import { NextRequest } from "next/server"
import { db, session, actorOf, json, unauthorized, bad, serverError } from "@/lib/server/tracker"

// POST { call_id, add: [emails], remove: [emails] } → mark attendance from the
// Google Meet participant list after a session. Member self-marks stay intact.
export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    const callId = String(b.call_id || "")
    const add: string[] = Array.isArray(b.add) ? b.add.map((e: unknown) => String(e).toLowerCase().trim()).filter(Boolean) : []
    const remove: string[] = Array.isArray(b.remove) ? b.remove.map((e: unknown) => String(e).toLowerCase().trim()).filter(Boolean) : []
    if (!callId || (!add.length && !remove.length)) return bad("call_id and add/remove are required")

    const sb = db()
    const { data: call } = await sb.from("fw_calls").select("id").eq("id", callId).maybeSingle()
    if (!call) return json({ error: "Session not found" }, 404)

    if (add.length) {
      const { data: members, error: memberErr } = await sb.from("fw_memberships").select("email, full_name")
      if (memberErr) throw memberErr
      const byEmail = new Map((members || []).map(m => [m.email.toLowerCase(), m]))
      const rows = add.map(e => ({
        call_id: callId, member_email: byEmail.get(e)?.email || e, member_name: byEmail.get(e)?.full_name || null, marked_by: actorOf(s),
      }))
      const { error } = await sb.from("fw_attendance").upsert(rows, { onConflict: "call_id,member_email", ignoreDuplicates: true })
      if (error) throw error
    }
    if (remove.length) {
      // Delete by the address as stored: some rows keep the member's original casing.
      const { data: rows, error: readErr } = await sb.from("fw_attendance").select("id, member_email").eq("call_id", callId)
      if (readErr) throw readErr
      const drop = new Set(remove)
      const ids = (rows || []).filter(r => drop.has(r.member_email.toLowerCase())).map(r => r.id)
      if (ids.length) {
        const { error } = await sb.from("fw_attendance").delete().in("id", ids)
        if (error) throw error
      }
    }
    const { count } = await sb.from("fw_attendance").select("*", { count: "exact", head: true }).eq("call_id", callId)
    return json({ success: true, attended: count ?? 0 })
  } catch (err) {
    return serverError("team/attendance", err)
  }
}
