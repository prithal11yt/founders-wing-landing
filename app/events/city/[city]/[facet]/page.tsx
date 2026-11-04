import { notFound, permanentRedirect } from 'next/navigation'
import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { getUpcomingEvents } from '@/lib/events/data'
import { canonicalCitySlug, cityFacetHub } from '@/lib/events/hubs'

export const revalidate = 3600
export const generateStaticParams = () => []

type Props = { params: Promise<{ city: string; facet: string }> }

export async function generateMetadata({ params }: Props) {
  const { city, facet } = await params
  const hub = cityFacetHub(city, facet, await getUpcomingEvents())
  return hub ? hubMetadata(hub) : {}
}

export default async function Page({ params }: Props) {
  const { city, facet } = await params
  const alias = canonicalCitySlug(city)
  if (alias) permanentRedirect(`/events/city/${alias}/${facet}`)
  const hub = cityFacetHub(city, facet, await getUpcomingEvents())
  if (!hub) notFound()
  return <HubPage hub={hub} />
}
