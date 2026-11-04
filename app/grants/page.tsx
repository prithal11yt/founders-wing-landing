import { GrantHubPage, grantHubMetadata } from '@/components/grants/hub-page'
import { allGrantsHub } from '@/lib/grants'

export const revalidate = 86400
export const metadata = grantHubMetadata(allGrantsHub())

export default function GrantsPage() {
  return <GrantHubPage hub={allGrantsHub()} />
}
