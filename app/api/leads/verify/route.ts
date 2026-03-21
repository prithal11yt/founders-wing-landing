import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("fw_leads_token")?.value

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    if (decoded.exp < Date.now()) {
      const response = NextResponse.json({ authenticated: false, error: "Session expired" }, { status: 401 })
      response.cookies.delete("fw_leads_token")
      return response
    }

    return NextResponse.json({ authenticated: true, email: decoded.email })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
