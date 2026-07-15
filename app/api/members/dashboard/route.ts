import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyMemberToken } from "../session/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function authEmail(request: NextRequest): string | null {
  const token = request.cookies.get("fw_member_token")?.value
  if (!token) return null
  return verifyMemberToken(token)?.email ?? null
}

function monthStartISO(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}
function weekAgoISO(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
}

type GoalRow = { member_email: string; status: string; created_at: string }
type WingRow = { to_email: string; amount: number; type: string; created_at: string }

function goalBreakdown(goals: GoalRow[]) {
  return {
    total: goals.length,
    achieved: goals.filter((g) => g.status === "achieved").length,
    in_progress: goals.filter((g) => g.status === "in_progress").length,
    missed: goals.filter((g) => g.status === "missed").length,
  }
}

// GET → personal scorecard + community pulse
export async function GET(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const me = email.toLowerCase()

  try {
    const supabase = getSupabase()
    const monthStart = monthStartISO()
    const weekAgo = weekAgoISO()

    const [goalsRes, wingsRes, membersRes, callsRes, attendanceRes, profilesRes] = await Promise.all([
      supabase.from("fw_weekly_goals").select("member_email, status, created_at"),
      supabase.from("fw_wings_ledger").select("to_email, amount, type, created_at"),
      supabase.from("fw_memberships").select("email"),
      supabase.from("fw_calls").select("id"),
      supabase.from("fw_attendance").select("member_email, call_id"),
      supabase.from("fw_member_profiles").select("member_email, what_building"),
    ])

    const goals = (goalsRes.data || []) as GoalRow[]
    const wings = (wingsRes.data || []) as WingRow[]
    const members = membersRes.data || []
    const calls = callsRes.data || []
    const attendance = attendanceRes.data || []
    const profiles = profilesRes.data || []

    // ── Personal ──
    const myGoals = goals.filter((g) => g.member_email?.toLowerCase() === me)
    const myWingsMonth = wings
      .filter((w) => w.to_email?.toLowerCase() === me && w.created_at >= monthStart)
      .reduce((s, w) => s + w.amount, 0)
    const myWingsLifetime = wings
      .filter((w) => w.to_email?.toLowerCase() === me)
      .reduce((s, w) => s + w.amount, 0)
    const myAttended = new Set(
      attendance.filter((a) => a.member_email?.toLowerCase() === me).map((a) => a.call_id)
    ).size

    // ── Community ──
    const participatedThisWeek = new Set(
      goals.filter((g) => g.created_at >= weekAgo).map((g) => g.member_email?.toLowerCase())
    ).size
    const wingsGivenMonth = wings
      .filter((w) => w.type === "peer" && w.created_at >= monthStart)
      .reduce((s, w) => s + w.amount, 0)
    const profilesShared = new Set(
      profiles.filter((p) => p.what_building).map((p) => p.member_email.toLowerCase())
    ).size

    return NextResponse.json({
      personal: {
        wings_month: myWingsMonth,
        wings_lifetime: myWingsLifetime,
        goals: goalBreakdown(myGoals),
        attended: myAttended,
        total_calls: calls.length,
      },
      community: {
        total_members: members.length,
        participated_this_week: participatedThisWeek,
        profiles_shared: profilesShared,
        goals: goalBreakdown(goals),
        wings_given_month: wingsGivenMonth,
        total_calls: calls.length,
      },
    })
  } catch (err) {
    console.error("[members/dashboard] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
