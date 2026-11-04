import { notFound } from 'next/navigation'
import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { CATEGORIES, isCategory } from '@/lib/events/config'
import { getUpcomingEvents } from '@/lib/events/data'
import { typeHub } from '@/lib/events/hubs'

export const revalidate = 3600
export const generateStaticParams = () => CATEGORIES.map(c => ({ type: c.slug }))

type Props = { params: Promise<{ type: string }> }

export async function generateMetadata({ params }: Props) {
  const { type } = await params
  const hub = isCategory(type) ? typeHub(type, await getUpcomingEvents()) : null
  return hub ? hubMetadata(hub) : {}
}

export default async function Page({ params }: Props) {
  const { type } = await params
  const hub = isCategory(type) ? typeHub(type, await getUpcomingEvents()) : null
  if (!hub) notFound()
  return <HubPage hub={hub} />
}
