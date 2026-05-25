import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import { getAllPosts, getCategoryLabel } from "@/lib/blog"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: `Founders Wing Blog | Guides for Aspiring Founders in India`,
  description: "Practical guides on AI-first building, founder accountability, online business ideas, and earning your first money online in India.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: `Founders Wing Blog | Guides for Aspiring Founders in India`,
    description: "Action-first guides for aspiring founders who want to stop overthinking and start building with AI.",
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: "website",
  },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featured = posts.filter((post) => post.featured)
  const regular = posts.filter((post) => !post.featured)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden px-4 pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.14),transparent_55%)]" />
        <div className="container relative z-10 mx-auto max-w-5xl">
          <Link href="/" className="mb-8 inline-flex text-sm text-muted-foreground hover:text-foreground">
            Founders Wing
          </Link>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-cyan-300">Founder guides</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Build with AI. Ship faster. Stop circling the idea.</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Practical essays for aspiring Indian founders who want relevant traffic, first income, accountability, and a clearer path from idea to launch.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-5xl">
          {featured.length > 0 && (
            <div className="mb-12 grid gap-5 md:grid-cols-3">
              {featured.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-3xl neu-flat transition-all hover:border-cyan-400/30">
                  {post.heroImage && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={post.heroImage} alt={post.imageAlt || post.title} fill className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <span className="mb-5 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                      {getCategoryLabel(post.category)}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight transition-colors group-hover:text-cyan-200">{post.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.description}</p>
                    <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {regular.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col gap-4 rounded-2xl neu-flat p-5 transition-all hover:border-cyan-400/30 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="text-cyan-300">{getCategoryLabel(post.category)}</span>
                    <span>{post.readTime} min read</span>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight group-hover:text-cyan-200">{post.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{post.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-cyan-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
