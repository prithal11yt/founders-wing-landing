import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

function getSecret(): string {
  const secret = process.env.LEADS_AUTH_SECRET
  if (!secret) throw new Error("LEADS_AUTH_SECRET not configured")
  return secret
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Signed member token — payload marked with typ:"member" so it can never be
// mistaken for an admin (fw_leads_token) session.
function signMemberToken(email: string): string {
  const secret = getSecret()
  const payload = { email, typ: "member", exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url")
  return `${data}.${signature}`
}

export function verifyMemberToken(token: string): { email: string } | null {
  try {
    const [data, signature] = token.split(".")
    if (!data || !signature) return null
    const secret = getSecret()
    const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url")
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null
    const payload = JSON.parse(Buffer.from(data, "base64url").toString())
    if (payload.typ !== "member") return null
    if (payload.exp < Date.now()) return null
    return { email: payload.email }
  } catch {
    return null
  }
}

// Look up a member by email and return their public-safe profile (no amount).
async function findMember(email: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("fw_memberships")
    .select("id, full_name, email, plan, created_at")
    .ilike("email", email.trim())
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

// Member number = join order across all memberships.
async function memberNumber(email: string): Promise<number | null> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from("fw_memberships")
    .select("email, created_at")
    .order("created_at", { ascending: true })
  if (!data) return null
  const idx = data.findIndex((m) => m.email?.toLowerCase() === email.toLowerCase())
  return idx === -1 ? null : idx + 1
}

// POST { email } → verify membership, set cookie
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    const member = await findMember(email)
    if (!member) {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 400))
      return NextResponse.json(
        { error: "We couldn't find that email. Use the email you joined Founders Wing with." },
        { status: 404 }
      )
    }

    const num = await memberNumber(member.email)
    const token = signMemberToken(member.email)
    const response = NextResponse.json({
      success: true,
      member: { ...member, member_no: num },
    })
    response.cookies.set("fw_member_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    })
    return response
  } catch (err) {
    console.error("[members/session] POST error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// GET → return current member from cookie
export async function GET(request: NextRequest) {
  const token = request.cookies.get("fw_member_token")?.value
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })

  const result = verifyMemberToken(token)
  if (!result) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 })
    response.cookies.delete("fw_member_token")
    return response
  }

  try {
    const member = await findMember(result.email)
    if (!member) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 })
      response.cookies.delete("fw_member_token")
      return response
    }
    const num = await memberNumber(member.email)
    return NextResponse.json({ authenticated: true, member: { ...member, member_no: num } })
  } catch (err) {
    console.error("[members/session] GET error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// DELETE → logout
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("fw_member_token")
  return response
}
