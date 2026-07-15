import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyToken } from "../../leads/verify/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  // Reuse the same admin auth as the leads dashboard
  const token = request.cookies.get("fw_leads_token")?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("fw_memberships")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[members/data] Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Number members by join order: first to join = Member 1
    const withNumbers = (data || []).map((m, i) => ({ ...m, member_no: i + 1 }))
    return NextResponse.json(withNumbers)
  } catch (err) {
    console.error("[members/data] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
