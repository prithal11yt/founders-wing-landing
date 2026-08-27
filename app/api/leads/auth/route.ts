import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Two levels of access to the leads data:
//   admin — the founder. Sees and edits everything, can delete.
//   team  — a team member. Sees untouched leads plus the ones they've worked
//           themselves; never sees leads the founder has already actioned.
// Roles are carried inside the signed token so every API route can enforce
// them without a second round trip.
export type LeadsRole = "admin" | "team"

const ADMIN_EMAIL = "prithalbhardwaj@gmail.com"

function getSecret(): string {
  const secret = process.env.LEADS_AUTH_SECRET
  if (!secret) throw new Error("LEADS_AUTH_SECRET not configured")
  return secret
}

function signToken(payload: object): string {
  const secret = getSecret()
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url")
  return `${data}.${signature}`
}

// Comparing digests keeps this constant-time even when the two strings differ
// in length, which a raw timingSafeEqual on the inputs can't do (it throws).
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest()
  const hb = crypto.createHash("sha256").update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

function resolveRole(email: string, password: string): { email: string; role: LeadsRole } | null {
  const adminPassword = process.env.LEADS_PASSWORD
  const teamEmail = process.env.TEAM_EMAIL
  const teamPassword = process.env.TEAM_PASSWORD

  if (adminPassword && safeEqual(email, ADMIN_EMAIL) && safeEqual(password, adminPassword)) {
    return { email: ADMIN_EMAIL, role: "admin" }
  }

  if (teamEmail && teamPassword && safeEqual(email, teamEmail.toLowerCase()) && safeEqual(password, teamPassword)) {
    return { email: teamEmail.toLowerCase(), role: "team" }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const account = resolveRole(email.trim().toLowerCase(), password)

    if (!account) {
      // Slow failed attempts down so the endpoint isn't cheap to brute force.
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = signToken({
      email: account.email,
      role: account.role,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })

    const response = NextResponse.json({
      success: true,
      email: account.email,
      role: account.role,
    })

    response.cookies.set("fw_leads_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 86400,
      path: "/",
    })

    return response
  } catch (err) {
    console.error("[leads/auth] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
