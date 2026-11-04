import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PrimaryCTA } from '@/components/site/ui'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { getLastRefresh, getUpcomingEvents } from '@/lib/events/data'
import { istDay } from '@/lib/events/format'
import { browseLinks, hubJsonLd, type Hub } from '@/lib/events/hubs'
import { EventBrowser } from './event-browser'

export function hubMetadata(hub: Hub): Metadata {
  const url = `${SITE_URL}${hub.path}`
  return {
    title: hub.title,
    description: hub.description,
    alternates: { canonical: url },
    // Thin pages stay reachable for visitors but out of search results.
    robots: hub.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: hub.title, description: hub.description, url, siteName: SITE_NAME, type: 'website', locale: 'en_IN' },
    twitter: { card: 'summary_large_image', title: hub.title, description: hub.description },
  }
}

export function Crumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-neutral-500">
      <Link href="/" className="hover:text-neutral-900">Home</Link>
      {items.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
          {i === items.length - 1 ? <span className="text-neutral-800">{c.name}</span> : <Link href={c.href} className="hover:text-neutral-900">{c.name}</Link>}
        </span>
      ))}
    </nav>
  )
}

export const Pill = ({ href, name, n }: { href: string; name: string; n?: number }) => (
  <Link href={href} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 text-[13.5px] font-medium text-neutral-800 transition-colors hover:border-neutral-400">
    {name}{n !== undefined && <span className="text-[12px] font-normal text-neutral-400">{n}</span>}
  </Link>
)

export function LinkBlock({ title, links }: { title: string; links: { href: string; name: string; n?: number }[] }) {
  if (!links.length) return null
  return (
    <div>
      <h3 className="text-[15px] font-semibold text-neutral-950">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map(l => <li key={l.href}><Link href={l.href} className="text-[14px] text-neutral-600 hover:text-neutral-950">{l.name}{l.n !== undefined && <span className="text-neutral-400"> ({l.n})</span>}</Link></li>)}
      </ul>
    </div>
  )
}

export function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (!faqs.length) return null
  return (
    <section className="pb-16">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">Questions people ask</h2>
        <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
          {faqs.map(f => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-neutral-950 [&::-webkit-details-marker]:hidden">{f.q}<ChevronRight className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-open:rotate-90" /></summary>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CommunityBand({ title = 'An event is one evening. Your founder circle is every week.' }: { title?: string }) {
  return (
    <section className="rounded-[24px] bg-neutral-950 px-6 py-10 text-white md:px-12 md:py-12">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">{title}</h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/65">Founders Wing is India’s community for people building with AI: weekly live sessions, a private group, and people who help you reach paying customers.</p>
        </div>
        <PrimaryCTA href="/">See Founders Wing</PrimaryCTA>
      </div>
    </section>
  )
}

/** Shared by every events landing page. */
export async function HubPage({ hub }: { hub: Hub }) {
  const [all, refreshed] = await Promise.all([getUpcomingEvents(), getLastRefresh()])
  const links = browseLinks(all)
  const physicalPills = links.cities.slice(0, 12)
  const city = hub.path.match(/^\/events\/city\/([^/]+)/)?.[1]
  const refreshedLabel = refreshed ? new Date(`${istDay(refreshed)}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hubJsonLd(hub)).replace(/</g, '\\u003c') }} />

      <section className="pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl px-5">
          {hub.crumbs.length > 1 && <Crumbs items={hub.crumbs} />}
          <h1 className="mt-4 max-w-4xl text-4xl font-medium leading-[1.04] tracking-[-0.04em] md:text-[56px]">{hub.h1}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-neutral-600">{hub.intro}</p>
          {refreshedLabel && <p className="mt-3 text-[13px] text-neutral-500">Updated weekly. Last checked {refreshedLabel}.</p>}
        </div>
      </section>

      {/* Real links, so every city page is one click (and one crawl) away. */}
      {!city && physicalPills.length > 0 && (
        <section className="mt-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {!hub.path.endsWith('/online') && <Pill href="/events/online" name="Online" />}
              {physicalPills.map(c => <Pill key={c.slug} href={`/events/city/${c.slug}`} name={c.name} n={c.n} />)}
            </div>
          </div>
        </section>
      )}
      {city && (
        <section className="mt-6">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Pill href={`/events/city/${city}`} name="All in this city" />
            <Pill href={`/events/city/${city}/free`} name="Free" />
            {links.types.map(t => <Pill key={t.slug} href={`/events/city/${city}/${t.slug}`} name={t.name} />)}
          </div>
        </section>
      )}

      <section className="mt-6 pb-16">
        <div className="mx-auto max-w-7xl px-5">
          <EventBrowser events={hub.events} lock={hub.lock} />
        </div>
      </section>

      <section className="pb-16"><div className="mx-auto max-w-7xl px-5"><CommunityBand /></div></section>

      <FaqSection faqs={hub.faqs} />

      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-4">
          <LinkBlock title="Startup events by city" links={links.cities.slice(0, 14).map(c => ({ href: `/events/city/${c.slug}`, name: `Events in ${c.name}`, n: c.n }))} />
          <LinkBlock title="Startup events by state" links={links.states.slice(0, 14).map(s => ({ href: `/events/state/${s.slug}`, name: `Events in ${s.name}`, n: s.n }))} />
          <LinkBlock title="By event type" links={[...links.types.map(t => ({ href: `/events/type/${t.slug}`, name: t.name, n: t.n })), { href: '/events/free', name: 'Free events' }, { href: '/events/paid', name: 'Paid events' }, { href: '/events/online', name: 'Online events' }]} />
          <LinkBlock title="By date" links={[{ href: '/events/this-week', name: 'This week' }, { href: '/events/this-weekend', name: 'This weekend' }, ...links.months.map(m => ({ href: `/events/month/${m.slug}`, name: m.name, n: m.n }))]} />
        </div>
      </section>
    </>
  )
}
