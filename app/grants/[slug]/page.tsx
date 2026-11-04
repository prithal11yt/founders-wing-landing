import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check } from 'lucide-react'
import { CommunityBand, Crumbs } from '@/components/events/hub-page'
import { GrantCard, StatusBadge } from '@/components/grants/hub-page'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { GRANTS, KIND_LABELS, fmtDate, grantBySlug, grantJsonLd, placeLabel, relatedGrants, repayLabel, type Grant } from '@/lib/grants'

type Props = { params: Promise<{ slug: string }> }

// Status badges depend on today's date, so rebuild daily.
export const revalidate = 86400
export const dynamicParams = false
export const generateStaticParams = () => GRANTS.map(g => ({ slug: g.slug }))

const pageTitle = (g: Grant) => `${g.name}: Status, Amount and Eligibility`
const pageDescription = (g: Grant) => `${g.amount ? `${g.amount}. ` : ''}${g.summary}`.slice(0, 300)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = grantBySlug(slug)
  if (!g) return { robots: { index: false, follow: true } }
  const url = `${SITE_URL}/grants/${g.slug}`
  const title = pageTitle(g)
  const description = pageDescription(g)
  return {
    title, description, alternates: { canonical: url },
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

export default async function GrantPage({ params }: Props) {
  const { slug } = await params
  const g = grantBySlug(slug)
  if (!g) notFound()
  const jsonLd = grantJsonLd(g, pageTitle(g), pageDescription(g))
  const label = g.shortName ?? g.name
  const closed = g.status === 'closed'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <article className="pt-32 md:pt-40">
        <div className="mx-auto max-w-3xl px-5">
          <Crumbs items={[{ name: 'Grants', href: '/grants' }, { name: label, href: `/grants/${g.slug}` }]} />
          <div className="mt-5"><StatusBadge grant={g} /></div>
          <h1 className="mt-3 text-4xl font-medium leading-[1.06] tracking-[-0.04em] md:text-[48px]">{g.name}</h1>
          <p className="mt-2 text-[15px] text-neutral-500">{g.provider}</p>
          <p className="mt-4 text-[17px] leading-relaxed text-neutral-700">{g.summary}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Fact label="What you can get">{g.amount ?? 'See the official page'}</Fact>
            <Fact label="Do you repay it?">{repayLabel(g)}</Fact>
            <Fact label="Type">{KIND_LABELS[g.kind]}</Fact>
            <Fact label="Where">{placeLabel(g)}</Fact>
          </div>

          <a href={g.applyUrl ?? g.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-neutral-900 px-6 text-[15px] font-medium text-white transition-colors hover:bg-neutral-700">
            {g.applyUrl ? 'Apply on the official site' : 'Go to the official page'} <ArrowUpRight className="h-4 w-4" />
          </a>

          <div className="mt-12 space-y-10">
            <Section title="Current status"><p>{g.statusNote}{g.deadline ? ` Published deadline: ${fmtDate(g.deadline)}.` : ''}</p></Section>
            <Section title={closed ? 'Who it was for' : 'Who can apply'}>
              <ul className="space-y-2.5">
                {g.eligibility.map(item => (
                  <li key={item} className="flex items-start gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2.5} /><span>{item}</span></li>
                ))}
              </ul>
            </Section>
            <Section title={closed ? 'How it worked' : 'How to apply'}>
              <ol className="space-y-3">
                {g.howToApply.map((step, n) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-900 text-[12px] font-medium text-white">{n + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>
            <Section title="The catch"><p>{g.watchOut}</p></Section>
          </div>

          <p className="mt-10 text-[13px] leading-relaxed text-neutral-500">
            We read this on the <a href={g.officialUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-800">official page</a> on {fmtDate(g.checkedOn)}. Rules and dates change, so confirm there before you apply. Founders Wing is not connected to this scheme, does not help with applications and never charges for access to it.
          </p>
        </div>
      </article>

      <section className="mt-14 pb-16">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">Similar schemes</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedGrants(g).map(o => <GrantCard key={o.slug} grant={o} />)}
          </div>
        </div>
      </section>

      <section className="pb-16"><div className="mx-auto max-w-7xl px-5"><CommunityBand title="A grant can help. Paying customers keep you going." /></div></section>
    </>
  )
}
