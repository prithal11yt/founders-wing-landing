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

export async function GET(request: NextRequest) {
  const session = getSession(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getSupabase()
    let query = supabase.from("waitlist_applications").select("*")

    // Team members only get leads nobody has worked yet, plus the ones they've
    // worked themselves — so their own callbacks stay visible while the
    // founder's contacted leads stay private. Filtering here (not in the UI)
    // means the restricted rows never leave the server.
    if (session.role === "team") {
      query = query.or("worked_by.is.null,worked_by.eq.team")
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("[leads/data] Supabase error:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error("[leads/data] Error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
