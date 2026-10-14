import { NextRequest } from "next/server"
import { db, session, actorOf, json, unauthorized, bad, serverError, cleanText, IDEA_CATEGORIES, IDEA_STATUSES } from "@/lib/server/tracker"

const CATS = new Set<string>(IDEA_CATEGORIES)
const STATUSES = new Set<string>(IDEA_STATUSES)

export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const { data, error } = await db().from("fw_ideas").select("*").order("created_at", { ascending: false }).limit(500)
    if (error) throw error
    return json(data || [])
  } catch (err) {
    return serverError("team/ideas", err)
  }
}

export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    const title = cleanText(b.title, 200)
    if (!title) return bad("title required")
    const { data, error } = await db().from("fw_ideas").insert({
      title, detail: cleanText(b.detail, 4000), category: CATS.has(b.category) ? b.category : "general",
      raised_by: actorOf(s), status: STATUSES.has(b.status) ? b.status : "inbox",
    }).select("*").single()
    if (error) throw error
    return json({ success: true, idea: data })
  } catch (err) {
    return serverError("team/ideas", err)
  }
}

export async function PATCH(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    if (!b.id) return bad("id required")
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if ("title" in b) { const t = cleanText(b.title, 200); if (t) patch.title = t }
    if ("detail" in b) patch.detail = cleanText(b.detail, 4000)
    if ("category" in b && CATS.has(b.category)) patch.category = b.category
    if ("status" in b && STATUSES.has(b.status)) {
      patch.status = b.status
      patch.done_at = b.status === "done" ? new Date().toISOString() : null
    }
    const { error } = await db().from("fw_ideas").update(patch).eq("id", b.id)
    if (error) throw error
    return json({ success: true })
  } catch (err) {
    return serverError("team/ideas", err)
  }
}

export async function DELETE(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const id = req.nextUrl.searchParams.get("id")
    if (!id) return bad("id required")
    let q = db().from("fw_ideas").delete().eq("id", id)
    if (s.role === "team") q = q.eq("raised_by", "team")
    const { error } = await q
    if (error) throw error
    return json({ success: true })
  } catch (err) {
    return serverError("team/ideas", err)
  }
}
