import { NextRequest } from "next/server"
import {
  db, session, json, unauthorized, bad, serverError, loadTargets, DEFAULT_TARGETS, type Targets,
  LEAD_TAGS, MEMBER_REASONS, MEMBER_WANTS, WHATSAPP_CATEGORIES, IDEA_CATEGORIES,
} from "@/lib/server/tracker"

export async function GET(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()
  try {
    return json({
      targets: await loadTargets(db()),
      vocab: {
        lead_tags: LEAD_TAGS, member_reasons: MEMBER_REASONS, member_wants: MEMBER_WANTS,
        whatsapp_categories: WHATSAPP_CATEGORIES, idea_categories: IDEA_CATEGORIES,
      },
    })
  } catch (err) {
    return serverError("team/settings", err)
  }
}

// PUT → founder tunes the daily targets.
export async function PUT(req: NextRequest) {
  const s = session(req)
  if (!s || s.role !== "admin") return unauthorized()
  try {
    const b = await req.json()
    const n = (v: unknown, fallback: number) => {
      const x = Math.round(Number(v))
      return Number.isFinite(x) && x >= 0 && x <= 500 ? x : fallback
    }
    const days: number[] = Array.isArray(b.working_days)
      ? [...new Set<number>(b.working_days.map(Number).filter((d: number) => d >= 0 && d <= 6))]
      : DEFAULT_TARGETS.working_days
    if (!days.length) return bad("At least one working day is required")
    const targets: Targets = {
      lead_calls: n(b.lead_calls, DEFAULT_TARGETS.lead_calls),
      member_calls: n(b.member_calls, DEFAULT_TARGETS.member_calls),
      whatsapp_posts: n(b.whatsapp_posts, DEFAULT_TARGETS.whatsapp_posts),
      session_attendance: n(b.session_attendance, DEFAULT_TARGETS.session_attendance),
      working_days: days.sort((a, b) => a - b),
    }
    const { error } = await db().from("fw_settings").upsert({ key: "team_targets", value: targets, updated_at: new Date().toISOString() })
    if (error) throw error
    return json({ success: true, targets })
  } catch (err) {
    return serverError("team/settings", err)
  }
}
