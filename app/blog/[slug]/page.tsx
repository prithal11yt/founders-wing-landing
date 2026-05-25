import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Clock } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { mdxComponents } from "@/components/mdx"
import { Button } from "@/components/ui/button"
import { getAllPosts, getCategoryLabel, getPostBySlug, getRelatedPosts } from "@/lib/blog"
import { SITE_NAME, SITE_URL } from "@/lib/site"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.date,
      images: post.heroImage ? [{ url: `${SITE_URL}${post.heroImage}`, alt: post.imageAlt || post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getRelatedPosts(post)
  const published = new Date(post.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: "Prithal Bhardwaj" },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article>
        {/* Header */}
        <header className="relative overflow-hidden px-4 pb-10 pt-24 md:pb-16 md:pt-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.14),transparent_55%)]" />
          <div className="container relative z-10 mx-auto max-w-3xl">
            <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <span>/</span>
              <span className="truncate max-w-[200px] text-foreground/60">{post.title}</span>
            </nav>
            <span className="mb-5 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              {getCategoryLabel(post.category)}
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl leading-tight">{post.title}</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">{post.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t border-white/5 pt-5">
              <span>{published}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
              <span>By Prithal Bhardwaj</span>
            </div>

            {post.heroImage && (
              <figure className="mt-10 overflow-hidden rounded-3xl border border-white/10 p-1">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.35rem]">
                  <Image
                    src={post.heroImage}
                    alt={post.imageAlt || post.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                </div>
                {post.imageCaption && (
                  <figcaption className="px-3 py-2 text-xs leading-5 text-muted-foreground text-center">
                    {post.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="px-4 pb-16">
          <div className="container mx-auto max-w-3xl">
            <article className="prose prose-invert max-w-none">
              <MDXRemote source={post.content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
            </article>

            {/* End CTA */}
            <div className="mt-14 rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.06] p-6 md:p-8">
              <p className="text-sm font-medium uppercase tracking-widest text-cyan-300">Ready to build?</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Join Founders Wing and turn this into action.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Get weekly sessions, AI workflows, accountability, and the First ₹10K sprint with other aspiring founders.
              </p>
              <Button asChild className="mt-6 rounded-full bg-sky-500 hover:bg-sky-400 text-white">
                <Link href="/secure-spot">
                  Become a Founding Member
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="border-t border-white/5 px-4 py-14">
          <div className="container mx-auto max-w-5xl">
            <h2 className="mb-6 text-2xl font-bold tracking-tight">Keep Reading</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-sky-500/20 transition-all"
                >
                  <p className="mb-2 text-xs text-cyan-300">{getCategoryLabel(item.category)}</p>
                  <h3 className="font-semibold leading-snug group-hover:text-cyan-200 transition-colors">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground line-clamp-2">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
