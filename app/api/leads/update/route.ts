import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getSession } from "../verify/route"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Supabase not configured")
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

const ADMIN_FIELDS = ["status", "starred", "notes", "call_status"]
// A team member's job is to call leads and record what happened, so they get
// the call outcome and notes — but not the pipeline status or starring, which
// stay the founder's editorial judgement.
const TEAM_FIELDS = ["notes", "call_status"]

export async function PATCH(request: NextRequest) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, field, value } = await request.json()

    if (!id || !field) {
      return NextResponse.json({ error: "Missing id or field" }, { status: 400 })
    }

    const allowedFields = session.role === "team" ? TEAM_FIELDS : ADMIN_FIELDS
    if (!allowedFields.includes(field)) {
      return NextResponse.json({ error: "Field not allowed" }, { status: 403 })
    }

    const supabase = getSupabase()

    if (session.role === "team") {
      // Re-check ownership server-side. Without this a team member could patch
      // any id they guessed, including the founder's private leads, even though
      // those rows are never sent to their dashboard.
      const { data: existing, error: readError } = await supabase
        .from("waitlist_applications")
        .select("worked_by")
        .eq("id", id)
        .maybeSingle()

      if (readError) {
        console.error("[leads/update] Ownership check failed:", readError)
        return NextResponse.json({ error: "Database error" }, { status: 500 })
      }
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      if (existing.worked_by && existing.worked_by !== "team") {
        return NextResponse.json({ error: "Not allowed for this lead" }, { status: 403 })
      }
    }

    const patch: Record<string, unknown> = { [field]: value }

    // Claim the lead for the team the moment they act on it, so it stays in
    // their list afterwards instead of disappearing once it's no longer
    // "not called".
    if (session.role === "team") {
      patch.worked_by = "team"
    }

    const { error } = await supabase
      .from("waitlist_applications")
      .update(patch)
      .eq("id", id)

    if (error) {
      console.error("[leads/update] Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[leads/update] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
