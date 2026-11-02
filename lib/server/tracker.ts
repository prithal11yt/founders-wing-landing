// Shared helpers for the team tracker API routes (/api/team/*).
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { getSession, type LeadsSession } from "@/app/api/leads/verify/route"

export function db(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export function session(req: NextRequest): LeadsSession | null {
  return getSession(req)
}

// The tracker follows the intern's work. Anything the founder logs is kept
// separate so it never inflates the intern's numbers.
export type Actor = "team" | "admin"
export function actorOf(s: LeadsSession): Actor {
  return s.role === "team" ? "team" : "admin"
}

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status })
export const unauthorized = () => json({ error: "Unauthorized" }, 401)
export const bad = (msg: string) => json({ error: msg }, 400)
export const serverError = (where: string, err: unknown) => {
  console.error(`[${where}]`, err)
  return json({ error: "Server error" }, 500)
}

// ── Dates: everything is reckoned in IST so "today" matches the team's day. ──
export const IST_MS = 5.5 * 60 * 60 * 1000
export function istDayKey(d: Date | string | number = Date.now()): string {
  const t = typeof d === "number" ? d : new Date(d).getTime()
  return new Date(t + IST_MS).toISOString().slice(0, 10)
}
export function dayStartUTC(day: string): Date {
  return new Date(new Date(day + "T00:00:00Z").getTime() - IST_MS)
}
export function dayEndUTC(day: string): Date {
  return new Date(dayStartUTC(day).getTime() + 86_400_000)
}
export function addDays(day: string, n: number): string {
  return new Date(new Date(day + "T00:00:00Z").getTime() + n * 86_400_000).toISOString().slice(0, 10)
}
export function weekday(day: string): number {
  return new Date(day + "T00:00:00Z").getUTCDay()
}
export const isValidDay = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s)

// Live sessions run on Wednesdays, 9pm IST.
export const SESSION_WEEKDAY = 3
export function nextSessionDay(from = istDayKey()): string {
  return addDays(from, (SESSION_WEEKDAY - weekday(from) + 7) % 7)
}
export function lastSessionDay(from = istDayKey()): string {
  const diff = (weekday(from) - SESSION_WEEKDAY + 7) % 7 || 7
  return addDays(from, -diff)
}

// ── Targets ──
export type Targets = {
  lead_calls: number
  member_calls: number
  whatsapp_posts: number
  session_attendance: number
  working_days: number[]
}
export const DEFAULT_TARGETS: Targets = {
  lead_calls: 15, member_calls: 5, whatsapp_posts: 1, session_attendance: 25, working_days: [1, 2, 3, 4, 5, 6],
}
export async function loadTargets(sb: SupabaseClient): Promise<Targets> {
  const { data } = await sb.from("fw_settings").select("value").eq("key", "team_targets").maybeSingle()
  return { ...DEFAULT_TARGETS, ...((data?.value as Partial<Targets>) || {}) }
}

// ── Vocabularies shared with the UI (kept here so the API validates them) ──
export const CALL_STATUSES = [
  "no_answer", "callback", "less_convinced", "interested", "very_convinced", "converted", "not_interested",
] as const
export const REACHED = new Set(["callback", "not_interested", "less_convinced", "interested", "very_convinced", "converted"])

export const LEAD_TAGS = [
  "price", "needs_time", "wants_to_think", "not_right_now", "student_exams", "no_idea_yet",
  "wants_mentorship", "wants_networking", "wants_cofounder", "wants_accountability", "wants_ai_learning",
  "asked_for_details", "already_in_community", "wrong_number", "language_barrier",
] as const
export const MEMBER_REASONS = [
  "timing_clash", "forgot", "didnt_know", "topic_not_relevant", "too_long", "prefers_recording",
  "busy_this_week", "lost_interest", "network_issue", "will_attend",
] as const
export const MEMBER_WANTS = [
  "more_qna", "guest_speakers", "hands_on_demos", "member_showcases", "shorter_sessions",
  "different_time", "ai_tools_walkthrough", "accountability", "one_on_one", "networking_breakouts",
] as const
export const WHATSAPP_CATEGORIES = ["poll", "learning", "question", "win", "resource", "announcement", "reminder", "other"] as const
export const IDEA_CATEGORIES = ["sales", "engagement", "sessions", "content", "product", "ops", "general"] as const
export const IDEA_STATUSES = ["inbox", "planned", "doing", "done", "parked"] as const

export function cleanTags(input: unknown, allowed: readonly string[]): string[] {
  if (!Array.isArray(input)) return []
  const set = new Set(allowed)
  return [...new Set(input.filter((t): t is string => typeof t === "string" && set.has(t)))]
}
export function cleanText(v: unknown, max = 2000): string | null {
  if (typeof v !== "string") return null
  const t = v.trim()
  return t ? t.slice(0, max) : null
}

// PostgREST returns at most 1,000 rows per request and doesn't say it truncated,
// so anything that must see a whole table has to page through it.
export async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const size = 1000
  const rows: T[] = []
  for (let from = 0; ; from += size) {
    const { data, error } = await page(from, from + size - 1)
    if (error) throw error
    rows.push(...(data ?? []))
    if (!data || data.length < size) return rows
  }
}

// Stored member emails have mixed casing, hence ilike. Escaped so "_" in an
// address isn't treated as a wildcard.
export const likeExact = (email: string) => email.replace(/[\\%_]/g, "\\$&")

// ── Member contact: one record shared by the Members tab and Member progress ──
const REACHED_OUTCOMES = ["answered", "callback", "messaged"]

// A logged contact keeps the Member progress page's dates in step. A missed call
// is an attempt rather than contact, so it leaves "last contacted" alone.
export async function syncCrmContact(sb: SupabaseClient, c: { email: string; outcome: string; followUp?: string | null; by: string }) {
  const patch: Record<string, unknown> = {}
  if (REACHED_OUTCOMES.includes(c.outcome)) patch.last_contacted = istDayKey()
  if (c.followUp) patch.next_follow_up = c.followUp
  if (!Object.keys(patch).length) return
  const { error } = await sb.from("fw_crm_members").upsert(
    { email: c.email, ...patch, updated_at: new Date().toISOString(), updated_by: c.by }, { onConflict: "email" },
  )
  if (error) console.error("[tracker] crm contact sync failed:", error.message)
}

export async function upcomingSessionId(sb: SupabaseClient): Promise<string | null> {
  const today = istDayKey()
  const { data } = await sb.from("fw_calls").select("id").gte("call_date", today).lte("call_date", nextSessionDay(today))
    .order("call_date", { ascending: true }).limit(1).maybeSingle()
  return data?.id ?? null
}

// Writing call notes or a check-in on Member progress means the team spoke to the
// member, so it counts on the daily tracker too. Once per member per day, so
// logging the call and then writing notes about it isn't counted twice.
export async function countMemberContactOnce(sb: SupabaseClient, c: { email: string; actor: Actor; note?: string | null }) {
  const { data: already, error: readErr } = await sb.from("fw_member_touchpoints").select("id")
    .eq("member_email", c.email).eq("actor", c.actor).in("outcome", REACHED_OUTCOMES)
    .gte("created_at", dayStartUTC(istDayKey()).toISOString()).limit(1)
  if (readErr) throw readErr
  if (already?.length) return
  const { data: member } = await sb.from("fw_memberships").select("full_name").ilike("email", likeExact(c.email)).limit(1).maybeSingle()
  const { error } = await sb.from("fw_member_touchpoints").insert({
    member_email: c.email, member_name: member?.full_name ?? null, actor: c.actor, channel: "call", outcome: "answered",
    note: cleanText(c.note ?? null), session_id: await upcomingSessionId(sb),
  })
  if (error) throw error
}

export function phoneDigits(raw?: string | null): string {
  if (!raw) return ""
  const d = raw.replace(/\D/g, "")
  if (d.length === 10) return `91${d}`
  if (d.length === 11 && d.startsWith("0")) return `91${d.slice(1)}`
  if (d.length === 12 && d.startsWith("91")) return d
  return d
}
