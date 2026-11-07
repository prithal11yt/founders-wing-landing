import type { SupabaseClient } from "@supabase/supabase-js"
import { COHORT_1_SIZE } from "@/lib/cohort"
import { JOURNEY_START, STAGES } from "@/lib/crm"

/* Builds the members' Journey board (/members → Journey) from the team's CRM
   tables. Only member-safe fields come out of here: name, stage, project and
   how long they've been in the stage. No emails, phones, call notes, goals,
   blockers or renewal signals. */

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
}
export type JourneyWin = Who & { kind: "moved"; from: string; to: string; at: string }

export async function buildJourney(s: SupabaseClient, me: string) {
  const [m, p, c, h] = await Promise.all([
    s.from("fw_memberships").select("full_name, email, created_at").order("created_at", { ascending: true }),
    s.from("fw_member_profiles").select("member_email, what_building"),
    s.from("fw_crm_members").select("email, project_name, stage, membership_status, board_summary, board_hidden"),
    s.from("fw_crm_history").select("email, old_value, new_value, changed_at").eq("field", "Stage").order("changed_at", { ascending: false }),
  ])
  for (const r of [m, p, c, h]) if (r.error) throw new Error(r.error.message)

  const lower = (e: string | null | undefined) => (e || "").trim().toLowerCase()
  const group = <T extends { email: string }>(rows: T[]) => {
    const map = new Map<string, T[]>()
    for (const r of rows) { const k = lower(r.email); map.set(k, [...(map.get(k) ?? []), r]) }
    return map
  }
  const selfBy = new Map((p.data ?? []).map((x) => [lower(x.member_email), x]))
  const crmBy = new Map((c.data ?? []).map((x) => [lower(x.email), x]))
  const stageRowsBy = group(h.data ?? [])

  const start = new Date(JOURNEY_START).getTime()
  const since = Math.max(start, Date.now() - WIN_WINDOW_DAYS * 86400000)
  // Day counts never reach back before the board's start date.
  const fromStart = (iso: string | null | undefined) => (iso ? (new Date(iso).getTime() < start ? new Date(start).toISOString() : iso) : null)
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

    const stageRows = stageRowsBy.get(k) ?? []
    members.push({
      ...who,
      isFounding: i + 1 <= COHORT_1_SIZE,
      stage,
      project: crm?.project_name?.trim() || null,
      summary: crm?.board_summary?.trim() || selfBy.get(k)?.what_building?.trim() || null,
      stage_since: fromStart(stageRows.find((x) => x.new_value === stage)?.changed_at),
    })

    // Wins: stage moves (not first placement) since the board started, last 30 days.
    for (const r of stageRows) {
      if (r.old_value && r.new_value && STAGE_KEYS.has(r.new_value) && new Date(r.changed_at).getTime() >= since) {
        wins.push({ ...who, kind: "moved", from: r.old_value, to: r.new_value, at: r.changed_at })
      }
    }
  })

  wins.sort((a, b) => b.at.localeCompare(a.at))
  return { members, unplaced, wins: wins.slice(0, 12) }
}
