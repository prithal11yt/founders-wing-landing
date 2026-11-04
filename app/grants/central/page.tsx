import { GrantHubPage, grantHubMetadata } from '@/components/grants/hub-page'
import { centralHub } from '@/lib/grants'

export const revalidate = 86400
export const metadata = grantHubMetadata(centralHub())

export default function CentralGrantsPage() {
  return <GrantHubPage hub={centralHub()} />
}
