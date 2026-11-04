import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IdeaHubPage, ideaHubMetadata } from '@/components/ideas/hub-page'
import { typeHub, typeSlugs } from '@/lib/ideas'

type Props = { params: Promise<{ type: string }> }

export const dynamicParams = false
export const generateStaticParams = () => typeSlugs().map(type => ({ type }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = typeHub((await params).type)
  return hub ? ideaHubMetadata(hub) : {}
}

export default async function IdeaTypePage({ params }: Props) {
  const hub = typeHub((await params).type)
  if (!hub) notFound()
  return <IdeaHubPage hub={hub} />
}
