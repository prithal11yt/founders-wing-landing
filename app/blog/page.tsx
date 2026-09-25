import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { getAllPosts, getCategoryLabel } from '@/lib/blog'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'

export const metadata: Metadata = {
  title: `Founders Wing Blog | Guides for People Building with AI`,
  description: 'Practical guides on building with AI, launching, getting your first customers, and earning your first money online in India.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: `Founders Wing Blog | Guides for People Building with AI`,
    description: 'Action-first guides for founders who want to build with AI, launch, and get paying customers.',
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: 'website',
  },
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function BlogPage() {
  const posts = getAllPosts()
  const featured = posts.filter(post => post.featured)
  const regular = posts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <SiteNav />
      <main>
        <section className="pt-36 md:pt-44 pb-12 md:pb-16">
          <div className="mx-auto max-w-5xl px-5">
            <p className="text-[15px] text-neutral-500">Founder guides</p>
            <h1 className="mt-3 max-w-3xl text-4xl md:text-6xl font-medium tracking-[-0.045em] leading-[1.02]">
              Build with AI. Launch it. <span className="text-neutral-400">Get paid for it.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-neutral-600 leading-relaxed">
              Practical essays for founders in India: building with AI, first income, getting customers, and a clearer path from idea to launch.
            </p>
          </div>
        </section>

        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-5xl px-5">
            {featured.length > 0 && (
              <div className="mb-10 grid gap-5 md:grid-cols-3">
                {featured.map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition-colors hover:border-neutral-400">
                    {post.heroImage && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                        <Image src={post.heroImage} alt={post.imageAlt || post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{getCategoryLabel(post.category)}</span>
                      <h2 className="mt-4 text-xl font-medium tracking-[-0.02em] leading-snug">{post.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-neutral-600">{post.description}</p>
                      <div className="mt-5 flex items-center justify-between text-xs text-neutral-500">
                        <span>{fmtDate(post.date)}</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime} min</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="border-t border-neutral-200">
              {regular.map(post => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex items-center justify-between gap-6 border-b border-neutral-200 py-6">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      <span className="font-medium text-neutral-700">{getCategoryLabel(post.category)}</span>
                      <span>{post.readTime} min read</span>
                    </div>
                    <h2 className="text-lg font-medium tracking-[-0.02em] group-hover:text-sky-700 transition-colors">{post.title}</h2>
                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-neutral-600">{post.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-neutral-900" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
