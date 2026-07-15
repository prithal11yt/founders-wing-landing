'use client'

import { useEffect, useRef, useState } from 'react'
import { Lightbulb, Wrench, Rocket, TrendingUp, Check, ArrowRight, Trophy, Flame, Medal, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const steps = [
  {
    icon: Lightbulb,
    label: 'Pick Your Challenge',
    desc: 'Choose from 50+ AI-friendly ideas or bring your own. Set your 30-day revenue target.',
    color: 'text-amber-600',
  },
  {
    icon: Wrench,
    label: 'Build Together',
    desc: 'Build alongside other founders in the sprint. Share progress, get feedback, move fast.',
    color: 'text-cyan-600',
  },
  {
    icon: Rocket,
    label: 'Launch & Sell',
    desc: 'Get it in front of real people. The community helps with positioning, pricing, and outreach.',
    color: 'text-violet-600',
  },
  {
    icon: TrendingUp,
    label: 'Hit the Leaderboard',
    desc: 'Track your revenue. Climb the leaderboard. Celebrate wins with your cohort.',
    color: 'text-emerald-600',
  },
]

const insideSprint = [
  'Structured 30-day sprint with daily action prompts',
  'Cohort of founders building alongside you',
  'Live leaderboard — track who earned what',
  'Weekly group calls with Prithal for unstuck moments',
  'Templates, swipe files & AI tool walkthroughs',
  'Private sprint channel for your cohort',
]

const leaderboardEntries = [
  { rank: 1, name: 'You?', amount: '₹___', highlight: true },
  { rank: 2, name: 'Founder B', amount: '₹12,400', highlight: false },
  { rank: 3, name: 'Founder C', amount: '₹8,200', highlight: false },
]

export function ChallengeSpotlight() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const scrollToApply = () => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] h-[600px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-emerald-500/10 rounded-full blur-[120px] pointer-events-none opacity-50 z-0" />

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        {/* Header */}
        <div className={cn(
          "text-center mb-12 md:mb-16 transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <p className="text-sm font-medium tracking-widest uppercase text-emerald-600 mb-4">Flagship Program</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            The ₹10K Sprint Challenge
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            A 30-day structured sprint where you and a cohort of like-minded founders each pick an idea, build with AI, and race to earn your first ₹10,000 online — together.
          </p>
        </div>

        {/* 4-step timeline */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10 md:mb-14 transition-all duration-700 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {steps.map((step, i) => (
            <div
              key={step.label}
              className={cn(
                "neu-flat rounded-2xl p-5 md:p-6 text-center relative transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
              style={{ transitionDelay: isVisible ? `${300 + i * 120}ms` : '0ms' }}
            >
              {/* Step number */}
              <div className="absolute top-3 right-3 text-xs font-bold text-muted-foreground/40">
                0{i + 1}
              </div>

              <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center mx-auto mb-4">
                <step.icon className={cn("w-6 h-6", step.color)} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{step.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

              {/* Connector arrow */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-foreground/15" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom section: Sprint details + Leaderboard preview */}
        <div className={cn(
          "grid md:grid-cols-[1fr_300px] gap-4 md:gap-6 transition-all duration-700 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {/* What's inside */}
          <div className="neu-flat rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg md:text-xl font-bold text-foreground">How the sprint works</h3>
            </div>
            <ul className="space-y-3 mb-6">
              {insideSprint.map((item, i) => (
                <li
                  key={item}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-500",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: isVisible ? `${700 + i * 80}ms` : '0ms' }}
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm md:text-base text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={scrollToApply}
              className="rounded-full px-8 h-12 text-base font-semibold neu-button-primary shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
            >
              Join the next sprint
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-3">New cohorts start every month</p>
          </div>

          {/* Leaderboard preview */}
          <div className="neu-flat rounded-3xl p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-foreground">Sprint Leaderboard</h3>
            </div>

            <div className="space-y-3 flex-1">
              {leaderboardEntries.map((entry) => (
                <div
                  key={entry.rank}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3 transition-all",
                    entry.highlight
                      ? "bg-emerald-500/10 border border-emerald-500/20 border-dashed"
                      : "neu-pressed"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold",
                    entry.rank === 1 ? "bg-amber-500/20 text-amber-600" :
                    entry.rank === 2 ? "bg-slate-500/20 text-slate-400" :
                    "bg-orange-900/20 text-orange-600"
                  )}>
                    {entry.rank === 1 ? <Medal className="w-4 h-4" /> : `#${entry.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      entry.highlight ? "text-emerald-600" : "text-foreground/70"
                    )}>
                      {entry.name}
                    </p>
                  </div>
                  <span className={cn(
                    "text-sm font-bold tabular-nums shrink-0",
                    entry.highlight ? "text-emerald-600" : "text-foreground/60"
                  )}>
                    {entry.amount}
                  </span>
                </div>
              ))}
            </div>

            {/* Gamification badges */}
            <div className="mt-5 pt-5 border-t border-foreground/5">
              <p className="text-xs text-muted-foreground mb-3">Earn badges as you build</p>
              <div className="flex gap-2">
                {[
                  { icon: Flame, label: '7-day streak', color: 'text-orange-600 bg-orange-500/10' },
                  { icon: Rocket, label: 'First sale', color: 'text-violet-600 bg-violet-500/10' },
                  { icon: Trophy, label: '₹10K club', color: 'text-amber-600 bg-amber-500/10' },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className={cn("flex flex-col items-center gap-1 rounded-xl p-2 flex-1", badge.color)}
                    title={badge.label}
                  >
                    <badge.icon className="w-4 h-4" />
                    <span className="text-[10px] text-muted-foreground leading-tight text-center">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
