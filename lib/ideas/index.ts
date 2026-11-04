import raw from './data.json'
import { SITE_URL } from '@/lib/site'

/* Free idea pages. data.json is short summaries in our own words, written from the private plans
   that make up the paid 100 Business Ideas PDF. Full plans never go in this public repo, and
   neither do revenue projections or the plans' unverified market stats. */

export type IdeaType = 'saas' | 'agency' | 'marketplace' | 'app' | 'ecommerce' | 'content' | 'directory' | 'service'
export type IdeaBudget = 'under-50k' | '50k-5l' | 'over-5l' | 'unknown'

export type Idea = {
  slug: string
  name: string
  type: IdeaType
  oneLine: string
  what: string
  problem: string
  bestFor: string[]
  moneyModel: string[]
  startupCost: string | null
  budget: IdeaBudget
  buildableWithAi: boolean
  market: 'india' | 'india-and-global' | 'global-from-india'
  firstSteps: string[]
  watchOut: string
  keywords: string[]
}

export const IDEAS = raw as Idea[]
export const ideaBySlug = (slug: string) => IDEAS.find(i => i.slug === slug)

export const PUBLISHED_ON = '2026-11-04'
export const PDF_PRICE = '₹499'
export const pdfUrl = (slug: string) => `https://www.thesoloentrepreneur.in/products?utm_source=founderswing&utm_medium=ideas&utm_campaign=${slug}#pdf`

// Under this many ideas a landing page stays reachable but out of search results.
export const INDEX_MIN_IDEAS = 4

export const TYPES: Record<IdeaType, { label: string; h1: string; title: string; intro: string }> = {
  saas: { label: 'SaaS', h1: 'SaaS business ideas for Indian founders', title: 'SaaS Business Ideas for Indian Founders', intro: 'Software that people pay for every month. Each idea says who pays, how it charges, how to test it this month and what makes it hard.' },
  agency: { label: 'Agency', h1: 'Agency business ideas you can start from India', title: 'Agency Business Ideas to Start from India', intro: 'You sell a service before you build anything, so this is often the quickest way to a first paying client. Each idea says who buys and how to find them.' },
  marketplace: { label: 'Marketplace', h1: 'Marketplace business ideas', title: 'Marketplace Business Ideas for Indian Founders', intro: 'Businesses that bring buyers and sellers together. Getting both sides on board at the start is always the hard part, so each idea says where you could begin.' },
  app: { label: 'App', h1: 'App ideas for Indian founders', title: 'App Business Ideas for Indian Founders', intro: 'Apps built for one clear use, from everyday consumer problems to small paid tools. Each idea says who it is for and how it would earn.' },
  ecommerce: { label: 'Ecommerce', h1: 'Ecommerce business ideas in India', title: 'Ecommerce Business Ideas in India', intro: 'Selling physical products online, from print on demand to subscription boxes. Each idea says what it costs to start and where it usually goes wrong.' },
  content: { label: 'Content', h1: 'Content business ideas', title: 'Content Business Ideas for Indian Creators', intro: 'Newsletters, ebooks, podcasts and video, where an audience pays or sponsors do. Each idea says how the money comes in and what it asks of you.' },
  directory: { label: 'Directory', h1: 'Directory website ideas', title: 'Directory Website Business Ideas', intro: 'Websites that collect the options in one category and earn from listings, referrals or ads. Each idea says who would pay and how you would start.' },
  service: { label: 'Service', h1: 'Service business ideas', title: 'Service Business Ideas in India', intro: 'Businesses built on doing the work for someone, usually with little money up front. Each idea says who pays and what to watch out for.' },
}

const BUDGETS: Record<string, { budget: IdeaBudget; label: string; h1: string; title: string; intro: string }> = {
  'under-50000': { budget: 'under-50k', label: 'Under ₹50,000', h1: 'Business ideas you can start under ₹50,000', title: 'Business Ideas Under ₹50,000 in India', intro: 'Ideas whose estimated startup cost is under ₹50,000. These are estimates, and your own costs will depend on what you already have and how much you do yourself.' },
  'under-5-lakh': { budget: '50k-5l', label: '₹50,000 to ₹5 lakh', h1: 'Business ideas from ₹50,000 to ₹5 lakh', title: 'Business Ideas Under ₹5 Lakh in India', intro: 'Ideas whose estimated startup cost is between ₹50,000 and ₹5 lakh. These are estimates, so test demand with far less before you spend the full amount.' },
}

export type IdeaHub = {
  path: string
  title: string
  description: string
  h1: string
  intro: string
  crumbs: { name: string; href: string }[]
  ideas: Idea[]
  indexable: boolean
  faqs: { q: string; a: string }[]
}

const FAQS = [
  { q: 'Can I use these ideas for free?', a: 'Yes. Anyone can build on an idea here, and each page is free to read. Nobody owns an idea, so what counts is how well you run it and how quickly you reach customers.' },
  { q: 'Do these pages say how much I will earn?', a: 'No. Startup costs and prices are estimates from our plans, not results from a real business. We leave out income figures here because nobody can promise what a new business will make.' },
  { q: 'What is in the full plan?', a: `The 100 Business Ideas PDF (${PDF_PRICE}) has a business plan for each idea. These pages are short overviews, so buy the PDF only if you want the longer version.` },
  { q: 'How should I pick an idea?', a: 'Pick one where you can name ten people who might pay, and message them this week. Choose it for who you can reach, not for how big it sounds.' },
]

const crumb = { name: 'Business ideas', href: '/ideas' }
const describe = (lead: string, n: number) => `${lead} ${n} ideas with startup cost, how each makes money, who it suits and how to test it.`

export function allIdeasHub(): IdeaHub {
  return {
    path: '/ideas',
    title: 'Business Ideas for Indian Founders',
    description: describe('Startup and business ideas for India, from SaaS and agencies to marketplaces.', IDEAS.length),
    h1: 'Business ideas for Indian founders',
    intro: `${IDEAS.length} ideas you could start, each with what it costs, how it makes money, who it suits, how to test it this month and what could go wrong.`,
    crumbs: [crumb],
    ideas: IDEAS,
    indexable: true,
    faqs: FAQS,
  }
}

export function typeHub(type: string): IdeaHub | null {
  const t = TYPES[type as IdeaType]
  if (!t) return null
  const ideas = IDEAS.filter(i => i.type === type)
  return {
    path: `/ideas/type/${type}`,
    title: t.title,
    description: describe(t.intro.split('. ')[0] + '.', ideas.length),
    h1: t.h1,
    intro: t.intro,
    crumbs: [crumb, { name: t.label, href: `/ideas/type/${type}` }],
    ideas,
    indexable: ideas.length >= INDEX_MIN_IDEAS,
    faqs: FAQS,
  }
}

export function budgetHub(slug: string): IdeaHub | null {
  const b = BUDGETS[slug]
  if (!b) return null
  const ideas = IDEAS.filter(i => i.budget === b.budget)
  return {
    path: `/ideas/budget/${slug}`,
    title: b.title,
    description: describe(b.intro.split('. ')[0] + '.', ideas.length),
    h1: b.h1,
    intro: b.intro,
    crumbs: [crumb, { name: b.label, href: `/ideas/budget/${slug}` }],
    ideas,
    indexable: ideas.length >= INDEX_MIN_IDEAS,
    faqs: FAQS,
  }
}

export function builtWithAiHub(): IdeaHub {
  const ideas = IDEAS.filter(i => i.buildableWithAi)
  return {
    path: '/ideas/built-with-ai',
    title: 'Business Ideas You Can Build with AI',
    description: describe('Business ideas one non-technical person could get running with AI coding or no-code tools.', ideas.length),
    h1: 'Business ideas you can build with AI',
    intro: 'Ideas where one person could get a first working version running in a few weeks with AI coding or no-code tools. That gets you to a first version, and finding people who pay for it is still the real work.',
    crumbs: [crumb, { name: 'Built with AI', href: '/ideas/built-with-ai' }],
    ideas,
    indexable: ideas.length >= INDEX_MIN_IDEAS,
    faqs: FAQS,
  }
}

export const typeSlugs = () => Object.keys(TYPES)
export const budgetSlugs = () => Object.keys(BUDGETS)

export function ideaFilters() {
  const hubs = [
    ...typeSlugs().map(t => typeHub(t)!).map(h => ({ hub: h, name: h.crumbs[1].name })),
    { hub: builtWithAiHub(), name: 'Built with AI' },
    ...budgetSlugs().map(b => budgetHub(b)!).map(h => ({ hub: h, name: h.crumbs[1].name })),
  ]
  return hubs.filter(h => h.hub.ideas.length > 0).map(h => ({ href: h.hub.path, name: h.name, n: h.hub.ideas.length }))
}

export const indexableIdeaHubPaths = () =>
  [...typeSlugs().map(t => typeHub(t)!), builtWithAiHub(), ...budgetSlugs().map(b => budgetHub(b)!)].filter(h => h.indexable).map(h => h.path)

// Same type first, so the links stay useful to someone comparing similar ideas.
export function relatedIdeas(idea: Idea, count = 6) {
  const others = IDEAS.filter(i => i.slug !== idea.slug)
  return [...others.filter(i => i.type === idea.type), ...others.filter(i => i.type !== idea.type)].slice(0, count)
}

const breadcrumbs = (crumbs: { name: string; href: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', href: '/' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.href === '/' ? '' : c.href}` })),
})

export function ideaHubJsonLd(hub: IdeaHub) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbs(hub.crumbs),
      {
        '@type': 'CollectionPage', name: hub.title, description: hub.description, url: `${SITE_URL}${hub.path}`,
        mainEntity: { '@type': 'ItemList', numberOfItems: hub.ideas.length, itemListElement: hub.ideas.slice(0, 30).map((i, n) => ({ '@type': 'ListItem', position: n + 1, url: `${SITE_URL}/ideas/${i.slug}`, name: i.name })) },
      },
      { '@type': 'FAQPage', mainEntity: hub.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  }
}

export function ideaJsonLd(idea: Idea, title: string, description: string) {
  const url = `${SITE_URL}/ideas/${idea.slug}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbs([crumb, { name: idea.name, href: `/ideas/${idea.slug}` }]),
      { '@type': 'Article', headline: title, description, url, mainEntityOfPage: url, datePublished: PUBLISHED_ON, dateModified: PUBLISHED_ON, keywords: idea.keywords.join(', '), author: { '@type': 'Organization', name: 'Founders Wing', url: SITE_URL }, publisher: { '@type': 'Organization', name: 'Founders Wing', url: SITE_URL } },
    ],
  }
}
