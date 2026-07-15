import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  category: 'guide' | 'community' | 'tools' | 'challenge' | 'story'
  tags: string[]
  readTime: number
  featured: boolean
  cta: 'default' | '10k-sprint' | 'community' | 'ai-tools'
  content: string
}

export type BlogPostMeta = Omit<BlogPost, 'content'>

function parseFrontmatter(slug: string): BlogPost {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  return {
    slug,
    title: data.title ?? '',
    description: data.description ?? '',
    date: data.date ?? '',
    category: data.category ?? 'guide',
    tags: data.tags ?? [],
    readTime: data.readTime ?? 5,
    featured: data.featured ?? false,
    cta: data.cta ?? 'default',
    content,
  }
}

export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return []

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx'))
  const posts = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const { content: _content, ...meta } = parseFrontmatter(slug)
      return meta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  return parseFrontmatter(slug)
}

export function getRelatedPosts(currentSlug: string, category: string, limit = 3): BlogPostMeta[] {
  return getAllPosts()
    .filter((p) => p.slug !== currentSlug && p.category === category)
    .slice(0, limit)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const CATEGORY_LABELS: Record<string, string> = {
  guide: 'Guide',
  community: 'Community',
  tools: 'AI Tools',
  challenge: 'Challenge',
  story: 'Story',
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}
