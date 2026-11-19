'use client'

import { useState } from 'react'
import { ACCENT } from '@/components/site/brand'

declare global { interface Window { gtag?: (...args: unknown[]) => void } }

/** The free first step for event visitors: a weekly email of new events in their city. */
export function EventAlertForm({ city, cityName }: { city: string; cityName: string }) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setState('error'); setError('Please enter a valid email.'); return }
    setState('busy'); setError('')
    try {
      const res = await fetch('/api/event-alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, city, company }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save. Please try again.')
      window.gtag?.('event', 'generate_lead', { lead_source: 'event_alert', city })
      setState('done')
    } catch (err) {
      setState('error'); setError(err instanceof Error ? err.message : 'Could not save. Please try again.')
    }
  }

  return (
    <div className="rounded-[22px] border border-neutral-200 bg-white p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
      <div className="max-w-xl">
        <h2 className="text-xl font-medium tracking-[-0.02em] md:text-2xl">Get new {cityName === 'India' ? 'startup' : cityName} events every Monday</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-600">One email a week with the founder meetups, hackathons and workshops coming up{cityName === 'India' ? ' across India' : ` in ${cityName}`}. Free. Unsubscribe any time.</p>
      </div>
      {state === 'done' ? (
        <p className="mt-4 text-[15px] font-medium md:mt-0" style={{ color: ACCENT }}>You&apos;re on the list. See you Monday.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex w-full max-w-md flex-col gap-2 md:mt-0" noValidate>
          <div className="flex gap-2">
            <label htmlFor={`alert-email-${city}`} className="sr-only">Email</label>
            <input id={`alert-email-${city}`} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="h-11 min-w-0 flex-1 rounded-full border border-neutral-300 px-4 text-[15px] outline-none focus:border-neutral-500" />
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={company} onChange={e => setCompany(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            <button type="submit" disabled={state === 'busy'} className="h-11 shrink-0 rounded-full px-5 text-[14px] font-medium text-white disabled:opacity-60" style={{ background: ACCENT }}>{state === 'busy' ? 'Saving…' : 'Get the alert'}</button>
          </div>
          {state === 'error' && <p role="alert" className="text-[13px] text-red-600">{error}</p>}
        </form>
      )}
    </div>
  )
}
