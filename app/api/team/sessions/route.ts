import { NextRequest } from "next/server"
import { db, session, actorOf, json, unauthorized, bad, serverError, cleanText, isValidDay, loadTargets } from "@/lib/server/tracker"

// GET → all sessions with attendance lists, RSVPs and pre-session call counts.
export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const sb = db()
    const [targets, sessRes, attRes, tpRes] = await Promise.all([
      loadTargets(sb),
      sb.from("fw_calls").select("*").order("call_date", { ascending: false }).limit(60),
      sb.from("fw_attendance").select("call_id, member_email, member_name, marked_by, created_at"),
      sb.from("fw_member_touchpoints").select("session_id, member_email, will_attend_next, channel").not("session_id", "is", null),
    ])
    if (sessRes.error) throw sessRes.error
    const att = new Map<string, typeof attRes.data>()
    for (const a of attRes.data || []) {
      if (!att.has(a.call_id)) att.set(a.call_id, [])
      att.get(a.call_id)!.push(a)
    }
    const rsvp = new Map<string, Set<string>>(), reached = new Map<string, Set<string>>()
    for (const t of tpRes.data || []) {
      const sid = t.session_id as string
      if (!reached.has(sid)) reached.set(sid, new Set())
      reached.get(sid)!.add(t.member_email.toLowerCase())
      if (t.will_attend_next === true) {
        if (!rsvp.has(sid)) rsvp.set(sid, new Set())
        rsvp.get(sid)!.add(t.member_email.toLowerCase())
      }
    }
    const sessions = (sessRes.data || []).map(c => ({
      ...c,
      target_attendance: c.target_attendance ?? targets.session_attendance,
      attendance: att.get(c.id) || [],
      attended: (att.get(c.id) || []).length,
      rsvp: rsvp.get(c.id)?.size || 0,
      members_contacted: reached.get(c.id)?.size || 0,
    }))
    return json({ sessions, default_target: targets.session_attendance })
  } catch (err) {
    return serverError("team/sessions", err)
  }
}

// POST → create a session (usually next Wednesday, prefilled by the UI).
export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    const title = cleanText(b.title, 160)
    if (!title || !isValidDay(b.call_date)) return bad("title and call_date are required")
    const sb = db()
    const { data: clash } = await sb.from("fw_calls").select("id").eq("call_date", b.call_date).limit(1).maybeSingle()
    if (clash) return json({ error: "A session already exists on that date" }, 409)
    const { data, error } = await sb.from("fw_calls").insert({
      title, call_date: b.call_date, topic: cleanText(b.topic, 300),
      target_attendance: Number.isFinite(Number(b.target_attendance)) && Number(b.target_attendance) > 0 ? Number(b.target_attendance) : null,
      created_by: actorOf(s),
    }).select("*").single()
    if (error) throw error
    return json({ success: true, session: data })
  } catch (err) {
    return serverError("team/sessions", err)
  }
}

// PATCH → edit topic / title / target / recap flag / notes.
export async function PATCH(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    if (!b.id) return bad("id required")
    const patch: Record<string, unknown> = {}
    if ("title" in b) { const t = cleanText(b.title, 160); if (t) patch.title = t }
    if ("topic" in b) patch.topic = cleanText(b.topic, 300)
    if ("notes" in b) patch.notes = cleanText(b.notes, 4000)
    if ("recap_posted" in b) patch.recap_posted = !!b.recap_posted
    if ("target_attendance" in b) patch.target_attendance = Number(b.target_attendance) > 0 ? Number(b.target_attendance) : null
    if ("call_date" in b && isValidDay(b.call_date)) patch.call_date = b.call_date
    if (!Object.keys(patch).length) return bad("Nothing to update")
    const { error } = await db().from("fw_calls").update(patch).eq("id", b.id)
    if (error) throw error
    return json({ success: true })
  } catch (err) {
    return serverError("team/sessions", err)
  }
}

export async function DELETE(req: NextRequest) {
  const s = session(req)
  if (!s || s.role !== "admin") return unauthorized()
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return bad("id required")
    const { error } = await db().from("fw_calls").delete().eq("id", id)
    if (error) throw error
    return json({ success: true })
  } catch (err) {
    return serverError("team/sessions", err)
  }
}
