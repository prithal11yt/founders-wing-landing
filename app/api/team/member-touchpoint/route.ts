import { NextRequest } from "next/server"
import {
  db, session, actorOf, json, unauthorized, bad, serverError, cleanTags, cleanText, isValidDay,
  MEMBER_REASONS, MEMBER_WANTS, istDayKey, nextSessionDay,
} from "@/lib/server/tracker"

const CHANNELS = new Set(["call", "whatsapp"])
const OUTCOMES = new Set(["answered", "no_answer", "callback", "messaged"])

// POST → log a call / WhatsApp nudge to a member about the live sessions.
export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    const email = cleanText(b.member_email, 160)?.toLowerCase()
    const channel = CHANNELS.has(b.channel) ? b.channel : "call"
    const outcome = channel === "whatsapp" ? "messaged" : OUTCOMES.has(b.outcome) ? b.outcome : null
    if (!email || !outcome) return bad("member_email and outcome are required")
    const followUp = b.follow_up_at ? b.follow_up_at : null
    if (followUp && !isValidDay(followUp)) return bad("follow_up_at must be YYYY-MM-DD")

    const sb = db()
    const { data: member } = await sb.from("fw_memberships").select("full_name").ilike("email", email).limit(1).maybeSingle()
    if (!member) return json({ error: "Member not found" }, 404)

    // Attach to the upcoming session so RSVPs line up with attendance later.
    const today = istDayKey()
    const { data: upcoming } = await sb.from("fw_calls").select("id").gte("call_date", today).lte("call_date", nextSessionDay(today))
      .order("call_date", { ascending: true }).limit(1).maybeSingle()

    const row = {
      member_email: email, member_name: member.full_name, actor: actorOf(s), channel, outcome,
      reasons: cleanTags(b.reasons, MEMBER_REASONS), wants: cleanTags(b.wants, MEMBER_WANTS),
      note: cleanText(b.note), will_attend_next: typeof b.will_attend_next === "boolean" ? b.will_attend_next : null,
      follow_up_at: followUp, session_id: upcoming?.id || null,
    }
    const { data, error } = await sb.from("fw_member_touchpoints").insert(row).select("*").single()
    if (error) throw error
    return json({ success: true, touchpoint: data })
  } catch (err) {
    return serverError("team/member-touchpoint", err)
  }
}

export async function DELETE(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return bad("id required")
    const sb = db()
    let q = sb.from("fw_member_touchpoints").delete().eq("id", id)
    if (s.role === "team") q = q.eq("actor", "team")
    const { error } = await q
    if (error) throw error
    return json({ success: true })
  } catch (err) {
    return serverError("team/member-touchpoint", err)
  }
}
