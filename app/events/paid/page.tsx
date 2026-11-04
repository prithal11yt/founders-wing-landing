import { HubPage, hubMetadata } from '@/components/events/hub-page'
import { getUpcomingEvents } from '@/lib/events/data'
import { priceHub } from '@/lib/events/hubs'

export const revalidate = 3600

export async function generateMetadata() {
  return hubMetadata((all => priceHub('paid', all))(await getUpcomingEvents()))
}

export default async function Page() {
  return <HubPage hub={(all => priceHub('paid', all))(await getUpcomingEvents())} />
}
