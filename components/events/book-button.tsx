'use client'

import { ArrowUpRight } from 'lucide-react'
import { ACCENT } from '@/components/site/brand'
import { SOURCE_LABELS } from '@/lib/events/config'
import { trackBook } from './event-card'

export function BookButton({ slug, source, url, className = '' }: { slug: string; source: string; url: string; className?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener nofollow" onClick={() => trackBook({ slug, source })} style={{ background: ACCENT }} className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-full px-6 text-[15px] font-medium text-white transition-all hover:brightness-110 ${className}`}>
      Book on {SOURCE_LABELS[source] ?? 'the organiser’s site'}<ArrowUpRight className="h-4 w-4" />
    </a>
  )
}
