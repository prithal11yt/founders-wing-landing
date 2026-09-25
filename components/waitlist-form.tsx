'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { ACCENT } from '@/components/site/brand'

const field =
  'w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors focus:border-neutral-900'
const label = 'block text-sm font-medium text-neutral-800'
const hint = 'text-xs text-neutral-500'

/* The application form. Creates the lead the team follows up on (/api/waitlist → Supabase),
   then sends the person to /secure-spot to pay. */
export function WaitlistForm({
  nextMemberNo = null,
  comingSoon = false,
}: {
  nextMemberNo?: number | null
  comingSoon?: boolean
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    idea: '',
    goal: '',
    heardFrom: '',
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      // Conversion signals for retargeting/analytics. Both are no-ops until the tags exist.
      const w = window as unknown as { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void }
      w.fbq?.('track', 'Lead')
      w.gtag?.('event', 'generate_lead', { method: 'waitlist_form' })

      if (comingSoon) {
        setSubmitted(true)
      } else {
        const query = new URLSearchParams({
          name: formData.fullName,
          email: formData.email,
          whatsapp: formData.whatsapp,
        })
        router.push(`/secure-spot?${query.toString()}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <CheckCircle2 className="h-12 w-12" style={{ color: ACCENT }} />
        <h3 className="text-xl font-medium">You’re on the list.</h3>
        <p className="text-neutral-600 max-w-sm">We’ll reach out the moment Founders Wing opens its doors. Keep building.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {/* Honeypot — hidden from real users, so anything that fills it in is a
          bot. The API silently discards those submissions. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        onChange={handleChange}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className={label}>Full name</label>
          <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Arjun Sharma" className={field} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="arjun@gmail.com" className={field} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="whatsapp" className={label}>WhatsApp number</label>
        <p className={hint}>Include the country code, e.g. +91 98765 43210. Your group invite comes here.</p>
        <input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleChange} required placeholder="+91 98765 43210" className={field} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="idea" className={label}>What are you building, or thinking of building?</label>
        <p className={hint}>SaaS, an AI automation, an app, an agency. A rough idea is fine, “not sure yet” works too.</p>
        <textarea id="idea" name="idea" value={formData.idea} onChange={handleChange} required placeholder="e.g. A WhatsApp automation for clinics, an AI tool for small shops, not sure yet…" className={`${field} min-h-[90px]`} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="goal" className={label}>What does success look like in the next 3 months?</label>
        <textarea id="goal" name="goal" value={formData.goal} onChange={handleChange} required placeholder="e.g. Launch it and get my first 3 paying customers, make ₹10K from it, quit my job…" className={`${field} min-h-[90px]`} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="heardFrom" className={label}>How did you hear about Founders Wing?</label>
        <select id="heardFrom" name="heardFrom" value={formData.heardFrom} onChange={handleChange} required className={field}>
          <option value="">Select one</option>
          <option value="youtube">YouTube</option>
          <option value="twitter-linkedin">Twitter / LinkedIn</option>
          <option value="whatsapp">WhatsApp community</option>
          <option value="friend-referral">Friend / Referral</option>
          <option value="other">Other</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full h-13 min-h-[52px] text-[15px] font-medium text-white transition-all hover:brightness-110 disabled:opacity-70"
        style={{ background: ACCENT }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
          </>
        ) : comingSoon ? (
          'Notify me at launch'
        ) : (
          <>
            Continue to payment <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-neutral-500">
        {comingSoon
          ? 'Free to join the waitlist · No card needed'
          : nextMemberNo
            ? `You’d be member #${nextMemberNo} · Instant access after payment`
            : 'Instant access after payment'}
      </p>
    </form>
  )
}
