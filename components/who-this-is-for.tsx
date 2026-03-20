'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, X, Bot, Users, Share2, GraduationCap, Megaphone, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const forYou = [
  {
    icon: Bot,
    title: 'Using AI in your startup',
    desc: "You're integrating AI into your product or ops — and overwhelmed by the 500 tools out there.",
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
  },
  {
    icon: Users,
    title: "Need founders who've done it",
    desc: "Making AI decisions alone — which model, which tool, build vs buy. You want peers who've already made those bets.",
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Share2,
    title: 'Will share what you learn',
    desc: "You don't need to be technical. But you're willing to share wins, failures, and honest experience.",
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
]

const notForYou = [
  {
    icon: GraduationCap,
    title: 'Want a course',
    desc: 'This is a peer network, not ed-tech. No curriculum, no modules.',
  },
  {
    icon: Megaphone,
    title: 'Pitching services',
    desc: 'Agencies and consultants looking for leads will be removed.',
  },
  {
    icon: Eye,
    title: 'Exploring casually',
    desc: 'We require active building. Hobby interest isn\'t the right fit.',
  },
]

export function WhoThisIsFor() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <div className="text-center mb-16">
          <h2
            className={cn(
              "text-3xl md:text-5xl font-bold tracking-tight mb-4 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            Who this is for
          </h2>
          <div
            className={cn(
              "w-16 h-1 bg-accent-cyan/50 rounded-full mx-auto transition-all duration-700 delay-100",
              isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            )}
          />
        </div>

        {/* Yes cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {forYou.map((item, i) => (
            <div
              key={item.title}
              className={cn(
                "neu-flat rounded-2xl p-6 transition-all duration-500 group",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: isVisible ? `${200 + i * 100}ms` : '0ms' }}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border", item.bg)}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* No cards — compact, muted row */}
        <div
          className={cn(
            "neu-pressed rounded-2xl p-5 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: isVisible ? '600ms' : '0ms' }}
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">Not the right fit if you…</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {notForYou.map((item) => (
              <div key={item.title} className="flex items-start gap-3 opacity-60">
                <X className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground/80">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
