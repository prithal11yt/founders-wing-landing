import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { getUpcomingEvents } from '@/lib/events/data'
import { allHub } from '@/lib/events/hubs'

export const revalidate = 3600

export async function generateMetadata() {
  return hubMetadata(allHub(await getUpcomingEvents()))
}

export default async function EventsPage() {
  return <HubPage hub={allHub(await getUpcomingEvents())} />
}
