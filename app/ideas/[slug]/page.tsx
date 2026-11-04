import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check } from 'lucide-react'
import { CommunityBand, Crumbs, LinkBlock } from '@/components/events/hub-page'
import { IdeaCard } from '@/components/ideas/hub-page'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { IDEAS, PDF_PRICE, TYPES, ideaBySlug, ideaFilters, ideaJsonLd, pdfUrl, relatedIdeas, type Idea } from '@/lib/ideas'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () => IDEAS.map(i => ({ slug: i.slug }))

const MARKET_LABEL: Record<Idea['market'], string> = { india: 'Customers in India', 'india-and-global': 'Customers in India and abroad', 'global-from-india': 'Run from India, customers abroad' }

const pageTitle = (i: Idea) => `${i.name}: Business Idea ${i.market === 'global-from-india' ? 'to Run from India' : 'in India'}`
const pageDescription = (i: Idea) => `${i.oneLine} ${i.startupCost ? `Estimated cost: ${i.startupCost}. ` : ''}How it makes money, who it suits and how to test it.`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const idea = ideaBySlug(slug)
  if (!idea) return { robots: { index: false, follow: true } }
  const url = `${SITE_URL}/ideas/${idea.slug}`
  const title = pageTitle(idea)
  const description = pageDescription(idea)
  return {
    title, description, keywords: idea.keywords, alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'article', locale: 'en_IN' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[18px] bg-neutral-50 p-4">
      <p className="text-[12px] text-neutral-500">{label}</p>
      <p className="mt-1 text-[15px] font-medium leading-snug text-neutral-950">{children}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-medium tracking-[-0.03em]">{title}</h2>
      <div className="mt-3 text-[16px] leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

function Ticks({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map(item => (
        <li key={item} className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2.5} /><span>{item}</span></li>
      ))}
    </ul>
  )
}

export default async function IdeaPage({ params }: Props) {
  const { slug } = await params
  const idea = ideaBySlug(slug)
  if (!idea) notFound()
  const type = TYPES[idea.type]
  const jsonLd = ideaJsonLd(idea, pageTitle(idea), pageDescription(idea))

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <article className="pt-32 md:pt-40">
        <div className="mx-auto max-w-3xl px-5">
          <Crumbs items={[{ name: 'Business ideas', href: '/ideas' }, { name: type.label, href: `/ideas/type/${idea.type}` }, { name: idea.name, href: `/ideas/${idea.slug}` }]} />
          <h1 className="mt-4 text-4xl font-medium leading-[1.06] tracking-[-0.04em] md:text-[52px]">{idea.name}</h1>
          <p className="mt-4 text-[18px] leading-relaxed text-neutral-600">{idea.oneLine}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Fact label="Estimated cost">{idea.startupCost ?? 'Not estimated'}</Fact>
            <Fact label="Who you sell to">{MARKET_LABEL[idea.market]}</Fact>
            <Fact label="First version">{idea.buildableWithAi ? 'One person can build it with AI tools' : 'Likely needs more than AI tools alone'}</Fact>
          </div>

          <div className="mt-12 space-y-10">
            <Section title="What it is"><p>{idea.what}</p></Section>
            <Section title="The problem it solves"><p>{idea.problem}</p></Section>
            <Section title="Who it suits"><Ticks items={idea.bestFor} /></Section>
            <Section title="How it makes money"><Ticks items={idea.moneyModel} /></Section>
            <Section title="How to test it this month">
              <ol className="space-y-3">
                {idea.firstSteps.map((step, n) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-900 text-[12px] font-medium text-white">{n + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
            <Section title="What to watch out for"><p>{idea.watchOut}</p></Section>
          </div>

          <p className="mt-10 text-[13px] leading-relaxed text-neutral-500">Costs and prices are estimates from our plan, not results from a real business. Nothing here promises income.</p>

          <div className="mt-10 rounded-[24px] border border-neutral-200 p-6 md:p-8">
            <h2 className="text-xl font-medium tracking-[-0.02em]">Want the full plan for this idea?</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">This page is the short version. The 100 Business Ideas PDF has a business plan for this idea and the others on this site, for a one-time {PDF_PRICE}.</p>
            <a href={pdfUrl(idea.slug)} target="_blank" rel="noopener" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-5 text-[14px] font-medium text-white transition-colors hover:bg-neutral-700">
              See the PDF <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </article>

      <section className="mt-14 pb-16">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">More ideas like this</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedIdeas(idea).map(i => <IdeaCard key={i.slug} idea={i} />)}
          </div>
        </div>
      </section>

      <section className="pb-16"><div className="mx-auto max-w-7xl px-5"><CommunityBand title="Picking an idea is the easy part. Reaching people who pay is the work." /></div></section>

      <section className="border-t border-neutral-200 bg-neutral-50 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:grid-cols-2 lg:grid-cols-3">
          <LinkBlock title="Business ideas by type and budget" links={ideaFilters()} />
          <LinkBlock title="Funding your idea" links={[{ href: '/grants', name: 'Startup grants in India' }, { href: '/grants/for-software', name: 'Grants for software startups' }]} />
          <LinkBlock title="Meet other founders" links={[{ href: '/events', name: 'Founder events in India' }, { href: '/', name: 'Founders Wing community' }]} />
        </div>
      </section>
    </>
  )
}
