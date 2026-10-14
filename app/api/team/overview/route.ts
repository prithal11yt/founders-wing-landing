import { NextRequest } from "next/server"
import {
  db, session, json, unauthorized, serverError, istDayKey, addDays, dayStartUTC, dayEndUTC,
  weekday, isValidDay, loadTargets, nextSessionDay, lastSessionDay, REACHED,
} from "@/lib/server/tracker"

// GET ?date=YYYY-MM-DD → everything the Today screen and the founder's
// tracker need for one day, plus a 14-day history ending on that day.
export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()

  try {
    const sb = db()
    const today = istDayKey()
    const qd = req.nextUrl.searchParams.get("date")
    const date = isValidDay(qd) ? qd : today
    const actor = "team"
    const since = addDays(date, -13)
    const sinceISO = dayStartUTC(since).toISOString()
    const untilISO = dayEndUTC(date).toISOString()
    const lastSession = lastSessionDay(date)
    const nextSession = nextSessionDay(date)

    let dueQuery = sb
      .from("waitlist_applications")
      .select("id, full_name, whatsapp, follow_up_at, call_status, heard_from")
      .lte("follow_up_at", date)
      .not("call_status", "in", '("converted","not_interested")')
      .order("follow_up_at", { ascending: true })
      .limit(50)
    if (s.role === "team") dueQuery = dueQuery.eq("worked_by", "team")

    const [targets, evRes, tpRes, waRes, ciRes, sessRes, attRes, dueRes, memRes, tpSinceSessionRes] = await Promise.all([
      loadTargets(sb),
      sb.from("lead_call_events").select("id, lead_id, call_status, note, tags, created_at")
        .eq("actor", actor).gte("created_at", sinceISO).lt("created_at", untilISO).order("created_at", { ascending: false }),
      sb.from("fw_member_touchpoints").select("id, member_email, member_name, channel, outcome, reasons, wants, note, will_attend_next, session_id, created_at")
        .eq("actor", actor).gte("created_at", sinceISO).lt("created_at", untilISO).order("created_at", { ascending: false }),
      sb.from("fw_whatsapp_posts").select("id, posted_on, category, content, replies, reactions")
        .gte("posted_on", since).lte("posted_on", date).order("created_at", { ascending: false }),
      sb.from("fw_daily_checkins").select("day, learned, blockers, plan_tomorrow, updated_at")
        .eq("actor", actor).gte("day", since).lte("day", date),
      sb.from("fw_calls").select("id, title, call_date, topic, target_attendance, recap_posted")
        .order("call_date", { ascending: false }).limit(12),
      sb.from("fw_attendance").select("call_id"),
      dueQuery,
      sb.from("fw_memberships").select("email", { count: "exact", head: true }),
      sb.from("fw_member_touchpoints").select("member_email").gte("created_at", dayStartUTC(lastSession).toISOString()),
    ])
    for (const r of [evRes, tpRes, waRes, ciRes, sessRes, attRes, dueRes]) if (r.error) throw r.error

    const events = evRes.data || []
    const touches = tpRes.data || []
    const posts = waRes.data || []
    const checkins = new Map((ciRes.data || []).map(c => [c.day, c]))

    // Names for the leads that were called, so the activity list is readable.
    const leadIds = [...new Set(events.map(e => e.lead_id))]
    const leadName = new Map<number, { full_name: string | null; whatsapp: string | null }>()
    if (leadIds.length) {
      const { data: leads } = await sb.from("waitlist_applications").select("id, full_name, whatsapp").in("id", leadIds)
      for (const l of leads || []) leadName.set(l.id, { full_name: l.full_name, whatsapp: l.whatsapp })
    }

    // 14-day history, oldest → newest.
    type DayRow = {
      day: string; working: boolean; lead_calls: number; lead_reached: number; lead_converted: number
      member_calls: number; member_reached: number; member_messages: number; whatsapp_posts: number; checkin: boolean
    }
    const days: DayRow[] = []
    for (let i = 13; i >= 0; i--) {
      const day = addDays(date, -i)
      const ev = events.filter(e => istDayKey(e.created_at) === day)
      const tp = touches.filter(t => istDayKey(t.created_at) === day)
      const wa = posts.filter(p => p.posted_on === day)
      days.push({
        day,
        working: targets.working_days.includes(weekday(day)),
        lead_calls: ev.length,
        lead_reached: ev.filter(e => REACHED.has(e.call_status)).length,
        lead_converted: ev.filter(e => e.call_status === "converted").length,
        member_calls: tp.filter(t => t.channel === "call").length,
        member_reached: tp.filter(t => t.outcome === "answered").length,
        member_messages: tp.filter(t => t.channel === "whatsapp").length,
        whatsapp_posts: wa.length,
        checkin: checkins.has(day),
      })
    }
    const todayRow = days[days.length - 1]
    const week = days.slice(-7).reduce(
      (a, d) => ({
        lead_calls: a.lead_calls + d.lead_calls, lead_reached: a.lead_reached + d.lead_reached,
        lead_converted: a.lead_converted + d.lead_converted, member_calls: a.member_calls + d.member_calls,
        member_reached: a.member_reached + d.member_reached, whatsapp_posts: a.whatsapp_posts + d.whatsapp_posts,
        checkins: a.checkins + (d.checkin ? 1 : 0),
      }),
      { lead_calls: 0, lead_reached: 0, lead_converted: 0, member_calls: 0, member_reached: 0, whatsapp_posts: 0, checkins: 0 },
    )

    // Streaks count consecutive working days (ending on `date`) with the thing done.
    const streak = (done: (d: (typeof days)[number]) => boolean) => {
      let n = 0
      for (let i = days.length - 1; i >= 0; i--) {
        const d = days[i]
        if (!d.working) continue
        if (done(d)) n++
        else break
      }
      return n
    }

    // Today's activity feed (leads + members, newest first).
    const activity = [
      ...events.filter(e => istDayKey(e.created_at) === date).map(e => ({
        kind: "lead" as const, id: String(e.id), ts: e.created_at, ref: e.lead_id,
        name: leadName.get(e.lead_id)?.full_name || `Lead #${e.lead_id}`,
        outcome: e.call_status, note: e.note, tags: e.tags || [],
      })),
      ...touches.filter(t => istDayKey(t.created_at) === date).map(t => ({
        kind: "member" as const, id: t.id, ts: t.created_at, ref: t.member_email,
        name: t.member_name || t.member_email, outcome: t.channel === "whatsapp" ? "messaged" : t.outcome,
        note: t.note, tags: [...(t.reasons || []), ...(t.wants || [])], will_attend_next: t.will_attend_next,
      })),
    ].sort((a, b) => (a.ts < b.ts ? 1 : -1))

    // Sessions with attendance counts; the upcoming one gets its RSVP count.
    const attCount = new Map<string, number>()
    for (const a of attRes.data || []) attCount.set(a.call_id, (attCount.get(a.call_id) || 0) + 1)
    const sessions = (sessRes.data || []).map(c => ({ ...c, attended: attCount.get(c.id) || 0 }))
    const upcoming = sessions.find(c => c.call_date >= date && c.call_date <= nextSession) || null
    const rsvp = upcoming ? touches.filter(t => t.session_id === upcoming.id && t.will_attend_next === true).length : 0
    const pastSessions = sessions.filter(c => c.call_date < date)

    const contacted = new Set((tpSinceSessionRes.data || []).map(t => t.member_email.toLowerCase()))
    const totalMembers = memRes.count ?? 0

    return json({
      date, today: date === today, targets,
      today_row: todayRow,
      checkin: checkins.get(date) || null,
      activity,
      posts_today: posts.filter(p => p.posted_on === date),
      days, week,
      streaks: { checkin: streak(d => d.checkin), whatsapp: streak(d => d.whatsapp_posts > 0), lead_target: streak(d => d.lead_calls >= targets.lead_calls) },
      followups_due: dueRes.data || [],
      next_session_day: nextSession,
      upcoming_session: upcoming ? { ...upcoming, rsvp } : null,
      past_sessions: pastSessions.slice(0, 8),
      members: { total: totalMembers, contacted_since_last_session: contacted.size, last_session_day: lastSession },
    })
  } catch (err) {
    return serverError("team/overview", err)
  }
}
