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

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get("fw_leads_token")?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing ids" }, { status: 400 })
    }

    const supabase = getSupabase()
    const { error } = await supabase
      .from("waitlist_applications")
      .delete()
      .in("id", ids)

    if (error) {
      console.error("[leads/delete] Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[leads/delete] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
