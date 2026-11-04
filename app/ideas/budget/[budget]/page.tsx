import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IdeaHubPage, ideaHubMetadata } from '@/components/ideas/hub-page'
import { budgetHub, budgetSlugs } from '@/lib/ideas'

type Props = { params: Promise<{ budget: string }> }

export const dynamicParams = false
export const generateStaticParams = () => budgetSlugs().map(budget => ({ budget }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = budgetHub((await params).budget)
  return hub ? ideaHubMetadata(hub) : {}
}

export default async function IdeaBudgetPage({ params }: Props) {
  const hub = budgetHub((await params).budget)
  if (!hub) notFound()
  return <IdeaHubPage hub={hub} />
}
