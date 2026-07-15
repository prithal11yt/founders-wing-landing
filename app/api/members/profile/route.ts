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

// GET → the caller's own profile (null if not set yet)
export async function GET(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("fw_member_profiles")
      .select("*")
      .ilike("member_email", email)
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ profile: data })
  } catch (err) {
    console.error("[members/profile] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// PUT → create or update the caller's own profile
export async function PUT(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const what_building = (body.what_building || "").trim()
    if (!what_building) {
      return NextResponse.json({ error: "Tell us what you're building or exploring" }, { status: 400 })
    }

    // Sanitize tag arrays: keep short trimmed strings only, capped.
    const cleanArray = (v: unknown, cap: number): string[] | null => {
      if (!Array.isArray(v)) return null
      const arr = v
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, cap)
      return arr.length ? arr : null
    }

    const supabase = getSupabase()
    const { data: member } = await supabase
      .from("fw_memberships")
      .select("full_name")
      .ilike("email", email)
      .limit(1)
      .maybeSingle()

    const { data, error } = await supabase
      .from("fw_member_profiles")
      .upsert(
        {
          member_email: email,
          member_name: member?.full_name || null,
          what_building,
          who_its_for: (body.who_its_for || "").trim() || null,
          problem: (body.problem || "").trim() || null,
          occupation: (body.occupation || "").trim() || null,
          location: (body.location || "").trim() || null,
          link: (body.link || "").trim() || null,
          how_i_help: (body.how_i_help || "").trim() || null,
          need_help_with: (body.need_help_with || "").trim() || null,
          stage: (body.stage || "").trim() || null,
          industry: (body.industry || "").trim() || null,
          tools: (body.tools || "").trim() || null,
          skills: cleanArray(body.skills, 12),
          open_to: cleanArray(body.open_to, 8),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "member_email" }
      )
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ success: true, profile: data })
  } catch (err) {
    console.error("[members/profile] PUT error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
