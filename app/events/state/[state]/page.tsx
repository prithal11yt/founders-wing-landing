import { notFound } from 'next/navigation'
import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { STATES, slugify } from '@/lib/events/config'
import { getUpcomingEvents } from '@/lib/events/data'
import { stateHub } from '@/lib/events/hubs'

export const revalidate = 3600
export const generateStaticParams = () => STATES.map(s => ({ state: slugify(s) }))

type Props = { params: Promise<{ state: string }> }

export async function generateMetadata({ params }: Props) {
  const { state } = await params
  const hub = stateHub(state, await getUpcomingEvents())
  return hub ? hubMetadata(hub) : {}
}

export default async function Page({ params }: Props) {
  const { state } = await params
  const hub = stateHub(state, await getUpcomingEvents())
  if (!hub) notFound()
  return <HubPage hub={hub} />
}
