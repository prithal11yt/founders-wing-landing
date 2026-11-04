import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { getUpcomingEvents } from '@/lib/events/data'
import { onlineHub } from '@/lib/events/hubs'

export const revalidate = 3600

export async function generateMetadata() {
  return hubMetadata(onlineHub(await getUpcomingEvents()))
}

export default async function Page() {
  return <HubPage hub={onlineHub(await getUpcomingEvents())} />
}
