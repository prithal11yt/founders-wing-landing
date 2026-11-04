import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Banknote, CalendarDays, CalendarPlus, Globe, MapPin, MessageCircle, Tag, User } from 'lucide-react'
import { BookButton } from '@/components/events/book-button'
import { EventCard, EventPoster } from '@/components/events/event-card'
import { CommunityBand, Crumbs } from '@/components/events/hub-page'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import { SOURCE_LABELS, categoryBySlug } from '@/lib/events/config'
import { getEvent, getUpcomingEvents, type EventDetail } from '@/lib/events/data'
import { fmtDateLong, fmtWhenLong, isOver, istDay, placeLabel, priceLabel } from '@/lib/events/format'
import { eventJsonLd } from '@/lib/events/hubs'

export const revalidate = 3600
// Event pages are built on first visit, then cached until the weekly refresh.
export const generateStaticParams = () => []

type Props = { params: Promise<{ slug: string }> }
const LONG_PAST_MS = 30 * 864e5

function metaDescription(e: EventDetail) {
  const where = e.mode === 'online' ? 'online' : `in ${e.city ?? 'India'}`
  return `${e.title} on ${fmtDateLong(e.startAt)} ${where}. ${priceLabel(e) === 'See price' ? '' : `${priceLabel(e)}. `}${e.summary ?? ''}`.slice(0, 300)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const e = await getEvent(slug)
  if (!e || !['published', 'cancelled'].includes(e.status)) return { robots: { index: false, follow: true } }
  const url = `${SITE_URL}/events/${e.slug}`
  const date = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(e.startAt))
  const title = `${e.title} | ${date}, ${e.mode === 'online' ? 'Online' : e.city ?? 'India'}`
  const description = metaDescription(e)
  const longPast = Date.now() - new Date(e.endAt ?? e.startAt).getTime() > LONG_PAST_MS
  return {
    title, description, alternates: { canonical: url },
    robots: longPast ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', locale: 'en_IN', ...(e.image ? { images: [{ url: e.image }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(e.image ? { images: [e.image] } : {}) },
  }
}

function Fact({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-100"><Icon className="h-4 w-4 text-neutral-600" /></span>
      <div className="min-w-0">
        <p className="text-[12px] text-neutral-500">{label}</p>
        <div className="text-[15px] font-medium leading-snug text-neutral-950">{children}</div>
      </div>
    </div>
  )
}

function googleCalendarUrl(e: EventDetail) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
  const allDay = (iso: string, plus = 0) => new Date(new Date(`${istDay(iso)}T00:00:00Z`).getTime() + plus * 864e5).toISOString().slice(0, 10).replace(/-/g, '')
  const dates = e.hasTime
    ? `${stamp(e.startAt)}/${stamp(e.endAt ?? new Date(new Date(e.startAt).getTime() + 2 * 3600e3).toISOString())}`
    : `${allDay(e.startAt)}/${allDay(e.endAt ?? e.startAt, 1)}`
  const p = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates, details: `${e.summary ?? ''}\n\nBook: ${e.url}`, location: e.mode === 'online' ? 'Online' : [e.venue, e.address, e.city].filter(Boolean).join(', ') })
  return `https://calendar.google.com/calendar/render?${p}`
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  const e = await getEvent(slug)
  if (!e || !['published', 'cancelled'].includes(e.status)) notFound()

  const over = isOver(e)
  const cancelled = e.status === 'cancelled'
  const bookable = !over && !cancelled
  const type = categoryBySlug(e.category)
  const url = `${SITE_URL}/events/${e.slug}`
  const inPerson = e.mode !== 'online'
  const mapQuery = [e.venue, e.address, e.city, 'India'].filter(Boolean).join(', ')

  const all = await getUpcomingEvents()
  const others = all.filter(o => o.slug !== e.slug)
  const near = inPerson ? others.filter(o => o.citySlug === e.citySlug) : others.filter(o => o.mode === 'online')
  const sameType = near.filter(o => o.category === e.category)
  const related = [...sameType, ...near.filter(o => o.category !== e.category)].slice(0, 6)
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${e.title}, ${fmtDateLong(e.startAt)}: ${url}`)}`

  const crumbs = [
    { name: 'Events', href: '/events' },
    ...(inPerson && e.citySlug && e.city ? [{ name: e.city, href: `/events/city/${e.citySlug}` }] : !inPerson ? [{ name: 'Online', href: '/events/online' }] : []),
    { name: e.title, href: `/events/${e.slug}` },
  ]
  const breadcrumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', href: '' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE_URL}${c.href}` })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(e)).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, '\\u003c') }} />

      <article className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:pb-16 md:pt-40">
        <Crumbs items={crumbs} />

        {(over || cancelled) && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
            {cancelled ? 'This event has been cancelled.' : 'This event has ended.'} {related.length > 0 && <a href="#more" className="font-medium underline">See upcoming events</a>}
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="min-w-0">
            <div className="aspect-[16/9] overflow-hidden rounded-[24px] bg-neutral-100"><EventPoster e={e} className="h-full w-full" /></div>
            <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
              {type && <Link href={`/events/type/${type.slug}`} className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-800 hover:bg-sky-100">{type.label}</Link>}
              {e.priceType === 'free' && <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">Free</span>}
              {e.mode !== 'in_person' && <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-800">{e.mode === 'online' ? 'Online' : 'Online and in person'}</span>}
            </div>
            <h1 className="mt-3 text-3xl font-medium leading-[1.1] tracking-[-0.035em] md:text-[44px]">{e.title}</h1>

            {e.summary && (
              <section className="mt-8">
                <h2 className="text-[20px] font-medium tracking-[-0.02em]">About this event</h2>
                <p className="mt-2 text-[17px] leading-relaxed text-neutral-700">{e.summary}</p>
              </section>
            )}
            {e.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px] text-neutral-600">
                <Tag className="h-3.5 w-3.5 text-neutral-400" />
                {e.tags.map(t => <span key={t} className="rounded-full border border-neutral-200 px-2.5 py-0.5">{t}</span>)}
              </div>
            )}
            <p className="mt-8 text-[13px] leading-relaxed text-neutral-500">
              Founders Wing lists this event to help founders find it. We don’t run it or sell its tickets. Details come from {SOURCE_LABELS[e.source] ?? 'the organiser'}, so confirm the date, venue and price there before you travel.
            </p>
          </div>

          <aside className="lg:sticky lg:top-[124px] lg:self-start">
            <div className="rounded-[24px] border border-neutral-200 p-5 md:p-6">
              <div className="space-y-4">
                <Fact icon={CalendarDays} label="When">{fmtWhenLong(e)}{!e.hasTime && <span className="mt-0.5 block text-[13px] font-normal text-neutral-500">Timing is on the booking page</span>}</Fact>
                <Fact icon={inPerson ? MapPin : Globe} label="Where">
                  {placeLabel(e)}
                  {e.address && e.address !== e.venue && <span className="mt-0.5 block text-[13px] font-normal text-neutral-500">{e.address}</span>}
                  {inPerson && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener nofollow" className="mt-0.5 block text-[13px] font-normal text-sky-700 hover:underline">Open in Google Maps</a>}
                </Fact>
                <Fact icon={Banknote} label="Price">{priceLabel(e) === 'See price' ? 'See the booking page' : priceLabel(e)}</Fact>
                {e.organizer && <Fact icon={User} label="Organiser">{e.organizer}</Fact>}
              </div>
              {bookable && <BookButton slug={e.slug} source={e.source} url={e.url} className="mt-6 w-full" />}
              {bookable && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={googleCalendarUrl(e)} target="_blank" rel="noopener nofollow" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-neutral-200 text-[13px] font-medium hover:bg-neutral-50"><CalendarPlus className="h-4 w-4" />Add to calendar</a>
                  <a href={whatsapp} target="_blank" rel="noopener nofollow" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-neutral-200 text-[13px] font-medium hover:bg-neutral-50"><MessageCircle className="h-4 w-4" />Share</a>
                </div>
              )}
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section id="more" className="mt-16 scroll-mt-32">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">{inPerson && e.city ? `More founder events in ${e.city}` : 'More online events'}</h2>
              <Link href={inPerson && e.citySlug ? `/events/city/${e.citySlug}` : '/events/online'} className="text-[14px] font-medium text-sky-700 hover:underline">See all</Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map(o => <EventCard key={o.slug} e={o} />)}</div>
          </section>
        )}

        <div className="mt-16"><CommunityBand /></div>
      </article>

      {/* Phone: the booking button stays on screen. */}
      {bookable && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <BookButton slug={e.slug} source={e.source} url={e.url} className="w-full" />
        </div>
      )}
    </>
  )
}
