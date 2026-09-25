'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, CheckCircle2, Phone, ShieldCheck, Zap } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '@/lib/contact'
import { COUPON_CODE, offerSpotsLeft } from '@/lib/offer'
import { ACCENT } from '@/components/site/brand'
import { INCLUDED, PLANS, type PlanKey } from '@/components/site/ui'
import { MembershipCard } from '@/components/site/membership-card'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'

// Checkout is hosted on thesoloentrepreneur.in (verified Razorpay account)
const CHECKOUT_BASE_URL = 'https://www.thesoloentrepreneur.in/fw-membership'

function checkoutUrl(plan: PlanKey, info: { name: string; email: string; whatsapp: string }, coupon: boolean) {
  const query = new URLSearchParams({ plan, ...info })
  if (coupon) query.set('coupon', COUPON_CODE)
  return `${CHECKOUT_BASE_URL}?${query.toString()}`
}

function SecureSpotContent() {
  const params = useSearchParams()
  const name = params.get('name') || ''
  const email = params.get('email') || ''
  const whatsapp = params.get('whatsapp') || ''
  const firstName = name.split(' ')[0]
  const info = { name, email, whatsapp }

  const [plan, setPlan] = useState<PlanKey>('annual')
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/public/member-count').then(r => r.json()).then(d => setCount(typeof d.count === 'number' ? d.count : null)).catch(() => {})
  }, [])
  const nextMemberNo = count !== null ? count + 1 : null
  const couponOn = count !== null && offerSpotsLeft(count) > 0

  return (
    <div className="min-h-screen bg-white text-neutral-950 flex flex-col">
      <SiteNav />
      <main className="flex-1 pt-36 md:pt-44 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* The card, with their name on it */}
          <div className="lg:sticky lg:top-32 order-2 lg:order-1">
            <div className="relative rounded-[28px] aspect-[5/4] flex items-center justify-center p-8 md:p-14" style={{ background: 'radial-gradient(70% 60% at 50% 45%, #e6f3fb 0%, #f4f4f5 72%)' }}>
              {nextMemberNo && (
                <div className="absolute top-4 right-4 md:top-5 md:right-5 rounded-full bg-neutral-900 text-white text-xs font-medium px-3.5 py-2">
                  You’d be member #{nextMemberNo}
                </div>
              )}
              <MembershipCard plan={plan} memberNo={nextMemberNo} name={name} className="max-w-[400px]" />
            </div>
            <div className="mt-6 rounded-[22px] bg-neutral-50 p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 font-semibold">What you unlock</p>
              <ul className="mt-4 space-y-2.5">
                {INCLUDED.map(i => (
                  <li key={i} className="flex items-start gap-3 text-[15px]">
                    <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: ACCENT }} strokeWidth={2.5} />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pick a plan, pay */}
          <div className="order-1 lg:order-2">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Application received
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-medium tracking-[-0.045em] leading-[1.02]">
              {firstName ? `${firstName}, you’re one step from in.` : 'You’re one step from in.'}
            </h1>
            <p className="mt-5 text-neutral-600 leading-relaxed">
              Pick a plan and pay securely. You get the WhatsApp group link and onboarding details straight away, and the next live session is never more than a week out.
            </p>

            <div className="mt-8 space-y-3">
              {(Object.keys(PLANS) as PlanKey[]).map(k => {
                const p = PLANS[k]
                const selected = plan === k
                return (
                  <a
                    key={k}
                    href={checkoutUrl(k, info, couponOn)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setPlan(k)}
                    onFocus={() => setPlan(k)}
                    className={`group flex items-center justify-between gap-4 rounded-[22px] border p-5 transition-all ${selected ? 'border-neutral-900 bg-white shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]' : 'border-neutral-200 bg-white hover:border-neutral-400'}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">{p.label}</span>
                        {k === 'annual' && <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: ACCENT }}>Best value</span>}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">{p.monthly}/month · {p.billed.toLowerCase()}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-2xl font-medium tracking-[-0.03em]">{p.price}</span>
                      <span className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform group-hover:translate-x-0.5" style={{ background: ACCENT }}>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>

            {couponOn && (
              <p className="mt-4 text-sm text-neutral-500">
                Code <span className="font-mono font-semibold text-neutral-900">{COUPON_CODE}</span> is applied at checkout for 20% off.
              </p>
            )}

            <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
              <span>Pay with</span>
              {['UPI', 'Cards', 'Netbanking', 'EMI'].map(m => <span key={m} className="rounded-md border border-neutral-200 px-2 py-1 font-medium text-neutral-700">{m}</span>)}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-neutral-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secure Razorpay checkout</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Instant access</span>
            </div>

            <div className="mt-10 rounded-[22px] border border-neutral-200 p-5">
              <p className="text-[15px] font-medium">Questions before you pay?</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <a href={PHONE_TEL} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                  <Phone className="w-4 h-4" style={{ color: ACCENT }} /> Call {PHONE_DISPLAY}
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                  WhatsApp us
                </a>
                <a href="mailto:prithalbhardwaj@gmail.com" className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-50">
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function SecureSpotPage() {
  return (
    <Suspense>
      <SecureSpotContent />
    </Suspense>
  )
}
