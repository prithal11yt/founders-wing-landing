import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function getSecret(): string {
  const secret = process.env.LEADS_AUTH_SECRET
  if (!secret) throw new Error("LEADS_AUTH_SECRET not configured")
  return secret
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const [data, signature] = token.split(".")
    if (!data || !signature) return null

    const secret = getSecret()
    const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url")

    // Constant-time comparison for signature
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString())

    if (payload.exp < Date.now()) return null

    return { email: payload.email }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("fw_leads_token")?.value

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const result = verifyToken(token)

  if (!result) {
    const response = NextResponse.json({ authenticated: false }, { status: 401 })
    response.cookies.delete("fw_leads_token")
    return response
  }

  return NextResponse.json({ authenticated: true, email: result.email })
}
