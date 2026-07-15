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

// DELETE { email } → clear a member's password so their next login
// shows the "create password" screen again. This is the whole
// forgot-password flow: WhatsApp message → one admin tap.
export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }
    const supabase = getSupabase()
    const { error } = await supabase.from("fw_member_auth").delete().eq("email", email.trim().toLowerCase())
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[admin/member-auth] DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
