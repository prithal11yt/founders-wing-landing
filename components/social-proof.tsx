'use client'

import { Users, MessageSquare, Video, TrendingUp } from 'lucide-react'
import { ScrollReveal, AnimatedCounter } from '@/components/scroll-reveal'

const stats = [
  {
    icon: Users,
    value: 5000,
    suffix: '+',
    label: 'Aspiring founders in our WhatsApp community',
    desc: 'Built organically through YouTube and word of mouth — no ads, no gimmicks.',
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
  },
  {
    icon: Video,
    value: 200,
    suffix: '+',
    label: 'Videos on business & AI',
    desc: 'From first business ideas to AI tools — real, actionable content for people who are just getting started.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: TrendingUp,
    value: 5,
    suffix: '+ years',
    label: 'Building businesses',
    desc: 'From SEO agency to content brand — real operational experience, not theory.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: MessageSquare,
    value: 36,
    suffix: 'K+ subscribers',
    label: 'YouTube channel',
    desc: "The Solo Entrepreneur — real, actionable content on business and AI that built this community.",
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
]

export function SocialProof() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal variant="fade-up" duration={800}>
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <p className="text-sm font-medium tracking-widest uppercase text-accent-cyan">Why founders trust us</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              The community where aspiring founders finally ship.
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From a 36K+ subscriber YouTube channel to a 5,000-member WhatsApp community — Prithal has been helping aspiring founders start for years. Founders Wing is the next level.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto">
          {stats.map((s, i) => (
            <ScrollReveal key={s.label} variant="fade-up" delay={100 + i * 100} duration={800}>
              <div className="neu-flat rounded-2xl p-4 md:p-6 h-full flex flex-col">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center border mb-3 md:mb-4 ${s.bg}`}>
                  <s.icon className={`w-4 h-4 md:w-5 md:h-5 ${s.color}`} />
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tighter tabular-nums">
                    <AnimatedCounter value={s.value} />
                  </span>
                  <span className="text-sm md:text-lg font-bold text-muted-foreground">{s.suffix}</span>
                </div>
                <p className="text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">{s.label}</p>
                <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed flex-1 hidden sm:block">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
