import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Users, Zap, Target, TrendingUp } from 'lucide-react'
import { seoPages, getPageBySlug } from '@/lib/seo-pages'
import { SITE_URL } from '@/lib/site'
import generatedContent from '@/lib/generated-content.json'
import { FAQSection } from '@/components/faq-section'
import { CTAStrip } from '@/components/cta-strip'
import { ScrollReveal } from '@/components/scroll-reveal'

export async function generateStaticParams() {
  return seoPages.map((page) => ({
    category: page.category,
    slug: page.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
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
    icon: Users,
    title: 'Accountability Buddy',
    description: 'Paired with a founder at your stage. Weekly check-ins. Real commitment.',
  },
  {
    icon: Zap,
    title: 'Weekly AI Tool Drops',
    description: 'One new AI tool every week with a real workflow — not just a demo.',
  },
  {
    icon: Target,
    title: '₹10K Sprint Challenge',
    description: '30-day cohort sprint with a live leaderboard to earn your first ₹10,000 online.',
  },
  {
    icon: TrendingUp,
    title: 'Live Sessions with Prithal',
    description: '26 sessions per year. Small group. Ask anything. Real guidance.',
  },
]

export default async function SeoPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  const page = getPageBySlug(category, slug)
  if (!page) notFound()

  const contentKey = `${category}/${slug}` as keyof typeof generatedContent
  const content = generatedContent[contentKey]

  // Related pages
  const relatedPages = page.relatedSlugs
    .map((s) => seoPages.find((p) => p.slug === s))
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
        mainEntity: content.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* Nav */}
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
          <div className="neu-flat rounded-full px-5 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Founders Wing" className="h-6 w-auto" />
              <span className="font-semibold text-sm">Founders Wing</span>
            </Link>
            <Link
              href="/secure-spot"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-sky-500 text-white hover:bg-sky-400 transition-colors"
            >
              Join Now
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-36 pb-16 px-4">
          <div className="container mx-auto max-w-3xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <span className="capitalize">{category}</span>
              <span>/</span>
              <span className="text-foreground truncate max-w-[200px]">{page.h1}</span>
            </nav>

            <ScrollReveal variant="fade-up" duration={700}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
                {page.h1}
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={100} duration={700}>
              {content?.intro ? (
                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                  {content.intro.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-lg">{page.description}</p>
              )}
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={200} duration={700}>
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/secure-spot"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition-colors shadow-[0_0_30px_rgba(14,165,233,0.3)]"
                >
                  Get Membership <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-sm text-muted-foreground">From ₹2,999 · No lurkers · Action-first</span>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <ScrollReveal variant="fade-up" duration={700}>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                What you get inside <span className="text-sky-400">Founders Wing</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => (
                <ScrollReveal key={i} variant="fade-up" delay={i * 80} duration={600}>
                  <div className="neu-flat rounded-2xl p-6 h-full">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 shrink-0">
                        <benefit.icon className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Pricing hint */}
            <ScrollReveal variant="fade-up" delay={400} duration={600}>
              <div className="mt-8 text-center p-6 neu-flat rounded-2xl">
                <p className="text-muted-foreground text-sm mb-1">Membership starts at</p>
                <p className="text-3xl font-bold text-foreground">₹2,999 <span className="text-sm font-normal text-muted-foreground">for 6 months</span></p>
                <p className="text-xs text-muted-foreground mt-1">That's just ₹500/month · No monthly option · Committed members only</p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ */}
        {content?.faqs && content.faqs.length > 0 && (
          <FAQSection faqs={content.faqs} />
        )}

        {/* CTA */}
        <section className="py-8 px-4">
          <CTAStrip
            text="Ready to stop overthinking and start building?"
            buttonText="Get Membership"
            href="/secure-spot"
          />
        </section>

        {/* Related pages */}
        {relatedPages.length > 0 && (
          <section className="py-16 px-4">
            <div className="container mx-auto max-w-4xl">
              <ScrollReveal variant="fade-up" duration={700}>
                <h2 className="text-xl font-semibold mb-8 text-center">Also explore</h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedPages.map((related, i) => (
                  related && (
                    <ScrollReveal key={i} variant="fade-up" delay={i * 60} duration={600}>
                      <Link
                        href={`/${related.category}/${related.slug}`}
                        className="neu-flat rounded-xl p-4 flex items-center justify-between gap-3 hover:border-sky-500/30 transition-colors group"
                      >
                        <span className="text-sm font-medium text-foreground group-hover:text-sky-400 transition-colors">
                          {related.h1}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-sky-400 transition-colors" />
                      </Link>
                    </ScrollReveal>
                  )
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-4">
          <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Founders Wing" className="h-5 w-auto" />
              <span className="text-sm font-semibold">Founders Wing</span>
            </Link>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
