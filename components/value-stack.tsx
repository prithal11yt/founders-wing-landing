'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ArrowRight, Zap, Crown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const valueItems = [
  { label: 'Weekly live sessions with Prithal (26 sessions)', value: '₹12,999' },
  { label: '50 Business Ideas Ebook (normally ₹299)', value: '₹299' },
  { label: '"First ₹10K" 30-Day Challenge', value: '₹2,999' },
  { label: 'AI Business Playbooks & Templates', value: '₹4,999' },
  { label: 'Copy-Paste Business Kits', value: '₹2,999' },
  { label: 'Accountability Buddy Matching', value: '₹1,999' },
  { label: 'AI Tool of the Week (early access)', value: '₹999' },
  { label: 'Private founder community access', value: '₹2,999' },
]

export function ValueStack() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastDismissed, setToastDismissed] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (!toastDismissed) {
            setTimeout(() => setShowToast(true), 600)
          }
        } else {
          if (!toastDismissed) setShowToast(false)
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [toastDismissed])

  const scrollToApply = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} id="pricing" className="py-16 md:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-violet-500/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0" />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <div className={cn(
          "text-center mb-12 md:mb-16 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <p className="text-sm font-medium tracking-widest uppercase text-emerald-400 mb-4">Everything included</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            One membership.<br className="md:hidden" /> Everything you need.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No upsells, no tiers, no hidden fees. You get the full experience from day one.
          </p>
        </div>

        {/* Value stack list */}
        <div className={cn(
          "neu-flat rounded-3xl p-6 md:p-10 mb-8 transition-all duration-700 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <div className="space-y-0">
            {valueItems.map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between py-3.5 md:py-4 border-b border-foreground/5 last:border-0 transition-all duration-500",
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                )}
                style={{ transitionDelay: isVisible ? `${300 + i * 80}ms` : '0ms' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm md:text-base text-foreground">{item.label}</span>
                </div>
                <span className="text-sm text-muted-foreground line-through ml-4 shrink-0">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className={cn(
            "mt-6 pt-6 border-t border-foreground/10 flex items-center justify-between transition-all duration-700",
            isVisible ? "opacity-100" : "opacity-0"
          )} style={{ transitionDelay: isVisible ? '1000ms' : '0ms' }}>
            <span className="text-sm md:text-base font-medium text-muted-foreground">Total Value</span>
            <span className="text-lg md:text-xl font-bold text-muted-foreground line-through">₹30,292</span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className={cn(
          "grid md:grid-cols-2 gap-4 md:gap-6 transition-all duration-700 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* 6-month plan */}
          <div className="neu-flat rounded-3xl p-6 md:p-8 relative group hover:border-cyan-500/20 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Starter</span>
            </div>
            <div className="mb-1">
              <span className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">₹2,999</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">for 6 months · just ₹500/mo</p>

            <ul className="space-y-2.5 mb-8">
              {['Full community access', 'Weekly live sessions', 'All playbooks & templates', '30-day challenge', 'Sprint leaderboard access'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={scrollToApply}
              className="w-full rounded-full h-12 text-base font-semibold bg-foreground/10 hover:bg-foreground/20 text-foreground border border-foreground/10 transition-all"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Annual plan — recommended */}
          <div className="relative rounded-3xl p-6 md:p-8 group transition-all duration-300 border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent shadow-[0_0_40px_rgba(2,132,199,0.15)]">
            {/* Best value badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-cyan-500 text-xs font-bold text-white shadow-[0_0_20px_rgba(2,132,199,0.5)]">
                <Crown className="w-3.5 h-3.5" />
                BEST VALUE — SAVE ₹1,000
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 mt-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-amber-400 uppercase tracking-wider">Committed</span>
            </div>
            <div className="mb-1">
              <span className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">₹4,999</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">for 12 months · just ₹417/mo</p>

            <ul className="space-y-2.5 mb-8">
              {['Everything in Starter', '6 extra months of access', 'Priority Hot Seat spots', 'Founding member badge', 'Sprint leaderboard access'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={scrollToApply}
              className="w-full rounded-full h-12 text-base font-semibold neu-button-primary shadow-[0_0_30px_rgba(2,132,199,0.4)] transition-all"
            >
              Join for ₹4,999/year
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Trust line */}
        <div className={cn(
          "text-center mt-8 transition-all duration-700 delay-700",
          isVisible ? "opacity-100" : "opacity-0"
        )}>
          <p className="text-sm text-muted-foreground">
            Instant access after approval · Cancel anytime after plan ends
          </p>
        </div>
      </div>

      {/* Floating price anchor toast */}
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md transition-all duration-500 ease-out",
        showToast && !toastDismissed
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}>
        <div className="relative rounded-2xl border border-amber-500/30 bg-[#0f1623]/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(245,158,11,0.15)] px-5 py-4 flex items-start gap-4">
          {/* Glow accent */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/10 via-transparent to-transparent pointer-events-none" />

          <div className="text-2xl shrink-0 mt-0.5">💡</div>

          <div className="flex-1 relative z-10">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Think about it this way</p>
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold">₹500/month</span>
              <span className="text-muted-foreground"> — less than one Swiggy order.</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              One offline workshop = ₹3,000–5,000 for a single day. Here you get <span className="text-foreground font-medium">26 live sessions + community + sprint access</span> for 6 months.
            </p>
          </div>

          <button
            onClick={() => { setShowToast(false); setToastDismissed(true) }}
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all relative z-10 mt-0.5"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
