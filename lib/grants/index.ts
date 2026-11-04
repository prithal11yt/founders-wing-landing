import raw from './data.json'
import { SITE_URL } from '@/lib/site'

/* Grants and schemes directory. data.json is researched by hand: every entry was read on an official
   page on its checkedOn date. Schemes close quietly, so re-check them periodically. */

export type GrantKind = 'grant' | 'seed-funding' | 'loan' | 'credit-guarantee' | 'credits' | 'incubation' | 'subsidy' | 'prize'
export type GrantStatus = 'open-rolling' | 'open-window' | 'periodic' | 'closed' | 'unclear'

export type Grant = {
  slug: string
  name: string
  shortName: string | null
  provider: string
  level: 'central' | 'state' | 'private'
  state: string | null
  kind: GrantKind
  summary: string
  amount: string | null
  amountMaxInr: number | null
  repayable: boolean | null
  stages: string[]
  sectors: string[]
  audience: string[]
  goodForSoftware: boolean
  eligibility: string[]
  howToApply: string[]
  status: GrantStatus
  statusNote: string
  deadline: string | null
  watchOut: string
  officialUrl: string
  applyUrl: string | null
  checkedOn: string
}

const ALL = raw as Grant[]
const STATUS_ORDER: Record<GrantStatus, number> = { 'open-window': 0, 'open-rolling': 1, periodic: 2, unclear: 3, closed: 4 }

// Closing soon, then open, then the rest. Within those, what suits a software startup, then the largest amounts.
export const GRANTS = [...ALL].sort((a, b) =>
  STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || Number(b.goodForSoftware) - Number(a.goodForSoftware) || (b.amountMaxInr ?? 0) - (a.amountMaxInr ?? 0))
const LISTED = GRANTS.filter(g => g.status !== 'closed')

export const CLOSED_GRANTS = GRANTS.filter(g => g.status === 'closed')

export const grantBySlug = (slug: string) => GRANTS.find(g => g.slug === slug)

export const INDEX_MIN_GRANTS = 3
// One good scheme is still a useful answer for its state, but two is the least worth ranking.
export const INDEX_MIN_STATE_GRANTS = 2

export const STATE_NAMES: Record<string, string> = {
  'andhra-pradesh': 'Andhra Pradesh', assam: 'Assam', bihar: 'Bihar', chhattisgarh: 'Chhattisgarh', delhi: 'Delhi', goa: 'Goa', gujarat: 'Gujarat', haryana: 'Haryana',
  'himachal-pradesh': 'Himachal Pradesh', jharkhand: 'Jharkhand', karnataka: 'Karnataka', kerala: 'Kerala', 'madhya-pradesh': 'Madhya Pradesh', maharashtra: 'Maharashtra',
  odisha: 'Odisha', punjab: 'Punjab', rajasthan: 'Rajasthan', 'tamil-nadu': 'Tamil Nadu', telangana: 'Telangana', 'uttar-pradesh': 'Uttar Pradesh', uttarakhand: 'Uttarakhand', 'west-bengal': 'West Bengal',
}

export const KIND_LABELS: Record<GrantKind, string> = {
  grant: 'Grant', 'seed-funding': 'Seed funding', loan: 'Loan', 'credit-guarantee': 'Credit guarantee', credits: 'Cloud and AI credits', incubation: 'Incubation support', subsidy: 'Subsidy', prize: 'Prize',
}

const KIND_HUBS: Partial<Record<GrantKind, { h1: string; title: string; intro: string }>> = {
  credits: { h1: 'Free cloud and AI credits for Indian startups', title: 'Free Cloud and AI Credits for Indian Startups', intro: 'Programmes that give startups credits for cloud hosting and AI tools. You do not repay them, though each has its own rules on who qualifies.' },
  grant: { h1: 'Startup grants in India', title: 'Startup Grants in India', intro: 'Money you are not expected to pay back, from government bodies and foundations. Check each scheme\'s conditions, since most pay in stages against milestones.' },
  loan: { h1: 'Government loans for startups in India', title: 'Government Loans for Startups in India', intro: 'Loan schemes backed by the government, usually through a bank. You repay these, so they suit a business that already has a way to earn.' },
  'seed-funding': { h1: 'Seed funding schemes for startups in India', title: 'Seed Funding Schemes for Startups in India', intro: 'Early money from public programmes. Some are grants and others are debt or convertible, so each page says which it is.' },
}

export function statusBadge(g: Grant, today = new Date().toISOString().slice(0, 10)): { label: string; open: boolean } {
  if (g.status === 'closed') return { label: 'Closed', open: false }
  if (g.deadline && g.deadline < today) return { label: 'Deadline passed', open: false }
  if (g.status === 'open-rolling') return { label: 'Open all year', open: true }
  if (g.status === 'open-window') return { label: g.deadline ? `Open until ${fmtDate(g.deadline)}` : 'Open now', open: true }
  if (g.status === 'periodic') return { label: 'Opens in rounds', open: false }
  return { label: 'Check official page', open: false }
}

export const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
export const repayLabel = (g: Grant) => (g.repayable === false ? 'No' : g.repayable === true ? 'Yes, or it takes equity' : 'See official page')
export const placeLabel = (g: Grant) => (g.state ? STATE_NAMES[g.state] ?? g.state : g.level === 'central' ? 'All of India' : 'Open to Indian startups')

export const lastChecked = () => ALL.map(g => g.checkedOn).sort().pop() ?? ''

export type GrantHub = {
  path: string
  title: string
  description: string
  h1: string
  intro: string
  crumbs: { name: string; href: string }[]
  grants: Grant[]
  indexable: boolean
  faqs: { q: string; a: string }[]
}

const crumb = { name: 'Grants', href: '/grants' }

const hub = (h: Omit<GrantHub, 'faqs' | 'indexable'> & { min?: number }): GrantHub => ({ ...h, indexable: h.grants.length >= (h.min ?? INDEX_MIN_GRANTS), faqs: FAQS })

export const FAQS: { q: string; a: string }[] = [
  { q: 'Is the Startup India Seed Fund Scheme still open?', a: 'No, not for new startups. The official portal gave 31 May 2026 as the last date for startups to apply. Money already approved is still being paid out, and we found no replacement scheme when we last checked.' },
  { q: 'Do I need DPIIT recognition to get a grant?', a: 'Many central and state schemes ask for it, but not all. Each page here lists that scheme\'s conditions, so check before you apply for recognition just for one scheme.' },
  { q: 'Can a SaaS or AI startup get a grant?', a: 'Yes, but fewer schemes suit it than the headlines suggest. Some are for deep tech or hardware, and NIDHI PRAYAS, for example, leaves out pure software and app projects. Start with our list for software startups.' },
  { q: 'What is the difference between a grant, a loan and a credit guarantee?', a: 'You are not expected to repay a grant if you meet its conditions. You repay a loan with interest. A credit guarantee is not money for you at all: it protects the bank, which may make the bank more willing to lend to you.' },
  { q: 'Should I pay an agent to get a government scheme?', a: 'Be careful with anyone who promises approval for a fee. Nobody outside the selection process can promise it. MUDRA, for example, says on its own site that it uses no agents.' },
  { q: 'How current is this list?', a: 'Each page shows the date we read the official source. Schemes change and close without much notice, so confirm the amount and dates on the official page before you apply.' },
]

export function allGrantsHub(): GrantHub {
  return hub({
    path: '/grants',
    title: 'Startup Grants and Government Schemes in India',
    description: `${LISTED.length} startup grants, government schemes, loans and free credits for Indian founders, each checked on its official page, with amounts, eligibility and how to apply.`,
    h1: 'Startup grants and government schemes in India',
    intro: `${LISTED.length} grants, schemes, loans and free credits for Indian startups. We read each one on its official page, then show whether it is open, whether you repay it and what the catch is.`,
    crumbs: [crumb],
    grants: LISTED,
    min: 1,
  })
}

export function centralHub(): GrantHub {
  const grants = LISTED.filter(g => g.level === 'central')
  return hub({ path: '/grants/central', title: 'Central Government Schemes for Startups in India', description: `${grants.length} central government grants, loans and schemes for Indian startups, with amounts, eligibility and how to apply.`, h1: 'Central government schemes for startups', intro: 'Schemes run by the Government of India and open across the country. Many reach you through an incubator or a bank, so each page says who you actually apply to.', crumbs: [crumb, { name: 'Central government', href: '/grants/central' }], grants })
}

export function womenHub(): GrantHub {
  const grants = LISTED.filter(g => g.audience.includes('women'))
  return hub({ path: '/grants/women', title: 'Grants and Schemes for Women Founders in India', description: `${grants.length} grants, loans and programmes for women entrepreneurs in India, with amounts, eligibility and how to apply.`, h1: 'Grants and schemes for women founders', intro: 'Programmes meant for women entrepreneurs, or with better terms for them. Check each page, since some ask for a set share of ownership by women.', crumbs: [crumb, { name: 'Women founders', href: '/grants/women' }], grants })
}

export function softwareHub(): GrantHub {
  const grants = LISTED.filter(g => g.goodForSoftware)
  return hub({ path: '/grants/for-software', title: 'Grants for SaaS and AI Startups in India', description: `${grants.length} grants, schemes and credits a small software or AI startup in India can realistically use.`, h1: 'Grants for SaaS and AI startups', intro: 'Schemes a small software or AI startup can realistically use, leaving out those meant for factories, biotech or hardware.', crumbs: [crumb, { name: 'For software startups', href: '/grants/for-software' }], grants })
}

export function stateHub(state: string): GrantHub | null {
  const name = STATE_NAMES[state]
  if (!name) return null
  const grants = LISTED.filter(g => g.state === state)
  return hub({ path: `/grants/state/${state}`, title: `Startup Grants and Schemes in ${name}`, description: `${grants.length === 1 ? 'A startup scheme' : `${grants.length} startup schemes`} for founders in ${name}, with amounts, eligibility and how to apply.`, h1: `Startup grants and schemes in ${name}`, intro: `Schemes for startups in ${name}, as published on their official pages. Central government schemes may be open to you as well, so look at those too.`, crumbs: [crumb, { name, href: `/grants/state/${state}` }], grants, min: INDEX_MIN_STATE_GRANTS })
}

export function kindHub(kind: string): GrantHub | null {
  const copy = KIND_HUBS[kind as GrantKind]
  if (!copy) return null
  const grants = LISTED.filter(g => g.kind === kind)
  return hub({ path: `/grants/type/${kind}`, title: copy.title, description: `${grants.length} options. ${copy.intro.split('. ')[0]}.`, h1: copy.h1, intro: copy.intro, crumbs: [crumb, { name: KIND_LABELS[kind as GrantKind], href: `/grants/type/${kind}` }], grants })
}

export const kindSlugs = () => Object.keys(KIND_HUBS)
export const stateSlugs = () => [...new Set(GRANTS.map(g => g.state).filter((s): s is string => !!s && !!STATE_NAMES[s]))]

export function grantStateLinks() {
  return stateSlugs().map(s => ({ href: `/grants/state/${s}`, name: STATE_NAMES[s], n: LISTED.filter(g => g.state === s).length })).filter(l => l.n > 0).sort((a, b) => b.n - a.n)
}

export function grantFilters() {
  return [softwareHub(), centralHub(), ...kindSlugs().map(k => kindHub(k)!), womenHub()]
    .filter(h => h.grants.length > 0)
    .map(h => ({ href: h.path, name: h.crumbs[1].name, n: h.grants.length }))
}

export const indexableGrantHubPaths = () =>
  [centralHub(), womenHub(), softwareHub(), ...kindSlugs().map(k => kindHub(k)!), ...stateSlugs().map(s => stateHub(s)!)].filter(h => h.indexable).map(h => h.path)

export function relatedGrants(g: Grant, count = 6) {
  const others = LISTED.filter(o => o.slug !== g.slug)
  const near = others.filter(o => (g.state && o.state === g.state) || o.kind === g.kind)
  return [...near, ...others.filter(o => !near.includes(o))].slice(0, count)
}

const breadcrumbs = (crumbs: { name: string; href: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', href: '/' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.href === '/' ? '' : c.href}` })),
})

export function grantHubJsonLd(h: GrantHub) {
  const graph: Record<string, unknown>[] = [
    breadcrumbs(h.crumbs),
    { '@type': 'CollectionPage', name: h.title, description: h.description, url: `${SITE_URL}${h.path}`, mainEntity: { '@type': 'ItemList', numberOfItems: h.grants.length, itemListElement: h.grants.slice(0, 30).map((g, n) => ({ '@type': 'ListItem', position: n + 1, url: `${SITE_URL}/grants/${g.slug}`, name: g.name })) } },
  ]
  if (h.faqs.length) graph.push({ '@type': 'FAQPage', mainEntity: h.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
  return { '@context': 'https://schema.org', '@graph': graph }
}

export function grantJsonLd(g: Grant, title: string, description: string) {
  const url = `${SITE_URL}/grants/${g.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbs([crumb, { name: g.shortName ?? g.name, href: `/grants/${g.slug}` }]),
      { '@type': 'Article', headline: title, description, url, mainEntityOfPage: url, dateModified: g.checkedOn, author: { '@type': 'Organization', name: 'Founders Wing', url: SITE_URL }, publisher: { '@type': 'Organization', name: 'Founders Wing', url: SITE_URL } },
    ],
  }
}
