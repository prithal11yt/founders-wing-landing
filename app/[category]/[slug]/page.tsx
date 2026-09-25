import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MessageSquare, Radio, Users, Wrench } from 'lucide-react'
import { seoPages, getPageBySlug } from '@/lib/seo-pages'
import { SITE_URL } from '@/lib/site'
import generatedContent from '@/lib/generated-content.json'
import { FAQSection } from '@/components/faq-section'
import { CTAStrip } from '@/components/cta-strip'
import { ScrollReveal } from '@/components/scroll-reveal'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { PrimaryCTA } from '@/components/site/ui'
import { ACCENT } from '@/components/site/brand'

export async function generateStaticParams() {
  return seoPages.map(page => ({
    category: page.category,
    slug: page.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; slug: string }> }): Promise<Metadata> {
  const { category, slug } = await params
  const page = getPageBySlug(category, slug)
  if (!page) return {}

  const url = `${SITE_URL}/${category}/${slug}`
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
    },
  }
}

const benefits = [
  {
    icon: Radio,
    title: 'Weekly live sessions with Prithal',
    description: '26 sessions every 6 months, plus a library of recordings. Bring what you’re building, leave with next steps.',
  },
  {
    icon: MessageSquare,
    title: 'Real-time feedback',
    description: 'Post your landing page, pitch or pricing and get honest feedback from founders the same day.',
  },
  {
    icon: Users,
    title: 'A network that gets you clients',
    description: 'Members bring their own networks. Ask for an intro and someone usually knows the exact person you need.',
  },
  {
    icon: Wrench,
    title: 'Workshops and a new AI tool every week',
    description: 'AI automations, SaaS building, local AI models. Hands-on, with the tools the pros actually use.',
  },
]

export default async function SeoPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params
  const page = getPageBySlug(category, slug)
  if (!page) notFound()

  const contentKey = `${category}/${slug}` as keyof typeof generatedContent
  const content = generatedContent[contentKey]

  const relatedPages = page.relatedSlugs
    .map(s => seoPages.find(p => p.slug === s))
    .filter(Boolean)
    .slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: `${SITE_URL}/${category}/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: category.charAt(0).toUpperCase() + category.slice(1), item: `${SITE_URL}/${category}` },
        { '@type': 'ListItem', position: 3, name: page.h1, item: `${SITE_URL}/${category}/${slug}` },
      ],
    },
    ...(content?.faqs && {
      mainEntity: {
        '@type': 'FAQPage',
        mainEntity: content.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    }),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-white text-neutral-950">
        <SiteNav />

        <main>
          {/* Hero */}
          <section className="pt-36 md:pt-44 pb-14 md:pb-20">
            <div className="mx-auto max-w-3xl px-5">
              <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
                <Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
                <span>/</span>
                <span className="capitalize">{category}</span>
                <span>/</span>
                <span className="truncate max-w-[200px] text-neutral-400">{page.h1}</span>
              </nav>

              <ScrollReveal variant="fade-up" duration={700}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-[-0.045em] leading-[1.05] mb-6">{page.h1}</h1>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={100} duration={700}>
                {content?.intro ? (
                  <div className="space-y-4 text-lg leading-relaxed text-neutral-600">
                    {content.intro.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg text-neutral-600">{page.description}</p>
                )}
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={200} duration={700}>
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <PrimaryCTA />
                  <span className="text-sm text-neutral-500">From ₹833/month · Build it, launch it, get customers</span>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* What you get */}
          <section className="py-16 md:py-20 bg-neutral-50">
            <div className="mx-auto max-w-5xl px-5">
              <ScrollReveal variant="fade-up" duration={700}>
                <h2 className="text-3xl md:text-5xl font-medium tracking-[-0.045em] text-center mb-12">What you get inside Founders Wing</h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, i) => (
                  <ScrollReveal key={benefit.title} variant="fade-up" delay={i * 80} duration={600}>
                    <div className="rounded-[22px] bg-white border border-neutral-200 p-6 h-full">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                          <benefit.icon className="w-4.5 h-4.5" style={{ color: ACCENT }} />
                        </div>
                        <div>
                          <h3 className="font-medium text-[17px] tracking-[-0.01em] mb-1">{benefit.title}</h3>
                          <p className="text-sm text-neutral-600 leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal variant="fade-up" delay={400} duration={600}>
                <div className="mt-6 rounded-[22px] bg-neutral-950 text-white p-7 text-center">
                  <p className="text-sm text-neutral-400 mb-1">Membership starts at</p>
                  <p className="text-4xl font-medium tracking-[-0.03em]">₹5,999 <span className="text-base font-normal text-neutral-400">for 6 months</span></p>
                  <p className="text-sm text-neutral-400 mt-2">That’s ₹1,000/month · 12 months for ₹9,999 · No monthly plan, committed members only</p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {content?.faqs && content.faqs.length > 0 && <FAQSection faqs={content.faqs} />}

          <section className="py-12 md:py-16">
            <CTAStrip text="Ready to build it, launch it and get customers?" buttonText="Get Membership" />
          </section>

          {relatedPages.length > 0 && (
            <section className="pb-16 md:pb-24">
              <div className="mx-auto max-w-5xl px-5">
                <ScrollReveal variant="fade-up" duration={700}>
                  <h2 className="text-xl font-medium mb-6 text-center">Also explore</h2>
                </ScrollReveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedPages.map(
                    (related, i) =>
                      related && (
                        <ScrollReveal key={related.slug} variant="fade-up" delay={i * 60} duration={600}>
                          <Link href={`/${related.category}/${related.slug}`} className="group rounded-[18px] border border-neutral-200 p-4 flex items-center justify-between gap-3 hover:border-neutral-400 transition-colors">
                            <span className="text-sm font-medium group-hover:text-sky-700 transition-colors">{related.h1}</span>
                            <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-900 transition-colors" />
                          </Link>
                        </ScrollReveal>
                      ),
                  )}
                </div>
              </div>
            </section>
          )}
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
