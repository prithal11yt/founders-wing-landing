'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
import { ACCENT, WingMark } from '@/components/site/brand'
import { SOURCE_LABELS, categoryBySlug } from '@/lib/events/config'
import { fmtDayNum, fmtDayShort, fmtMonthShort, fmtWhenShort, placeLabel, priceLabel, type ListedEvent } from '@/lib/events/format'

/** Records which booking links people use, so we can see which events drive clicks. */
export function trackBook(e: Pick<ListedEvent, 'slug' | 'source'>) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  w.gtag?.('event', 'event_book_click', { event_slug: e.slug, event_source: e.source })
}

/** The listing's poster, or a clean branded panel when it has none or the image fails. */
export function EventPoster({ e, className = '' }: { e: Pick<ListedEvent, 'image' | 'title' | 'category'>; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (e.image && !failed) {
    // Posters are hosted by the source sites, at sizes we can't predict.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={e.image} alt={e.title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`object-cover ${className}`} />
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-sky-900 text-white/90 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <WingMark className="w-8 text-sky-300/80" />
        <span className="text-[11px] tracking-[0.14em] uppercase text-white/60">{categoryBySlug(e.category)?.label ?? 'Founder event'}</span>
      </div>
    </div>
  )
}

export function EventCard({ e }: { e: ListedEvent }) {
  const type = categoryBySlug(e.category)
  const free = e.priceType === 'free'
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[18px] border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
        <EventPoster e={e} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 flex w-12 flex-col items-center rounded-xl bg-white/95 py-1.5 leading-none shadow-sm">
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">{fmtMonthShort(e.startAt)}</span>
          <span className="mt-0.5 text-[19px] font-semibold tracking-tight text-neutral-950">{fmtDayNum(e.startAt)}</span>
          <span className="mt-0.5 text-[10px] text-neutral-500">{fmtDayShort(e.startAt)}</span>
        </div>
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-medium shadow-sm ${free ? 'bg-emerald-600 text-white' : 'bg-white/95 text-neutral-800'}`}>{priceLabel(e)}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {type && <span className="text-[12px] font-medium" style={{ color: ACCENT }}>{type.label}</span>}
        <h3 className="mt-1 line-clamp-2 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-neutral-950">
          {/* The stretched link makes the whole card open the event page. */}
          <Link href={`/events/${e.slug}`} className="after:absolute after:inset-0">{e.title}</Link>
        </h3>
        <p className="mt-2 flex items-start gap-1.5 text-[13px] text-neutral-600"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />{fmtWhenShort(e)}</p>
        <p className="mt-1 flex items-start gap-1.5 text-[13px] text-neutral-600"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" /><span className="line-clamp-1">{placeLabel(e)}</span></p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="truncate text-[12px] text-neutral-500">on {SOURCE_LABELS[e.source] ?? e.source}</span>
          <a href={e.url} target="_blank" rel="noopener nofollow" onClick={() => trackBook(e)} className="relative z-10 inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-4 text-[13px] font-medium text-white transition-all hover:brightness-110" style={{ background: ACCENT }} aria-label={`Book ${e.title} on ${SOURCE_LABELS[e.source] ?? e.source}`}>
            Book <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  )
}
