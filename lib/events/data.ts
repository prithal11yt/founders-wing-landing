import { unstable_cache } from 'next/cache'
import { allRows, eventsDb } from './refresh'
import { isOver, type ListedEvent } from './format'
import type { EventCategory } from './config'

/* Everything the public pages read. Cached and tagged 'events', so the weekly refresh
   can update every page at once. If the database can't be reached the pages show an empty
   state rather than a server error. */

const LIST_COLS = 'slug, title, image_url, start_at, end_at, has_time, mode, venue_name, city, city_slug, state, state_slug, price_type, price_min, price_max, currency, category, source, source_url, organizer'

type Row = {
  slug: string; title: string; image_url: string | null; start_at: string; end_at: string | null; has_time: boolean; mode: ListedEvent['mode']; venue_name: string | null
  city: string | null; city_slug: string | null; state: string | null; state_slug: string | null; price_type: ListedEvent['priceType']; price_min: number | null; price_max: number | null
  currency: string | null; category: string | null; source: string; source_url: string; organizer: string | null
}

const toListed = (r: Row): ListedEvent => ({
  slug: r.slug, title: r.title, image: r.image_url, startAt: r.start_at, endAt: r.end_at, hasTime: r.has_time, mode: r.mode, venue: r.venue_name,
  city: r.city, citySlug: r.city_slug, state: r.state, stateSlug: r.state_slug, priceType: r.price_type, priceMin: r.price_min, priceMax: r.price_max,
  currency: r.currency, category: r.category as EventCategory | null, source: r.source, url: r.source_url, organizer: r.organizer,
})

const fetchUpcoming = unstable_cache(async (): Promise<ListedEvent[]> => {
  const sb = eventsDb()
  // Multi-day events that started up to a month ago can still be running.
  const since = new Date(Date.now() - 30 * 864e5).toISOString()
  const rows = await allRows<Row>((f, t) => sb.from('fw_events').select(LIST_COLS).eq('status', 'published').not('slug', 'is', null).gte('start_at', since).order('start_at').order('id').range(f, t))
  return rows.map(toListed)
}, ['fw-events-upcoming-v1'], { revalidate: 3600, tags: ['events'] })

export async function getUpcomingEvents(): Promise<ListedEvent[]> {
  try {
    const now = Date.now()
    return (await fetchUpcoming()).filter(e => !isOver(e, now))
  } catch (e) {
    console.error('[events] could not load events:', e)
    return []
  }
}

export type EventDetail = ListedEvent & {
  summary: string | null; address: string | null; lat: number | null; lng: number | null; organizerUrl: string | null; tags: string[]; status: string; updatedAt: string
}

const fetchEvent = unstable_cache(async (slug: string): Promise<EventDetail | null> => {
  const { data, error } = await eventsDb().from('fw_events').select(`${LIST_COLS}, summary, address, lat, lng, organizer_url, tags, status, updated_at`).eq('slug', slug).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const d = data as unknown as Row & { summary: string | null; address: string | null; lat: number | null; lng: number | null; organizer_url: string | null; tags: string[]; status: string; updated_at: string }
  return { ...toListed(d), summary: d.summary, address: d.address, lat: d.lat, lng: d.lng, organizerUrl: d.organizer_url, tags: d.tags ?? [], status: d.status, updatedAt: d.updated_at }
}, ['fw-events-detail-v1'], { revalidate: 3600, tags: ['events'] })

export async function getEvent(slug: string): Promise<EventDetail | null> {
  try { return await fetchEvent(slug) } catch (e) { console.error('[events] could not load event:', e); return null }
}

const fetchLastRefresh = unstable_cache(async (): Promise<string | null> => {
  const { data } = await eventsDb().from('fw_settings').select('value').eq('key', 'events_refresh').maybeSingle()
  return (data?.value as { at?: string } | null)?.at ?? null
}, ['fw-events-refreshed-v1'], { revalidate: 3600, tags: ['events'] })

export async function getLastRefresh(): Promise<string | null> {
  try { return await fetchLastRefresh() } catch { return null }
}

/** Dated URLs for the sitemap: every published event that hasn't long passed. */
const fetchSitemapRows = unstable_cache(async () => {
  const sb = eventsDb()
  const since = new Date(Date.now() - 864e5).toISOString()
  return allRows<{ slug: string; updated_at: string; start_at: string }>((f, t) => sb.from('fw_events').select('slug, updated_at, start_at').eq('status', 'published').not('slug', 'is', null).gte('start_at', since).order('start_at').order('id').range(f, t))
}, ['fw-events-sitemap-v1'], { revalidate: 3600, tags: ['events'] })

export async function getSitemapEvents() {
  try { return await fetchSitemapRows() } catch { return [] }
}
