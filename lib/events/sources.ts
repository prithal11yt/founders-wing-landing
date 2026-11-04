/* Reads public event listings. All four sources publish schema.org Event data in their
   pages (Luma also through its public discover feed), so we read that rather than
   scraping page layout. We identify ourselves, stay at low concurrency and run weekly. */

import { CITIES } from './config'

export const USER_AGENT = 'FoundersWingEventsBot/1.0 (+https://www.founderswing.com/events)'
export type SourceName = 'eventbrite' | 'meetup' | 'luma' | 'allevents'
export const SOURCES: SourceName[] = ['eventbrite', 'meetup', 'luma', 'allevents']

export type RawEvent = {
  source: SourceName
  source_id: string
  source_url: string
  title: string
  description: string | null
  image_url: string | null
  start_at: string
  end_at: string | null
  has_time: boolean
  mode: 'in_person' | 'online' | 'hybrid'
  venue_name: string | null
  address: string | null
  city_raw: string | null
  region_raw: string | null
  country: string | null
  lat: number | null
  lng: number | null
  price_type: 'free' | 'paid' | 'unknown'
  price_min: number | null
  price_max: number | null
  currency: string | null
  organizer: string | null
  organizer_url: string | null
  cancelled: boolean
}

export async function fetchText(url: string, timeoutMs = 20_000): Promise<{ status: number; text: string }> {
  for (let attempt = 0; ; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/json;q=0.9,*/*;q=0.8' }, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' })
    // Told to slow down: wait once and try again, then leave it for the next run.
    if (r.status === 429 && attempt === 0) { await new Promise(res => setTimeout(res, 8000)); continue }
    return { status: r.status, text: r.ok ? await r.text() : '' }
  }
}

/** Eventbrite rate-limits quickly, so it gets gentler treatment than the others. */
export const pace = (source: string) => (source === 'eventbrite' ? { size: 2, delayMs: 900 } : { size: 4, delayMs: 200 })

/** Runs tasks with limited concurrency, stopping early when the time budget runs out. */
export async function pool<T>(items: T[], size: number, deadline: number, work: (item: T) => Promise<void>, delayMs = 150): Promise<number> {
  let next = 0, done = 0
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length && Date.now() < deadline) {
      const item = items[next++]
      try { await work(item); done++ } catch (e) { console.error('[events] task failed:', e instanceof Error ? e.message : e) }
      await new Promise(r => setTimeout(r, delayMs))
    }
  }))
  return done
}

/* ── schema.org parsing ── */
type Ld = Record<string, unknown>
const first = <T,>(v: T | T[] | null | undefined): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined)
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : typeof v === 'number' ? String(v) : null)
const num = (v: unknown): number | null => { const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN; return Number.isFinite(n) ? n : null }
const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
const cleanText = (s: string | null) => (s ? decode(s).replace(/<[^>]+>/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim() : null)

export function ldEvents(html: string): Ld[] {
  const out: Ld[] = []
  const visit = (n: unknown) => {
    if (Array.isArray(n)) { n.forEach(visit); return }
    if (!n || typeof n !== 'object') return
    const o = n as Ld
    if (/Event$/.test(String(first(o['@type'] as string | string[]) ?? '')) && o.startDate) { out.push(o); return }
    if (o['@graph']) visit(o['@graph'])
    if (o.itemListElement) visit(o.itemListElement)
    if (o.item) visit(o.item)
  }
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try { visit(JSON.parse(m[1])) } catch { /* one bad block shouldn't lose the page */ }
  }
  return out
}

function priceFromOffers(offersRaw: unknown): Pick<RawEvent, 'price_type' | 'price_min' | 'price_max' | 'currency'> {
  const offers = (Array.isArray(offersRaw) ? offersRaw : offersRaw ? [offersRaw] : []) as Ld[]
  const prices: number[] = []
  let currency: string | null = null
  for (const o of offers) {
    for (const k of ['lowPrice', 'highPrice', 'price']) { const n = num(o[k]); if (n !== null) prices.push(n) }
    currency = currency ?? str(o.priceCurrency)?.toUpperCase() ?? null
  }
  if (!prices.length) return { price_type: 'unknown', price_min: null, price_max: null, currency: null }
  const paid = prices.filter(p => p > 0)
  if (!paid.length) return { price_type: 'free', price_min: 0, price_max: 0, currency }
  return { price_type: 'paid', price_min: Math.min(...paid), price_max: Math.max(...paid), currency }
}

/** IST date with no clock time when a listing only gives a date, so sorting still works. */
function toIso(d: unknown): { iso: string | null; hasTime: boolean } {
  const s = str(d)
  if (!s) return { iso: null, hasTime: false }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { iso: `${s}T00:00:00+05:30`, hasTime: false }
  const t = new Date(s)
  return Number.isNaN(t.getTime()) ? { iso: null, hasTime: false } : { iso: t.toISOString(), hasTime: true }
}

function sourceId(source: SourceName, url: string): string | null {
  if (source === 'eventbrite') return url.match(/-(\d{6,})(?:[/?]|$)/)?.[1] ?? null
  if (source === 'meetup') return url.match(/\/events\/([a-z0-9]+)/i)?.[1] ?? null
  if (source === 'allevents') return url.match(/\/(\d{6,})(?:[/?]|$)/)?.[1] ?? null
  return url.match(/luma\.com\/([^/?#]+)/)?.[1] ?? url.match(/lu\.ma\/([^/?#]+)/)?.[1] ?? null
}

export function mapLd(source: SourceName, e: Ld): RawEvent | null {
  const url = str(e.url)?.split('?')[0].split('#')[0]
  const title = cleanText(str(e.name))
  const start = toIso(e.startDate)
  if (!url || !title || !start.iso) return null
  const id = sourceId(source, url)
  if (!id) return null

  const mode = String(e.eventAttendanceMode ?? '')
  const locations = (Array.isArray(e.location) ? e.location : [e.location]) as (Ld | undefined)[]
  const place = locations.find(l => l && /Place/.test(String(l['@type'])))
  const addr = (place?.address ?? {}) as Ld | string
  const addrObj = typeof addr === 'string' ? ({ streetAddress: addr } as Ld) : addr
  const geo = (place?.geo ?? {}) as Ld
  const online = /Online/.test(mode) || (!place && locations.some(l => l && /Virtual/.test(String(l['@type']))))
  const org = first(e.organizer as Ld | Ld[]) as Ld | undefined
  const end = toIso(e.endDate)
  const img = first(e.image as string | string[])
  return {
    source, source_id: id, source_url: url, title,
    description: cleanText(str(e.description)),
    image_url: typeof img === 'string' ? img : null,
    start_at: start.iso, end_at: end.iso, has_time: start.hasTime,
    mode: /Mixed/.test(mode) ? 'hybrid' : online ? 'online' : 'in_person',
    venue_name: cleanText(str(place?.name)),
    address: cleanText(str(addrObj.streetAddress)),
    city_raw: cleanText(str(addrObj.addressLocality)),
    region_raw: cleanText(str(addrObj.addressRegion)),
    country: str(addrObj.addressCountry)?.toUpperCase() ?? null,
    lat: num(geo.latitude), lng: num(geo.longitude),
    ...priceFromOffers(e.offers),
    organizer: cleanText(str(org?.name)),
    organizer_url: str(org?.url),
    cancelled: /Cancelled/i.test(String(e.eventStatus ?? '')),
  }
}

/* ── Listing pages to crawl each week ── */
const EVENTBRITE_TERMS = ['startup', 'entrepreneur', 'networking']
const MEETUP_TERMS = ['startup', 'entrepreneur', 'founder']
const ALLEVENTS_TERMS = ['startups', 'entrepreneurship', 'business']

export function listUrls(source: Exclude<SourceName, 'luma'>): string[] {
  const urls: string[] = []
  for (const c of CITIES) {
    if (source === 'eventbrite' && c.crawl?.eventbrite) for (const t of EVENTBRITE_TERMS) urls.push(`https://www.eventbrite.com/d/india--${c.crawl.eventbrite}/${t}/`)
    if (source === 'meetup' && c.crawl?.meetup) for (const t of MEETUP_TERMS) urls.push(`https://www.meetup.com/find/?keywords=${t}&location=in--${c.crawl.meetup}&source=EVENTS`)
    if (source === 'allevents' && c.crawl?.allevents) for (const t of ALLEVENTS_TERMS) urls.push(`https://allevents.in/${c.crawl.allevents}/${t}`)
  }
  if (source === 'eventbrite') for (const t of ['startup', 'entrepreneur']) urls.push(`https://www.eventbrite.com/d/online/${t}/`)
  if (source === 'meetup') for (const t of ['startup', 'entrepreneur']) urls.push(`https://www.meetup.com/find/?keywords=${t}&location=in--Bangalore&source=EVENTS&eventType=online`)
  return urls
}

/* ── Luma: public discover feed, searched around each city ── */
type LumaEntry = {
  event?: { name?: string; url?: string; start_at?: string; end_at?: string; timezone?: string; location_type?: string; cover_url?: string; geo_address_info?: { city?: string; region?: string; country_code?: string; sublocality?: string; full_address?: string; address?: string } | null; coordinate?: { latitude?: number; longitude?: number } | null }
  hosts?: { name?: string }[]
  calendar?: { name?: string; slug?: string | null }
  ticket_info?: { is_free?: boolean; price?: { cents?: number; currency?: string } | null; max_price?: { cents?: number } | null } | null
}

function mapLuma(entry: LumaEntry): RawEvent | null {
  const ev = entry.event
  if (!ev?.name || !ev.url || !ev.start_at) return null
  const geo = ev.geo_address_info ?? {}
  const t = entry.ticket_info
  const min = t?.price?.cents != null ? t.price.cents / 100 : null
  const hostNames = (entry.hosts ?? []).map(h => h.name).filter(Boolean).slice(0, 3).join(', ')
  return {
    source: 'luma', source_id: ev.url, source_url: `https://luma.com/${ev.url}`, title: decode(ev.name).trim(),
    description: [entry.calendar?.name && `Hosted by ${entry.calendar.name}.`, hostNames && `Hosts: ${hostNames}.`].filter(Boolean).join(' ') || null,
    image_url: ev.cover_url ?? null, start_at: new Date(ev.start_at).toISOString(), end_at: ev.end_at ? new Date(ev.end_at).toISOString() : null, has_time: true,
    mode: ev.location_type === 'offline' ? 'in_person' : 'online',
    venue_name: geo.sublocality ?? null, address: geo.full_address ?? geo.address ?? null,
    city_raw: geo.city ?? null, region_raw: geo.region ?? null, country: geo.country_code?.toUpperCase() ?? null,
    lat: ev.coordinate?.latitude ?? null, lng: ev.coordinate?.longitude ?? null,
    price_type: t?.is_free ? 'free' : min !== null ? 'paid' : 'unknown', price_min: t?.is_free ? 0 : min, price_max: t?.max_price?.cents != null ? t.max_price.cents / 100 : min,
    currency: t?.price?.currency?.toUpperCase() ?? null,
    organizer: entry.calendar?.name ?? entry.hosts?.[0]?.name ?? null, organizer_url: null, cancelled: false,
  }
}

async function crawlLuma(deadline: number, onError: (msg: string) => void): Promise<RawEvent[]> {
  const out: RawEvent[] = []
  const cities = CITIES.filter(c => c.crawl?.luma)
  await pool(cities, 3, deadline, async c => {
    let cursor: string | undefined
    for (let page = 0; page < 4; page++) {
      const u = `https://api2.luma.com/discover/get-paginated-events?latitude=${c.lat}&longitude=${c.lng}&pagination_limit=50${cursor ? `&pagination_cursor=${encodeURIComponent(cursor)}` : ''}`
      const { status, text } = await fetchText(u)
      if (status !== 200) { onError(`luma ${c.slug}: HTTP ${status}`); return }
      const j = JSON.parse(text) as { entries?: LumaEntry[]; has_more?: boolean; next_cursor?: string }
      for (const entry of j.entries ?? []) { const m = mapLuma(entry); if (m) out.push(m) }
      if (!j.has_more || !j.next_cursor) return
      cursor = j.next_cursor
    }
  })
  return out
}

// Plainly not founder events. Saves reading their pages and asking the model about them.
const JUNK_TITLE = /\b(study abroad|mba admission|admissions? (open|fair)|job fair|walk-?in drive|hiring drive|astrolog|numerolog|tarot|yoga|meditation|concert|dj night|stand-?up comedy|open mic|speed dating|singles|garba|navratri|bollywood|zumba|trading (class|masterclass|workshop)|forex|crypto trading|mlm|property (expo|fair)|real estate (expo|investing)|wedding|kids? (camp|workshop)|board exam|neet|jee)\b/i

export const inIndianHours = (iso: string) => {
  const h = Number(new Date(iso).toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }))
  return h >= 8 && h <= 22
}

/** Keeps India and Indian-time online events that haven't happened yet. */
function keep(e: RawEvent): boolean {
  if (new Date(e.end_at ?? e.start_at).getTime() < Date.now()) return false
  if (e.cancelled) return false
  if (JUNK_TITLE.test(e.title)) return false
  if (e.mode !== 'online' && !e.city_raw && !e.address) return false
  if (e.country && !['IN', 'IND', 'INDIA'].includes(e.country)) return false
  if (e.mode === 'online' && e.has_time) {
    // Global online listings: only sessions in a sensible slot for an Indian audience.
    if (!inIndianHours(e.start_at)) return false
  }
  return true
}

export async function crawlSource(source: SourceName, deadline: number): Promise<{ events: RawEvent[]; pages: number; errors: string[] }> {
  const errors: string[] = []
  const found = new Map<string, RawEvent>()
  const add = (e: RawEvent | null) => { if (e && keep(e) && !found.has(e.source_id)) found.set(e.source_id, e) }

  if (source === 'luma') {
    (await crawlLuma(deadline, m => errors.push(m))).forEach(add)
    return { events: [...found.values()], pages: CITIES.filter(c => c.crawl?.luma).length, errors }
  }
  const urls = listUrls(source)
  const { size, delayMs } = pace(source)
  const pages = await pool(urls, size, deadline, async url => {
    const { status, text } = await fetchText(url)
    if (status === 404) return // Not every city has every listing.
    if (status !== 200) { errors.push(`${source} ${url}: HTTP ${status}`); return }
    ldEvents(text).forEach(l => add(mapLd(source, l)))
  }, delayMs)
  return { events: [...found.values()], pages, errors }
}

/** Reads one event's own page, which has the exact time, price and organiser. */
export async function fetchDetail(source: string, url: string): Promise<{ status: number; event: RawEvent | null; meetupFee?: boolean }> {
  const { status, text } = await fetchText(url)
  if (status !== 200) return { status, event: null }
  const name = source as SourceName
  const parsed = ldEvents(text).map(l => mapLd(name, l)).find(Boolean) ?? null
  // Meetup leaves paid events out of its schema.org data, but sets feeSettings on the page.
  const meetupFee = source === 'meetup' ? /"feeSettings":\{/.test(text) : undefined
  return { status, event: parsed, meetupFee }
}
