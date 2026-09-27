import { createClient } from '@supabase/supabase-js'
import { gaConfigured, runReports, type ReportRequest, type Row } from './ga4'

/* Assembles everything the /analytics dashboard shows: GA4 traffic, the Supabase
   funnel (applications and paid members), month-over-month history, and computed
   takeaways. All dates are handled in India time. */

export type RangeKey = '7d' | '28d' | '90d' | 'mtd' | 'last-month'
export const RANGE_LABELS: Record<RangeKey, string> = {
  '7d': 'Last 7 days',
  '28d': 'Last 28 days',
  '90d': 'Last 90 days',
  mtd: 'This month',
  'last-month': 'Last month',
}

const IST_OFFSET_MS = 5.5 * 3600 * 1000
const ist = (d = new Date()) => new Date(d.getTime() + IST_OFFSET_MS) // use UTC getters on this
const iso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000)

export type Period = { start: string; end: string; days: number; label: string }

export function periodsFor(range: RangeKey): { current: Period; previous: Period } {
  const today = ist()
  const yesterday = addDays(today, -1)
  const span = (start: Date, end: Date, label: string): Period => ({
    start: iso(start),
    end: iso(end),
    days: Math.round((end.getTime() - start.getTime()) / 86400000) + 1,
    label,
  })
  if (range === 'mtd') {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
    const cur = span(start, today, 'This month so far')
    const prevStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1))
    const prevEnd = addDays(prevStart, cur.days - 1)
    return { current: cur, previous: span(prevStart, prevEnd, `Same days last month`) }
  }
  if (range === 'last-month') {
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1))
    const end = addDays(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)), -1)
    const prevStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 2, 1))
    const prevEnd = addDays(start, -1)
    return { current: span(start, end, 'Last month'), previous: span(prevStart, prevEnd, 'The month before') }
  }
  const n = range === '7d' ? 7 : range === '90d' ? 90 : 28
  const cur = span(addDays(yesterday, -(n - 1)), yesterday, `Last ${n} days`)
  const prev = span(addDays(yesterday, -(2 * n - 1)), addDays(yesterday, -n), `Previous ${n} days`)
  return { current: cur, previous: prev }
}

/* ── Types the dashboard consumes ── */
export type Kpi = { key: string; label: string; value: number; previous: number; format: 'int' | 'pct' | 'secs' | 'inr'; hint?: string }
export type DayPoint = { date: string; label: string; sessions: number; users: number; newUsers: number; prevSessions: number | null; prevUsers: number | null }
export type MonthPoint = { month: string; label: string; sessions: number; users: number; newUsers: number; pageviews: number; checkout: number; leadEvents: number; applications: number; members: number; revenue: number }
export type Compare = { name: string; value: number; previous: number; extra?: number }
export type Takeaway = { kind: 'good' | 'bad' | 'info'; title: string; body: string }

export type Dashboard = {
  generatedAt: string
  range: RangeKey
  current: Period
  previous: Period
  gaConfigured: boolean
  error?: string
  kpis: Kpi[]
  daily: DayPoint[]
  monthly: MonthPoint[]
  channels: Compare[]
  sources: Compare[]
  checkoutBySource: Compare[]
  pages: Compare[]
  landing: Compare[]
  devices: Compare[]
  cities: Compare[]
  countries: Compare[]
  newVsReturning: Compare[]
  weekday: { name: string; sessions: number }[]
  hours: { hour: number; sessions: number }[]
  heardFrom: Compare[]
  funnel: { step: string; value: number; previous: number }[]
  takeaways: Takeaway[]
  aiSummary?: { text: string; provider: string } | null
}

/* ── Supabase: applications and paid members ── */
type Lead = { created_at: string; heard_from: string | null; call_status: string | null }
type Member = { created_at: string; amount_paise: number | null; plan: string | null }

async function loadSupabase(since: string): Promise<{ leads: Lead[]; members: Member[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { leads: [], members: [] }
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const [l, m] = await Promise.all([
    db.from('waitlist_applications').select('created_at, heard_from, call_status').gte('created_at', since).limit(10000),
    db.from('fw_memberships').select('created_at, amount_paise, plan').gte('created_at', since).limit(10000),
  ])
  return { leads: (l.data as Lead[]) ?? [], members: (m.data as Member[]) ?? [] }
}

const istDate = (s: string) => iso(ist(new Date(s)))
const inPeriod = (s: string, p: Period) => {
  const d = istDate(s)
  return d >= p.start && d <= p.end
}

/* ── Helpers ── */
const byName = (rows: Row[], dim: string, met: string): Map<string, { cur: number; prev: number }> => {
  const m = new Map<string, { cur: number; prev: number }>()
  for (const r of rows) {
    const k = r.dims[dim] ?? '(not set)'
    const e = m.get(k) ?? { cur: 0, prev: 0 }
    if (r.range === 0) e.cur += r.mets[met] ?? 0
    else e.prev += r.mets[met] ?? 0
    m.set(k, e)
  }
  return m
}
const toCompare = (m: Map<string, { cur: number; prev: number }>, limit = 50): Compare[] =>
  [...m.entries()]
    .map(([name, v]) => ({ name, value: v.cur, previous: v.prev }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)

const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? 100 : 0)
const fmtInt = (n: number) => Math.round(n).toLocaleString('en-IN')
const fmtPct = (n: number) => `${n > 0 ? '+' : ''}${Math.round(n)}%`
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthLabel = (ym: string) => `${MONTHS[Number(ym.slice(4, 6)) - 1]} ${ym.slice(2, 4)}`
const dayLabel = (ymd: string) => `${Number(ymd.slice(6, 8))} ${MONTHS[Number(ymd.slice(4, 6)) - 1]}`
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const CHECKOUT_FILTER = { fieldName: 'pagePath', stringFilter: { matchType: 'BEGINS_WITH' as const, value: '/secure-spot' } }
const LEAD_FILTER = { fieldName: 'eventName', stringFilter: { matchType: 'EXACT' as const, value: 'generate_lead' } }

/* ── Main ── */
export async function buildDashboard(range: RangeKey): Promise<Dashboard> {
  const { current, previous } = periodsFor(range)
  const both = [
    { startDate: current.start, endDate: current.end },
    { startDate: previous.start, endDate: previous.end },
  ]
  const cur = [{ startDate: current.start, endDate: current.end }]
  const today = ist()
  const twelveMonthsAgo = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1))
  const year = [{ startDate: iso(twelveMonthsAgo), endDate: iso(today) }]

  const base: Dashboard = {
    generatedAt: new Date().toISOString(),
    range,
    current,
    previous,
    gaConfigured: gaConfigured(),
    kpis: [],
    daily: [],
    monthly: [],
    channels: [],
    sources: [],
    checkoutBySource: [],
    pages: [],
    landing: [],
    devices: [],
    cities: [],
    countries: [],
    newVsReturning: [],
    weekday: [],
    hours: [],
    heardFrom: [],
    funnel: [],
    takeaways: [],
  }

  // Supabase first: it works even before GA is connected.
  const sb = await loadSupabase(iso(twelveMonthsAgo))
  const leadsCur = sb.leads.filter(l => inPeriod(l.created_at, current)).length
  const leadsPrev = sb.leads.filter(l => inPeriod(l.created_at, previous)).length
  const membersCur = sb.members.filter(m => inPeriod(m.created_at, current))
  const membersPrev = sb.members.filter(m => inPeriod(m.created_at, previous))
  const revenue = (ms: Member[]) => ms.reduce((s, m) => s + (m.amount_paise ?? 0), 0) / 100
  const heard = new Map<string, { cur: number; prev: number }>()
  for (const l of sb.leads) {
    const k = (l.heard_from || 'unknown').replace('twitter-linkedin', 'Twitter / LinkedIn').replace('friend-referral', 'Friend / referral').replace('youtube', 'YouTube').replace('whatsapp', 'WhatsApp').replace(/^other$/, 'Other').replace(/^unknown$/, 'Not answered')
    const e = heard.get(k) ?? { cur: 0, prev: 0 }
    if (inPeriod(l.created_at, current)) e.cur++
    else if (inPeriod(l.created_at, previous)) e.prev++
    heard.set(k, e)
  }
  base.heardFrom = toCompare(heard)

  // Monthly skeleton for the last 12 months
  const monthly = new Map<string, MonthPoint>()
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(twelveMonthsAgo.getUTCFullYear(), twelveMonthsAgo.getUTCMonth() + i, 1))
    const ym = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    monthly.set(ym, { month: ym, label: monthLabel(ym), sessions: 0, users: 0, newUsers: 0, pageviews: 0, checkout: 0, leadEvents: 0, applications: 0, members: 0, revenue: 0 })
  }
  for (const l of sb.leads) {
    const ym = istDate(l.created_at).replace(/-/g, '').slice(0, 6)
    const m = monthly.get(ym); if (m) m.applications++
  }
  for (const mem of sb.members) {
    const ym = istDate(mem.created_at).replace(/-/g, '').slice(0, 6)
    const m = monthly.get(ym)
    if (m) { m.members++; m.revenue += (mem.amount_paise ?? 0) / 100 }
  }

  if (!base.gaConfigured) {
    base.monthly = [...monthly.values()]
    base.kpis = [
      { key: 'applications', label: 'Applications', value: leadsCur, previous: leadsPrev, format: 'int', hint: 'Apply form submissions' },
      { key: 'members', label: 'New paying members', value: membersCur.length, previous: membersPrev.length, format: 'int' },
      { key: 'revenue', label: 'Revenue', value: revenue(membersCur), previous: revenue(membersPrev), format: 'inr' },
    ]
    base.takeaways = [{ kind: 'info', title: 'Google Analytics is not connected yet', body: 'Add the GA_SERVICE_ACCOUNT_JSON environment variable in Vercel and this dashboard fills in with traffic, sources, pages and the full funnel.' }]
    return base
  }

  const reqs: ReportRequest[] = [
    /* 0 */ { metrics: ['sessions', 'totalUsers', 'newUsers', 'screenPageViews', 'engagementRate', 'averageSessionDuration'], dateRanges: both },
    /* 1 */ { dimensions: ['date'], metrics: ['sessions', 'totalUsers', 'newUsers'], dateRanges: both, limit: 400, orderBy: { dimension: 'date' } },
    /* 2 */ { dimensions: ['sessionDefaultChannelGroup'], metrics: ['sessions'], dateRanges: both, limit: 20 },
    /* 3 */ { dimensions: ['sessionSourceMedium'], metrics: ['sessions'], dateRanges: both, limit: 40, orderBy: { metric: 'sessions' } },
    /* 4 */ { dimensions: ['pagePath'], metrics: ['screenPageViews'], dateRanges: both, limit: 60, orderBy: { metric: 'screenPageViews' } },
    /* 5 */ { dimensions: ['landingPage'], metrics: ['sessions'], dateRanges: both, limit: 30, orderBy: { metric: 'sessions' } },
    /* 6 */ { dimensions: ['deviceCategory'], metrics: ['sessions'], dateRanges: both },
    /* 7 */ { dimensions: ['city'], metrics: ['sessions'], dateRanges: cur, limit: 12, orderBy: { metric: 'sessions' } },
    /* 8 */ { dimensions: ['country'], metrics: ['sessions'], dateRanges: cur, limit: 8, orderBy: { metric: 'sessions' } },
    /* 9 */ { metrics: ['totalUsers'], dateRanges: both, filter: CHECKOUT_FILTER },
    /* 10 */ { dimensions: ['sessionSourceMedium'], metrics: ['totalUsers'], dateRanges: both, limit: 20, orderBy: { metric: 'totalUsers' }, filter: CHECKOUT_FILTER },
    /* 11 */ { metrics: ['eventCount'], dateRanges: both, filter: LEAD_FILTER },
    /* 12 */ { dimensions: ['yearMonth'], metrics: ['sessions', 'totalUsers', 'newUsers', 'screenPageViews'], dateRanges: year, limit: 24 },
    /* 13 */ { dimensions: ['yearMonth'], metrics: ['totalUsers'], dateRanges: year, limit: 24, filter: CHECKOUT_FILTER },
    /* 14 */ { dimensions: ['yearMonth'], metrics: ['eventCount'], dateRanges: year, limit: 24, filter: LEAD_FILTER },
    /* 15 */ { dimensions: ['dayOfWeek'], metrics: ['sessions'], dateRanges: cur, limit: 7 },
    /* 16 */ { dimensions: ['hour'], metrics: ['sessions'], dateRanges: cur, limit: 24 },
    /* 17 */ { dimensions: ['newVsReturning'], metrics: ['sessions'], dateRanges: cur, limit: 5 },
  ]

  let r: Row[][]
  try {
    r = await runReports(reqs)
  } catch (e) {
    base.error = e instanceof Error ? e.message : 'GA4 request failed'
    base.monthly = [...monthly.values()]
    return base
  }

  // Totals
  const tot = (range: number, met: string) => r[0].find(x => x.range === range)?.mets[met] ?? 0
  const checkoutCur = r[9].find(x => x.range === 0)?.mets.totalUsers ?? 0
  const checkoutPrev = r[9].find(x => x.range === 1)?.mets.totalUsers ?? 0
  const leadEvCur = r[11].find(x => x.range === 0)?.mets.eventCount ?? 0
  const leadEvPrev = r[11].find(x => x.range === 1)?.mets.eventCount ?? 0

  base.kpis = [
    { key: 'users', label: 'Visitors', value: tot(0, 'totalUsers'), previous: tot(1, 'totalUsers'), format: 'int', hint: 'People who visited the site' },
    { key: 'sessions', label: 'Visits', value: tot(0, 'sessions'), previous: tot(1, 'sessions'), format: 'int', hint: 'One person can visit more than once' },
    { key: 'newUsers', label: 'New visitors', value: tot(0, 'newUsers'), previous: tot(1, 'newUsers'), format: 'int', hint: 'First time on the site' },
    { key: 'pageviews', label: 'Pageviews', value: tot(0, 'screenPageViews'), previous: tot(1, 'screenPageViews'), format: 'int' },
    { key: 'engagement', label: 'Engaged visits', value: tot(0, 'engagementRate') * 100, previous: tot(1, 'engagementRate') * 100, format: 'pct', hint: 'Stayed 10s+, viewed 2+ pages, or converted' },
    { key: 'duration', label: 'Avg. time on site', value: tot(0, 'averageSessionDuration'), previous: tot(1, 'averageSessionDuration'), format: 'secs' },
    { key: 'checkout', label: 'Reached checkout', value: checkoutCur, previous: checkoutPrev, format: 'int', hint: 'People who opened the payment page' },
    { key: 'applications', label: 'Applications', value: leadsCur, previous: leadsPrev, format: 'int', hint: 'Apply form submissions (from your database)' },
    { key: 'members', label: 'New paying members', value: membersCur.length, previous: membersPrev.length, format: 'int', hint: 'Razorpay payments recorded' },
    { key: 'revenue', label: 'Revenue', value: revenue(membersCur), previous: revenue(membersPrev), format: 'inr' },
  ]

  // Daily, aligned with the previous period by day index
  const curDays = r[1].filter(x => x.range === 0).sort((a, b) => a.dims.date.localeCompare(b.dims.date))
  const prevDays = r[1].filter(x => x.range === 1).sort((a, b) => a.dims.date.localeCompare(b.dims.date))
  const prevByIndex = new Map<number, Row>()
  {
    const start = new Date(previous.start + 'T00:00:00Z').getTime()
    for (const p of prevDays) {
      const d = p.dims.date
      const t = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T00:00:00Z`).getTime()
      prevByIndex.set(Math.round((t - start) / 86400000), p)
    }
  }
  {
    const start = new Date(current.start + 'T00:00:00Z').getTime()
    const byDate = new Map(curDays.map(x => [x.dims.date, x]))
    for (let i = 0; i < current.days; i++) {
      const dt = new Date(start + i * 86400000)
      const ymd = iso(dt).replace(/-/g, '')
      const c = byDate.get(ymd)
      const p = prevByIndex.get(i)
      base.daily.push({
        date: iso(dt),
        label: dayLabel(ymd),
        sessions: c?.mets.sessions ?? 0,
        users: c?.mets.totalUsers ?? 0,
        newUsers: c?.mets.newUsers ?? 0,
        prevSessions: p ? p.mets.sessions : null,
        prevUsers: p ? p.mets.totalUsers : null,
      })
    }
  }

  base.channels = toCompare(byName(r[2], 'sessionDefaultChannelGroup', 'sessions'))
  base.sources = toCompare(byName(r[3], 'sessionSourceMedium', 'sessions'), 15)
  const INTERNAL = /^\/(admin|leads|team|members|analytics|preview-superpower)(\/|$)|^\(not set\)$/
  base.pages = toCompare(byName(r[4], 'pagePath', 'screenPageViews'), 40).filter(p => !INTERNAL.test(p.name)).slice(0, 20)
  base.landing = toCompare(byName(r[5], 'landingPage', 'sessions'), 24).filter(p => !INTERNAL.test(p.name)).slice(0, 12)
  base.devices = toCompare(byName(r[6], 'deviceCategory', 'sessions'))
  base.cities = toCompare(byName(r[7], 'city', 'sessions'), 12).filter(c => c.name !== '(not set)')
  base.countries = toCompare(byName(r[8], 'country', 'sessions'), 8)
  base.checkoutBySource = toCompare(byName(r[10], 'sessionSourceMedium', 'totalUsers'), 10)
  base.newVsReturning = toCompare(byName(r[17], 'newVsReturning', 'sessions')).map(x => ({ ...x, name: x.name === 'new' ? 'New' : x.name === 'returning' ? 'Returning' : x.name }))
  base.weekday = WEEKDAYS.map((name, i) => ({ name, sessions: r[15].find(x => Number(x.dims.dayOfWeek) === i)?.mets.sessions ?? 0 }))
  base.hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, sessions: r[16].find(x => Number(x.dims.hour) === h)?.mets.sessions ?? 0 }))

  for (const row of r[12]) {
    const m = monthly.get(row.dims.yearMonth)
    if (m) { m.sessions = row.mets.sessions; m.users = row.mets.totalUsers; m.newUsers = row.mets.newUsers; m.pageviews = row.mets.screenPageViews }
  }
  for (const row of r[13]) { const m = monthly.get(row.dims.yearMonth); if (m) m.checkout = row.mets.totalUsers }
  for (const row of r[14]) { const m = monthly.get(row.dims.yearMonth); if (m) m.leadEvents = row.mets.eventCount }
  base.monthly = [...monthly.values()]

  // The form comes before the payment page, and the payment page can be reached
  // directly too, so it is a KPI rather than a funnel step.
  base.funnel = [
    { step: 'Visited the site', value: tot(0, 'totalUsers'), previous: tot(1, 'totalUsers') },
    { step: 'Filled the apply form', value: leadsCur, previous: leadsPrev },
    { step: 'Paid', value: membersCur.length, previous: membersPrev.length },
  ]

  base.takeaways = computeTakeaways(base, { leadEvCur, leadEvPrev })
  return base
}

/* ── Plain-English takeaways computed from the numbers ── */
function computeTakeaways(d: Dashboard, x: { leadEvCur: number; leadEvPrev: number }): Takeaway[] {
  const t: Takeaway[] = []
  const k = Object.fromEntries(d.kpis.map(k => [k.key, k])) as Record<string, Kpi>
  const prevLabel = d.previous.label.toLowerCase()

  // Traffic direction
  if (k.users && k.users.previous > 0) {
    const p = pct(k.users.value, k.users.previous)
    if (Math.abs(p) >= 5)
      t.push({
        kind: p > 0 ? 'good' : 'bad',
        title: `${p > 0 ? 'Traffic is up' : 'Traffic is down'} ${fmtPct(Math.abs(p))}`,
        body: `${fmtInt(k.users.value)} people visited vs ${fmtInt(k.users.previous)} in the ${prevLabel}.`,
      })
    else t.push({ kind: 'info', title: 'Traffic is flat', body: `${fmtInt(k.users.value)} visitors, about the same as the ${prevLabel}.` })
  }

  // Biggest mover among channels
  const movers = d.channels.filter(c => c.value + c.previous >= 20).map(c => ({ ...c, diff: c.value - c.previous })).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
  if (movers[0] && Math.abs(movers[0].diff) >= 10) {
    const m = movers[0]
    t.push({
      kind: m.diff > 0 ? 'good' : 'bad',
      title: `${m.name} ${m.diff > 0 ? 'grew' : 'fell'} the most`,
      body: `${fmtInt(m.value)} visits vs ${fmtInt(m.previous)} (${fmtPct(pct(m.value, m.previous))}). ${m.name === 'Referral' ? 'Most referral traffic here is YouTube description links.' : ''}`.trim(),
    })
  }

  // YouTube share
  const yt = d.sources.filter(s => /youtube|jev|midroll|aitools/i.test(s.name)).reduce((a, s) => a + s.value, 0)
  if (k.sessions && k.sessions.value > 0 && yt > 0) {
    const share = Math.round((yt / k.sessions.value) * 100)
    t.push({ kind: 'info', title: `YouTube brings ${share}% of visits`, body: share >= 40 ? 'Video launches drive the site. A tagged link in every description is your cheapest growth lever.' : 'Other channels are carrying more weight than YouTube right now.' })
  }

  // Checkout conversion
  if (k.users && k.checkout && k.users.value > 0) {
    const rate = (k.checkout.value / k.users.value) * 100
    const prevRate = k.users.previous > 0 ? (k.checkout.previous / k.users.previous) * 100 : 0
    const diff = rate - prevRate
    t.push({
      kind: Math.abs(diff) < 0.5 ? 'info' : diff > 0 ? 'good' : 'bad',
      title: `${rate.toFixed(1)}% of visitors reach checkout`,
      body: `${fmtInt(k.checkout.value)} people opened the payment page. ${prevRate ? `It was ${prevRate.toFixed(1)}% in the ${prevLabel}.` : ''} ${rate < 3 ? 'Under 3% means the page is not convincing enough people to pick a plan.' : rate >= 6 ? 'Above 6% is strong for a paid community landing page.' : ''}`.trim(),
    })
  }

  // Applications and members
  if (k.applications) {
    const a = k.applications
    t.push({
      kind: a.value >= a.previous ? 'good' : 'bad',
      title: `${fmtInt(a.value)} applications`,
      body: a.previous ? `vs ${fmtInt(a.previous)} in the ${prevLabel} (${fmtPct(pct(a.value, a.previous))}).` : 'No applications in the previous period to compare with.',
    })
  }
  if (k.members) {
    const m = k.members
    const rev = k.revenue
    t.push({
      kind: m.value > 0 ? 'good' : 'bad',
      title: m.value > 0 ? `${fmtInt(m.value)} new paying member${m.value === 1 ? '' : 's'}, ₹${fmtInt(rev?.value ?? 0)}` : 'No new paying members in this period',
      body: m.previous ? `The ${prevLabel} brought ${fmtInt(m.previous)} (₹${fmtInt(rev?.previous ?? 0)}).` : 'Nothing to compare with in the previous period.',
    })
    if (k.applications && k.applications.value > 0) {
      const close = (m.value / k.applications.value) * 100
      t.push({ kind: close >= 25 ? 'good' : close >= 10 ? 'info' : 'bad', title: `${Math.round(close)}% of applicants paid`, body: close >= 25 ? 'The follow-up calls are converting well.' : 'Most applicants did not pay. Faster follow-up on WhatsApp usually lifts this.' })
    }
  }

  // Best day
  const best = [...d.daily].sort((a, b) => b.sessions - a.sessions)[0]
  if (best && best.sessions > 0) {
    const avg = d.daily.reduce((s, x) => s + x.sessions, 0) / Math.max(1, d.daily.length)
    if (best.sessions > avg * 1.8) t.push({ kind: 'info', title: `${best.label} was your biggest day (${fmtInt(best.sessions)} visits)`, body: 'Spikes like this usually follow a video or a post. Check what went out that day and do it again.' })
  }

  // Devices
  const desk = d.devices.find(x => x.name === 'desktop')
  const mob = d.devices.find(x => x.name === 'mobile')
  if (desk && mob && desk.value + mob.value > 0) {
    const ms = Math.round((mob.value / (desk.value + mob.value)) * 100)
    t.push({ kind: 'info', title: `${ms}% of visits are on phones`, body: ms > 60 ? 'Most people see the site on a phone. Check every new section on mobile first.' : 'Desktop is unusually high for India, which fits people clicking from YouTube on a laptop.' })
  }

  // Blog / SEO share
  const blogViews = d.pages.filter(p => /^\/(blog|guide|community|tools)\//.test(p.name)).reduce((a, p) => a + p.value, 0)
  const totalViews = k.pageviews?.value ?? 0
  if (totalViews > 0 && blogViews > 0) {
    const share = Math.round((blogViews / totalViews) * 100)
    const organic = d.channels.find(c => c.name === 'Organic Search')
    t.push({ kind: 'info', title: `Blog and guides are ${share}% of pageviews`, body: organic ? `Google search sent ${fmtInt(organic.value)} visits (${fmtPct(pct(organic.value, organic.previous))} vs the ${prevLabel}). This traffic compounds if you keep publishing.` : 'Keep publishing: this is the traffic that arrives without a new video.' })
  }

  // Lead event sanity note
  if (x.leadEvCur === 0 && (k.applications?.value ?? 0) > 0) {
    t.push({ kind: 'info', title: 'Analytics is not seeing form submissions', body: 'Applications exist in the database but Google Analytics recorded no lead events. The tag may be blocked by ad blockers; the database number is the one to trust.' })
  }

  // Outside India
  const india = d.countries.find(c => c.name === 'India')
  const totalC = d.countries.reduce((a, c) => a + c.value, 0)
  if (india && totalC > 0) {
    const outside = Math.round(((totalC - india.value) / totalC) * 100)
    if (outside >= 20) t.push({ kind: 'info', title: `${outside}% of visits come from outside India`, body: 'Some of these visitors cannot pay through UPI. Worth knowing when you read conversion rates.' })
  }

  return t.slice(0, 9)
}
