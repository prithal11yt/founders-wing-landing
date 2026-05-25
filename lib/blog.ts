import fs from "fs"
import path from "path"

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

function parseValue(value: string) {
  const trimmed = value.trim()
  if (trimmed === "true") return true
  if (trimmed === "false") return false
  if (/^\d+$/.test(trimmed)) return Number(trimmed)
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)
  }
  return trimmed.replace(/^["']|["']$/g, "")
}

function parseFrontmatter(source: string): BlogPost {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) {
    throw new Error("Blog post is missing frontmatter")
  }

  const meta = match[1].split("\n").reduce<Record<string, unknown>>((acc, line) => {
    const separator = line.indexOf(":")
    if (separator === -1) return acc
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1)
    acc[key] = parseValue(value)
    return acc
  }, {})

  return {
    title: String(meta.title),
    description: String(meta.description),
    date: String(meta.date),
    slug: String(meta.slug),
    category: meta.category as BlogPostMeta["category"],
    tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
    readTime: Number(meta.readTime),
    featured: Boolean(meta.featured),
    cta: meta.cta as BlogPostMeta["cta"],
    heroImage: meta.heroImage ? String(meta.heroImage) : undefined,
    imageAlt: meta.imageAlt ? String(meta.imageAlt) : undefined,
    imageCaption: meta.imageCaption ? String(meta.imageCaption) : undefined,
    content: match[2].trim(),
  }
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const post = parseFrontmatter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"))
      const { content: _content, ...meta } = post
      return meta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): BlogPost | null {
  const file = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  return parseFrontmatter(fs.readFileSync(file, "utf8"))
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
