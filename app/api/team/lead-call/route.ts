import { NextRequest } from "next/server"
import {
  db, session, actorOf, json, unauthorized, bad, serverError, CALL_STATUSES, LEAD_TAGS, cleanTags, cleanText, isValidDay,
} from "@/lib/server/tracker"

// POST → log one call to a lead in a single request: outcome + what they said
// + structured tags + optional follow-up date. Updates the lead row and
// appends an immutable call event (the source of truth for daily numbers).
export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()

  try {
    const body = await req.json()
    const id = Number(body.lead_id)
    const status = String(body.call_status || "")
    if (!id || !(CALL_STATUSES as readonly string[]).includes(status)) return bad("lead_id and a valid call_status are required")

    const note = cleanText(body.note)
    const tags = cleanTags(body.tags, LEAD_TAGS)
    const followUp = body.follow_up_at === null || body.follow_up_at === "" ? null : body.follow_up_at
    if (followUp !== undefined && followUp !== null && !isValidDay(followUp)) return bad("follow_up_at must be YYYY-MM-DD")

    const sb = db()
    const { data: lead, error: readErr } = await sb
      .from("waitlist_applications").select("id, worked_by, call_attempts, notes").eq("id", id).maybeSingle()
    if (readErr) throw readErr
    if (!lead) return json({ error: "Lead not found" }, 404)
    if (s.role === "team" && lead.worked_by && lead.worked_by !== "team") return json({ error: "Not allowed for this lead" }, 403)

    const patch: Record<string, unknown> = {
      call_status: status,
      last_called_at: new Date().toISOString(),
      call_attempts: (lead.call_attempts ?? 0) + 1,
    }
    if (followUp !== undefined) patch.follow_up_at = followUp
    if (s.role === "team") patch.worked_by = "team"
    // Running summary on the lead: keep the latest note at the top.
    if (note && body.append_to_notes !== false) {
      const stamp = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })
      patch.notes = `${stamp}: ${note}${lead.notes ? `\n${lead.notes}` : ""}`.slice(0, 8000)
    }

    const { error: upErr } = await sb.from("waitlist_applications").update(patch).eq("id", id)
    if (upErr) throw upErr

    const { data: event, error: evErr } = await sb
      .from("lead_call_events")
      .insert({ lead_id: id, actor: actorOf(s), call_status: status, note, tags })
      .select("id, lead_id, actor, call_status, note, tags, created_at")
      .single()
    if (evErr) throw evErr

    return json({ success: true, event, notes: patch.notes ?? lead.notes })
  } catch (err) {
    return serverError("team/lead-call", err)
  }
}
