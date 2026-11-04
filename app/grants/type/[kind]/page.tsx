import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GrantHubPage, grantHubMetadata } from '@/components/grants/hub-page'
import { kindHub, kindSlugs } from '@/lib/grants'

type Props = { params: Promise<{ kind: string }> }

export const revalidate = 86400
export const dynamicParams = false
export const generateStaticParams = () => kindSlugs().map(kind => ({ kind }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = kindHub((await params).kind)
  return hub ? grantHubMetadata(hub) : {}
}

export default async function GrantKindPage({ params }: Props) {
  const hub = kindHub((await params).kind)
  if (!hub) notFound()
  return <GrantHubPage hub={hub} />
}
