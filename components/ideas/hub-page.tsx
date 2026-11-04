import type { Metadata } from 'next'
import Link from 'next/link'
import { CommunityBand, Crumbs, FaqSection, LinkBlock, Pill } from '@/components/events/hub-page'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { TYPES, ideaFilters, ideaHubJsonLd, type Idea, type IdeaHub } from '@/lib/ideas'

export function ideaHubMetadata(hub: IdeaHub): Metadata {
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

export function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <Link href={`/ideas/${idea.slug}`} className="group flex h-full flex-col rounded-[22px] border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400">
      <p className="text-[12px] font-medium text-neutral-500">{TYPES[idea.type].label}</p>
      <h2 className="mt-1.5 text-[18px] font-medium leading-snug tracking-[-0.02em] text-neutral-950">{idea.name}</h2>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-neutral-600">{idea.oneLine}</p>
      <p className="mt-4 text-[13px] text-neutral-500">{idea.startupCost ? `Estimated cost: ${idea.startupCost}` : 'Cost not estimated'}</p>
    </Link>
  )
}

export function IdeaHubPage({ hub }: { hub: IdeaHub }) {
  const filters = ideaFilters()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ideaHubJsonLd(hub)).replace(/</g, '\\u003c') }} />

      <section className="pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl px-5">
          {hub.crumbs.length > 1 && <Crumbs items={hub.crumbs} />}
          <h1 className="mt-4 max-w-4xl text-4xl font-medium leading-[1.04] tracking-[-0.04em] md:text-[56px]">{hub.h1}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-neutral-600">{hub.intro}</p>
        </div>
      </section>

      <section className="mt-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hub.path !== '/ideas' && <Pill href="/ideas" name="All ideas" />}
            {filters.filter(f => f.href !== hub.path).map(f => <Pill key={f.href} {...f} />)}
          </div>
        </div>
      </section>

      <section className="mt-6 pb-16">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {hub.ideas.map(i => <IdeaCard key={i.slug} idea={i} />)}
        </div>
      </section>

      <section className="pb-16"><div className="mx-auto max-w-7xl px-5"><CommunityBand title="Picking an idea is the easy part. Reaching people who pay is the work." /></div></section>

      <FaqSection faqs={hub.faqs} />

      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-3">
          <LinkBlock title="Business ideas by type and budget" links={filters} />
          <LinkBlock title="Funding your idea" links={[{ href: '/grants', name: 'Startup grants in India' }, { href: '/grants/for-software', name: 'Grants for software startups' }]} />
          <LinkBlock title="Meet other founders" links={[{ href: '/events', name: 'Founder events in India' }, { href: '/', name: 'Founders Wing community' }]} />
        </div>
      </section>
    </>
  )
}
