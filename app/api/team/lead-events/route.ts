import { NextRequest } from "next/server"
import { db, session, json, unauthorized, serverError } from "@/lib/server/tracker"

// GET → call history for leads. Team sees its own events; admin sees all.
export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const sb = db()
    let q = sb.from("lead_call_events")
      .select("id, lead_id, actor, call_status, note, tags, created_at")
      .order("created_at", { ascending: false })
      .limit(2000)
    if (s.role === "team") q = q.eq("actor", "team")
    const { data, error } = await q
    if (error) throw error
    return json(data || [])
  } catch (err) {
    return serverError("team/lead-events", err)
  }
}
