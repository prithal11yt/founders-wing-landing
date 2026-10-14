import { NextRequest } from "next/server"
import { db, session, json, unauthorized, serverError, phoneDigits } from "@/lib/server/tracker"

// Twitter outreach leads are auto-logged by a bot into a Google Sheet. This
// pulls the sheet's CSV export and adds any new rows to the leads table so the
// team works a single list. Idempotent: rows are keyed by handle (source_ref)
// and skipped when the phone number already exists as a lead.
const SHEET_ID = process.env.TWITTER_LEADS_SHEET_ID || "1PrtrpLicLNa_LBapKvn9J7_2bn2jNWBQ_7f_G3qIbjM"
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`
const MIN_INTERVAL_MS = 10 * 60 * 1000

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = "", inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false
      } else field += c
    } else if (c === '"') inQ = true
    else if (c === ",") { row.push(field); field = "" }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++
      row.push(field); rows.push(row); row = []; field = ""
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(v => v.trim()))
}

export async function POST(req: NextRequest) {
  const s = session(req)
  if (!s) return unauthorized()

  try {
    const sb = db()
    const force = req.nextUrl.searchParams.get("force") === "1"
    const { data: last } = await sb.from("fw_settings").select("value").eq("key", "twitter_sync").maybeSingle()
    const lastAt = (last?.value as { at?: string } | null)?.at
    if (!force && lastAt && Date.now() - new Date(lastAt).getTime() < MIN_INTERVAL_MS) {
      return json({ skipped: true, last_sync: lastAt, added: 0 })
    }

    const res = await fetch(CSV_URL, { cache: "no-store" })
    if (!res.ok) return json({ error: `Sheet fetch failed (${res.status})` }, 502)
    const rows = parseCSV(await res.text())
    if (rows.length < 2) return json({ added: 0, total: 0 })

    const header = rows[0].map(h => h.trim().toLowerCase())
    const col = (name: string) => header.findIndex(h => h.startsWith(name))
    const ci = {
      date: col("date"), handle: col("handle"), name: col("name"), product: col("product"), link: col("product link"),
      phone: col("phone"), interest: col("interest"), status: col("status"), notes: col("notes"),
    }
    const get = (r: string[], i: number) => (i >= 0 ? (r[i] || "").trim() : "")

    const { data: existing, error: exErr } = await sb
      .from("waitlist_applications").select("source_ref, whatsapp").not("whatsapp", "is", null)
    if (exErr) throw exErr
    const knownRefs = new Set((existing || []).map(e => e.source_ref).filter(Boolean))
    const knownPhones = new Set((existing || []).map(e => phoneDigits(e.whatsapp)).filter(Boolean))

    const inserts = []
    for (const r of rows.slice(1)) {
      let handle = get(r, ci.handle).replace(/^https?:\/\/(x|twitter)\.com\//i, "@").replace(/^@?/, "@")
      const phone = get(r, ci.phone)
      const digits = phoneDigits(phone)
      if (!digits && handle === "@") continue
      if (handle === "@") handle = `@phone:${digits}`
      const ref = `twitter:${handle.toLowerCase()}`
      if (knownRefs.has(ref) || (digits && knownPhones.has(digits))) continue
      knownRefs.add(ref); if (digits) knownPhones.add(digits)

      const date = get(r, ci.date)
      const product = get(r, ci.product)
      const link = get(r, ci.link)
      const interest = get(r, ci.interest)
      inserts.push({
        full_name: get(r, ci.name) || handle,
        email: null,
        whatsapp: phone || null,
        heard_from: "twitter",
        twitter_handle: handle,
        product: product || null,
        what_building: [product, link].filter(Boolean).join(" · ") || null,
        join_reason: interest || null,
        notes: "",
        source_ref: ref,
        created_at: /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00+05:30` : new Date().toISOString(),
      })
    }

    // Upsert on source_ref so two overlapping syncs (or a retry) never
    // duplicate a lead or fail on the unique index.
    if (inserts.length) {
      const { error: insErr } = await sb.from("waitlist_applications").upsert(inserts, { onConflict: "source_ref", ignoreDuplicates: true })
      if (insErr) throw insErr
    }
    const at = new Date().toISOString()
    await sb.from("fw_settings").upsert({ key: "twitter_sync", value: { at, added: inserts.length, rows: rows.length - 1 }, updated_at: at })
    return json({ added: inserts.length, total: rows.length - 1, last_sync: at })
  } catch (err) {
    return serverError("team/twitter-sync", err)
  }
}
