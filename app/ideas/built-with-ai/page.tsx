import { IdeaHubPage, ideaHubMetadata } from '@/components/ideas/hub-page'
import { builtWithAiHub } from '@/lib/ideas'

export const metadata = ideaHubMetadata(builtWithAiHub())

export default function BuiltWithAiPage() {
  return <IdeaHubPage hub={builtWithAiHub()} />
}
