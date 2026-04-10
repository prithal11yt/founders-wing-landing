'use client';

import { useState } from "react"
import { ArrowRight, Sparkles, Menu, X, MapPin, Users, Zap, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InteractiveBackground } from "@/components/interactive-background"
import { InteractiveBento } from "@/components/interactive-bento"
import { ExpandableGallery } from "@/components/expandable-gallery"
import { GlowingCard } from "@/components/glowing-card"
import { WaitlistForm } from "@/components/waitlist-form"
import { VideoEmbed } from "@/components/video-embed"
import { WhoThisIsFor } from "@/components/who-this-is-for"
import { SocialProof } from "@/components/social-proof"
import { FAQSection } from "@/components/faq-section"
import { ScrollReveal, AnimatedCounter } from "@/components/scroll-reveal"
import { ScrollProgress } from "@/components/scroll-progress"
import { MagneticButton } from "@/components/magnetic-button"
import Image from "next/image"
import { MeetFounder } from "@/components/meet-founder"
import { CTAStrip } from "@/components/cta-strip"
import { ValueStack } from "@/components/value-stack"
import { ChallengeSpotlight } from "@/components/challenge-spotlight"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <ScrollProgress />
      <InteractiveBackground />

      {/* ═══════════════ Navigation ═══════════════ */}
      <header className="fixed top-3 md:top-4 left-1/2 -translate-x-1/2 w-[92%] md:w-[95%] max-w-5xl z-50 neu-convex rounded-full px-2 py-1">
        <div className="container mx-auto px-3 md:px-4 h-12 md:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="Founders Wing" width={28} height={28} className="object-contain" />
            <span className="font-semibold tracking-tight">Founders Wing</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#community" className="hover:text-foreground transition-colors">
              What You Get
            </Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#who" className="hover:text-foreground transition-colors">
              Who It&apos;s For
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>
          <Button
            asChild
            variant="outline"
            className="hidden md:inline-flex border-foreground/10 hover:bg-foreground hover:text-background transition-all bg-transparent"
          >
            <a href="#apply" onClick={(e) => {
              e.preventDefault()
              document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })
            }}>Join Now</a>
          </Button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu — rendered outside header pill to prevent clipping */}
      <div
        className={`fixed top-[64px] md:top-[76px] left-1/2 -translate-x-1/2 w-[92%] md:w-[95%] max-w-5xl z-50 md:hidden overflow-hidden transition-all duration-300 ease-out rounded-2xl ${
          mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="neu-flat flex flex-col px-6 py-4 gap-1 rounded-2xl">
          {[
            { label: "What You Get", id: "community" },
            { label: "Pricing", id: "pricing" },
            { label: "Who It's For", id: "who" },
            { label: "FAQ", id: "faq" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-left py-3 text-lg text-muted-foreground hover:text-foreground transition-colors border-b border-foreground/5 last:border-0"
            >
              {item.label}
            </button>
          ))}
          <Button
            className="mt-3 w-full rounded-full neu-button-primary h-12 text-base font-medium transition-colors"
            onClick={() => scrollTo("apply")}
          >
            Join Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </nav>
      </div>

      <main className="flex-1">
        {/* ═══════════════ Hero Section ═══════════════ */}
        <section className="relative pt-28 pb-16 md:pt-48 md:pb-32 overflow-hidden">
          {/* Subtle radial gradient overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(2,132,199,0.06) 0%, transparent 70%)',
          }} />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-5 md:space-y-8">
              {/* Badge */}
              <ScrollReveal variant="fade-down" delay={200} duration={1000}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl neu-pressed text-xs font-medium text-muted-foreground select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                  </span>
                  Now Open · Limited Spots · AI-Powered Growth
                </div>
              </ScrollReveal>

              {/* Headline */}
              <ScrollReveal variant="fade-up" delay={400} duration={1200}>
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                    Stop overthinking.
                    <br />
                    <span className="text-gradient-cyan">Start building with AI.</span>
                  </h1>
                </div>
              </ScrollReveal>

              {/* Subtitle */}
              <ScrollReveal variant="blur-in" delay={700} duration={1000}>
                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
                  Join aspiring founders who are done watching tutorials and finally shipping something real — with AI as the unfair advantage.
                </p>
              </ScrollReveal>

              {/* CTA */}
              <ScrollReveal variant="fade-up" delay={1000} duration={800}>
                <div className="flex flex-col items-center justify-center gap-3 md:gap-5">
                  <MagneticButton strength={0.25}>
                    <Button
                      size="lg"
                      className="rounded-full px-8 h-13 text-base font-semibold neu-button-primary shadow-[0_0_30px_rgba(2,132,199,0.4),0_0_60px_rgba(2,132,199,0.15)]"
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      Apply to Join
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </MagneticButton>
                  <p className="text-sm text-muted-foreground">No fluff, no courses — just founders helping founders</p>
                </div>
              </ScrollReveal>

              {/* Mini social proof in hero */}
              <ScrollReveal variant="fade-up" delay={1200} duration={800}>
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  {/* Avatar row */}
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex -space-x-2">
                      {['AM', 'PS', 'RK', 'NK', 'VT'].map((initials, i) => (
                        <div key={initials} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-background flex items-center justify-center text-[9px] md:text-[10px] font-bold text-muted-foreground" style={{ zIndex: 5 - i }}>
                          {initials}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      From a <span className="text-foreground font-medium">36K+ YouTube</span> channel & <span className="text-foreground font-medium">5K+ WhatsApp</span> community
                    </p>
                  </div>

                  {/* Stats strip — always horizontal */}
                  <div className="inline-flex items-center gap-3 md:gap-8 px-4 py-2.5 md:px-8 md:py-4 neu-flat rounded-full text-sm">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-base md:text-xl font-extrabold text-foreground tracking-tighter">AI-First</span>
                    </div>

                    <div className="w-px h-3 md:h-4 bg-white/10"></div>

                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-base md:text-xl font-extrabold text-foreground tracking-tighter">Action-Only</span>
                    </div>

                    <div className="w-px h-3 md:h-4 bg-white/10"></div>

                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-base md:text-xl font-extrabold text-foreground tracking-tighter">&#8377;4,999</span>
                      <span className="text-[10px] md:text-xs text-muted-foreground">/yr</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20" style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--bg-color) 100%)',
          }} />
        </section>

        {/* ═══════════════ Video Section ═══════════════ */}
        <section className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal variant="fade-up" duration={800}>
              <div className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Watch: What Is Founders Wing?</h2>
                <p className="text-muted-foreground">
                  A 3-minute overview from the founder on why this community exists and what to expect as a member.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="scale-up" delay={200} duration={1000}>
              <div className="neu-flat p-2 rounded-[2rem]">
                <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50" style={{ aspectRatio: '16/9' }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full neu-convex flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 md:w-8 md:h-8 text-cyan-400 ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <div className="text-center">
                      <p className="text-base md:text-lg font-semibold text-foreground/80">Video coming soon</p>
                      <p className="text-sm text-muted-foreground mt-1">A 3-minute walkthrough from Prithal is in production.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════ Meet the Founder ═══════════════ */}
        <MeetFounder />

        {/* ═══════════════ What You Get (Merged Vision + Community) ═══════════════ */}
        <section id="community" className="py-16 md:py-24 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] h-[800px] bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-indigo-500/10 rounded-full blur-[120px] pointer-events-none opacity-50 z-0"></div>

          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up" duration={800}>
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl neu-convex mb-4">
                  <Sparkles className="w-6 h-6 text-accent-cyan drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What You Get Inside</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Everything you need to go from &quot;I want to start&quot; to actually building — with AI tools, accountability, and founders who get it.
                </p>
              </div>
            </ScrollReveal>

            <InteractiveBento />
          </div>
        </section>

        {/* ═══════════════ Challenge Spotlight ═══════════════ */}
        <ChallengeSpotlight />

        {/* ═══════════════ Testimonials ═══════════════ */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up" duration={800}>
              <div className="text-center mb-10 space-y-3">
                <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">Real members, real results</span>
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Founders already building inside</h2>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={150} duration={800}>
              <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
                {[
                  {
                    name: "Rahul M.",
                    handle: "@rahul_builds",
                    location: "Pune",
                    avatar: "RM",
                    color: "from-cyan-500/20 to-cyan-500/5",
                    text: "Joined during Sprint #2 with zero idea what to build. By day 22 I had my first ₹3,400 from selling an AI prompt pack. The cohort accountability is real — you can't just ghost when people are watching your progress on the leaderboard.",
                    result: "₹3,400 in first sprint",
                    resultColor: "text-cyan-400",
                  },
                  {
                    name: "Sneha K.",
                    handle: "@sneha_makes",
                    location: "Bangalore",
                    avatar: "SK",
                    color: "from-violet-500/20 to-violet-500/5",
                    text: "I had been 'learning' for 8 months before this. First live session with Prithal, I asked about my freelance pricing. He told me in 5 minutes what I'd been overthinking for weeks. Now I charge 3x my old rate.",
                    result: "3× freelance rate",
                    resultColor: "text-violet-400",
                  },
                  {
                    name: "Arjun T.",
                    handle: "@arjunbuilds",
                    location: "Delhi",
                    avatar: "AT",
                    color: "from-amber-500/20 to-amber-500/5",
                    text: "Was scared to pay ₹2,999 honestly. But the ebook alone has 50 ideas with full business plans — that's worth more. Found my co-founder here too. We're building together now.",
                    result: "Found co-founder",
                    resultColor: "text-amber-400",
                  },
                ].map((t) => (
                  <div key={t.name} className="neu-flat rounded-3xl p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} border border-white/10 flex items-center justify-center text-sm font-bold shrink-0`}>
                          {t.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.location}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 ${t.resultColor}`}>{t.result}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* WhatsApp-style proof strip */}
            <ScrollReveal variant="fade-up" delay={300} duration={800}>
              <div className="max-w-2xl mx-auto neu-flat rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground font-medium">From the Founders Wing community</span>
                </div>
                {[
                  { avatar: "PK", name: "Priya K.", msg: "Just got my first client from the outreach template in the resource library 🙌 ₹8,000 project!", time: "2d ago" },
                  { avatar: "VR", name: "Vikram R.", msg: "Sprint Day 15 update — ₹5,200 earned so far. Didn't think I'd hit ₹10K but actually might 😅", time: "4d ago" },
                  { avatar: "DM", name: "Dev M.", msg: "The hot seat coaching today was insane. Prithal literally rewrote my pitch in 3 minutes and it actually makes sense now", time: "1w ago" },
                ].map((m) => (
                  <div key={m.name} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold shrink-0">{m.avatar}</div>
                    <div className="flex-1 bg-white/[0.03] rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">{m.name}</span>
                        <span className="text-[10px] text-muted-foreground">{m.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{m.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════ Value Stack & Pricing ═══════════════ */}
        <ValueStack />

        {/* ═══════════════ Roadmap / What's Coming ═══════════════ */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up" duration={800}>
              <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 space-y-3">
                  <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">For Members</span>
                  <h2 className="text-2xl md:text-4xl font-bold tracking-tight">What we&apos;re building next</h2>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-xl mx-auto">
                    Every subscription goes toward making this community bigger and better. You&apos;re not just joining — you&apos;re helping build what it becomes.
                  </p>
                </div>

                {/* Roadmap items */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    {
                      icon: <MapPin className="w-5 h-5 text-violet-400" />,
                      label: "Offline Meetups",
                      desc: "City-based founder meetups in Delhi, Mumbai, Bangalore — meet your cohort IRL.",
                      when: "Late 2026",
                      color: "border-violet-500/20 bg-violet-500/5",
                    },
                    {
                      icon: <Users className="w-5 h-5 text-cyan-400" />,
                      label: "Founder Sports Days",
                      desc: "Cricket, football, bowling — build friendships and find co-founders away from screens.",
                      when: "2026",
                      color: "border-cyan-500/20 bg-cyan-500/5",
                    },
                    {
                      icon: <Trophy className="w-5 h-5 text-amber-400" />,
                      label: "Sprint Demo Days",
                      desc: "In-person events where members pitch what they built during the ₹10K sprint.",
                      when: "2026",
                      color: "border-amber-500/20 bg-amber-500/5",
                    },
                    {
                      icon: <Zap className="w-5 h-5 text-emerald-400" />,
                      label: "Founding Member Perks",
                      desc: "Members who join now get priority access to all offline events — for life.",
                      when: "Always",
                      color: "border-emerald-500/20 bg-emerald-500/5",
                    },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-2xl border p-5 ${item.color} flex gap-4 items-start`}>
                      <div className="w-10 h-10 rounded-xl neu-convex flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">{item.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">{item.when}</span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Founder note */}
                <div className="neu-flat rounded-2xl p-5 flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center shrink-0 text-sm font-bold">PB</div>
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="text-foreground font-medium">A note from Prithal —</span> &quot;These aren&apos;t just ideas. I&apos;ve already started planning the first meetup. The people who join early are the ones who will shape what this becomes — and they&apos;ll always get first access to everything we build.&quot;
                    </p>
                  </div>
                </div>

              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════ Who This Is For ═══════════════ */}
        <div id="who">
          <WhoThisIsFor />
        </div>

        {/* CTA after Who This Is For */}
        <div className="py-4">
          <CTAStrip text="Spots are limited per cohort. Don't miss the next sprint." buttonText="Join Now — ₹2,999" />
        </div>

        {/* ═══════════════ FAQ ═══════════════ */}
        <div id="faq">
          <FAQSection />
        </div>

        {/* ═══════════════ Waitlist Form ═══════════════ */}
        <section id="apply" className="py-16 md:py-24 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal variant="fade-up" duration={800}>
                <div className="text-center mb-12 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Founding Member Applications Open
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Become a Founding Member</h2>
                  <p className="text-muted-foreground">
                    We&apos;re onboarding our first <span className="text-foreground font-semibold">50 founding members</span>. You could be one of them. Takes 2 minutes — pay after and get instant access.
                  </p>
                  {/* Founding member counter */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <div className="flex-1 max-w-[200px] h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-[50%] rounded-full bg-gradient-to-r from-amber-500 to-amber-400" />
                    </div>
                    <span className="text-sm font-semibold text-amber-400">25 / 50</span>
                    <span className="text-xs text-muted-foreground">spots filled</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="scale-up" delay={200} duration={1000}>
                <GlowingCard className="p-5 md:p-10">
                  <WaitlistForm />
                </GlowingCard>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="relative z-10 py-10 mt-12 border-t border-foreground/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-8">
            {/* Logo + tagline */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <Image src="/logo-icon.png" alt="Founders Wing" width={22} height={22} className="object-contain" />
                <span className="font-semibold tracking-tight">Founders Wing</span>
              </div>
              <p className="text-sm text-muted-foreground">Where aspiring founders stop overthinking and start building.</p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
              <Link href="https://twitter.com/founderswing" className="hover:text-foreground transition-colors">
                Twitter
              </Link>
              <Link href="https://linkedin.com/company/founderswing" className="hover:text-foreground transition-colors">
                LinkedIn
              </Link>
              <Link href="https://youtube.com/@founderswing" className="hover:text-foreground transition-colors">
                YouTube
              </Link>
              <Link href="mailto:hello@founderswing.com" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-foreground/5 flex flex-col items-center gap-3 md:flex-row md:justify-between text-xs text-muted-foreground">
            <p>&copy; 2026 Founders Wing. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
