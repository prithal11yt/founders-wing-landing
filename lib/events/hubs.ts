/* Search landing pages. Each one targets a real search ("free startup events in Bengaluru")
   and is built from live data, so its counts, FAQs and event list are its own. */

import { SITE_URL } from '@/lib/site'
import { CATEGORIES, CITIES, INDEX_MIN_EVENTS, categoryBySlug, cityBySlug, slugify, stateBySlug, type EventCategory } from './config'
import { fmtDateLong, fmtMonthYear, istDay, matchesWhen, type ListedEvent, type When } from './format'

export type Lock = { city?: boolean; state?: boolean; price?: boolean; mode?: boolean; category?: boolean; when?: boolean }
export type Faq = { q: string; a: string }
export type Crumb = { name: string; href: string }

export type Hub = {
  path: string
  title: string
  description: string
  h1: string
  eyebrow: string
  intro: string
  events: ListedEvent[]
  lock: Lock
  crumbs: Crumb[]
  faqs: Faq[]
  indexable: boolean
}

const HOME: Crumb = { name: 'Events', href: '/events' }
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

const nameOf = (slug: string, events: ListedEvent[]) => cityBySlug(slug)?.name ?? events.find(e => e.citySlug === slug)?.city ?? null

function aliasOf(slug: string) {
  const a = cityBySlug(slug)?.aliases?.[0]
  return a ? a.replace(/\b[a-z]/g, m => m.toUpperCase()) : null
}

function stats(events: ListedEvent[]) {
  const free = events.filter(e => e.priceType === 'free').length
  const online = events.filter(e => e.mode === 'online').length
  const next = events[0] ?? null
  const types = CATEGORIES.map(c => ({ c, n: events.filter(e => e.category === c.slug).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n)
  return { total: events.length, free, online, next, types }
}

function commonFaqs(where: string, events: ListedEvent[]): Faq[] {
  const s = stats(events)
  const faqs: Faq[] = []
  if (s.next) faqs.push({ q: `What is the next founder event ${where}?`, a: `The next one is ${s.next.title} on ${fmtDateLong(s.next.startAt)}. There are ${plural(s.total, 'upcoming event')} listed ${where} right now.` })
  faqs.push({
    q: `Are there free startup events ${where}?`,
    a: s.free ? `Yes. ${s.free} of the ${plural(s.total, 'upcoming event')} listed ${where} are free to attend. Use the Free filter to see only those.` : `None of the events listed ${where} are marked free right now. New events are added every week, so it is worth checking back.`,
  })
  faqs.push({ q: 'How do I book a ticket?', a: 'Open any event and press the booking button. It takes you to the organiser’s own ticket page on Eventbrite, Meetup, Luma or their website, and you book directly with them. Founders Wing does not sell tickets or charge a fee.' })
  faqs.push({ q: 'How often is this list updated?', a: 'Every week. New events are added, and upcoming ones are re-checked so that cancelled events and dead links come off the list.' })
  return faqs
}

const sortedTypes = (events: ListedEvent[]) => {
  const t = stats(events).types.slice(0, 3).map(x => x.c.plural.toLowerCase())
  return t.length ? `Most common right now: ${t.join(', ')}.` : ''
}

export function allHub(events: ListedEvent[]): Hub {
  const month = fmtMonthYear(Date.now())
  const s = stats(events)
  return {
    path: '/events', eyebrow: 'Founder events in India',
    title: `Founder & Startup Events in India (${month}): Free & Paid`,
    description: `${plural(s.total, 'upcoming startup, founder and networking event')} across India, ${s.free} of them free. Filter by state, city, date, price and type, then book directly with the organiser. Updated weekly.`,
    h1: 'Founder & startup events in India',
    intro: `Meetups, pitch nights, networking evenings and summits for people building a business. Pick your city, then book directly with the organiser.`,
    events, lock: {}, crumbs: [HOME], indexable: true,
    faqs: [
      { q: 'What are the best startup events in India?', a: `This page lists ${plural(s.total, 'upcoming event')} for founders and entrepreneurs, from small meetups to large summits. ${sortedTypes(events)} Filter by your city to find the ones you can actually attend.` },
      ...commonFaqs('in India', events),
    ],
  }
}

const WHEN_HUBS: Record<'week' | 'weekend', { path: string; label: string; when: When }> = {
  week: { path: '/events/this-week', label: 'this week', when: 'week' },
  weekend: { path: '/events/this-weekend', label: 'this weekend', when: 'weekend' },
}

export function whenHub(which: 'week' | 'weekend', all: ListedEvent[]): Hub {
  const w = WHEN_HUBS[which]
  const events = all.filter(e => matchesWhen(e, w.when))
  const s = stats(events)
  const label = w.label
  return {
    path: w.path, eyebrow: `Happening ${label}`,
    title: `Startup & Founder Events ${label.replace(/\b[a-z]/g, m => m.toUpperCase())} in India`,
    description: `${plural(s.total, 'startup and founder event')} in India ${label}, ${s.free} of them free. Filter by city and price, then book directly with the organiser.`,
    h1: `Founder events ${label}`,
    intro: `Everything for founders and entrepreneurs happening ${label}, across every city and online.`,
    events, lock: { when: true }, crumbs: [HOME, { name: `This ${which}`, href: w.path }], indexable: s.total >= INDEX_MIN_EVENTS,
    faqs: commonFaqs(label, events),
  }
}

export function priceHub(kind: 'free' | 'paid', all: ListedEvent[]): Hub {
  const events = all.filter(e => e.priceType === kind)
  const n = events.length
  const free = kind === 'free'
  return {
    path: `/events/${kind}`, eyebrow: free ? 'No ticket price' : 'Ticketed events',
    title: free ? `Free Startup & Founder Events in India (${fmtMonthYear(Date.now())})` : `Paid Startup Conferences & Founder Events in India`,
    description: free
      ? `${plural(n, 'free startup, founder and networking event')} across India. Filter by city and date, then register directly with the organiser. Updated weekly.`
      : `${plural(n, 'ticketed startup event')} across India, from founder dinners to large conferences. Compare by city and date, then book directly with the organiser.`,
    h1: free ? 'Free founder & startup events in India' : 'Paid founder & startup events in India',
    intro: free ? 'Meet founders and learn without paying for a ticket. Popular free events fill up quickly, so register early.' : 'Ticketed conferences, founder dinners and workshops, for when you want a smaller room or a bigger stage.',
    events, lock: { price: true }, crumbs: [HOME, { name: free ? 'Free' : 'Paid', href: `/events/${kind}` }], indexable: n >= INDEX_MIN_EVENTS,
    faqs: commonFaqs('in India', events).filter(f => !f.q.startsWith('Are there free') || free),
  }
}

export function onlineHub(all: ListedEvent[]): Hub {
  const events = all.filter(e => e.mode === 'online' || e.mode === 'hybrid')
  const n = events.length
  return {
    path: '/events/online', eyebrow: 'Join from anywhere',
    title: 'Online Events & Webinars for Founders in India',
    description: `${plural(n, 'online event')} and webinars for founders and entrepreneurs, at times that suit India. Join from anywhere and book directly with the organiser.`,
    h1: 'Online events & webinars for founders',
    intro: 'No startup scene nearby? These sessions run online, at hours that work in India.',
    events, lock: { mode: true, city: true, state: true }, crumbs: [HOME, { name: 'Online', href: '/events/online' }], indexable: n >= INDEX_MIN_EVENTS,
    faqs: commonFaqs('online', events),
  }
}

export function typeHub(slug: EventCategory, all: ListedEvent[]): Hub | null {
  const c = categoryBySlug(slug)
  if (!c) return null
  const events = all.filter(e => e.category === slug)
  return {
    path: `/events/type/${slug}`, eyebrow: c.plural,
    title: `${c.seo} in India (${fmtMonthYear(Date.now())})`,
    description: `${plural(events.length, 'upcoming event')} in this category across India. ${c.intro} Filter by city and price, then book directly with the organiser.`,
    h1: `${c.plural} for founders in India`, intro: c.intro,
    events, lock: { category: true }, crumbs: [HOME, { name: c.plural, href: `/events/type/${slug}` }], indexable: events.length >= INDEX_MIN_EVENTS,
    faqs: commonFaqs('in India', events),
  }
}

export function stateHub(slug: string, all: ListedEvent[]): Hub | null {
  const state = stateBySlug(slug) ?? all.find(e => e.stateSlug === slug)?.state
  if (!state) return null
  const events = all.filter(e => e.stateSlug === slug && e.mode !== 'online')
  const s = stats(events)
  const cities = [...new Set(events.map(e => e.city).filter(Boolean))].slice(0, 4)
  return {
    path: `/events/state/${slug}`, eyebrow: state,
    title: `Startup & Founder Events in ${state} (${fmtMonthYear(Date.now())})`,
    description: `${plural(s.total, 'upcoming startup and founder event')} in ${state}${cities.length ? `, including ${cities.join(', ')}` : ''}. ${s.free} free. Filter by city, date and price, then book directly.`,
    h1: `Startup & founder events in ${state}`,
    intro: cities.length ? `Founder meetups, networking and summits across ${state}, including ${cities.join(', ')}.` : `Founder meetups, networking and summits across ${state}.`,
    events, lock: { state: true, mode: true }, crumbs: [HOME, { name: state, href: `/events/state/${slug}` }], indexable: s.total >= INDEX_MIN_EVENTS,
    faqs: commonFaqs(`in ${state}`, events),
  }
}

export function cityHub(slug: string, all: ListedEvent[]): Hub | null {
  const name = nameOf(slug, all)
  if (!name) return null
  const events = all.filter(e => e.citySlug === slug && e.mode !== 'online')
  const s = stats(events)
  const alias = aliasOf(slug)
  const blurb = cityBySlug(slug)?.blurb
  return {
    path: `/events/city/${slug}`, eyebrow: name,
    title: `Startup & Founder Events in ${name} (${fmtMonthYear(Date.now())})`,
    description: `${plural(s.total, 'upcoming startup, founder and networking event')} in ${name}${alias ? ` (${alias})` : ''}, ${s.free} of them free. Filter by date, price and type, then book directly with the organiser.`,
    h1: `Startup & founder events in ${name}`,
    intro: blurb ?? `Founder meetups, networking evenings, pitch nights and summits happening in ${name}.`,
    events, lock: { city: true, state: true, mode: true }, crumbs: [HOME, { name, href: `/events/city/${slug}` }], indexable: s.total >= INDEX_MIN_EVENTS,
    faqs: [
      ...(alias ? [{ q: `Is this the same as startup events in ${alias}?`, a: `Yes. ${name} and ${alias} are the same city, so every startup event in ${alias} is listed here.` }] : []),
      ...commonFaqs(`in ${name}`, events),
    ],
  }
}

export const CITY_FACETS = ['free', ...CATEGORIES.map(c => c.slug)] as const

export function cityFacetHub(slug: string, facet: string, all: ListedEvent[]): Hub | null {
  const base = cityHub(slug, all)
  if (!base) return null
  const name = base.eyebrow
  const path = `/events/city/${slug}/${facet}`
  if (facet === 'free') {
    const events = base.events.filter(e => e.priceType === 'free')
    return {
      ...base, path, events, eyebrow: `Free in ${name}`,
      title: `Free Startup Events in ${name} (${fmtMonthYear(Date.now())})`,
      description: `${plural(events.length, 'free startup and founder event')} in ${name}. Filter by date and type, then register directly with the organiser. Updated weekly.`,
      h1: `Free startup events in ${name}`, intro: `Founder events in ${name} with no ticket price. Popular ones fill up quickly, so register early.`,
      lock: { ...base.lock, price: true }, crumbs: [...base.crumbs, { name: 'Free', href: path }], indexable: events.length >= INDEX_MIN_EVENTS, faqs: commonFaqs(`in ${name}`, events).filter(f => !f.q.startsWith('Are there free')),
    }
  }
  const c = categoryBySlug(facet)
  if (!c) return null
  const events = base.events.filter(e => e.category === c.slug)
  return {
    ...base, path, events, eyebrow: `${c.plural} in ${name}`,
    title: `${c.seo} in ${name} (${fmtMonthYear(Date.now())})`,
    description: `${plural(events.length, 'upcoming event')} in ${name}. ${c.intro} Filter by date and price, then book directly with the organiser.`,
    h1: `${c.plural} for founders in ${name}`, intro: c.intro,
    lock: { ...base.lock, category: true }, crumbs: [...base.crumbs, { name: c.plural, href: path }], indexable: events.length >= INDEX_MIN_EVENTS, faqs: commonFaqs(`in ${name}`, events),
  }
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const monthSlug = (iso: string) => { const [y, m] = istDay(iso).split('-').map(Number); return `${MONTHS[m - 1]}-${y}` }

export function monthHub(slug: string, all: ListedEvent[]): Hub | null {
  const m = slug.match(/^([a-z]+)-(\d{4})$/)
  if (!m || !MONTHS.includes(m[1])) return null
  const label = `${m[1][0].toUpperCase()}${m[1].slice(1)} ${m[2]}`
  const events = all.filter(e => monthSlug(e.startAt) === slug)
  const s = stats(events)
  return {
    path: `/events/month/${slug}`, eyebrow: label,
    title: `Startup & Founder Events in India in ${label}`,
    description: `${plural(s.total, 'startup and founder event')} in India in ${label}, ${s.free} of them free. Plan your month by city, type and price, then book directly.`,
    h1: `Founder events in ${label}`, intro: `Plan ahead: everything for founders and entrepreneurs in India during ${label}.`,
    events, lock: { when: true }, crumbs: [HOME, { name: label, href: `/events/month/${slug}` }], indexable: s.total >= INDEX_MIN_EVENTS,
    faqs: commonFaqs(`in ${label}`, events),
  }
}

/* ── Internal links and sitemap ── */
export type PlaceCount = { slug: string; name: string; n: number }

function countBy(events: ListedEvent[], key: (e: ListedEvent) => [string, string] | null): PlaceCount[] {
  const m = new Map<string, PlaceCount>()
  for (const e of events) { const k = key(e); if (!k) continue; const c = m.get(k[0]) ?? { slug: k[0], name: k[1], n: 0 }; c.n++; m.set(k[0], c) }
  return [...m.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
}

export function browseLinks(all: ListedEvent[]) {
  const physical = all.filter(e => e.mode !== 'online')
  return {
    cities: countBy(physical, e => (e.citySlug && e.city ? [e.citySlug, e.city] : null)),
    states: countBy(physical, e => (e.stateSlug && e.state ? [e.stateSlug, e.state] : null)),
    types: CATEGORIES.map(c => ({ slug: c.slug, name: c.plural, n: all.filter(e => e.category === c.slug).length })).filter(x => x.n > 0),
    months: countBy(all, e => [monthSlug(e.startAt), fmtMonthYear(e.startAt)]).sort((a, b) => {
      const key = (s: string) => { const [m, y] = s.split('-'); return Number(y) * 12 + MONTHS.indexOf(m) }
      return key(a.slug) - key(b.slug)
    }).slice(0, 8),
  }
}

/** Every landing page with enough events to be worth indexing. */
export function indexableHubPaths(all: ListedEvent[]): string[] {
  const { cities, states, types, months } = browseLinks(all)
  const hubs: (Hub | null)[] = [
    whenHub('week', all), whenHub('weekend', all), priceHub('free', all), priceHub('paid', all), onlineHub(all),
    ...cities.map(c => cityHub(c.slug, all)),
    ...cities.flatMap(c => CITY_FACETS.map(f => cityFacetHub(c.slug, f, all))),
    ...states.map(s => stateHub(s.slug, all)),
    ...types.map(t => typeHub(t.slug as EventCategory, all)),
    ...months.map(m => monthHub(m.slug, all)),
  ]
  return hubs.filter((h): h is Hub => !!h && h.indexable).map(h => h.path)
}

/** Lets /events/city/bangalore redirect to /events/city/bengaluru. */
export const canonicalCitySlug = (slug: string) => CITIES.find(c => (c.aliases ?? []).some(a => slugify(a) === slug))?.slug ?? null

/* ── Structured data ── */
export function hubJsonLd(hub: Hub) {
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [{ name: 'Home', href: '/' }, ...hub.crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.href === '/' ? '' : c.href}` })),
    },
    {
      '@type': 'CollectionPage', name: hub.title, description: hub.description, url: `${SITE_URL}${hub.path}`,
      mainEntity: {
        '@type': 'ItemList', numberOfItems: hub.events.length,
        itemListElement: hub.events.slice(0, 30).map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/events/${e.slug}`, name: e.title })),
      },
    },
  ]
  if (hub.faqs.length) graph.push({ '@type': 'FAQPage', mainEntity: hub.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
  return { '@context': 'https://schema.org', '@graph': graph }
}

const istIso = (iso: string, hasTime: boolean) => {
  if (!hasTime) return istDay(iso)
  return `${new Date(new Date(iso).getTime() + 5.5 * 3600e3).toISOString().slice(0, 19)}+05:30`
}

export function eventJsonLd(e: ListedEvent & { summary: string | null; address: string | null; lat: number | null; lng: number | null; organizerUrl: string | null; status: string }) {
  const url = `${SITE_URL}/events/${e.slug}`
  const attendance = e.mode === 'online' ? 'OnlineEventAttendanceMode' : e.mode === 'hybrid' ? 'MixedEventAttendanceMode' : 'OfflineEventAttendanceMode'
  const physical = {
    '@type': 'Place', name: e.venue ?? e.city ?? 'India',
    address: { '@type': 'PostalAddress', ...(e.address ? { streetAddress: e.address } : {}), ...(e.city ? { addressLocality: e.city } : {}), ...(e.state ? { addressRegion: e.state } : {}), addressCountry: 'IN' },
    ...(e.lat != null && e.lng != null ? { geo: { '@type': 'GeoCoordinates', latitude: e.lat, longitude: e.lng } } : {}),
  }
  const virtual = { '@type': 'VirtualLocation', url: e.url }
  return {
    '@context': 'https://schema.org', '@type': 'BusinessEvent', '@id': url, url,
    name: e.title,
    ...(e.summary ? { description: e.summary } : {}),
    startDate: istIso(e.startAt, e.hasTime),
    ...(e.endAt ? { endDate: istIso(e.endAt, e.hasTime) } : {}),
    eventStatus: `https://schema.org/${e.status === 'cancelled' ? 'EventCancelled' : 'EventScheduled'}`,
    eventAttendanceMode: `https://schema.org/${attendance}`,
    location: e.mode === 'online' ? virtual : e.mode === 'hybrid' ? [physical, virtual] : physical,
    ...(e.image ? { image: [e.image] } : {}),
    ...(e.organizer ? { organizer: { '@type': 'Organization', name: e.organizer, ...(e.organizerUrl ? { url: e.organizerUrl } : {}) } } : {}),
    ...(e.priceType === 'free' || (e.priceType === 'paid' && e.priceMin != null && e.currency)
      ? { offers: { '@type': 'Offer', url: e.url, price: e.priceType === 'free' ? 0 : e.priceMin, priceCurrency: e.currency ?? 'INR', availability: 'https://schema.org/InStock' } }
      : {}),
  }
}
