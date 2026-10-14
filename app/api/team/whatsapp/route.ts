import { NextRequest } from "next/server"
import { db, session, actorOf, json, unauthorized, bad, serverError, cleanText, isValidDay, istDayKey, addDays, WHATSAPP_CATEGORIES } from "@/lib/server/tracker"

const CATS = new Set<string>(WHATSAPP_CATEGORIES)
const num = (v: unknown) => Math.max(0, Math.min(9999, Math.round(Number(v) || 0)))

export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const since = addDays(istDayKey(), -90)
    const { data, error } = await db().from("fw_whatsapp_posts").select("*").gte("posted_on", since)
      .order("posted_on", { ascending: false }).order("created_at", { ascending: false })
    if (error) throw error
    return json(data || [])
  } catch (err) {
    return serverError("team/whatsapp", err)
  }
}

export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    const posted_on = isValidDay(b.posted_on) ? b.posted_on : istDayKey()
    const category = CATS.has(b.category) ? b.category : "other"
    const { data, error } = await db().from("fw_whatsapp_posts").insert({
      posted_on, category, content: cleanText(b.content, 4000), replies: num(b.replies), reactions: num(b.reactions), actor: actorOf(s),
    }).select("*").single()
    if (error) throw error
    return json({ success: true, post: data })
  } catch (err) {
    return serverError("team/whatsapp", err)
  }
}

export async function PATCH(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    if (!b.id) return bad("id required")
    const patch: Record<string, unknown> = {}
    if ("replies" in b) patch.replies = num(b.replies)
    if ("reactions" in b) patch.reactions = num(b.reactions)
    if ("content" in b) patch.content = cleanText(b.content, 4000)
    if ("category" in b && CATS.has(b.category)) patch.category = b.category
    if ("posted_on" in b && isValidDay(b.posted_on)) patch.posted_on = b.posted_on
    if (!Object.keys(patch).length) return bad("Nothing to update")
    const { error } = await db().from("fw_whatsapp_posts").update(patch).eq("id", b.id)
    if (error) throw error
    return json({ success: true })
  } catch (err) {
    return serverError("team/whatsapp", err)
  }
}

export async function DELETE(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return bad("id required")
    const { error } = await db().from("fw_whatsapp_posts").delete().eq("id", id)
    if (error) throw error
    return json({ success: true })
  } catch (err) {
    return serverError("team/whatsapp", err)
  }
}
