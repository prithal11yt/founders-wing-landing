'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, X, Bot, Users, Share2, GraduationCap, Megaphone, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

const forYou = [
  {
    icon: Bot,
    title: 'Stuck watching tutorials instead of building',
    desc: "You have ideas but can't stop overthinking. You need clarity, direction, and people who push you to act.",
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10 border-accent-cyan/20',
  },
  {
    icon: Users,
    title: 'Want to make your first rupee online',
    desc: "You're tired of consuming content and ready to build something real — even if you don't know exactly what yet.",
    color: 'text-blue-600',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Share2,
    title: 'Ready to use AI as your unfair advantage',
    desc: "You know AI can help you move 10x faster. You just need the right tools, playbooks, and people around you.",
    color: 'text-emerald-600',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
]

const notForYou = [
  {
    icon: GraduationCap,
    title: 'Want spoon-fed courses',
    desc: 'This is a community, not a course. We give you tools and accountability — you do the work.',
  },
  {
    icon: Megaphone,
    title: 'Here to sell or pitch',
    desc: 'Agencies and freelancers looking for leads will be removed immediately.',
  },
  {
    icon: Eye,
    title: 'Just want to lurk',
    desc: "If you're not willing to take action and share your journey, this isn't the right fit.",
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
    <section ref={sectionRef} className="py-16 md:py-24 relative overflow-hidden">
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
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3 md:mb-4">Not the right fit if you…</p>
          <div className="grid sm:grid-cols-3 gap-3 md:gap-4">
            {notForYou.map((item) => (
              <div key={item.title} className="flex items-start gap-3 opacity-60">
                <X className="w-4 h-4 text-red-600/70 shrink-0 mt-0.5" />
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
