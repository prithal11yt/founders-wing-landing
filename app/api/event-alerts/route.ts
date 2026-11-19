import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { CITIES } from "@/lib/events/config"

// Sign-up for the weekly startup-events email, from the /events pages.
// Same defences as /api/waitlist: a honeypot, a per-IP throttle, and one
// response for new and existing addresses so nobody can test who signed up.

const EMAIL_RE = /^[^\s@<>"'`;]+@[^\s@<>"'`;.]+\.[a-zA-Z]{2,}$/
const CITY_SLUGS = new Set(["india", ...CITIES.map(c => c.slug)])

const WINDOW_MS = 60_000
const MAX_HITS = 5
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear()
  return list.length > MAX_HITS
}

const OK = { success: true }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 })

  if (typeof body.company === "string" && body.company.trim()) return NextResponse.json(OK)

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : ""
  const city = typeof body.city === "string" && CITY_SLUGS.has(body.city) ? body.city : "india"
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

  const { error } = await supabase
    .from("fw_event_alerts")
    .upsert({ email, city_slug: city }, { onConflict: "email,city_slug", ignoreDuplicates: true })
  if (error) {
    console.error("[event-alerts] insert failed:", error.message)
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 500 })
  }
  return NextResponse.json(OK)
}
