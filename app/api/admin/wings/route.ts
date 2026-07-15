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

const ADMIN_MONTHLY_POOL = 500

function monthStartISO(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

// GET → remaining admin pool this month + members list for the award UI
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const supabase = getSupabase()
    const monthStart = monthStartISO()
    const [{ data: awarded }, { data: members }] = await Promise.all([
      supabase.from("fw_wings_ledger").select("amount").eq("type", "admin").gte("created_at", monthStart),
      supabase.from("fw_memberships").select("full_name, email").order("created_at", { ascending: true }),
    ])
    const used = (awarded || []).reduce((s, a) => s + a.amount, 0)
    return NextResponse.json({
      pool: ADMIN_MONTHLY_POOL,
      used,
      remaining: Math.max(0, ADMIN_MONTHLY_POOL - used),
      members: (members || []).map((m) => ({ email: m.email, name: m.full_name })),
    })
  } catch (err) {
    console.error("[admin/wings] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST { to_email, amount, reason } → award Wings from the admin pool
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const { to_email, amount, reason } = await request.json()
    const amt = Math.floor(Number(amount))
    if (!to_email || !amt || amt <= 0) {
      return NextResponse.json({ error: "Pick a member and a valid amount" }, { status: 400 })
    }

    const supabase = getSupabase()
    const monthStart = monthStartISO()

    const { data: recipient } = await supabase
      .from("fw_memberships")
      .select("email")
      .ilike("email", to_email)
      .limit(1)
      .maybeSingle()
    if (!recipient) return NextResponse.json({ error: "Member not found" }, { status: 404 })

    const { data: awarded } = await supabase
      .from("fw_wings_ledger")
      .select("amount")
      .eq("type", "admin")
      .gte("created_at", monthStart)
    const used = (awarded || []).reduce((s, a) => s + a.amount, 0)
    const remaining = ADMIN_MONTHLY_POOL - used
    if (amt > remaining) {
      return NextResponse.json({ error: `Only ${remaining} Wings left in this month's pool` }, { status: 400 })
    }

    const { error } = await supabase.from("fw_wings_ledger").insert({
      from_email: null,
      to_email: recipient.email,
      amount: amt,
      reason: (reason || "").trim() || null,
      type: "admin",
    })
    if (error) throw error

    return NextResponse.json({ success: true, remaining: remaining - amt })
  } catch (err) {
    console.error("[admin/wings] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
