/* Types and display helpers for events. Client-safe. All dates are shown in IST, whatever
   timezone the reader's device or the server happens to be in. */

import type { EventCategory } from './config'

export type ListedEvent = {
  slug: string
  title: string
  image: string | null
  startAt: string
  endAt: string | null
  hasTime: boolean
  mode: 'in_person' | 'online' | 'hybrid'
  venue: string | null
  city: string | null
  citySlug: string | null
  state: string | null
  stateSlug: string | null
  priceType: 'free' | 'paid' | 'unknown'
  priceMin: number | null
  priceMax: number | null
  currency: string | null
  category: EventCategory | null
  source: string
  url: string
  organizer: string | null
}

export type When = 'today' | 'tomorrow' | 'weekend' | 'week' | 'month'
export const WHEN_OPTIONS: { value: When; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'month', label: 'This month' },
]

const TZ = 'Asia/Kolkata'
const IST_MS = 5.5 * 3600e3
export const istDay = (t: string | number | Date) => new Date(new Date(t).getTime() + IST_MS).toISOString().slice(0, 10)
const addDays = (day: string, n: number) => new Date(new Date(`${day}T00:00:00Z`).getTime() + n * 864e5).toISOString().slice(0, 10)
const weekdayOf = (day: string) => new Date(`${day}T00:00:00Z`).getUTCDay()

export const lastDay = (e: Pick<ListedEvent, 'startAt' | 'endAt'>) => istDay(e.endAt ?? e.startAt)
export const isOver = (e: Pick<ListedEvent, 'startAt' | 'endAt' | 'hasTime'>, now = Date.now()) => {
  if (e.endAt && e.hasTime) return new Date(e.endAt).getTime() < now
  return lastDay(e) < istDay(now)
}

/** The inclusive IST date range a "when" filter covers. */
export function whenRange(when: When, now = Date.now()): [string, string] {
  const today = istDay(now)
  if (when === 'today') return [today, today]
  if (when === 'tomorrow') { const d = addDays(today, 1); return [d, d] }
  if (when === 'week') return [today, addDays(today, 6)]
  if (when === 'weekend') {
    const dow = weekdayOf(today)
    if (dow === 0) return [today, today]
    if (dow === 6) return [today, addDays(today, 1)]
    const sat = addDays(today, 6 - dow)
    return [sat, addDays(sat, 1)]
  }
  const [y, m] = today.split('-').map(Number)
  return [today, new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)]
}

export function matchesWhen(e: Pick<ListedEvent, 'startAt' | 'endAt'>, when: When, now = Date.now()) {
  const [from, to] = whenRange(when, now)
  return istDay(e.startAt) <= to && lastDay(e) >= from
}

const part = (iso: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: TZ, ...opts }).format(new Date(iso))

export const fmtTime = (iso: string) => part(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase().replace(/\s+/g, ' ')
export const fmtDayShort = (iso: string) => part(iso, { weekday: 'short' })
export const fmtDayNum = (iso: string) => part(iso, { day: 'numeric' })
export const fmtMonthShort = (iso: string) => part(iso, { month: 'short' })
export const fmtDateLong = (iso: string) => part(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const fmtMonthYear = (t: string | number | Date) => new Intl.DateTimeFormat('en-IN', { timeZone: TZ, month: 'long', year: 'numeric' }).format(new Date(t))

const isMultiDay = (e: Pick<ListedEvent, 'startAt' | 'endAt'>) => !!e.endAt && istDay(e.startAt) !== istDay(e.endAt)

/** "Sat, 21 Nov, 10:30 AM" on cards, or "21 Nov to 23 Nov" for multi-day events. */
export function fmtWhenShort(e: Pick<ListedEvent, 'startAt' | 'endAt' | 'hasTime'>) {
  const start = `${fmtDayNum(e.startAt)} ${fmtMonthShort(e.startAt)}`
  if (isMultiDay(e)) return `${start} to ${fmtDayNum(e.endAt as string)} ${fmtMonthShort(e.endAt as string)}`
  return `${fmtDayShort(e.startAt)}, ${start}${e.hasTime ? `, ${fmtTime(e.startAt)}` : ''}`
}

export function fmtWhenLong(e: Pick<ListedEvent, 'startAt' | 'endAt' | 'hasTime'>) {
  if (isMultiDay(e)) return `${fmtDateLong(e.startAt)} to ${fmtDateLong(e.endAt as string)}`
  const end = e.endAt && e.hasTime ? ` to ${fmtTime(e.endAt)}` : ''
  return `${fmtDateLong(e.startAt)}${e.hasTime ? `, ${fmtTime(e.startAt)}${end} IST` : ''}`
}

export function priceLabel(e: Pick<ListedEvent, 'priceType' | 'priceMin' | 'priceMax' | 'currency'>) {
  if (e.priceType === 'free') return 'Free'
  if (e.priceType === 'unknown') return 'See price'
  if (e.priceMin == null || !e.currency) return 'Paid'
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: e.currency, maximumFractionDigits: e.priceMin % 1 ? 2 : 0 }).format(e.priceMin)
  return e.priceMax != null && e.priceMax > e.priceMin ? `From ${money}` : money
}

export const placeLabel = (e: Pick<ListedEvent, 'mode' | 'venue' | 'city'>) => {
  if (e.mode === 'online') return 'Online'
  return [e.venue, e.city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'India'
}
