import type { Metadata } from 'next'
import { Home } from '@/components/site/home'

export const metadata: Metadata = {
  title: { absolute: 'AI Founder Community in India | Founders Wing' },
  alternates: { canonical: 'https://www.founderswing.com' },
}

export default function Page() {
  return <Home />
}
