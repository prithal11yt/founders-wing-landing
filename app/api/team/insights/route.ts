import { NextRequest } from "next/server"
import { db, session, json, unauthorized, serverError, istDayKey, addDays, dayStartUTC, REACHED } from "@/lib/server/tracker"

// GET ?days=30 → the patterns: what leads object to / ask for, why members
// skip sessions and what they want, which WhatsApp post types get replies,
// and the attendance trend. This is the "what are people telling us" view.
export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const sb = db()
    const days = Math.min(365, Math.max(7, Number(req.nextUrl.searchParams.get("days")) || 30))
    const since = addDays(istDayKey(), -days)
    const sinceISO = dayStartUTC(since).toISOString()

    const [evRes, tpRes, waRes, sessRes, attRes] = await Promise.all([
      sb.from("lead_call_events").select("lead_id, actor, call_status, note, tags, created_at").gte("created_at", sinceISO).order("created_at", { ascending: false }),
      sb.from("fw_member_touchpoints").select("member_name, member_email, actor, channel, outcome, reasons, wants, note, will_attend_next, created_at").gte("created_at", sinceISO).order("created_at", { ascending: false }),
      sb.from("fw_whatsapp_posts").select("posted_on, category, replies, reactions").gte("posted_on", since),
      sb.from("fw_calls").select("id, title, call_date, topic, target_attendance").order("call_date", { ascending: false }).limit(12),
      sb.from("fw_attendance").select("call_id"),
    ])
    for (const r of [evRes, tpRes, waRes, sessRes, attRes]) if (r.error) throw r.error

    const count = (lists: (string[] | null)[]) => {
      const m = new Map<string, number>()
      for (const l of lists) for (const t of l || []) m.set(t, (m.get(t) || 0) + 1)
      return [...m.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n)
    }
    const events = evRes.data || []
    const touches = tpRes.data || []

    const leadIds = [...new Set(events.filter(e => e.note).map(e => e.lead_id))].slice(0, 200)
    const names = new Map<number, string>()
    if (leadIds.length) {
      const { data } = await sb.from("waitlist_applications").select("id, full_name").in("id", leadIds)
      for (const l of data || []) names.set(l.id, l.full_name || `Lead #${l.id}`)
    }

    const outcomeCounts = new Map<string, number>()
    for (const e of events) outcomeCounts.set(e.call_status, (outcomeCounts.get(e.call_status) || 0) + 1)

    const attCount = new Map<string, number>()
    for (const a of attRes.data || []) attCount.set(a.call_id, (attCount.get(a.call_id) || 0) + 1)

    const waByCat = new Map<string, { posts: number; replies: number; reactions: number }>()
    for (const p of waRes.data || []) {
      const c = waByCat.get(p.category) || { posts: 0, replies: 0, reactions: 0 }
      c.posts++; c.replies += p.replies; c.reactions += p.reactions
      waByCat.set(p.category, c)
    }

    return json({
      days,
      leads: {
        calls: events.length,
        reached: events.filter(e => REACHED.has(e.call_status)).length,
        outcomes: [...outcomeCounts.entries()].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n),
        tags: count(events.map(e => e.tags)),
        notes: events.filter(e => e.note).slice(0, 40).map(e => ({ name: names.get(e.lead_id) || `Lead #${e.lead_id}`, outcome: e.call_status, note: e.note, tags: e.tags, ts: e.created_at, actor: e.actor })),
      },
      members: {
        touches: touches.length,
        answered: touches.filter(t => t.outcome === "answered").length,
        will_attend: touches.filter(t => t.will_attend_next === true).length,
        wont_attend: touches.filter(t => t.will_attend_next === false).length,
        reasons: count(touches.map(t => t.reasons)),
        wants: count(touches.map(t => t.wants)),
        notes: touches.filter(t => t.note).slice(0, 40).map(t => ({ name: t.member_name || t.member_email, outcome: t.outcome, note: t.note, tags: [...(t.reasons || []), ...(t.wants || [])], ts: t.created_at, actor: t.actor })),
      },
      whatsapp: [...waByCat.entries()].map(([category, c]) => ({ category, ...c, avg_replies: c.posts ? Math.round((c.replies / c.posts) * 10) / 10 : 0 })).sort((a, b) => b.avg_replies - a.avg_replies),
      sessions: (sessRes.data || []).filter(c => c.call_date < istDayKey()).map(c => ({ ...c, attended: attCount.get(c.id) || 0 })).reverse(),
    })
  } catch (err) {
    return serverError("team/insights", err)
  }
}
