import { NextRequest } from "next/server"
import { db, session, json, unauthorized, serverError, istDayKey, nextSessionDay, lastSessionDay } from "@/lib/server/tracker"

// GET → the cohort with attendance history and every touchpoint the team has
// logged, so the Members screen can show who to call and what they said.
export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const sb = db()
    const today = istDayKey()
    const [memRes, attRes, sessRes, tpRes] = await Promise.all([
      sb.from("fw_memberships").select("id, full_name, email, whatsapp, plan, created_at").eq("status", "paid").order("created_at", { ascending: true }),
      sb.from("fw_attendance").select("call_id, member_email, marked_by"),
      sb.from("fw_calls").select("id, title, call_date, topic").order("call_date", { ascending: false }),
      sb.from("fw_member_touchpoints").select("*").order("created_at", { ascending: false }).limit(3000),
    ])
    for (const r of [memRes, attRes, sessRes, tpRes]) if (r.error) throw r.error

    const sessions = sessRes.data || []
    const past = sessions.filter(c => c.call_date < today)
    const upcoming = sessions.filter(c => c.call_date >= today && c.call_date <= nextSessionDay(today)).sort((a, b) => a.call_date.localeCompare(b.call_date))[0] || null
    const lastPast = past[0] || null
    const lastSessionCut = lastSessionDay(today)

    const attendedBy = new Map<string, Set<string>>()
    for (const a of attRes.data || []) {
      const e = a.member_email.toLowerCase()
      if (!attendedBy.has(e)) attendedBy.set(e, new Set())
      attendedBy.get(e)!.add(a.call_id)
    }
    const touchesBy = new Map<string, typeof tpRes.data>()
    for (const t of tpRes.data || []) {
      const e = t.member_email.toLowerCase()
      if (!touchesBy.has(e)) touchesBy.set(e, [])
      touchesBy.get(e)!.push(t)
    }

    const members = (memRes.data || []).map((m, i) => {
      const e = m.email.toLowerCase()
      const att = attendedBy.get(e) || new Set<string>()
      const touches = touchesBy.get(e) || []
      const last = touches[0] || null
      const rsvp = touches.find(t => t.will_attend_next === true && (upcoming ? t.session_id === upcoming.id : t.created_at >= `${lastSessionCut}T00:00:00`))
      const declined = touches.find(t => t.will_attend_next === false && (upcoming ? t.session_id === upcoming.id : t.created_at >= `${lastSessionCut}T00:00:00`))
      return {
        member_no: i + 1,
        full_name: m.full_name, email: m.email, whatsapp: m.whatsapp, plan: m.plan, joined_at: m.created_at,
        attended_count: att.size,
        attended_session_ids: [...att],
        attended_last: lastPast ? att.has(lastPast.id) : null,
        // Attendance over the last 4 past sessions, newest first (true/false).
        recent_attendance: past.slice(0, 4).map(c => att.has(c.id)),
        last_touch_at: last?.created_at || null,
        last_outcome: last ? (last.channel === "whatsapp" ? "messaged" : last.outcome) : null,
        contacted_this_week: !!last && last.created_at >= `${lastSessionCut}T00:00:00`,
        rsvp_next: rsvp ? true : declined ? false : null,
        touchpoints: touches.slice(0, 25),
      }
    })

    const attendedCount = (id: string) => (attRes.data || []).filter(a => a.call_id === id).length
    return json({
      members,
      sessions: sessions.slice(0, 20).map(c => ({ ...c, attended: attendedCount(c.id) })),
      upcoming_session: upcoming ? { ...upcoming, attended: attendedCount(upcoming.id) } : null,
      last_session: lastPast ? { ...lastPast, attended: attendedCount(lastPast.id) } : null,
      next_session_day: nextSessionDay(today),
    })
  } catch (err) {
    return serverError("team/members", err)
  }
}
