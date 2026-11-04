import type { Metadata } from 'next'
import Link from 'next/link'
import { CommunityBand, Crumbs, FaqSection, LinkBlock, Pill } from '@/components/events/hub-page'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { CLOSED_GRANTS, KIND_LABELS, fmtDate, grantFilters, grantHubJsonLd, grantStateLinks, lastChecked, placeLabel, statusBadge, type Grant, type GrantHub } from '@/lib/grants'

export function grantHubMetadata(hub: GrantHub): Metadata {
  const url = `${SITE_URL}${hub.path}`
  return {
    title: hub.title,
    description: hub.description,
    alternates: { canonical: url },
    robots: hub.indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: hub.title, description: hub.description, url, siteName: SITE_NAME, type: 'website', locale: 'en_IN' },
    twitter: { card: 'summary_large_image', title: hub.title, description: hub.description },
  }
}

export function StatusBadge({ grant }: { grant: Grant }) {
  const { label, open } = statusBadge(grant)
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium ${open ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}>{label}</span>
}

export function GrantCard({ grant }: { grant: Grant }) {
  return (
    <Link href={`/grants/${grant.slug}`} className="flex h-full flex-col rounded-[22px] border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-neutral-500">{KIND_LABELS[grant.kind]} · {placeLabel(grant)}</p>
        <StatusBadge grant={grant} />
      </div>
      <h2 className="mt-2 text-[18px] font-medium leading-snug tracking-[-0.02em] text-neutral-950">{grant.shortName && !grant.name.includes(grant.shortName) ? `${grant.shortName}: ${grant.name}` : grant.name}</h2>
      <p className="mt-1 text-[13px] text-neutral-500">{grant.provider}</p>
      <p className="mt-3 flex-1 text-[14px] font-medium leading-relaxed text-neutral-800">{grant.amount ?? 'Amount varies, see the official page'}</p>
    </Link>
  )
}

export function GrantHubPage({ hub }: { hub: GrantHub }) {
  const filters = grantFilters()
  const states = grantStateLinks()
  const checked = lastChecked()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(grantHubJsonLd(hub)).replace(/</g, '\\u003c') }} />

      <section className="pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl px-5">
          {hub.crumbs.length > 1 && <Crumbs items={hub.crumbs} />}
          <h1 className="mt-4 max-w-4xl text-4xl font-medium leading-[1.04] tracking-[-0.04em] md:text-[56px]">{hub.h1}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-neutral-600">{hub.intro}</p>
          {checked && <p className="mt-3 text-[13px] text-neutral-500">Checked on official pages, last on {fmtDate(checked)}. Founders Wing does not run these schemes or help with applications.</p>}
        </div>
      </section>

      <section className="mt-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hub.path !== '/grants' && <Pill href="/grants" name="All" />}
            {filters.filter(f => f.href !== hub.path).map(f => <Pill key={f.href} {...f} />)}
          </div>
        </div>
      </section>

      <section className="mt-6 pb-16">
        <div className="mx-auto max-w-7xl px-5">
          {hub.grants.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hub.grants.map(g => <GrantCard key={g.slug} grant={g} />)}
            </div>
          ) : (
            <p className="rounded-[22px] bg-neutral-50 p-6 text-[15px] text-neutral-600">Nothing we could confirm as open right now. <Link href="/grants" className="font-medium text-neutral-950 underline">See every scheme</Link>.</p>
          )}
        </div>
      </section>

      {hub.path === '/grants' && CLOSED_GRANTS.length > 0 && (
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-5">
            <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">Closed to new applicants</h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-neutral-600">Many websites still list these as open. We keep them here so you do not spend time on them.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CLOSED_GRANTS.map(g => <GrantCard key={g.slug} grant={g} />)}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16"><div className="mx-auto max-w-7xl px-5"><CommunityBand title="A grant can help. Paying customers keep you going." /></div></section>

      <FaqSection faqs={hub.faqs} />

      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-3">
          <LinkBlock title="Startup grants by state" links={states} />
          <LinkBlock title="Grants by type" links={filters} />
          <LinkBlock title="Before you apply" links={[{ href: '/ideas', name: 'Business ideas for Indian founders' }, { href: '/events', name: 'Founder events in India' }, { href: '/', name: 'Founders Wing community' }]} />
        </div>
      </section>
    </>
  )
}
