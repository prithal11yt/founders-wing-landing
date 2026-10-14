import { NextRequest } from "next/server"
import { db, session, json, unauthorized, bad, serverError, cleanText, isValidDay, istDayKey, addDays } from "@/lib/server/tracker"

// The check-in is the intern's end-of-day note. Numbers are derived live
// elsewhere; this captures what was learned and what's blocking.
export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const sb = db()
    const day = req.nextUrl.searchParams.get("day")
    if (day) {
      if (!isValidDay(day)) return bad("day must be YYYY-MM-DD")
      const { data } = await sb.from("fw_daily_checkins").select("*").eq("actor", "team").eq("day", day).maybeSingle()
      return json(data || null)
    }
    const since = addDays(istDayKey(), -60)
    const { data, error } = await sb.from("fw_daily_checkins").select("*").eq("actor", "team").gte("day", since).order("day", { ascending: false })
    if (error) throw error
    return json(data || [])
  } catch (err) {
    return serverError("team/checkin", err)
  }
}

export async function PUT(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    const b = await req.json()
    const day = isValidDay(b.day) ? b.day : istDayKey()
    // Only the intern's account writes the intern's check-in.
    const actor = s.role === "team" ? "team" : "admin"
    const row = {
      day, actor, learned: cleanText(b.learned, 4000), blockers: cleanText(b.blockers, 4000),
      plan_tomorrow: cleanText(b.plan_tomorrow, 4000), updated_at: new Date().toISOString(),
    }
    const { data, error } = await db().from("fw_daily_checkins").upsert(row, { onConflict: "day,actor" }).select("*").single()
    if (error) throw error
    return json({ success: true, checkin: data })
  } catch (err) {
    return serverError("team/checkin", err)
  }
}
