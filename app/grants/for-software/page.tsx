import { GrantHubPage, grantHubMetadata } from '@/components/grants/hub-page'
import { softwareHub } from '@/lib/grants'

export const revalidate = 86400
export const metadata = grantHubMetadata(softwareHub())

export default function SoftwareGrantsPage() {
  return <GrantHubPage hub={softwareHub()} />
}
