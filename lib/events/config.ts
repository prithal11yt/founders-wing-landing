/* Places, event types and URL rules for the founder events directory. Safe to import
   on the client: no server code and no secrets. */

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export type City = {
  slug: string
  name: string
  state: string
  /** Other spellings people use, in addresses and in searches. */
  aliases?: string[]
  lat: number
  lng: number
  /** Crawled every week. Other cities still get a page if events turn up there. */
  crawl?: { eventbrite?: string; meetup?: string; allevents?: string; luma?: boolean }
  /** One factual line about the local startup scene, shown on the city page. */
  blurb?: string
}

export const CITIES: City[] = [
  { slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', aliases: ['bangalore', 'bangaluru', 'bengalore', 'whitefield', 'koramangala', 'indiranagar', 'hsr layout', 'electronic city'], lat: 12.9716, lng: 77.5946, crawl: { eventbrite: 'bangalore', meetup: 'Bangalore', allevents: 'bangalore', luma: true }, blurb: 'Bengaluru has India’s largest startup scene, with founder meetups clustered around Koramangala, HSR Layout, Indiranagar and Whitefield.' },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', aliases: ['bombay', 'navi mumbai', 'thane', 'bandra', 'andheri', 'powai'], lat: 19.076, lng: 72.8777, crawl: { eventbrite: 'mumbai', meetup: 'Mumbai', allevents: 'mumbai', luma: true }, blurb: 'Mumbai is India’s finance capital, so its founder events lean towards fintech, consumer brands and meeting investors, around BKC, Powai and Lower Parel.' },
  { slug: 'delhi', name: 'Delhi', state: 'Delhi', aliases: ['new delhi', 'delhi ncr', 'ncr'], lat: 28.6139, lng: 77.209, crawl: { eventbrite: 'delhi', meetup: 'Delhi', allevents: 'delhi', luma: true }, blurb: 'Delhi anchors the NCR startup scene, and many of its events draw founders from Gurugram and Noida as well.' },
  { slug: 'gurugram', name: 'Gurugram', state: 'Haryana', aliases: ['gurgaon'], lat: 28.4595, lng: 77.0266, crawl: { eventbrite: 'gurgaon', meetup: 'Gurgaon', allevents: 'gurgaon', luma: true }, blurb: 'Gurugram’s startup events are concentrated around Cyber City and Golf Course Road, with a strong B2B and SaaS crowd.' },
  { slug: 'noida', name: 'Noida', state: 'Uttar Pradesh', aliases: ['greater noida'], lat: 28.5355, lng: 77.391, crawl: { eventbrite: 'noida', meetup: 'Noida', allevents: 'noida' } },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', aliases: ['secunderabad', 'hitec city', 'gachibowli', 'madhapur', 'nanakramguda'], lat: 17.385, lng: 78.4867, crawl: { eventbrite: 'hyderabad', meetup: 'Hyderabad', allevents: 'hyderabad', luma: true }, blurb: 'Hyderabad’s startup scene centres on T-Hub and HITEC City, with regular founder and deep-tech meetups.' },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', aliases: ['madras'], lat: 13.0827, lng: 80.2707, crawl: { eventbrite: 'chennai', meetup: 'Chennai', allevents: 'chennai', luma: true }, blurb: 'Chennai is known for SaaS founders, and its events often connect with the IIT Madras research park community.' },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', aliases: ['pimpri-chinchwad', 'hinjewadi', 'baner'], lat: 18.5204, lng: 73.8567, crawl: { eventbrite: 'pune', meetup: 'Pune', allevents: 'pune', luma: true }, blurb: 'Pune mixes SaaS and manufacturing founders, with active startup communities around Baner, Hinjewadi and Kharadi.' },
  { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', aliases: ['gandhinagar'], lat: 23.0225, lng: 72.5714, crawl: { eventbrite: 'ahmedabad', meetup: 'Ahmedabad', allevents: 'ahmedabad', luma: true }, blurb: 'Ahmedabad’s founder community draws on Gujarat’s business families and on institutions such as IIM Ahmedabad’s CIIE.' },
  { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', aliases: ['calcutta', 'salt lake', 'howrah'], lat: 22.5726, lng: 88.3639, crawl: { eventbrite: 'kolkata', meetup: 'Kolkata', allevents: 'kolkata', luma: true } },
  { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, crawl: { eventbrite: 'jaipur', meetup: 'Jaipur', allevents: 'jaipur', luma: true }, blurb: 'Jaipur’s startup events are often linked to iStart Rajasthan and the state’s Techno Hub.' },
  { slug: 'kochi', name: 'Kochi', state: 'Kerala', aliases: ['cochin', 'ernakulam', 'kalamassery'], lat: 9.9312, lng: 76.2673, crawl: { eventbrite: 'kochi', meetup: 'Kochi', allevents: 'kochi', luma: true }, blurb: 'Kochi is home to Kerala Startup Mission’s Integrated Startup Complex, a regular base for founder events.' },
  { slug: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', aliases: ['mohali', 'panchkula'], lat: 30.7333, lng: 76.7794, crawl: { eventbrite: 'chandigarh', meetup: 'Chandigarh', allevents: 'chandigarh' } },
  { slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, crawl: { eventbrite: 'indore', meetup: 'Indore', allevents: 'indore' } },
  { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, crawl: { eventbrite: 'lucknow', allevents: 'lucknow' } },
  { slug: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, crawl: { eventbrite: 'coimbatore', allevents: 'coimbatore' } },
  { slug: 'surat', name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, crawl: { eventbrite: 'surat', allevents: 'surat' } },
  { slug: 'goa', name: 'Goa', state: 'Goa', aliases: ['panaji', 'panjim', 'margao', 'vasco da gama', 'north goa', 'south goa'], lat: 15.4909, lng: 73.8278, crawl: { eventbrite: 'goa', allevents: 'goa', luma: true } },
  { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', aliases: ['trivandrum'], lat: 8.5241, lng: 76.9366, crawl: { allevents: 'trivandrum' } },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', aliases: ['bhubaneshwar'], lat: 20.2961, lng: 85.8245, crawl: { allevents: 'bhubaneswar' } },
  { slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, crawl: { allevents: 'nagpur' } },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', aliases: ['vizag'], lat: 17.6868, lng: 83.2185, crawl: { allevents: 'vizag' } },
  { slug: 'mysuru', name: 'Mysuru', state: 'Karnataka', aliases: ['mysore'], lat: 12.2958, lng: 76.6394 },
  { slug: 'vadodara', name: 'Vadodara', state: 'Gujarat', aliases: ['baroda'], lat: 22.3072, lng: 73.1812 },
  { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', aliases: ['nasik'], lat: 19.9975, lng: 73.7898 },
  { slug: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { slug: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
  { slug: 'patna', name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376 },
]

const STATE_CODES: Record<string, string> = {
  AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CG: 'Chhattisgarh', CT: 'Chhattisgarh', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh',
  JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala', MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OD: 'Odisha', OR: 'Odisha',
  PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TS: 'Telangana', TG: 'Telangana', TR: 'Tripura', UP: 'Uttar Pradesh', UK: 'Uttarakhand', UT: 'Uttarakhand', WB: 'West Bengal',
  DL: 'Delhi', CH: 'Chandigarh', JK: 'Jammu and Kashmir', LA: 'Ladakh', PY: 'Puducherry', AN: 'Andaman and Nicobar Islands', DN: 'Dadra and Nagar Haveli and Daman and Diu', LD: 'Lakshadweep',
}
export const STATES = [...new Set(Object.values(STATE_CODES))].sort()
const STATE_BY_LOWER = new Map(STATES.map(s => [s.toLowerCase(), s]))
STATE_BY_LOWER.set('nct of delhi', 'Delhi'); STATE_BY_LOWER.set('new delhi', 'Delhi'); STATE_BY_LOWER.set('orissa', 'Odisha'); STATE_BY_LOWER.set('jammu & kashmir', 'Jammu and Kashmir')

const CITY_BY_NAME = new Map<string, City>()
for (const c of CITIES) { CITY_BY_NAME.set(c.name.toLowerCase(), c); for (const a of c.aliases ?? []) CITY_BY_NAME.set(a, c) }

export const cityBySlug = (slug: string) => CITIES.find(c => c.slug === slug)
export const stateBySlug = (slug: string) => STATES.find(s => slugify(s) === slug)

/** Turns whatever an address says into a canonical city and state. */
export function resolvePlace(cityRaw?: string | null, regionRaw?: string | null, addressRaw?: string | null): { city: string | null; citySlug: string | null; state: string | null; stateSlug: string | null } {
  const lower = (cityRaw ?? '').trim().toLowerCase()
  let match = CITY_BY_NAME.get(lower)
  if (!match && addressRaw) {
    // Fall back to the address only for whole-word matches, longest name first.
    const addr = ` ${addressRaw.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `
    const names = [...CITY_BY_NAME.keys()].sort((a, b) => b.length - a.length)
    const hit = lower ? null : names.find(n => addr.includes(` ${n.replace(/[^a-z0-9]+/g, ' ')} `))
    if (hit) match = CITY_BY_NAME.get(hit)
  }
  const region = (regionRaw ?? '').trim()
  const state = match?.state ?? STATE_CODES[region.toUpperCase()] ?? STATE_BY_LOWER.get(region.toLowerCase()) ?? null
  const city = match?.name ?? (lower ? (cityRaw as string).trim().replace(/\s+/g, ' ').replace(/\b[a-z]/g, m => m.toUpperCase()) : null)
  return { city, citySlug: match?.slug ?? (city ? slugify(city) : null), state, stateSlug: state ? slugify(state) : null }
}

export type EventCategory = 'networking' | 'pitch' | 'conference' | 'meetup' | 'workshop' | 'hackathon' | 'investor' | 'webinar'

export const CATEGORIES: { slug: EventCategory; label: string; plural: string; seo: string; intro: string }[] = [
  { slug: 'networking', label: 'Networking', plural: 'Networking events', seo: 'Networking Events for Founders & Entrepreneurs', intro: 'Rooms built for meeting people: founder mixers, business networking evenings and startup socials.' },
  { slug: 'meetup', label: 'Meetup', plural: 'Founder meetups', seo: 'Founder & Startup Meetups', intro: 'Small, regular gatherings where founders compare notes, get feedback and find their people.' },
  { slug: 'conference', label: 'Conference', plural: 'Conferences & summits', seo: 'Startup Conferences & Summits', intro: 'The big-stage events: startup summits, entrepreneurship conclaves and industry conferences.' },
  { slug: 'pitch', label: 'Pitch event', plural: 'Pitch events & demo days', seo: 'Startup Pitch Events & Demo Days', intro: 'Get your startup in front of a room, or watch others do it: pitch nights, competitions and demo days.' },
  { slug: 'investor', label: 'Investor event', plural: 'Investor events', seo: 'Investor & Fundraising Events for Startups', intro: 'Meet angels and VCs, or learn how fundraising actually works, at investor connects and funding sessions.' },
  { slug: 'workshop', label: 'Workshop', plural: 'Workshops & bootcamps', seo: 'Workshops & Bootcamps for Founders', intro: 'Hands-on sessions on building, selling and running a business, from one evening to a weekend.' },
  { slug: 'hackathon', label: 'Hackathon', plural: 'Hackathons', seo: 'Startup Hackathons & Build Weekends', intro: 'Build something real in a weekend, often with prizes, mentors or a path to funding.' },
  { slug: 'webinar', label: 'Webinar', plural: 'Webinars', seo: 'Webinars for Founders & Entrepreneurs', intro: 'Online sessions you can join from anywhere, on growth, funding and building with AI.' },
]
export const categoryBySlug = (slug?: string | null) => CATEGORIES.find(c => c.slug === slug)
export const isCategory = (s: unknown): s is EventCategory => CATEGORIES.some(c => c.slug === s)

export const SOURCE_LABELS: Record<string, string> = { eventbrite: 'Eventbrite', meetup: 'Meetup', luma: 'Luma', allevents: 'AllEvents', curated: 'the organiser’s site' }

// Hub pages with fewer events than this stay out of search, so Google never sees thin pages.
export const INDEX_MIN_EVENTS = 3
