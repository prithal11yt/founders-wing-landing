import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { buildJourney } from "@/lib/server/journey"
import { verifyMemberToken } from "../session/route"

/* The members' Journey board: every member's stage, what they're building and
   their current 30-day goal. Read-only for members; the team sets all of it
   from /team/members (fw_crm_*). */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function authEmail(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("fw_member_token")?.value
  if (!token) return null
  return (await verifyMemberToken(token))?.email ?? null
}

export async function GET(request: NextRequest) {
  const email = await authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const journey = await buildJourney(getSupabase(), email.toLowerCase())
    return NextResponse.json(journey, { headers: { "Cache-Control": "private, no-store" } })
  } catch (err) {
    console.error("[members/journey] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
