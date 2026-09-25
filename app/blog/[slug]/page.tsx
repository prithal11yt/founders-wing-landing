import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock } from 'lucide-react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/components/mdx'
import { getAllPosts, getCategoryLabel, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { PrimaryCTA } from '@/components/site/ui'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }))
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
      type: 'article',
      publishedTime: post.date,
      images: post.heroImage ? [{ url: `${SITE_URL}${post.heroImage}`, alt: post.imageAlt || post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: post.heroImage ? [`${SITE_URL}${post.heroImage}`] : [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const related = getRelatedPosts(post)
  const published = new Date(post.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: 'Prithal Bhardwaj' },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <SiteNav />

      <main>
        <article>
          <header className="pt-36 md:pt-44 pb-10 md:pb-14">
            <div className="mx-auto max-w-3xl px-5">
              <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-500">
                <Link href="/" className="hover:text-neutral-900 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-neutral-900 transition-colors">Blog</Link>
                <span>/</span>
                <span className="truncate max-w-[200px] text-neutral-400">{post.title}</span>
              </nav>
              <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">{getCategoryLabel(post.category)}</span>
              <h1 className="mt-5 text-4xl md:text-5xl font-medium tracking-[-0.04em] leading-[1.05]">{post.title}</h1>
              <p className="mt-6 text-lg leading-8 text-neutral-600">{post.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-5 text-sm text-neutral-500">
                <span>{published}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.readTime} min read</span>
                <span>By Prithal Bhardwaj</span>
              </div>

              {post.heroImage && (
                <figure className="mt-10">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-neutral-100">
                    <Image src={post.heroImage} alt={post.imageAlt || post.title} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
                  </div>
                  {post.imageCaption && <figcaption className="px-3 py-2 text-center text-xs leading-5 text-neutral-500">{post.imageCaption}</figcaption>}
                </figure>
              )}
            </div>
          </header>

          <div className="pb-16">
            <div className="mx-auto max-w-3xl px-5">
              <div className="prose prose-neutral max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-a:text-sky-700">
                <MDXRemote source={post.content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
              </div>

              <div className="mt-14 rounded-[28px] bg-neutral-950 p-7 md:p-10 text-white">
                <p className="text-sm text-neutral-400">Ready to build?</p>
                <h2 className="mt-2 text-2xl md:text-4xl font-medium tracking-[-0.03em] leading-[1.05]">Join Founders Wing and turn this into a paying product.</h2>
                <p className="mt-3 text-neutral-400 max-w-xl">Weekly live sessions, workshops, feedback on what you build, and a network that helps you get customers.</p>
                <div className="mt-6"><PrimaryCTA /></div>
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-neutral-200 py-14">
            <div className="mx-auto max-w-5xl px-5">
              <h2 className="mb-6 text-2xl font-medium tracking-[-0.02em]">Keep reading</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {related.map(item => (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="group rounded-[22px] border border-neutral-200 p-5 transition-colors hover:border-neutral-400">
                    <p className="mb-2 text-xs font-medium text-neutral-500">{getCategoryLabel(item.category)}</p>
                    <h3 className="font-medium leading-snug group-hover:text-sky-700 transition-colors">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-neutral-600 line-clamp-2">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
