import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyToken } from "../../leads/verify/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// The call-outcome ladder, ordered coldest → hottest. Kept in sync with the
// dashboard's CALL_STATUSES so labels/colours match what the team sees.
const OUTCOMES: { value: string; label: string; color: string }[] = [
  { value: "no_answer", label: "No answer", color: "#fb923c" },
  { value: "callback", label: "Callback", color: "#eab308" },
  { value: "not_interested", label: "Not interested", color: "#ef4444" },
  { value: "less_convinced", label: "Less convinced", color: "#f59e0b" },
  { value: "interested", label: "Interested", color: "#22c55e" },
  { value: "very_convinced", label: "Very convinced", color: "#10b981" },
  { value: "converted", label: "Converted", color: "#0284c7" },
]

// Reached = we actually spoke to them (everything past "no answer"/not-called).
const REACHED = new Set(["callback", "not_interested", "less_convinced", "interested", "very_convinced", "converted"])
const INTERESTED = new Set(["interested", "very_convinced"])

// The day per-call logging went live (lead_call_events created). Trend charts
// only have data from here forward — surfaced so the UI can say so.
const LOGGING_SINCE = "2026-09-09"

type LeadRow = { call_status: string | null; worked_by: string | null; call_attempts: number | null }
type EventRow = { actor: string; call_status: string; created_at: string }

// Date helpers, all in IST so "today" lines up with Prithal's day.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000
function istParts(iso: string) {
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS)
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), day: d.getUTCDate(), dow: d.getUTCDay(), date: d }
}
function istTodayStart() {
  const now = new Date(Date.now() + IST_OFFSET_MS)
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - IST_OFFSET_MS
}
function dayKey(iso: string) {
  const { y, m, day } = istParts(iso)
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}
function monthKey(iso: string) {
  const { y, m } = istParts(iso)
  return `${y}-${String(m + 1).padStart(2, "0")}`
}

function snapshotFor(leads: LeadRow[]) {
  const counts: Record<string, number> = {}
  for (const o of OUTCOMES) counts[o.value] = 0
  let worked = 0, reached = 0, interested = 0, converted = 0, callAttempts = 0
  for (const l of leads) {
    const s = l.call_status || "not_called"
    callAttempts += l.call_attempts ?? 0
    if (s === "not_called") continue
    worked++
    if (s in counts) counts[s]++
    if (REACHED.has(s)) reached++
    if (INTERESTED.has(s)) interested++
    if (s === "converted") converted++
  }
  return {
    kpis: {
      leadsWorked: worked,
      reached,
      interested,
      converted,
      callAttempts,
      conversionRate: worked > 0 ? Math.round((converted / worked) * 1000) / 10 : 0,
      reachRate: worked > 0 ? Math.round((reached / worked) * 1000) / 10 : 0,
    },
    funnel: [
      { stage: "Worked", count: worked },
      { stage: "Reached", count: reached },
      { stage: "Interested", count: interested },
      { stage: "Converted", count: converted },
    ],
    outcomes: OUTCOMES.map((o) => ({ ...o, count: counts[o.value] })),
  }
}

function trendsFor(events: EventRow[]) {
  const today = istTodayStart()
  const DAY = 86_400_000

  // Last 30 days
  const daily: { label: string; calls: number; conversions: number }[] = []
  const dayIndex: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const ts = today - i * DAY
    const key = dayKey(new Date(ts).toISOString())
    dayIndex[key] = daily.length
    const d = new Date(ts + IST_OFFSET_MS)
    daily.push({ label: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`, calls: 0, conversions: 0 })
  }

  // Last 12 weeks (week = 7-day bucket ending today)
  const weekly: { label: string; calls: number; conversions: number }[] = []
  for (let i = 11; i >= 0; i--) weekly.push({ label: `W-${i}`, calls: 0, conversions: 0 })

  // Last 12 months
  const monthly: { label: string; calls: number; conversions: number }[] = []
  const monthIndex: Record<string, number> = {}
  const nowIST = new Date(Date.now() + IST_OFFSET_MS)
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth() - i, 1))
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
    monthIndex[key] = monthly.length
    monthly.push({ label: MON[d.getUTCMonth()], calls: 0, conversions: 0 })
  }

  for (const e of events) {
    const t = new Date(e.created_at).getTime()
    const conv = e.call_status === "converted" ? 1 : 0

    const dk = dayKey(e.created_at)
    if (dk in dayIndex) {
      daily[dayIndex[dk]].calls++
      daily[dayIndex[dk]].conversions += conv
    }

    const weeksAgo = Math.floor((today + DAY - t) / (7 * DAY))
    if (weeksAgo >= 0 && weeksAgo < 12) {
      const idx = 11 - weeksAgo
      weekly[idx].calls++
      weekly[idx].conversions += conv
    }

    const mk = monthKey(e.created_at)
    if (mk in monthIndex) {
      monthly[monthIndex[mk]].calls++
      monthly[monthIndex[mk]].conversions += conv
    }
  }

  return { daily, weekly, monthly }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("fw_leads_token")?.value
  const session = token ? verifyToken(token) : null
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // Admin (Prithal) sees both scopes; a team member only ever receives their
  // own numbers — the "everyone" aggregate is never sent to a team token.
  const isAdmin = session.role === "admin"

  try {
    const supabase = getSupabase()

    const { data: leads, error: leadErr } = await supabase
      .from("waitlist_applications")
      .select("call_status, worked_by, call_attempts")
    if (leadErr) throw leadErr

    // Only need the last ~13 months of events for the trend windows.
    const since = new Date(Date.now() - 400 * 86_400_000).toISOString()
    const { data: events, error: evErr } = await supabase
      .from("lead_call_events")
      .select("actor, call_status, created_at")
      .gte("created_at", since)
    if (evErr) throw evErr

    const all = (leads || []) as LeadRow[]
    const team = all.filter((l) => l.worked_by === "team")
    const allEvents = (events || []) as EventRow[]
    const teamEvents = allEvents.filter((e) => e.actor === "team")

    const payload: Record<string, unknown> = {
      generatedAt: new Date().toISOString(),
      role: session.role,
      loggingSince: LOGGING_SINCE,
      eventsLogged: isAdmin ? allEvents.length : teamEvents.length,
      team: { ...snapshotFor(team), trends: trendsFor(teamEvents) },
    }
    if (isAdmin) payload.all = { ...snapshotFor(all), trends: trendsFor(allEvents) }
    return NextResponse.json(payload)
  } catch (err) {
    console.error("[admin/performance] error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
