'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { ACCENT } from '@/components/site/brand'
import { CATEGORIES, categoryBySlug } from '@/lib/events/config'
import { WHEN_OPTIONS, isOver, matchesWhen, type ListedEvent, type When } from '@/lib/events/format'
import type { Lock } from '@/lib/events/hubs'
import { EventCard } from './event-card'

/* Filters run instantly in the browser. The first page of cards is in the server-rendered
   HTML, so search engines see real events, and each filter goes in the URL so a filtered
   view can be shared. Filtered URLs canonicalise to the page itself. */

type Filters = { q: string; when: When | ''; price: '' | 'free' | 'paid'; mode: '' | 'in_person' | 'online'; type: string; state: string; city: string; sort: 'soon' | 'free' }
const EMPTY: Filters = { q: '', when: '', price: '', mode: '', type: '', state: '', city: '', sort: 'soon' }
const PAGE = 24

function readUrl(): Filters {
  const p = new URLSearchParams(window.location.search)
  const pick = <T extends string>(k: string, ok: readonly T[]): T | '' => { const v = p.get(k) as T; return ok.includes(v) ? v : '' }
  return {
    q: (p.get('q') ?? '').slice(0, 80),
    when: pick('when', WHEN_OPTIONS.map(w => w.value)),
    price: pick('price', ['free', 'paid'] as const),
    mode: pick('mode', ['in_person', 'online'] as const),
    type: pick('type', CATEGORIES.map(c => c.slug)),
    state: (p.get('state') ?? '').slice(0, 60),
    city: (p.get('city') ?? '').slice(0, 60),
    sort: p.get('sort') === 'free' ? 'free' : 'soon',
  }
}

function writeUrl(f: Filters) {
  const p = new URLSearchParams()
  for (const k of ['q', 'when', 'price', 'mode', 'type', 'state', 'city'] as const) if (f[k]) p.set(k, f[k])
  if (f.sort !== 'soon') p.set('sort', f.sort)
  const qs = p.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
}

function matches(e: ListedEvent, f: Filters, skip?: keyof Filters) {
  if (skip !== 'when' && f.when && !matchesWhen(e, f.when)) return false
  if (skip !== 'price' && f.price && e.priceType !== f.price) return false
  if (skip !== 'mode' && f.mode && (f.mode === 'online' ? e.mode === 'in_person' : e.mode === 'online')) return false
  if (skip !== 'type' && f.type && e.category !== f.type) return false
  if (skip !== 'state' && f.state && e.stateSlug !== f.state) return false
  if (skip !== 'city' && f.city && e.citySlug !== f.city) return false
  if (f.q) {
    const hay = `${e.title} ${e.organizer ?? ''} ${e.venue ?? ''} ${e.city ?? ''} ${e.state ?? ''}`.toLowerCase()
    if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false
  }
  return true
}

const countWhere = (events: ListedEvent[], f: Filters, skip: keyof Filters, test: (e: ListedEvent) => boolean) => events.filter(e => matches(e, f, skip) && test(e)).length

function places(events: ListedEvent[], f: Filters, skip: keyof Filters, slug: (e: ListedEvent) => string | null, name: (e: ListedEvent) => string | null) {
  const m = new Map<string, { slug: string; name: string; n: number }>()
  for (const e of events) {
    if (e.mode === 'online' || !matches(e, f, skip)) continue
    const s = slug(e), n = name(e)
    if (!s || !n) continue
    const row = m.get(s) ?? { slug: s, name: n, n: 0 }
    row.n++; m.set(s, row)
  }
  return [...m.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-neutral-200 py-4 last:border-b-0">
      <p className="mb-2.5 text-[13px] font-semibold text-neutral-950">{title}</p>
      {children}
    </div>
  )
}

function Option({ active, label, n, onClick }: { active: boolean; label: string; n?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} disabled={!active && n === 0} className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] transition-colors disabled:cursor-default disabled:text-neutral-300 ${active ? 'font-medium text-white' : 'text-neutral-700 hover:bg-neutral-100 disabled:hover:bg-transparent'}`} style={active ? { background: ACCENT } : undefined}>
      <span className="truncate">{label}</span>
      {n !== undefined && <span className={`text-[12px] tabular-nums ${active ? 'text-white/80' : 'text-neutral-400'}`}>{n}</span>}
    </button>
  )
}

function PlaceSection({ title, rows, active, onPick }: { title: string; rows: { slug: string; name: string; n: number }[]; active: string; onPick: (slug: string) => void }) {
  const [all, setAll] = useState(false)
  const shown = all ? rows : rows.filter((r, i) => i < 8 || r.slug === active)
  if (!rows.length) return null
  return (
    <Section title={title}>
      <div className="space-y-0.5">
        {shown.map(r => <Option key={r.slug} active={active === r.slug} label={r.name} n={r.n} onClick={() => onPick(active === r.slug ? '' : r.slug)} />)}
      </div>
      {rows.length > 8 && <button type="button" onClick={() => setAll(!all)} className="mt-2 inline-flex items-center gap-1 px-2.5 text-[13px] font-medium" style={{ color: ACCENT }}>{all ? 'Show fewer' : `Show all ${rows.length}`}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${all ? 'rotate-180' : ''}`} /></button>}
    </Section>
  )
}

export function EventBrowser({ events, lock = {}, emptyHint }: { events: ListedEvent[]; lock?: Lock; emptyHint?: string }) {
  const [f, setF] = useState<Filters>(EMPTY)
  const [limit, setLimit] = useState(PAGE)
  const [sheet, setSheet] = useState(false)
  const [now, setNow] = useState<number | null>(null)

  // Applied after the first render, so the server HTML and first client render match.
  useEffect(() => { setF(readUrl()); setNow(Date.now()) }, [])

  const update = useCallback((patch: Partial<Filters>) => {
    setF(prev => { const next = { ...prev, ...patch }; writeUrl(next); return next })
    setLimit(PAGE)
  }, [])
  const clear = () => update({ ...EMPTY, sort: f.sort })

  // Pages are cached for up to an hour, so anything that has since ended drops off here.
  const live = useMemo(() => (now ? events.filter(e => !isOver(e, now)) : events), [events, now])
  const shown = useMemo(() => {
    const list = live.filter(e => matches(e, f))
    if (f.sort === 'free') return [...list].sort((a, b) => Number(b.priceType === 'free') - Number(a.priceType === 'free'))
    return list
  }, [live, f])

  const stateRows = useMemo(() => places(live, f, 'state', e => e.stateSlug, e => e.state), [live, f])
  const cityRows = useMemo(() => places(live, f, 'city', e => e.citySlug, e => e.city), [live, f])

  const chips: { label: string; off: Partial<Filters> }[] = []
  if (f.when) chips.push({ label: WHEN_OPTIONS.find(w => w.value === f.when)!.label, off: { when: '' } })
  if (f.price) chips.push({ label: f.price === 'free' ? 'Free' : 'Paid', off: { price: '' } })
  if (f.mode) chips.push({ label: f.mode === 'online' ? 'Online' : 'In person', off: { mode: '' } })
  if (f.type) chips.push({ label: categoryBySlug(f.type)?.plural ?? f.type, off: { type: '' } })
  if (f.state) chips.push({ label: stateRows.find(r => r.slug === f.state)?.name ?? f.state, off: { state: '', city: '' } })
  if (f.city) chips.push({ label: cityRows.find(r => r.slug === f.city)?.name ?? f.city, off: { city: '' } })

  const panel = (
    <div>
      {!lock.price && (
        <Section title="Price">
          <div className="space-y-0.5">
            <Option active={f.price === 'free'} label="Free" n={countWhere(live, f, 'price', e => e.priceType === 'free')} onClick={() => update({ price: f.price === 'free' ? '' : 'free' })} />
            <Option active={f.price === 'paid'} label="Paid" n={countWhere(live, f, 'price', e => e.priceType === 'paid')} onClick={() => update({ price: f.price === 'paid' ? '' : 'paid' })} />
          </div>
        </Section>
      )}
      {!lock.mode && (
        <Section title="Format">
          <div className="space-y-0.5">
            <Option active={f.mode === 'in_person'} label="In person" n={countWhere(live, f, 'mode', e => e.mode !== 'online')} onClick={() => update({ mode: f.mode === 'in_person' ? '' : 'in_person' })} />
            <Option active={f.mode === 'online'} label="Online" n={countWhere(live, f, 'mode', e => e.mode !== 'in_person')} onClick={() => update({ mode: f.mode === 'online' ? '' : 'online' })} />
          </div>
        </Section>
      )}
      {!lock.category && (
        <Section title="Event type">
          <div className="space-y-0.5">
            {CATEGORIES.map(c => ({ c, n: countWhere(live, f, 'type', e => e.category === c.slug) })).filter(x => x.n > 0 || f.type === x.c.slug).map(({ c, n }) => (
              <Option key={c.slug} active={f.type === c.slug} label={c.plural} n={n} onClick={() => update({ type: f.type === c.slug ? '' : c.slug })} />
            ))}
          </div>
        </Section>
      )}
      {!lock.state && <PlaceSection title="State" rows={stateRows} active={f.state} onPick={s => update({ state: s, city: '' })} />}
      {!lock.city && <PlaceSection title="City" rows={cityRows} active={f.city} onPick={s => update({ city: s })} />}
    </div>
  )

  return (
    <div>
      {/* Search and date. Stays in reach while scrolling a long list. */}
      <div className="sticky top-[108px] z-30 -mx-5 border-b border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur md:top-[124px] md:mx-0 md:rounded-[18px] md:border md:px-4">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input value={f.q} onChange={e => update({ q: e.target.value })} type="search" placeholder="Search events, organisers, venues" aria-label="Search events" className="h-11 w-full rounded-full border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-[15px] outline-none transition-colors focus:border-neutral-400 focus:bg-white" />
          </div>
          <button type="button" onClick={() => setSheet(true)} className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 px-4 text-[14px] font-medium lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />Filters{chips.length > 0 && <span className="grid h-5 w-5 place-items-center rounded-full text-[11px] text-white" style={{ background: ACCENT }}>{chips.length}</span>}
          </button>
        </div>
        {!lock.when && (
          <div className="-mx-5 mt-2.5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
            {WHEN_OPTIONS.map(w => (
              <button key={w.value} type="button" aria-pressed={f.when === w.value} onClick={() => update({ when: f.when === w.value ? '' : w.value })} className={`h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${f.when === w.value ? 'border-transparent text-white' : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'}`} style={f.when === w.value ? { background: ACCENT } : undefined}>{w.label}</button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filter events">
          <div className="sticky top-[244px] max-h-[calc(100vh-260px)] overflow-y-auto pr-1">{panel}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-neutral-600" aria-live="polite"><span className="font-semibold text-neutral-950">{shown.length}</span> {shown.length === 1 ? 'event' : 'events'}</p>
            <label className="flex items-center gap-2 text-[13px] text-neutral-500">Sort
              <select value={f.sort} onChange={e => update({ sort: e.target.value as Filters['sort'] })} className="h-9 rounded-full border border-neutral-200 bg-white px-3 text-[13px] text-neutral-800 outline-none">
                <option value="soon">Soonest first</option>
                <option value="free">Free first</option>
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map(c => <button key={c.label} type="button" onClick={() => update(c.off)} className="inline-flex h-8 items-center gap-1 rounded-full bg-neutral-100 px-3 text-[13px] font-medium text-neutral-800 hover:bg-neutral-200">{c.label}<X className="h-3.5 w-3.5 text-neutral-500" /><span className="sr-only">Remove filter</span></button>)}
              <button type="button" onClick={clear} className="px-1 text-[13px] font-medium" style={{ color: ACCENT }}>Clear all</button>
            </div>
          )}

          {shown.length === 0 ? (
            <div className="mt-6 rounded-[18px] border border-dashed border-neutral-300 px-6 py-14 text-center">
              <p className="text-[16px] font-medium text-neutral-950">{live.length === 0 ? 'No upcoming events here right now' : 'No events match these filters'}</p>
              <p className="mx-auto mt-1.5 max-w-sm text-[14px] text-neutral-600">{live.length === 0 ? (emptyHint ?? 'New events are added every week. Browse other cities below in the meantime.') : 'Try removing a filter or picking different dates.'}</p>
              {live.length > 0 && <button type="button" onClick={clear} className="mt-4 inline-flex h-10 items-center rounded-full px-5 text-[14px] font-medium text-white" style={{ background: ACCENT }}>Clear filters</button>}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {shown.slice(0, limit).map(e => <EventCard key={e.slug} e={e} />)}
            </div>
          )}
          {shown.length > limit && (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setLimit(limit + PAGE)} className="inline-flex h-11 items-center rounded-full border border-neutral-300 px-6 text-[14px] font-medium hover:bg-neutral-50">Show more events <span className="ml-1.5 text-neutral-500">({shown.length - limit} left)</span></button>
            </div>
          )}
        </div>
      </div>

      {/* Phone filters: a sheet from the bottom of the screen. */}
      {sheet && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filter events">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <p className="text-[16px] font-semibold">Filters</p>
              <div className="flex items-center gap-3">
                {chips.length > 0 && <button type="button" onClick={clear} className="text-[14px] font-medium" style={{ color: ACCENT }}>Clear all</button>}
                <button type="button" onClick={() => setSheet(false)} aria-label="Close filters" className="rounded-full p-1.5 hover:bg-neutral-100"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5">{panel}</div>
            <div className="border-t border-neutral-200 p-4"><button type="button" onClick={() => setSheet(false)} className="h-12 w-full rounded-full text-[15px] font-medium text-white" style={{ background: ACCENT }}>Show {shown.length} {shown.length === 1 ? 'event' : 'events'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
