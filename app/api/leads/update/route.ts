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

export async function PATCH(request: NextRequest) {
  // Verify authentication
  const token = request.cookies.get("fw_leads_token")?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, field, value } = await request.json()

    if (!id || !field) {
      return NextResponse.json({ error: "Missing id or field" }, { status: 400 })
    }

    // Only allow updating specific safe fields
    const allowedFields = ["status", "starred", "notes"]
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: "Field not allowed" }, { status: 403 })
    }

    const supabase = getSupabase()
    const { error } = await supabase
      .from("waitlist_applications")
      .update({ [field]: value })
      .eq("id", id)

    if (error) {
      console.error("[leads/update] Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[leads/update] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
