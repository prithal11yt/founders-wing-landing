import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Clock, Calendar } from 'lucide-react'
import { getAllPosts, getCategoryLabel } from '@/lib/blog'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Blog — Guides for Aspiring Founders in India',
  description: 'Practical guides, AI tool breakdowns, and honest stories for aspiring founders in India. Learn how to stop overthinking and start building.',
  alternates: { canonical: 'https://founderwing.com/blog' },
  openGraph: {
    title: 'Blog — Founders Wing',
    description: 'Practical guides, AI tool breakdowns, and honest stories for aspiring founders in India.',
    url: 'https://founderwing.com/blog',
    type: 'website',
  },
}

const CATEGORY_COLORS: Record<string, string> = {
  guide: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  community: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  tools: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  challenge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  story: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featured = posts.find((p) => p.featured)
  const rest = posts.filter((p) => !p.featured || p.slug !== featured?.slug)

  return (
    <div className="min-h-screen" style={{ background: 'hsl(222 47% 5%)' }}>
      {/* Nav */}
      <nav className="border-b border-white/5 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-icon-dark.png" alt="Founders Wing" width={24} height={24} className="object-contain" />
            <span className="font-semibold tracking-tight text-foreground">Founders Wing</span>
          </Link>
          <Link
            href="/secure-spot"
            className="text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            Get Membership →
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-sky-400 mb-3">The Blog</p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Guides for aspiring founders in India
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            No fluff. No motivational posters. Just practical guides, honest breakdowns, and real stories from founders who are building something.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[featured.category]}`}>
                  {getCategoryLabel(featured.category)}
                </span>
                <span className="text-xs text-muted-foreground">Featured</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-sky-300 transition-colors">
                {featured.title}
              </h2>
              <p className="text-muted-foreground mb-5 max-w-2xl">{featured.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(featured.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readTime} min read
                </span>
                <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                  Read article <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Post grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-6 hover:border-sky-500/20 hover:bg-sky-500/[0.03] transition-all">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category]}`}>
                  {getCategoryLabel(post.category)}
                </span>
                <h2 className="mt-4 mb-2 text-lg font-bold text-foreground leading-snug group-hover:text-sky-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime} min
                  </span>
                  <span>
                    {new Date(post.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No posts yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
