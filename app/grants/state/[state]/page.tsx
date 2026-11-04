import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GrantHubPage, grantHubMetadata } from '@/components/grants/hub-page'
import { stateHub, stateSlugs } from '@/lib/grants'

type Props = { params: Promise<{ state: string }> }

export const revalidate = 86400
export const dynamicParams = false
export const generateStaticParams = () => stateSlugs().map(state => ({ state }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = stateHub((await params).state)
  return hub ? grantHubMetadata(hub) : {}
}

export default async function GrantStatePage({ params }: Props) {
  const hub = stateHub((await params).state)
  if (!hub) notFound()
  return <GrantHubPage hub={hub} />
}
