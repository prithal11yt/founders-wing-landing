import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyToken } from "../../leads/verify/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("fw_leads_token")?.value
  return !!token && !!verifyToken(token)
}

const DEMO_EMAIL = "prithalbhardwaj@gmail.com"

type Event = { type: string; icon: string; text: string; detail?: string | null; actor?: string; ts: string }

function monthStartISO() {
  const n = new Date()
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1)).toISOString()
}
function weekAgoISO() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
}

// GET → unified activity timeline + a community pulse summary (admin only)
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabase()
    const [membersRes, wingsRes, goalsRes, attendanceRes, callsRes, offersRes, authRes] = await Promise.all([
      supabase.from("fw_memberships").select("full_name, email, plan, created_at").order("created_at", { ascending: true }),
      supabase.from("fw_wings_ledger").select("from_email, to_email, amount, reason, type, created_at"),
      supabase.from("fw_weekly_goals").select("member_email, member_name, goal, status, created_at, updated_at"),
      supabase.from("fw_attendance").select("member_email, member_name, call_id, created_at"),
      supabase.from("fw_calls").select("id, title"),
      supabase.from("fw_help_offers").select("helper_email, helper_name, ask_owner_email, created_at"),
      supabase.from("fw_member_auth").select("email, updated_at"),
    ])

    const members = membersRes.data || []
    const nameByEmail = new Map(members.map((m) => [m.email.toLowerCase(), m.full_name]))
    const name = (email?: string | null) => {
      if (!email) return "Admin"
      const lower = email.toLowerCase()
      if (lower === DEMO_EMAIL) return "Prithal"
      return nameByEmail.get(lower) || (email.split("@")[0] || "A member")
    }
    const first = (n?: string | null) => (n || "A member").split(" ")[0]
    const callTitle = new Map((callsRes.data || []).map((c) => [c.id, c.title]))

    const events: Event[] = []

    // New members
    for (const m of members) {
      events.push({ type: "join", icon: "🎉", text: `${first(m.full_name)} joined Founders Wing`, detail: `${m.plan} plan`, actor: m.email, ts: m.created_at })
    }
    // First login (password set)
    for (const a of authRes.data || []) {
      events.push({ type: "login", icon: "🔑", text: `${first(name(a.email))} logged in for the first time`, actor: a.email, ts: a.updated_at })
    }
    // Wings
    for (const w of wingsRes.data || []) {
      if (w.type === "bonus") {
        events.push({ type: "wings", icon: "🎁", text: `${first(name(w.to_email))} earned a +${w.amount} Wing bonus`, ts: w.created_at })
      } else if (w.type === "admin" || !w.from_email) {
        events.push({ type: "wings", icon: "🪽", text: `Admin awarded ${w.amount} Wings to ${first(name(w.to_email))}`, detail: w.reason, ts: w.created_at })
      } else {
        events.push({ type: "wings", icon: "🪽", text: `${first(name(w.from_email))} gave ${w.amount} Wings to ${first(name(w.to_email))}`, detail: w.reason, actor: w.from_email, ts: w.created_at })
      }
    }
    // Goals set + status changes
    for (const g of goalsRes.data || []) {
      events.push({ type: "goal", icon: "🎯", text: `${first(g.member_name || name(g.member_email))} set a weekly goal`, detail: g.goal, actor: g.member_email, ts: g.created_at })
      if (g.status !== "in_progress" && g.updated_at && g.updated_at !== g.created_at) {
        events.push({ type: "goal_status", icon: g.status === "achieved" ? "✅" : "❌", text: `${first(g.member_name || name(g.member_email))} marked their goal ${g.status}`, actor: g.member_email, ts: g.updated_at })
      }
    }
    // Attendance
    for (const a of attendanceRes.data || []) {
      events.push({ type: "attendance", icon: "📋", text: `${first(a.member_name || name(a.member_email))} marked attendance`, detail: callTitle.get(a.call_id) || null, actor: a.member_email, ts: a.created_at })
    }
    // Help offers
    for (const o of offersRes.data || []) {
      events.push({ type: "help", icon: "🙋", text: `${first(o.helper_name || name(o.helper_email))} offered to help ${first(name(o.ask_owner_email))}`, actor: o.helper_email, ts: o.created_at })
    }

    events.sort((a, b) => (a.ts < b.ts ? 1 : -1))

    // ── Pulse summary ──
    const weekAgo = weekAgoISO()
    const monthStart = monthStartISO()
    const recentActors = new Set(
      events.filter((e) => e.ts >= weekAgo && e.actor).map((e) => e.actor!.toLowerCase())
    )
    const goalsThisWeek = (goalsRes.data || []).filter((g) => g.created_at >= weekAgo).length
    const wingsThisMonth = (wingsRes.data || [])
      .filter((w) => w.type === "peer" && w.created_at >= monthStart)
      .reduce((s, w) => s + w.amount, 0)

    return NextResponse.json({
      summary: {
        total_members: members.length,
        activated: (authRes.data || []).length,
        active_this_week: recentActors.size,
        goals_this_week: goalsThisWeek,
        wings_this_month: wingsThisMonth,
      },
      events: events.slice(0, 200),
    })
  } catch (err) {
    console.error("[admin/activity] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
