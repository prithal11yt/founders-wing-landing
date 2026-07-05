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

const firstName = (n?: string | null) => (n || "A member").split(" ")[0]

// Shared: ordered members (join order = member_no), keyed maps.
async function loadMembers(supabase: ReturnType<typeof getSupabase>) {
  const { data } = await supabase
    .from("fw_memberships")
    .select("full_name, email")
    .order("created_at", { ascending: true })
  const members = data || []
  const byNo = new Map(members.map((m, i) => [i + 1, m]))
  const noByEmail = new Map(members.map((m, i) => [m.email.toLowerCase(), i + 1]))
  return { members, byNo, noByEmail }
}

// GET → open asks (weekly community_asks + ongoing need_help_with), each with
// who has raised their hand. Emails never leave the server — asks are keyed by
// member number, helpers are shown by first name.
export async function GET(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const me = email.toLowerCase()

  try {
    const supabase = getSupabase()
    const [{ byNo, noByEmail }, profilesRes, goalsRes, offersRes] = await Promise.all([
      loadMembers(supabase),
      supabase.from("fw_member_profiles").select("member_email, need_help_with, updated_at"),
      supabase.from("fw_weekly_goals").select("member_email, member_name, community_ask, created_at").order("created_at", { ascending: false }),
      supabase.from("fw_help_offers").select("ask_owner_email, ask_type, helper_email, helper_name"),
    ])

    const offers = offersRes.data || []
    const offersFor = (ownerEmail: string, type: string) =>
      offers.filter((o) => o.ask_owner_email.toLowerCase() === ownerEmail && o.ask_type === type)

    type Ask = {
      id: string; type: "weekly" | "ongoing"; owner_name: string; owner_no: number
      text: string; created_at: string; isMine: boolean; iOffered: boolean
      helpers: string[] // first names
    }
    const asks: Ask[] = []

    const buildAsk = (ownerEmail: string, type: "weekly" | "ongoing", text: string, created_at: string): Ask | null => {
      const lower = ownerEmail.toLowerCase()
      const no = noByEmail.get(lower)
      if (!no) return null // not a listed member (e.g. demo profile) — keep board members-only
      const o = offersFor(lower, type)
      return {
        id: `${no}:${type}`,
        type,
        owner_name: firstName(byNo.get(no)?.full_name),
        owner_no: no,
        text,
        created_at,
        isMine: lower === me,
        iOffered: o.some((x) => x.helper_email.toLowerCase() === me),
        helpers: o.map((x) => firstName(x.helper_name)),
      }
    }

    // Weekly: latest check-in ask per member
    const seen = new Set<string>()
    for (const g of goalsRes.data || []) {
      const key = g.member_email?.toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      if (!g.community_ask?.trim()) continue
      const ask = buildAsk(g.member_email, "weekly", g.community_ask, g.created_at)
      if (ask) asks.push(ask)
    }

    // Ongoing: profile "what I need help with right now"
    for (const p of profilesRes.data || []) {
      if (!p.need_help_with?.trim()) continue
      const ask = buildAsk(p.member_email, "ongoing", p.need_help_with, p.updated_at)
      if (ask) asks.push(ask)
    }

    asks.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    return NextResponse.json({ asks })
  } catch (err) {
    console.error("[members/helpboard] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// POST { ask_id } → raise your hand for an ask
export async function POST(request: NextRequest) {
  const email = authEmail(request)
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const me = email.toLowerCase()

  try {
    const { ask_id } = await request.json()
    const [noStr, type] = String(ask_id || "").split(":")
    const no = parseInt(noStr, 10)
    if (!no || !["weekly", "ongoing"].includes(type)) {
      return NextResponse.json({ error: "Invalid ask" }, { status: 400 })
    }

    const supabase = getSupabase()
    const { byNo } = await loadMembers(supabase)
    const owner = byNo.get(no)
    if (!owner) return NextResponse.json({ error: "Ask not found" }, { status: 404 })
    if (owner.email.toLowerCase() === me) {
      return NextResponse.json({ error: "That's your own ask 🙂" }, { status: 400 })
    }

    // Helper display name (fall back for the demo login, which isn't a membership row)
    const { data: helper } = await supabase
      .from("fw_memberships")
      .select("full_name")
      .ilike("email", email)
      .limit(1)
      .maybeSingle()
    const helperName = helper?.full_name || "Prithal Bhardwaj"

    const { error } = await supabase.from("fw_help_offers").upsert(
      {
        ask_owner_email: owner.email.toLowerCase(),
        ask_type: type,
        helper_email: me,
        helper_name: helperName,
      },
      { onConflict: "ask_owner_email,ask_type,helper_email", ignoreDuplicates: true }
    )
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[members/helpboard] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
