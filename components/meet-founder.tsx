'use client'

import { Youtube, Twitter, Globe, Users, Play } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollReveal } from '@/components/scroll-reveal'

const stats = [
  { icon: Play, label: 'YouTube', value: '36K+', color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20' },
  { icon: Users, label: 'Community', value: '5K+', color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { icon: Globe, label: 'Experience', value: '7+ yrs', color: 'text-cyan-600', bg: 'bg-cyan-500/10 border-cyan-500/20' },
]

export function MeetFounder() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-gradient-to-r from-cyan-500/8 via-transparent to-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <ScrollReveal variant="fade-up" duration={800}>
          <div className="neu-flat rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr]">

              {/* Photo */}
              <div className="relative bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden min-h-[280px] md:min-h-[420px]">
                <Image
                  src="/prithal.jpg"
                  alt="Prithal Bhardwaj"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
              </div>

              {/* Content */}
              <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center gap-5">

                {/* Label + Name */}
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-accent-cyan mb-2">Meet the founder</p>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-1">
                    Prithal Bhardwaj
                  </h2>
                  <p className="text-muted-foreground text-sm">Builder · Creator · AI Entrepreneur</p>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap gap-2">
                  {stats.map((stat) => (
                    <div key={stat.label} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${stat.bg}`}>
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                <div className="space-y-3 text-muted-foreground leading-relaxed text-sm md:text-[15px]">
                  <p>
                    I spent <span className="text-foreground font-medium">5+ years building businesses</span> — from an SEO agency to a content brand with hundreds of videos — so I could help people who are exactly where I was when I started: full of ideas, zero clue how to execute.
                  </p>
                  <p>
                    Free communities plateau — most members watch, like, and never ship anything. I built Founders Wing to be different.
                  </p>
                </div>

                {/* Pull quote */}
                <div className="border-l-2 border-cyan-500/50 pl-4 py-1">
                  <p className="text-foreground font-medium text-sm md:text-base leading-relaxed">
                    "Founders Wing is for the doers. If you're tired of being a perpetual beginner and want someone in your corner — this is the room."
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">— Prithal</p>
                </div>

                {/* Social links */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="https://youtube.com/@thesoloentrepreneur07"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full neu-pressed text-xs font-medium text-muted-foreground hover:text-red-600 hover:border-red-500/20 transition-all"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-600" />
                    YouTube
                  </Link>
                  <Link
                    href="https://x.com/Prithal7"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full neu-pressed text-xs font-medium text-muted-foreground hover:text-sky-600 transition-all"
                  >
                    <Twitter className="w-3.5 h-3.5 text-sky-600" />
                    Twitter
                  </Link>
                  <Link
                    href="https://thesoloentrepreneur.in"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full neu-pressed text-xs font-medium text-muted-foreground hover:text-emerald-600 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    Website
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
