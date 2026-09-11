import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createInvitation } from "@/lib/member-credentials"
import { escapeLike } from "@/lib/like"
import { verifyToken } from "../../leads/verify/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("fw_leads_token")?.value
  if (!token) return false
  // Team-role tokens are valid but must not reach admin data.
  return verifyToken(token)?.role === "admin"
}

// POST creates a one-hour, single-use setup link after the admin verifies identity.
// Replacing the stored credential immediately invalidates existing member sessions.
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { email } = await request.json()
    if (typeof email !== "string" || email.length > 200 || !email.includes("@")) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    const lower = email.trim().toLowerCase()
    const supabase = getSupabase()
    const { data: member, error: memberError } = await supabase.from("fw_memberships")
      .select("email").ilike("email", escapeLike(lower)).limit(1).maybeSingle()
    if (memberError) throw memberError
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })
    const invite = await createInvitation()
    const { error } = await supabase.from("fw_member_auth").upsert({
      email: lower, password_hash: invite.stored, updated_at: new Date().toISOString(),
    }, { onConflict: "email" })
    if (error) throw error
    return NextResponse.json({ success: true, setupToken: invite.token, expiresAt: invite.expiresAt }, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (err) {
    console.error("[admin/member-auth] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
