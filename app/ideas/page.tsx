import { IdeaHubPage, ideaHubMetadata } from '@/components/ideas/hub-page'
import { allIdeasHub } from '@/lib/ideas'

export const metadata = ideaHubMetadata(allIdeasHub())

export default function IdeasPage() {
  return <IdeaHubPage hub={allIdeasHub()} />
}
