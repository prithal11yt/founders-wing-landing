import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { escapeLike } from "@/lib/like"
import { hashPassword, verifyPassword, verifyInvitation, credentialVersion } from "@/lib/member-credentials"

// Loose sanity check on the email shape before it ever reaches the database.
// This blocks "%"-style patterns and injection characters, while still allowing
// legitimate address characters like "_" and "+". The real wildcard safety net
// is escapeLike() on the lookup below — this is just defence in depth.
const EMAIL_RE = /^[^\s@%<>"'`;]+@[^\s@%<>"'`;]+\.[a-zA-Z]{2,}$/

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
function signMemberToken(email: string, passwordHash: string): string {
  const secret = getSecret()
  const payload = { email, typ: "member", ver: credentialVersion(passwordHash), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url")
  return `${data}.${signature}`
}

export async function verifyMemberToken(token: string): Promise<{ email: string } | null> {
  try {
    const [data, signature, extra] = token.split(".")
    if (!data || !signature || extra) return null
    const secret = getSecret()
    const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url")
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null
    const payload = JSON.parse(Buffer.from(data, "base64url").toString())
    if (payload.typ !== "member") return null
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp) || payload.exp <= Date.now()) return null
    if (typeof payload.email !== "string" || !EMAIL_RE.test(payload.email) || typeof payload.ver !== "string") return null
    const { data: auth, error } = await getSupabase().from("fw_member_auth")
      .select("password_hash").eq("email", payload.email.toLowerCase()).maybeSingle()
    if (error || !auth || auth.password_hash.startsWith("invite:")) return null
    if (payload.ver !== credentialVersion(auth.password_hash)) return null
    if (!await findMember(payload.email)) return null
    return { email: payload.email }
  } catch {
    return null
  }
}

// Hidden reference/demo profile. This email can log in and see a fully-filled
// example profile, but it is NOT a row in fw_memberships — so it never appears
// in the members directory, member count, or leaderboard.
const DEMO_EMAIL = "prithalbhardwaj@gmail.com"
const DEMO_MEMBER = {
  id: "demo",
  full_name: "Prithal Bhardwaj",
  email: DEMO_EMAIL,
  plan: "annual",
  created_at: "2026-06-24T00:00:00.000Z",
}

// Look up a member by email and return their public-safe profile (no amount).
async function findMember(email: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from("fw_memberships")
    .select("id, full_name, email, plan, created_at")
    .ilike("email", escapeLike(email.trim()))
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (data) return data
  if (email.trim().toLowerCase() === DEMO_EMAIL) return DEMO_MEMBER
  return null
}

// Member number = join order across all memberships.
async function memberNumber(email: string): Promise<number | null> {
  if (email.trim().toLowerCase() === DEMO_EMAIL) return 1 // demo displays as a founding member
  const supabase = getSupabase()
  const { data } = await supabase
    .from("fw_memberships")
    .select("email, created_at")
    .order("created_at", { ascending: true })
  if (!data) return null
  const idx = data.findIndex((m) => m.email?.toLowerCase() === email.toLowerCase())
  return idx === -1 ? null : idx + 1
}

// Per-IP throttle so member passwords can't be brute-forced from one script.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const recentAttempts = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (recentAttempts.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  hits.push(now)
  recentAttempts.set(ip, hits)
  if (recentAttempts.size > 5000) recentAttempts.clear()
  return hits.length > RATE_LIMIT_MAX
}

// POST — uniform email prompt, password login, or single-use invitation redemption.
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 })
    }

    const { email, password, mode, setupToken } = await request.json()
    if (!email || typeof email !== "string" || email.length > 200 || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
    }

    // The email screen must not reveal membership or password setup state.
    if (password === undefined) return NextResponse.json({ needsPassword: true })
    if (typeof password !== "string" || password.length === 0 || password.length > 128) {
      return NextResponse.json({ error: "Enter a password of up to 128 characters" }, { status: 400 })
    }
    const invalid = async () => {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      return NextResponse.json(
        { error: "Unable to sign in. Check your details, or ask Prithal for a new setup link." }, { status: 401 }
      )
    }
    const member = await findMember(email)
    if (!member) return invalid()
    const lower = member.email.toLowerCase()
    const supabase = getSupabase()
    const { data: auth, error: authError } = await supabase.from("fw_member_auth")
      .select("password_hash").eq("email", lower).maybeSingle()
    if (authError) throw authError
    if (!auth) return invalid()
    let passwordHash = auth.password_hash as string
    if (mode === "setup") {
      if (!await verifyInvitation(setupToken, passwordHash)) return invalid()
      if (password.length < 12) {
        return NextResponse.json({ error: "Use at least 12 characters" }, { status: 400 })
      }
      const replacement = await hashPassword(password)
      // Compare-and-swap makes the invitation single-use, including parallel requests.
      const { data: changed, error } = await supabase.from("fw_member_auth")
        .update({ password_hash: replacement, updated_at: new Date().toISOString() })
        .eq("email", lower).eq("password_hash", passwordHash).select("email").maybeSingle()
      if (error) throw error
      if (!changed) return invalid()
      passwordHash = replacement
    } else if (passwordHash.startsWith("invite:") || !await verifyPassword(password, passwordHash)) {
      return invalid()
    }

    const num = await memberNumber(member.email)
    const token = signMemberToken(member.email, passwordHash)
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

  const result = await verifyMemberToken(token)
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
