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

// GET → latest call + whether I attended it + my total attendance count
export async function GET(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabase()

    const { data: latest } = await supabase
      .from("fw_calls")
      .select("*")
      .order("call_date", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: myAttendance } = await supabase
      .from("fw_attendance")
      .select("call_id")
      .ilike("member_email", email)

    const attendedCallIds = new Set((myAttendance || []).map((a) => a.call_id))
    const { count: totalCalls } = await supabase.from("fw_calls").select("*", { count: "exact", head: true })

    return NextResponse.json({
      latestCall: latest || null,
      attendedLatest: latest ? attendedCallIds.has(latest.id) : false,
      attendedCount: attendedCallIds.size,
      totalCalls: totalCalls || 0,
    })
  } catch (err) {
    console.error("[members/attendance] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST { call_id } → self-mark attendance for a call
export async function POST(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { call_id } = await request.json()
    if (!call_id) return NextResponse.json({ error: "call_id required" }, { status: 400 })

    const supabase = getSupabase()

    // Confirm the call exists
    const { data: call } = await supabase.from("fw_calls").select("id").eq("id", call_id).maybeSingle()
    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 })

    const { data: member } = await supabase
      .from("fw_memberships")
      .select("full_name")
      .ilike("email", email)
      .limit(1)
      .maybeSingle()

    // Idempotent insert — unique(call_id, member_email) prevents duplicates
    const { error } = await supabase
      .from("fw_attendance")
      .upsert(
        { call_id, member_email: email, member_name: member?.full_name || null },
        { onConflict: "call_id,member_email", ignoreDuplicates: true }
      )
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[members/attendance] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
