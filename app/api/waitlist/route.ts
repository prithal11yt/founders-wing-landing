import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received form data:", body)

    // Validate required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("[waitlist] Missing Supabase environment variables")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Insert form data into waitlist_applications table
    const { data, error } = await supabase
      .from("waitlist_applications")
      .insert([
        {
          full_name: body.fullName,
          email: body.email,
          what_building: body.idea,
          join_reason: body.goal,
          heard_from: body.heardFrom,
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Supabase error:", error.message, error.details)
      return NextResponse.json(
        { error: `Failed to save application: ${error.message}` },
        { status: 500 },
      )
    }

    console.log("[v0] Application saved successfully:", data)
    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 },
    )
  }
}
