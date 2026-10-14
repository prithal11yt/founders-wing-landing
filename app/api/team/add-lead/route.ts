import { NextRequest } from "next/server"
import { db, session, json, unauthorized, bad, serverError, cleanText } from "@/lib/server/tracker"

// POST → manually add a lead (a referral, a DM, someone who called in).
export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    const full_name = cleanText(b.full_name, 120)
    const whatsapp = cleanText(b.whatsapp, 40)
    if (!full_name || !whatsapp) return bad("Name and phone are required")
    const sb = db()
    const { data, error } = await sb.from("waitlist_applications").insert({
      full_name, whatsapp,
      email: cleanText(b.email, 160),
      heard_from: cleanText(b.heard_from, 40) || "other",
      what_building: cleanText(b.what_building, 500),
      twitter_handle: cleanText(b.twitter_handle, 60),
      notes: "",
      worked_by: s.role === "team" ? "team" : null,
      source_ref: `manual:${crypto.randomUUID()}`,
    }).select("*").single()
    if (error) throw error
    return json({ success: true, lead: data })
  } catch (err) {
    return serverError("team/add-lead", err)
  }
}
