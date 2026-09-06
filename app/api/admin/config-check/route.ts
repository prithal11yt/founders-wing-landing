import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "../../leads/verify/route"

// Admin-only. Reports whether required environment variables are present in
// the running deployment — never their values. Vercel only applies env vars to
// deployments created after the variable is added, so "I added it but it still
// doesn't work" is almost always a missing redeploy. This makes that visible
// instead of guessable.
export async function GET(request: NextRequest) {
  const token = request.cookies.get("fw_leads_token")?.value
  if (!token || verifyToken(token)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const present = (v?: string) => Boolean(v && v.trim().length > 0)

  return NextResponse.json({
    deployedAt: process.env.VERCEL_DEPLOYMENT_ID ?? "local",
    env: {
      LEADS_AUTH_SECRET: present(process.env.LEADS_AUTH_SECRET),
      LEADS_PASSWORD: present(process.env.LEADS_PASSWORD),
      TEAM_EMAIL: present(process.env.TEAM_EMAIL),
      TEAM_PASSWORD: present(process.env.TEAM_PASSWORD),
      NEXT_PUBLIC_SUPABASE_URL: present(process.env.NEXT_PUBLIC_SUPABASE_URL),
      SUPABASE_SERVICE_ROLE_KEY: present(process.env.SUPABASE_SERVICE_ROLE_KEY),
    },
    // A trailing space/newline pasted into the Vercel field silently breaks an
    // exact match. Report *whether* one is present without echoing the value.
    teamEmailHasWhitespace: /^\s|\s$/.test(process.env.TEAM_EMAIL ?? ""),
    teamPasswordHasWhitespace: /^\s|\s$/.test(process.env.TEAM_PASSWORD ?? ""),
  })
}
