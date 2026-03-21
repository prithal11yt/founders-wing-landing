import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyToken } from "../verify/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET(request: NextRequest) {
  // Verify authentication
  const token = request.cookies.get("fw_leads_token")?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("waitlist_applications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[leads/data] Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[leads/data] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
