import { notFound, permanentRedirect } from 'next/navigation'
import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { CITIES } from '@/lib/events/config'
import { getUpcomingEvents } from '@/lib/events/data'
import { canonicalCitySlug, cityHub } from '@/lib/events/hubs'

export const revalidate = 3600
export const generateStaticParams = () => CITIES.filter(c => c.crawl).map(c => ({ city: c.slug }))

type Props = { params: Promise<{ city: string }> }

export async function generateMetadata({ params }: Props) {
  const { city } = await params
  const hub = cityHub(city, await getUpcomingEvents())
  return hub ? hubMetadata(hub) : {}
}

export default async function Page({ params }: Props) {
  const { city } = await params
  const alias = canonicalCitySlug(city)
  if (alias) permanentRedirect(`/events/city/${alias}`)
  const hub = cityHub(city, await getUpcomingEvents())
  if (!hub) notFound()
  return <HubPage hub={hub} />
}
