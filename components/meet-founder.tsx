'use client'

import { Youtube, Twitter, Globe } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/scroll-reveal'

export function MeetFounder() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <ScrollReveal variant="fade-up" duration={800}>
          <div className="neu-flat rounded-3xl overflow-hidden">
            <div className="grid md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]">
              {/* Photo */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-full h-full min-h-[200px] md:min-h-full bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 flex flex-col items-center justify-center gap-3 py-8 md:py-0">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-white/10 flex items-center justify-center">
                    <span className="text-2xl md:text-4xl font-bold text-white/60">PB</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Photo placeholder</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20 pointer-events-none hidden md:block" />
              </div>

              {/* Content */}
              <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center">
                <p className="text-sm font-medium tracking-widest uppercase text-accent-cyan mb-3">Meet the founder</p>
                <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-1">
                  Prithal Bhardwaj
                </h2>
                <p className="text-muted-foreground text-xs md:text-sm mb-5">
                  Builder · Creator · 36K+ on YouTube
                </p>

                <div className="space-y-3 text-muted-foreground leading-relaxed text-sm md:text-[15px]">
                  <p>
                    I spent <span className="text-foreground font-medium">5+ years building businesses</span> — from an SEO agency to a content brand with hundreds of videos — so I could help people who are exactly where I was when I started: full of ideas, zero clue how to execute.
                  </p>
                  <p>
                    My YouTube channel grew to{' '}
                    <span className="text-foreground font-medium">36,000+ subscribers</span> and I built a{' '}
                    <span className="text-foreground font-medium">5,000+ member WhatsApp community</span>. But free communities plateau — most members watch, like, and never ship anything.
                  </p>
                  <p>
                    <span className="text-foreground font-medium">Founders Wing is for the doers.</span>{' '}
                    If you&apos;re tired of being a perpetual beginner and want someone in your corner while you build your first real thing — this is the room.
                  </p>
                </div>

                {/* Social links */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-6">
                  <Link
                    href="https://youtube.com/@thesoloentrepreneur07"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-pressed text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    YouTube
                  </Link>
                  <Link
                    href="https://x.com/Prithal7"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-pressed text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    Twitter
                  </Link>
                  <Link
                    href="https://thesoloentrepreneur.in"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-pressed text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
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
