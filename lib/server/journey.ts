import type { SupabaseClient } from "@supabase/supabase-js"
import { COHORT_1_SIZE } from "@/lib/cohort"
import { STAGES } from "@/lib/crm"

/* Builds the members' Journey board (/members → Journey) from the team's CRM
   tables. Only member-safe fields come out of here: no emails, phones, call
   notes, blockers or renewal signals. */

const STAGE_KEYS = new Set<string>(STAGES.map((s) => s.value))
const WIN_WINDOW_DAYS = 30

// "Aniruddha Das" → "Aniruddha D."
function shortName(full: string | null | undefined): string {
  const parts = (full || "Member").trim().split(/\s+/)
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase()
  return parts.length > 1 ? `${first} ${parts[parts.length - 1].charAt(0).toUpperCase()}.` : first
}

type Who = { member_no: number; name: string; isMe: boolean }
export type JourneyMember = Who & {
  isFounding: boolean
  stage: string
  project: string | null
  summary: string | null
  stage_since: string | null
  goal: { goal: string; next_action: string | null; set_on: string | null; due_on: string | null } | null
  goals_achieved: number
}
export type JourneyWin = Who & { kind: "moved" | "goal"; from?: string; to?: string; goal?: string; at: string }

export async function buildJourney(s: SupabaseClient, me: string) {
  const [m, p, c, g, h] = await Promise.all([
    s.from("fw_memberships").select("full_name, email, created_at").order("created_at", { ascending: true }),
    s.from("fw_member_profiles").select("member_email, what_building"),
    s.from("fw_crm_members").select("email, project_name, stage, membership_status, board_summary, board_hidden"),
    s.from("fw_crm_goals").select("email, goal, next_action, set_on, due_on, status, reviewed_on").order("created_at", { ascending: false }),
    s.from("fw_crm_history").select("email, old_value, new_value, changed_at").eq("field", "Stage").order("changed_at", { ascending: false }),
  ])
  for (const r of [m, p, c, g, h]) if (r.error) throw new Error(r.error.message)

  const lower = (e: string | null | undefined) => (e || "").trim().toLowerCase()
  const group = <T extends { email: string }>(rows: T[]) => {
    const map = new Map<string, T[]>()
    for (const r of rows) { const k = lower(r.email); map.set(k, [...(map.get(k) ?? []), r]) }
    return map
  }
  const selfBy = new Map((p.data ?? []).map((x) => [lower(x.member_email), x]))
  const crmBy = new Map((c.data ?? []).map((x) => [lower(x.email), x]))
  const goalsBy = group(g.data ?? [])
  const stageRowsBy = group(h.data ?? [])

  const since = Date.now() - WIN_WINDOW_DAYS * 86400000
  const members: JourneyMember[] = []
  const unplaced: Who[] = []
  const wins: JourneyWin[] = []

  ;(m.data ?? []).forEach((row, i) => {
    const k = lower(row.email)
    const crm = crmBy.get(k)
    if (crm?.membership_status === "left") return
    const isMe = k === me
    // Hidden members still see their own card; nobody else does.
    if (crm?.board_hidden && !isMe) return
    const who: Who = { member_no: i + 1, name: shortName(row.full_name), isMe }

    const stage = crm?.stage && STAGE_KEYS.has(crm.stage) ? crm.stage : null
    if (!stage) { unplaced.push(who); return }

    const goals = goalsBy.get(k) ?? []
    const active = goals.find((x) => x.status === "active")
    const stageRows = stageRowsBy.get(k) ?? []
    members.push({
      ...who,
      isFounding: i + 1 <= COHORT_1_SIZE,
      stage,
      project: crm?.project_name?.trim() || null,
      summary: crm?.board_summary?.trim() || selfBy.get(k)?.what_building?.trim() || null,
      stage_since: stageRows.find((x) => x.new_value === stage)?.changed_at ?? null,
      goal: active ? { goal: active.goal, next_action: active.next_action, set_on: active.set_on, due_on: active.due_on } : null,
      goals_achieved: goals.filter((x) => x.status === "achieved").length,
    })

    // Wins: stage moves (not first placement) and goals achieved in the last 30 days.
    for (const r of stageRows) {
      if (r.old_value && r.new_value && STAGE_KEYS.has(r.new_value) && new Date(r.changed_at).getTime() >= since) {
        wins.push({ ...who, kind: "moved", from: r.old_value, to: r.new_value, at: r.changed_at })
      }
    }
    for (const x of goals) {
      if (x.status === "achieved" && x.reviewed_on && new Date(x.reviewed_on).getTime() >= since) {
        wins.push({ ...who, kind: "goal", goal: x.goal, at: x.reviewed_on })
      }
    }
  })

  wins.sort((a, b) => b.at.localeCompare(a.at))
  return { members, unplaced, wins: wins.slice(0, 12) }
}
