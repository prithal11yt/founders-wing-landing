import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// This endpoint is public, so it's the one surface an attacker can hammer.
// In Aug 2026 someone used it to (a) insert ~90 junk rows with no real details
// and (b) enumerate which email addresses were already registered, by reading
// the different responses for new vs. existing emails. The validation and the
// uniform response below close both of those off.

const MAX_LEN = {
  fullName: 120,
  email: 200,
  whatsapp: 25,
  idea: 2000,
  goal: 2000,
  heardFrom: 100,
}

// Deliberately simple: the goal is to reject obvious junk like "12345" or
// injection payloads, not to perfectly model RFC 5322.
const EMAIL_RE = /^[^\s@<>"'`;]+@[^\s@<>"'`;.]+\.[a-zA-Z]{2,}$/

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, max)
}

// Small in-memory throttle. Serverless instances are short-lived so this won't
// stop a determined distributed attacker, but it does stop the trivial case of
// one script firing 80 requests in under a minute, which is what happened.
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 5
const recentSubmissions = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (recentSubmissions.get(ip) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  hits.push(now)
  recentSubmissions.set(ip, hits)

  if (recentSubmissions.size > 5000) recentSubmissions.clear()

  return hits.length > RATE_LIMIT_MAX
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 })
    }

    // Honeypot: a hidden field real users never fill in. Bots that blindly
    // populate every field give themselves away, and we drop them silently so
    // they can't tell they've been caught.
    if (clean((body as Record<string, unknown>).company, 100)) {
      return NextResponse.json({ success: true, message: "Application submitted successfully" }, { status: 201 })
    }

    const fullName = clean((body as Record<string, unknown>).fullName, MAX_LEN.fullName)
    const email = clean((body as Record<string, unknown>).email, MAX_LEN.email).toLowerCase()
    const whatsapp = clean((body as Record<string, unknown>).whatsapp, MAX_LEN.whatsapp)
    const idea = clean((body as Record<string, unknown>).idea, MAX_LEN.idea)
    const goal = clean((body as Record<string, unknown>).goal, MAX_LEN.goal)
    const heardFrom = clean((body as Record<string, unknown>).heardFrom, MAX_LEN.heardFrom)

    const errors: string[] = []
    if (fullName.length < 2) errors.push("Please enter your name")
    if (!EMAIL_RE.test(email)) errors.push("Please enter a valid email address")
    // Digits only, so "+91 98765 43210" and "9876543210" both pass but junk doesn't.
    if (whatsapp.replace(/\D/g, "").length < 8) errors.push("Please enter a valid WhatsApp number")

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(". ") }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("[waitlist] Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: existing } = await supabase
      .from("waitlist_applications")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    // Same response either way. Previously "Already registered" vs. a success
    // message told an attacker whether an address was in the database, which
    // is exactly how the August enumeration run worked.
    if (!existing) {
      const { error } = await supabase.from("waitlist_applications").insert([
        {
          full_name: fullName,
          email,
          whatsapp,
          what_building: idea || null,
          join_reason: goal || null,
          heard_from: heardFrom || null,
        },
      ])

      if (error) {
        console.error("[waitlist] Supabase error:", error.message)
        return NextResponse.json({ error: "Could not save your application. Please try again." }, { status: 500 })
      }
    }

    return NextResponse.json(
      { success: true, message: "Application submitted successfully" },
      { status: 201 },
    )
  } catch (error) {
    console.error("[waitlist] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
