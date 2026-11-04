import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { getUpcomingEvents } from '@/lib/events/data'
import { whenHub } from '@/lib/events/hubs'

export const revalidate = 3600

export async function generateMetadata() {
  return hubMetadata((all => whenHub('weekend', all))(await getUpcomingEvents()))
}

export default async function Page() {
  return <HubPage hub={(all => whenHub('weekend', all))(await getUpcomingEvents())} />
}
