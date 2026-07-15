import fs from "fs"
import path from "path"
import matter from "gray-matter"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export type BlogPostMeta = {
  title: string
  description: string
  date: string
  slug: string
  category: "guide" | "community" | "tools" | "challenge" | "story"
  tags: string[]
  readTime: number
  featured: boolean
  cta: "membership" | "10k-sprint" | "accountability" | "ai-tools"
  heroImage?: string
  imageAlt?: string
  imageCaption?: string
}

export type BlogPost = BlogPostMeta & {
  content: string
}

function parsePost(file: string): BlogPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8")
  const { data, content } = matter(raw)
  const filename = file.replace(/\.mdx$/, "")

  return {
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    slug: data.slug ?? filename,      // fall back to filename if slug not in frontmatter
    category: data.category ?? "guide",
    tags: Array.isArray(data.tags) ? data.tags : [],
    readTime: data.readTime ?? 5,
    featured: data.featured ?? false,
    cta: data.cta ?? "membership",
    heroImage: data.heroImage ?? undefined,
    imageAlt: data.imageAlt ?? undefined,
    imageCaption: data.imageCaption ?? undefined,
    content: content.trim(),
  }
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const { content: _content, ...meta } = parsePost(file)
      return meta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null
  // Try slug.mdx first, then scan all files for matching slug in frontmatter
  const direct = path.join(BLOG_DIR, `${slug}.mdx`)
  if (fs.existsSync(direct)) {
    return parsePost(`${slug}.mdx`)
  }
  // fallback: scan for slug match
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"))
  for (const file of files) {
    const post = parsePost(file)
    if (post.slug === slug) return post
  }
  return null
}

export function getRelatedPosts(post: BlogPostMeta, limit = 3): BlogPostMeta[] {
  return getAllPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .sort((a, b) => {
      const categoryScore = Number(b.category === post.category) - Number(a.category === post.category)
      if (categoryScore !== 0) return categoryScore
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, limit)
}

export function getCategoryLabel(category: BlogPostMeta["category"]) {
  const labels: Record<BlogPostMeta["category"], string> = {
    guide: "Guide",
    community: "Community",
    tools: "AI Tools",
    challenge: "Challenge",
    story: "Story",
  }
  return labels[category]
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
