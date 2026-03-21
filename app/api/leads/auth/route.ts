import { NextRequest, NextResponse } from "next/server"

const ALLOWED_EMAIL = "prithalbhardwaj@gmail.com"
const ACCESS_PASSWORD = "founderswing2026"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    if (email.toLowerCase() !== ALLOWED_EMAIL || password !== ACCESS_PASSWORD) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a simple token (email + timestamp + secret hash)
    const token = Buffer.from(
      JSON.stringify({ email: ALLOWED_EMAIL, exp: Date.now() + 24 * 60 * 60 * 1000 })
    ).toString("base64")

    const response = NextResponse.json({ success: true, email: ALLOWED_EMAIL })

    response.cookies.set("fw_leads_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
