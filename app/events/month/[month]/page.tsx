import { notFound } from 'next/navigation'
import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { getUpcomingEvents } from '@/lib/events/data'
import { monthHub } from '@/lib/events/hubs'

export const revalidate = 3600
export const generateStaticParams = () => []

type Props = { params: Promise<{ month: string }> }

export async function generateMetadata({ params }: Props) {
  const { month } = await params
  const hub = monthHub(month, await getUpcomingEvents())
  return hub ? hubMetadata(hub) : {}
}

export default async function Page({ params }: Props) {
  const { month } = await params
  const hub = monthHub(month, await getUpcomingEvents())
  if (!hub) notFound()
  return <HubPage hub={hub} />
}
