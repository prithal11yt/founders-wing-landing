import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import type { LeadsRole } from "../auth/route"

function getSecret(): string {
  const secret = process.env.LEADS_AUTH_SECRET
  if (!secret) throw new Error("LEADS_AUTH_SECRET not configured")
  return secret
}

export type LeadsSession = { email: string; role: LeadsRole }

export function verifyToken(token: string): LeadsSession | null {
  try {
    const [data, signature] = token.split(".")
    if (!data || !signature) return null

    const secret = getSecret()
    const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url")

    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null

    const payload = JSON.parse(Buffer.from(data, "base64url").toString())

    if (payload.exp < Date.now()) return null

    // Tokens issued before roles existed belong to the founder, so default to
    // admin rather than locking the existing session out.
    const role: LeadsRole = payload.role === "team" ? "team" : "admin"

    return { email: payload.email, role }
  } catch {
    return null
  }
}

/** Reads and validates the session off the request cookie. */
export function getSession(request: NextRequest): LeadsSession | null {
  const token = request.cookies.get("fw_leads_token")?.value
  if (!token) return null
  return verifyToken(token)
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

  return NextResponse.json({ authenticated: true, email: result.email, role: result.role })
}
