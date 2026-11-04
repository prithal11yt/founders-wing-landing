/* The weekly refresh, split into steps so one slow source can't starve the rest.
   crawl:   read a source's listing pages and save anything new as pending
   enrich:  read each new event's own page, drop duplicates, check relevance, publish
   verify:  re-check upcoming events, hiding dead links and updating changes */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolvePlace, slugify } from './config'
import { classifyBatch, hasAiKey, type ClassifyInput } from './classify'
import { crawlSource, fetchDetail, inIndianHours, pace, pool, type RawEvent, type SourceName } from './sources'

export function eventsDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function allRows<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await page(from, from + 999)
    if (error) throw new Error(error.message)
    rows.push(...(data ?? []))
    if (!data || data.length < 1000) return rows
  }
}

const place = (e: Pick<RawEvent, 'city_raw' | 'region_raw' | 'address'>) => resolvePlace(e.city_raw, e.region_raw, e.address)

function placeColumns(e: RawEvent) {
  const p = place(e)
  return { city: p.city, city_slug: p.citySlug, state: p.state, state_slug: p.stateSlug }
}

export async function crawlStep(source: SourceName, deadline: number) {
  const sb = eventsDb()
  const { events, pages, errors } = await crawlSource(source, deadline)
  const existing = await allRows<{ id: string; source_id: string }>((f, t) => sb.from('fw_events').select('id, source_id').eq('source', source).range(f, t))
  const known = new Map(existing.map(r => [r.source_id, r.id]))
  const now = new Date().toISOString()

  const fresh = events.filter(e => !known.has(e.source_id)).map(e => ({
    source: e.source, source_id: e.source_id, source_url: e.source_url, title: e.title, raw_title: e.title, raw_description: e.description, image_url: e.image_url,
    start_at: e.start_at, end_at: e.end_at, has_time: e.has_time, mode: e.mode, venue_name: e.venue_name, address: e.address, ...placeColumns(e), lat: e.lat, lng: e.lng,
    price_type: e.price_type, price_min: e.price_min, price_max: e.price_max, currency: e.currency, organizer: e.organizer, organizer_url: e.organizer_url,
    detail_at: null,
  }))
  for (let i = 0; i < fresh.length; i += 200) {
    const { error } = await sb.from('fw_events').upsert(fresh.slice(i, i + 200), { onConflict: 'source,source_id', ignoreDuplicates: true })
    if (error) throw new Error(error.message)
  }
  const seenIds = events.map(e => known.get(e.source_id)).filter(Boolean) as string[]
  for (let i = 0; i < seenIds.length; i += 200) {
    await sb.from('fw_events').update({ last_seen_at: now }).in('id', seenIds.slice(i, i + 200))
  }
  return { source, pages, found: events.length, added: fresh.length, errors: errors.slice(0, 10) }
}

/* ── Duplicates: the same event is often listed on more than one site ── */
const STOP = new Set(['the', 'a', 'an', 'of', 'in', 'at', 'for', 'and', 'to', 'by', 'with', 'on', 'event', 'events', 'india', '2026', '2027'])
const tokens = (t: string) => new Set(t.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP.has(w)))
function similar(a: string, b: string) {
  const x = tokens(a), y = tokens(b)
  if (!x.size || !y.size) return false
  const shared = [...x].filter(w => y.has(w)).length
  return shared / Math.min(x.size, y.size) >= 0.75 && shared >= 2
}
// When an event is on several sites, keep the link closest to the organiser's own page.
const SOURCE_RANK: Record<string, number> = { curated: 0, luma: 1, meetup: 2, eventbrite: 3, allevents: 4 }
const istDay = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 3600e3).toISOString().slice(0, 10)

type DedupeRow = { id: string; title: string; raw_title: string | null; source: string; start_at: string; city_slug: string | null; mode: string; status: string }

async function markDuplicates(sb: SupabaseClient): Promise<number> {
  const rows = await allRows<DedupeRow>((f, t) => sb.from('fw_events').select('id, title, raw_title, source, start_at, city_slug, mode, status')
    .in('status', ['pending', 'published']).gte('start_at', new Date(Date.now() - 864e5).toISOString()).order('id').range(f, t))
  const groups = new Map<string, DedupeRow[]>()
  for (const r of rows) { const k = `${istDay(r.start_at)}|${r.mode === 'online' ? 'online' : r.city_slug}`; groups.set(k, [...(groups.get(k) ?? []), r]) }
  let marked = 0
  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) => (SOURCE_RANK[a.source] ?? 9) - (SOURCE_RANK[b.source] ?? 9))
    const kept: DedupeRow[] = []
    for (const r of sorted) {
      const twin = kept.find(k => k.source !== r.source && similar(k.raw_title ?? k.title, r.raw_title ?? r.title))
      if (!twin) { kept.push(r); continue }
      await sb.from('fw_events').update({ status: 'duplicate', duplicate_of: twin.id, updated_at: new Date().toISOString() }).eq('id', r.id)
      marked++
    }
  }
  return marked
}

/* ── Slugs: readable, and stable once published ── */
export async function uniqueSlug(sb: SupabaseClient, title: string, city: string | null, startAt: string, id: string) {
  const d = new Date(new Date(startAt).getTime() + 5.5 * 3600e3)
  const when = `${d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toLowerCase()}-${d.getUTCDate()}-${d.getUTCFullYear()}`
  const name = slugify(title).split('-').slice(0, 9).join('-').slice(0, 70).replace(/-+$/, '')
  const base = [name, city && !name.includes(slugify(city)) ? slugify(city) : null, when].filter(Boolean).join('-')
  const { data } = await sb.from('fw_events').select('id').eq('slug', base).maybeSingle()
  return data && data.id !== id ? `${base}-${id.slice(0, 6)}` : base
}

type PendingRow = {
  id: string; source: string; source_url: string; title: string; raw_description: string | null; organizer: string | null; venue_name: string | null; city: string | null; city_slug: string | null; mode: string
  price_type: string; price_min: number | null; currency: string | null; start_at: string; detail_at: string | null; classified_at: string | null
}
const PENDING_COLS = 'id, source, source_url, title, raw_description, organizer, venue_name, city, city_slug, mode, price_type, price_min, currency, start_at, detail_at, classified_at'

function detailPatch(d: RawEvent, meetupFee?: boolean) {
  const patch: Record<string, unknown> = {
    start_at: d.start_at, has_time: d.has_time, mode: d.mode, updated_at: new Date().toISOString(),
    // Keep the listing's value when the event's own page doesn't state one.
    ...(d.end_at ? { end_at: d.end_at } : {}), ...(d.description ? { raw_description: d.description } : {}), ...(d.image_url ? { image_url: d.image_url } : {}),
    ...(d.venue_name ? { venue_name: d.venue_name } : {}), ...(d.address ? { address: d.address } : {}), ...(d.organizer ? { organizer: d.organizer } : {}), ...(d.organizer_url ? { organizer_url: d.organizer_url } : {}),
    ...(d.lat != null ? { lat: d.lat, lng: d.lng } : {}),
  }
  if (d.city_raw || d.address) { const p = place(d); if (p.citySlug) Object.assign(patch, { city: p.city, city_slug: p.citySlug, state: p.state, state_slug: p.stateSlug }) }
  if (d.source === 'meetup') {
    // Free to RSVP unless the page shows a fee.
    Object.assign(patch, meetupFee ? { price_type: 'paid' } : { price_type: 'free', price_min: 0, price_max: 0 })
  } else if (d.price_type !== 'unknown') {
    Object.assign(patch, { price_type: d.price_type, price_min: d.price_min, price_max: d.price_max, currency: d.currency })
  }
  return patch
}

export async function enrichStep(deadline: number) {
  const sb = eventsDb()
  const nowIso = new Date().toISOString()

  // 1. Read each new event's own page.
  const needDetail = await allRows<PendingRow>((f, t) => sb.from('fw_events').select(PENDING_COLS).eq('status', 'pending').is('detail_at', null).gte('start_at', nowIso).order('start_at').range(f, t))
  let detailed = 0, dead = 0
  // Most of the budget, since classifying is quick, but each source at its own pace.
  const bySource = new Map<string, PendingRow[]>()
  for (const r of needDetail) bySource.set(r.source, [...(bySource.get(r.source) ?? []), r])
  await Promise.all([...bySource.entries()].map(([source, rows]) => {
    const { size, delayMs } = pace(source)
    return pool(rows, size, deadline - 60_000, async r => {
      const { status, event, meetupFee } = await fetchDetail(r.source, r.source_url)
      if (status === 404 || status === 410) { await sb.from('fw_events').update({ status: 'hidden', ai_reason: `Source page returned ${status}`, detail_at: new Date().toISOString() }).eq('id', r.id); dead++; return }
      if (status !== 200) return // Temporary failure: left pending for the next run.
      const patch: Record<string, unknown> = { detail_at: new Date().toISOString() }
      if (event) {
        Object.assign(patch, detailPatch(event, meetupFee))
        if (event.cancelled) patch.status = 'cancelled'
        if (event.country && !['IN', 'IND', 'INDIA'].includes(event.country)) { patch.status = 'rejected'; patch.ai_reason = 'Outside India' }
        if (event.mode === 'online' && event.has_time && !inIndianHours(event.start_at)) { patch.status = 'rejected'; patch.ai_reason = 'Online, outside Indian hours' }
      }
      const { error } = await sb.from('fw_events').update(patch).eq('id', r.id)
      if (error) throw new Error(error.message)
      detailed++
    }, delayMs)
  }))

  // 2. Drop duplicates before spending anything on classifying them.
  const duplicates = await markDuplicates(sb)

  // 3. Check relevance, write our own summary, publish.
  const stats = { detailed, dead, duplicates, published: 0, rejected: 0, failed: 0, remaining: 0, aiMissing: false }
  const pending = await allRows<PendingRow>((f, t) => sb.from('fw_events').select(PENDING_COLS).eq('status', 'pending').not('detail_at', 'is', null).gte('start_at', nowIso).order('start_at').range(f, t))
  if (!hasAiKey()) { stats.aiMissing = true; stats.remaining = pending.length; return stats }

  const batches: PendingRow[][] = []
  for (let i = 0; i < pending.length; i += 10) batches.push(pending.slice(i, i + 10))
  const finished = await pool(batches, 4, deadline, async batch => {
    const input: ClassifyInput[] = batch.map(r => ({
      id: r.id, title: r.title, description: r.raw_description, organizer: r.organizer, venue: r.venue_name, city: r.city, mode: r.mode, source: r.source,
      price: r.price_type === 'free' ? 'free' : r.price_type === 'paid' ? `paid${r.price_min ? ` from ${r.price_min} ${r.currency ?? ''}` : ''}` : 'unknown',
    }))
    const verdicts = await classifyBatch(input)
    for (const r of batch) {
      const v = verdicts.get(r.id)
      if (!v) { stats.failed++; continue }
      const at = new Date().toISOString()
      if (!v.relevant || v.score < 50 || !v.summary) {
        await sb.from('fw_events').update({ status: 'rejected', score: v.score, ai_reason: v.reason, classified_at: at, updated_at: at }).eq('id', r.id)
        stats.rejected++
        continue
      }
      const slug = await uniqueSlug(sb, v.title, r.mode === 'online' ? 'online' : r.city, r.start_at, r.id)
      const { error } = await sb.from('fw_events').update({ status: 'published', slug, title: v.title, summary: v.summary, category: v.category, tags: v.tags, score: v.score, ai_reason: v.reason, classified_at: at, updated_at: at }).eq('id', r.id)
      if (error) { console.error('[events] publish failed:', error.message); stats.failed++; continue }
      stats.published++
    }
  })
  stats.remaining = Math.max(0, batches.length - finished) * 10
  return stats
}

/* Bookings are the point of this page, so a dead link is worse than no listing. */
export async function verifyStep(deadline: number) {
  const sb = eventsDb()
  const rows = await allRows<{ id: string; source: string; source_url: string; link_fail_count: number }>((f, t) => sb.from('fw_events').select('id, source, source_url, link_fail_count')
    .eq('status', 'published').gte('start_at', new Date().toISOString()).order('link_checked_at', { ascending: true, nullsFirst: true }).range(f, t))
  const stats = { checked: 0, hidden: 0, cancelled: 0, updated: 0, total: rows.length }
  await pool(rows, 3, deadline, async r => {
    const { status, event, meetupFee } = await fetchDetail(r.source, r.source_url)
    const at = new Date().toISOString()
    stats.checked++
    if (status === 404 || status === 410) {
      const fails = r.link_fail_count + 1
      // Two strikes in a row, so one bad response doesn't remove a real event.
      await sb.from('fw_events').update({ link_fail_count: fails, link_checked_at: at, ...(fails >= 2 ? { status: 'hidden', ai_reason: `Booking link returned ${status}` } : {}) }).eq('id', r.id)
      if (fails >= 2) stats.hidden++
      return
    }
    const patch: Record<string, unknown> = { link_checked_at: at }
    if (status === 200) patch.link_fail_count = 0
    if (status === 200 && event && r.source !== 'curated') { Object.assign(patch, detailPatch(event, meetupFee)); stats.updated++ }
    if (event?.cancelled) { patch.status = 'cancelled'; stats.cancelled++ }
    await sb.from('fw_events').update(patch).eq('id', r.id)
  })
  return stats
}

export async function saveRunStats(step: string, result: unknown) {
  const sb = eventsDb()
  const { data } = await sb.from('fw_settings').select('value').eq('key', 'events_refresh').maybeSingle()
  const at = new Date().toISOString()
  const value = { ...((data?.value as Record<string, unknown>) ?? {}), at, [step]: { at, result } }
  await sb.from('fw_settings').upsert({ key: 'events_refresh', value, updated_at: at })
}
