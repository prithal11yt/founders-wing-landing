import { MetadataRoute } from 'next'
import { seoPages } from '@/lib/seo-pages'
import { getAllPosts } from '@/lib/blog'
import { getSitemapEvents, getUpcomingEvents } from '@/lib/events/data'
import { indexableHubPaths } from '@/lib/events/hubs'
import { IDEAS, PUBLISHED_ON, indexableIdeaHubPaths } from '@/lib/ideas'
import { GRANTS, indexableGrantHubPaths } from '@/lib/grants'

const BASE_URL = 'https://www.founderswing.com'

// Events change weekly, so this can't be frozen at build time.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/founder`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/build`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/secure-spot`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const dynamicRoutes: MetadataRoute.Sitemap = seoPages.map((page) => ({
    url: `${BASE_URL}/${page.category}/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const [upcoming, eventRows] = await Promise.all([getUpcomingEvents(), getSitemapEvents()])
  const eventHubRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...indexableHubPaths(upcoming).map(path => ({ url: `${BASE_URL}${path}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 })),
  ]
  const eventRoutes: MetadataRoute.Sitemap = eventRows.map(e => ({ url: `${BASE_URL}/events/${e.slug}`, lastModified: new Date(e.updated_at), changeFrequency: 'weekly', priority: 0.6 }))

  const ideaRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/ideas`, lastModified: new Date(PUBLISHED_ON), changeFrequency: 'monthly', priority: 0.9 },
    ...indexableIdeaHubPaths().map(path => ({ url: `${BASE_URL}${path}`, lastModified: new Date(PUBLISHED_ON), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...IDEAS.map(i => ({ url: `${BASE_URL}/ideas/${i.slug}`, lastModified: new Date(PUBLISHED_ON), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]
  const grantRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/grants`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    ...indexableGrantHubPaths().map(path => ({ url: `${BASE_URL}${path}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...GRANTS.map(g => ({ url: `${BASE_URL}/grants/${g.slug}`, lastModified: new Date(g.checkedOn), changeFrequency: 'monthly' as const, priority: 0.6 })),
  ]

  return [...staticRoutes, ...blogRoutes, ...dynamicRoutes, ...eventHubRoutes, ...eventRoutes, ...ideaRoutes, ...grantRoutes]
}
