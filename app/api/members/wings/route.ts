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

export const MONTHLY_ALLOWANCE = 100
export const GIVEAWAY_BONUS = 20

// Start of the current calendar month (UTC) as an ISO string.
function monthStartISO(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

type Ledger = { from_email: string | null; to_email: string; amount: number; type: string; created_at: string }

// GET → the caller's balances + the community leaderboard (monthly + lifetime)
export async function GET(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const lower = email.toLowerCase()

  try {
    const supabase = getSupabase()
    const monthStart = monthStartISO()

    const [{ data: ledger }, { data: members }] = await Promise.all([
      supabase.from("fw_wings_ledger").select("from_email, to_email, amount, type, created_at"),
      supabase.from("fw_memberships").select("full_name, email, created_at").order("created_at", { ascending: true }),
    ])

    const entries = (ledger || []) as Ledger[]

    // Received totals per member (monthly + lifetime)
    const monthlyReceived = new Map<string, number>()
    const lifetimeReceived = new Map<string, number>()
    for (const e of entries) {
      const to = e.to_email?.toLowerCase()
      if (!to) continue
      lifetimeReceived.set(to, (lifetimeReceived.get(to) || 0) + e.amount)
      if (e.created_at >= monthStart) monthlyReceived.set(to, (monthlyReceived.get(to) || 0) + e.amount)
    }

    // Caller's giving this month (peer only counts against the allowance)
    const givenThisMonth = entries
      .filter((e) => e.from_email?.toLowerCase() === lower && e.type === "peer" && e.created_at >= monthStart)
      .reduce((s, e) => s + e.amount, 0)

    const membersList = members || []
    const nameByEmail = new Map(membersList.map((m) => [m.email.toLowerCase(), m.full_name]))
    const memberNoByEmail = new Map(membersList.map((m, i) => [m.email.toLowerCase(), i + 1]))

    // Leaderboard: one row per member, ranked by monthly wings received.
    const leaderboard = membersList
      .map((m) => {
        const key = m.email.toLowerCase()
        return {
          name: m.full_name,
          member_no: memberNoByEmail.get(key) || null,
          isMe: key === lower,
          monthly: monthlyReceived.get(key) || 0,
          lifetime: lifetimeReceived.get(key) || 0,
        }
      })
      .sort((a, b) => b.monthly - a.monthly || b.lifetime - a.lifetime)

    // People the caller can give to (everyone but themselves)
    const giveTargets = membersList
      .filter((m) => m.email.toLowerCase() !== lower)
      .map((m) => ({ email: m.email, name: m.full_name }))

    return NextResponse.json({
      me: {
        monthly: monthlyReceived.get(lower) || 0,
        lifetime: lifetimeReceived.get(lower) || 0,
        givenThisMonth,
        remainingToGive: Math.max(0, MONTHLY_ALLOWANCE - givenThisMonth),
        allowance: MONTHLY_ALLOWANCE,
      },
      leaderboard,
      giveTargets,
      nameByEmail: Object.fromEntries(nameByEmail),
    })
  } catch (err) {
    console.error("[members/wings] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST { to_email, amount, reason } → give Wings to another member
export async function POST(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const lower = email.toLowerCase()

  try {
    const { to_email, amount, reason } = await request.json()
    const amt = Math.floor(Number(amount))
    if (!to_email || !amt || amt <= 0) {
      return NextResponse.json({ error: "Pick a member and a valid amount" }, { status: 400 })
    }
    if (to_email.toLowerCase() === lower) {
      return NextResponse.json({ error: "You can't give Wings to yourself" }, { status: 400 })
    }

    const supabase = getSupabase()
    const monthStart = monthStartISO()

    // Recipient must be a real member
    const { data: recipient } = await supabase
      .from("fw_memberships")
      .select("email")
      .ilike("email", to_email)
      .limit(1)
      .maybeSingle()
    if (!recipient) return NextResponse.json({ error: "That member wasn't found" }, { status: 404 })

    // Check remaining allowance this month
    const { data: given } = await supabase
      .from("fw_wings_ledger")
      .select("amount")
      .ilike("from_email", email)
      .eq("type", "peer")
      .gte("created_at", monthStart)
    const givenThisMonth = (given || []).reduce((s, g) => s + g.amount, 0)
    const remaining = MONTHLY_ALLOWANCE - givenThisMonth
    if (amt > remaining) {
      return NextResponse.json({ error: `You only have ${remaining} Wings left to give this month` }, { status: 400 })
    }

    // Record the gift
    const { error: giveErr } = await supabase.from("fw_wings_ledger").insert({
      from_email: lower,
      to_email: recipient.email,
      amount: amt,
      reason: (reason || "").trim() || null,
      type: "peer",
    })
    if (giveErr) throw giveErr

    // Give-away bonus: if this pushes them to the full 100 given this month, and
    // they haven't already received the bonus this month, award +20 once.
    let bonusAwarded = false
    if (givenThisMonth + amt >= MONTHLY_ALLOWANCE) {
      const { data: existingBonus } = await supabase
        .from("fw_wings_ledger")
        .select("id")
        .ilike("to_email", email)
        .eq("type", "bonus")
        .gte("created_at", monthStart)
        .limit(1)
        .maybeSingle()
      if (!existingBonus) {
        await supabase.from("fw_wings_ledger").insert({
          from_email: null,
          to_email: lower,
          amount: GIVEAWAY_BONUS,
          reason: "Gave all 100 Wings this month",
          type: "bonus",
        })
        bonusAwarded = true
      }
    }

    return NextResponse.json({ success: true, bonusAwarded })
  } catch (err) {
    console.error("[members/wings] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
