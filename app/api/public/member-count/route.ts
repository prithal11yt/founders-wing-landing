import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Public, unauthenticated: the homepage shows how many founding members have
// joined. Only a count is ever returned — no names, emails or any other member
// data crosses this boundary.
export const revalidate = 60

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({ count: null }, { status: 200 })
  }

  try {
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { count, error } = await supabase
      .from("fw_memberships")
      .select("id", { count: "exact", head: true })

    if (error) {
      console.error("[public/member-count] Supabase error:", error)
      // Null lets the UI hide the count rather than render a wrong number.
      return NextResponse.json({ count: null }, { status: 200 })
    }

    return NextResponse.json(
      { count: count ?? null },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    )
  } catch (err) {
    console.error("[public/member-count] Error:", err)
    return NextResponse.json({ count: null }, { status: 200 })
  }
}
