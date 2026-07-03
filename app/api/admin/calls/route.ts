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

// GET → all calls, newest first, each with an attendance count
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const supabase = getSupabase()
    const { data: calls, error } = await supabase
      .from("fw_calls")
      .select("*")
      .order("call_date", { ascending: false })
    if (error) throw error

    const { data: attendance } = await supabase.from("fw_attendance").select("call_id")
    const counts = new Map<string, number>()
    for (const a of attendance || []) counts.set(a.call_id, (counts.get(a.call_id) || 0) + 1)

    return NextResponse.json({
      calls: (calls || []).map((c) => ({ ...c, attendance_count: counts.get(c.id) || 0 })),
    })
  } catch (err) {
    console.error("[admin/calls] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST → create a weekly call
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { title, call_date } = await request.json()
    if (!title?.trim() || !call_date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 })
    }
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("fw_calls")
      .insert({ title: title.trim(), call_date })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ success: true, call: data })
  } catch (err) {
    console.error("[admin/calls] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE ?id= → remove a call (and its attendance via cascade)
export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const id = request.nextUrl.searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    const supabase = getSupabase()
    const { error } = await supabase.from("fw_calls").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[admin/calls] DELETE error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
