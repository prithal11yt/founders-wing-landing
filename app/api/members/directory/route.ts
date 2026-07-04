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

// GET → every member with their snapshot profile attached (no emails/phones exposed)
export async function GET(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const lower = email.toLowerCase()

  try {
    const supabase = getSupabase()
    const [{ data: members }, { data: profiles }] = await Promise.all([
      supabase.from("fw_memberships").select("full_name, email, created_at").order("created_at", { ascending: true }),
      supabase.from("fw_member_profiles").select("member_email, what_building, who_its_for, problem, link"),
    ])

    const profileByEmail = new Map(
      (profiles || []).map((p) => [p.member_email.toLowerCase(), p])
    )

    const directory = (members || []).map((m, i) => {
      const key = m.email.toLowerCase()
      const p = profileByEmail.get(key)
      return {
        name: m.full_name,
        member_no: i + 1,
        isFounding: i + 1 <= 19,
        isMe: key === lower,
        hasProfile: !!p,
        what_building: p?.what_building || null,
        who_its_for: p?.who_its_for || null,
        problem: p?.problem || null,
        link: p?.link || null,
      }
    })

    return NextResponse.json({ directory })
  } catch (err) {
    console.error("[members/directory] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
