import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyMemberToken } from "../session/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const VALID_STATUS = ["in_progress", "achieved", "missed"]

// Resolve the authenticated member's email from the session cookie.
function authEmail(request: NextRequest): string | null {
  const token = request.cookies.get("fw_member_token")?.value
  if (!token) return null
  return verifyMemberToken(token)?.email ?? null
}

// Attach each goal's member profile (what they're building / who for / problem)
// so the UI can render full context without a separate round trip.
async function withProfiles(supabase: ReturnType<typeof getSupabase>, goals: Record<string, unknown>[]) {
  if (goals.length === 0) return goals

  // Fetch all profiles (bounded by member count) rather than filtering by email —
  // emails aren't stored consistently lower-cased, so an .in() filter against
  // lower-cased values would silently miss any mixed-case address.
  const { data: profiles } = await supabase
    .from("fw_member_profiles")
    .select("member_email, what_building, who_its_for, problem")
  const byEmail = new Map((profiles || []).map((p) => [p.member_email.toLowerCase(), p]))
  return goals.map((g) => ({ ...g, profile: byEmail.get((g.member_email as string)?.toLowerCase()) || null }))
}

// GET → { mine: [...], feed: [latest goal per member] }, each with its member's profile attached
export async function GET(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("fw_weekly_goals")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error

    const goals = data || []
    const mine = goals.filter((g) => g.member_email?.toLowerCase() === email.toLowerCase())

    // Community feed: latest goal per member (goals already sorted newest-first).
    const seen = new Set<string>()
    const feed = []
    for (const g of goals) {
      const key = g.member_email?.toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      feed.push(g)
    }

    return NextResponse.json({
      mine: await withProfiles(supabase, mine),
      feed: await withProfiles(supabase, feed),
    })
  } catch (err) {
    console.error("[members/goals] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST → submit this week's check-in (just the goal + community ask)
export async function POST(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const goal = (body.goal || "").trim()
    if (!goal) {
      return NextResponse.json({ error: "Your 7-day goal is required" }, { status: 400 })
    }

    const supabase = getSupabase()

    // Denormalize the member's name so the feed doesn't need a join.
    const { data: member } = await supabase
      .from("fw_memberships")
      .select("full_name")
      .ilike("email", email)
      .limit(1)
      .maybeSingle()

    const { data, error } = await supabase
      .from("fw_weekly_goals")
      .insert({
        member_email: email,
        member_name: member?.full_name || null,
        goal,
        community_ask: (body.community_ask || "").trim() || null,
      })
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ success: true, goal: data })
  } catch (err) {
    console.error("[members/goals] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PATCH → update the status of one of your own goals
export async function PATCH(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id, status } = await request.json()
    if (!id || !VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const supabase = getSupabase()
    // Scope the update to the caller's own goal so members can't edit others'.
    const { data, error } = await supabase
      .from("fw_weekly_goals")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .ilike("member_email", email)
      .select()
    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[members/goals] PATCH error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
