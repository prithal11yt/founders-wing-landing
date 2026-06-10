import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const ALLOWED_EMAIL = "prithalbhardwaj@gmail.com"

function getSecret(): string {
  const secret = process.env.LEADS_AUTH_SECRET
  if (!secret) throw new Error("LEADS_AUTH_SECRET not configured")
  return secret
}

function getPassword(): string {
  const password = process.env.LEADS_PASSWORD
  if (!password) throw new Error("LEADS_PASSWORD not configured")
  return password
}

function signToken(payload: object): string {
  const secret = getSecret()
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url")
  return `${data}.${signature}`
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Constant-time comparison to prevent timing attacks
    const emailMatch = email.toLowerCase() === ALLOWED_EMAIL
    const passwordMatch = crypto.timingSafeEqual(
      Buffer.from(password),
      Buffer.from(getPassword().padEnd(password.length).slice(0, password.length))
    ) && password === getPassword()

    if (!emailMatch || !passwordMatch) {
      // Add small delay to prevent brute force
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = signToken({
      email: ALLOWED_EMAIL,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })

    const response = NextResponse.json({ success: true, email: ALLOWED_EMAIL })

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
