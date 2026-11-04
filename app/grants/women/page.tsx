import { GrantHubPage, grantHubMetadata } from '@/components/grants/hub-page'
import { womenHub } from '@/lib/grants'

export const revalidate = 86400
export const metadata = grantHubMetadata(womenHub())

export default function WomenGrantsPage() {
  return <GrantHubPage hub={womenHub()} />
}
