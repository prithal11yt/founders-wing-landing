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

const ADMIN_FIELDS = ["status", "starred", "notes", "call_status", "follow_up_at"]
// A team member's job is to call leads and record what happened, so they get
// the call outcome, notes and follow-up date — but not the pipeline status or
// starring, which stay the founder's editorial judgement.
const TEAM_FIELDS = ["notes", "call_status", "follow_up_at"]

// The call-tracking columns are added by a separate migration; until that runs
// we still want saves to work rather than the dashboard appearing broken.
// PostgREST reports a missing column as PGRST204 ("not found in schema cache")
// rather than passing through Postgres's own 42703, so both are treated the same.
const MISSING_COLUMN_CODES = new Set(["PGRST204", "42703"])
const isMissingColumn = (code?: string) => !!code && MISSING_COLUMN_CODES.has(code)

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

    // Ownership is read on its own, selecting only columns that are guaranteed
    // to exist. Bundling the optional tracking columns into this query would
    // make it fail wholesale on a database that hasn't been migrated yet, and a
    // failed read must never be mistaken for "no owner".
    const { data: existing, error: readError } = await supabase
      .from("waitlist_applications")
      .select("worked_by")
      .eq("id", id)
      .maybeSingle()

    if (readError) {
      console.error("[leads/update] Read failed:", readError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (session.role === "team") {
      // Re-check ownership server-side. Without this a team member could patch
      // any id they guessed, including the founder's private leads, even though
      // those rows are never sent to their dashboard.
      if (existing.worked_by && existing.worked_by !== "team") {
        return NextResponse.json({ error: "Not allowed for this lead" }, { status: 403 })
      }
    }

    const patch: Record<string, unknown> = { [field]: value === "" ? null : value }

    // Claim the lead for the team the moment they act on it, so it stays in
    // their list afterwards instead of disappearing once it's no longer
    // "not called".
    if (session.role === "team") {
      patch.worked_by = "team"
    }

    // Recording a call outcome is the signal that a call actually happened, so
    // stamp the time here rather than trusting a value from the browser. Moving
    // a lead back to "not called" is a correction, not a call, so it doesn't
    // count.
    let trackingPatch: Record<string, unknown> = {}
    if (field === "call_status" && value && value !== "not_called") {
      // Read the current count separately so a not-yet-migrated database
      // degrades to "no increment" instead of failing the whole request.
      const { data: counts } = await supabase
        .from("waitlist_applications")
        .select("call_attempts")
        .eq("id", id)
        .maybeSingle()

      trackingPatch = {
        last_called_at: new Date().toISOString(),
        call_attempts: ((counts?.call_attempts as number | undefined) ?? 0) + 1,
      }
    }

    let { error } = await supabase
      .from("waitlist_applications")
      .update({ ...patch, ...trackingPatch })
      .eq("id", id)

    // If the tracking columns aren't in the database yet, save the core change
    // anyway. The dashboard stays usable and starts recording call times as
    // soon as the migration is applied.
    if (isMissingColumn(error?.code)) {
      const retry = await supabase
        .from("waitlist_applications")
        .update(patch)
        .eq("id", id)
      error = retry.error
    }

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
