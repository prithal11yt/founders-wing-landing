import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug, getRelatedPosts, formatDate, getCategoryLabel } from '@/lib/blog'
import { mdxComponents } from '@/components/mdx'
import { CTAStrip } from '@/components/cta-strip'

const BASE_URL = 'https://founderwing.com'

const CATEGORY_COLORS: Record<string, string> = {
  guide: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  community: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  tools: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  challenge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  story: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${BASE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getRelatedPosts(post.slug, post.category)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Person', name: 'Prithal Bhardwaj', url: 'https://thesoloentrepreneur.in' },
    publisher: {
      '@type': 'Organization',
      name: 'Founders Wing',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE_URL}/blog/${post.slug}` },
  }

  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 5%)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="border-b border-white/5 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon-dark.png" alt="Founders Wing" width={24} height={24} className="object-contain" />
            <span className="font-semibold tracking-tight text-foreground">Founders Wing</span>
          </Link>
          <Link href="/secure-spot" className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors">
            Get Membership →
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* Post header */}
        <header className="mb-10">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category]}`}>
            {getCategoryLabel(post.category)}
          </span>
          <h1 className="mt-4 mb-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">{post.description}</p>
          <div className="flex items-center gap-5 text-sm text-muted-foreground border-t border-white/5 pt-5">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
            <span>By Prithal Bhardwaj</span>
          </div>
        </header>

        {/* MDX content */}
        <article className="prose prose-invert max-w-none">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>

        {/* End CTA */}
        <div className="mt-16">
          <CTAStrip href="/secure-spot" />
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/5">
            <h2 className="text-xl font-bold text-foreground mb-6">Keep reading</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                  <div className="rounded-xl border border-white/10 p-5 hover:border-sky-500/20 transition-all">
                    <p className="text-sm font-semibold text-foreground leading-snug mb-2 group-hover:text-sky-300 transition-colors">
                      {r.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {r.readTime} min <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to blog */}
        <div className="mt-10">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    </div>
  )
}
