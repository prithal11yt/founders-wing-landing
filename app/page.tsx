'use client';

import { useState } from "react"
import { ArrowRight, Sparkles, Menu, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VisionRoadmap } from "@/components/vision-roadmap"
import { InteractiveBackground } from "@/components/interactive-background"
import { InteractiveBento } from "@/components/interactive-bento"
import { ExpandableGallery } from "@/components/expandable-gallery"
import { GlowingCard } from "@/components/glowing-card"
import { WaitlistForm } from "@/components/waitlist-form"
import { VideoEmbed } from "@/components/video-embed"
import { WhoThisIsFor } from "@/components/who-this-is-for"
import { AIPulse } from "@/components/ai-pulse"
import { ScrollReveal, AnimatedCounter, TextReveal, Parallax } from "@/components/scroll-reveal"
import { ScrollProgress } from "@/components/scroll-progress"
import { MagneticButton } from "@/components/magnetic-button"

import { CanvasCursorTrail } from "@/components/canvas-cursor-trail"

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
      <CanvasCursorTrail />
      {/* Navigation */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-50 neu-convex rounded-full px-2 py-1">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 neu-flat rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-accent-cyan rounded-full shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            </div>
            <span className="font-semibold tracking-tight">Founders Wing</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#vision" className="hover:text-foreground transition-colors">
              Vision
            </Link>
            <Link href="#community" className="hover:text-foreground transition-colors">
              Community
            </Link>
            <Link href="#events" className="hover:text-foreground transition-colors">
              Events
            </Link>
            <Link href="#apply" className="hover:text-foreground transition-colors">
              Waitlist
            </Link>
          </nav>
          <MagneticButton strength={0.4}>
            <Button
              asChild
              variant="outline"
              className="hidden md:inline-flex border-foreground/10 hover:bg-foreground hover:text-background transition-all bg-transparent"
            >
              <a href="#apply" onClick={(e) => {
                e.preventDefault()
                document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })
              }}>Join Waitlist</a>
            </Button>
          </MagneticButton>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out border-t border-foreground/5 bg-background/95 backdrop-blur-xl ${mobileMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <nav className="flex flex-col px-6 py-4 gap-1">
            {[
              { label: "Vision", id: "vision" },
              { label: "Community", id: "community" },
              { label: "Events", id: "events" },
              { label: "Waitlist", id: "apply" },
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
              className="mt-3 w-full rounded-full bg-foreground text-background hover:bg-muted hover:text-foreground h-12 text-base font-medium transition-colors"
              onClick={() => scrollTo("apply")}
            >
              Join the Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ═══════════════ Hero Section ═══════════════ */}
        <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">

          {/* Subtle radial gradient overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(2,132,199,0.06) 0%, transparent 70%)',
          }} />

          {/* Glassmorphism floating pills */}
          <div className="absolute top-32 left-[8%] hidden lg:flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/30 border border-white/40 shadow-lg animate-float text-xs font-medium text-foreground/70 select-none z-20" style={{ animationDelay: '0s' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
            12 founders online
          </div>
          <div className="absolute top-52 right-[10%] hidden lg:flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/30 border border-white/40 shadow-lg animate-float text-xs font-medium text-foreground/70 select-none z-20" style={{ animationDelay: '2s' }}>
            <span className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_6px_rgba(2,132,199,0.6)]" />
            New AI deep dive starting
          </div>
          <div className="absolute bottom-24 left-[12%] hidden lg:flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/30 border border-white/40 shadow-lg animate-float text-xs font-medium text-foreground/70 select-none z-20" style={{ animationDelay: '4s' }}>
            🔥 3 new playbooks this week
          </div>
          <div className="container mx-auto px-4 relative z-10 pointer-events-none">
            <div className="max-w-4xl mx-auto text-center space-y-8 pointer-events-auto">
              {/* Badge */}
              <ScrollReveal variant="fade-down" delay={200} duration={1000}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl neu-pressed text-xs font-medium text-muted-foreground select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan"></span>
                  </span>
                  Invite-only • Paid • Only accepting 50 members every quarter
                </div>
              </ScrollReveal>

              {/* Headline — word-by-word reveal */}
              <ScrollReveal variant="fade-up" delay={400} duration={1200}>
                <div className="space-y-2">
                  <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-muted-foreground tracking-tight">
                    Every founder needs a wing.
                  </p>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
                    <span className="text-gradient-animated">
                      This is yours.
                    </span>
                  </h1>
                </div>
              </ScrollReveal>

              {/* Subtitle */}
              <ScrollReveal variant="blur-in" delay={700} duration={1000}>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
                  A private, paid community for founders who want to learn, network, and stay ahead of the curve in the age of AI.
                </p>
              </ScrollReveal>

              {/* CTA */}
              <ScrollReveal variant="fade-up" delay={1000} duration={800}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <MagneticButton strength={0.25}>
                    <Button
                      size="lg"
                      className="rounded-full px-8 h-13 text-base font-semibold neu-button-primary shadow-[0_0_30px_rgba(2,132,199,0.4),0_0_60px_rgba(2,132,199,0.15)]"
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      Join the Waitlist
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </MagneticButton>
                  <p className="text-sm text-muted-foreground">Rolling admissions • We review every application personally</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
          {/* Bottom gradient fade for smooth transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20" style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--bg-color) 100%)',
          }} />
        </section>

        <div className="section-divider" />

        {/* ═══════════════ Video Section ═══════════════ */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal variant="fade-up" duration={800}>
              <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">See What We&apos;re Building</h2>
                <p className="text-muted-foreground">
                  Understand who this community is for and what makes us different.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="scale-up" delay={200} duration={1000}>
              <div className="neu-flat p-2 rounded-[2rem]">
                <VideoEmbed videoId="rmdRVCFeOA0" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════════════ Vision Section ═══════════════ */}
        <section id="vision" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8 mb-20">
              <ScrollReveal variant="scale-up" duration={600}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl neu-convex mb-4">
                  <Sparkles className="w-6 h-6 text-accent-cyan drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={100} duration={800}>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Our Vision</h2>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={200} duration={800}>
                <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                  <p>
                    Founders Wing exists because AI is reshaping every industry — and the founders who understand it first will win.
                  </p>
                  <p>
                    This is where builders come to discuss what&apos;s actually working in AI, share real implementation strategies, and help each other stay ahead — not just react.
                  </p>
                  <p className="text-foreground font-medium">In the AI era, your network is your unfair advantage.</p>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="fade-up" delay={300} duration={800}>
              <VisionRoadmap />
            </ScrollReveal>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════════════ Who This Is For ═══════════════ */}
        <WhoThisIsFor />

        {/* ═══════════════ AI Pulse ═══════════════ */}
        <AIPulse />

        <div className="section-divider" />

        {/* ═══════════════ Philosophy Section ═══════════════ */}
        <section className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto space-y-8">
              <ScrollReveal variant="fade-up" duration={800}>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  Not for everyone. <br />
                  <span className="text-gradient-cyan">Just for builders who get AI.</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={150} duration={800}>
                <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                  <div className="neu-pressed rounded-3xl p-8 space-y-4">
                    <p className="font-semibold text-foreground text-xl">This is a Paid, Invite-Only Community</p>
                    <p>
                      Founders Wing is intentionally paid. We charge to keep the bar high, the conversations deeply technical, and the community free from noise. Membership fees directly fund AI workshops, curated tooling, and member-only deep dives.
                    </p>
                    <p>
                      This community is not for passive observers or AI tourists. It&apos;s for founders who are actively building with AI and willing to both share and learn from others doing the same.
                    </p>
                  </div>

                  <p>
                    We design for relationships that compound — founders who push each other to stay ahead, not just stay informed.
                  </p>
                  <p>
                    The best AI strategies come from honest conversation between peers who are actively deploying. No hype threads. No passive scrolling. Just real founders sharing real playbooks.
                  </p>
                </div>
              </ScrollReveal>

              {/* Animated Stats */}
              <ScrollReveal variant="fade-up" delay={300} duration={800} staggerChildren={150} className="grid sm:grid-cols-3 gap-6 pt-4">
                <div className="rounded-3xl neu-flat neu-interactive p-6 text-center">
                  <p className="text-3xl font-bold text-gradient-cyan">
                    <AnimatedCounter value={50} />
                  </p>
                  <p className="text-sm font-medium text-foreground mt-2">New members per quarter</p>
                  <p className="text-xs text-muted-foreground mt-1">Rolling admissions</p>
                </div>
                <div className="rounded-3xl neu-flat neu-interactive p-6 text-center">
                  <p className="text-3xl font-bold text-gradient-cyan">AI-first</p>
                  <p className="text-sm font-medium text-foreground mt-2">Founders only</p>
                  <p className="text-xs text-muted-foreground mt-1">No tourists, no lurkers</p>
                </div>
                <div className="rounded-3xl neu-flat neu-interactive p-6 text-center">
                  <p className="text-3xl font-bold text-gradient-cyan">₹1,999+</p>
                  <p className="text-sm font-medium text-foreground mt-2">Per month</p>
                  <p className="text-xs text-muted-foreground mt-1">Varies by access tier</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════════════ Community Structure ═══════════════ */}
        <section id="community" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-up" duration={800}>
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Two Worlds, One Community</h2>
                <p className="text-muted-foreground">
                  Your online AI command center and curated in-person experiences designed for depth, not scale.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={200} duration={1000}>
              <InteractiveBento />
            </ScrollReveal>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════════════ Physical Events ═══════════════ */}
        <section id="events" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-left" duration={800}>
              <div className="mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Curated Experiences</h2>
                <p className="text-muted-foreground max-w-2xl">
                  These aren&apos;t conferences. They&apos;re shared experiences designed to turn peers into collaborators.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={200} duration={800}>
              <ExpandableGallery />
            </ScrollReveal>
          </div>
        </section>

        <div className="section-divider" />

        {/* ═══════════════ Waitlist Form ═══════════════ */}
        <section id="apply" className="py-24 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <ScrollReveal variant="fade-up" duration={800}>
                <div className="text-center mb-12 space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Join the Waitlist</h2>
                  <p className="text-muted-foreground">
                    We review every application personally. We care less about resumes and more about what you&apos;re building with AI, how you think, and whether you&apos;ll actively contribute to the community.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="scale-up" delay={200} duration={1000}>
                <GlowingCard className="p-8 md:p-10">
                  <WaitlistForm />
                </GlowingCard>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 overflow-hidden py-10 mt-12 bg-background">
        {/* Top bar — links & copyright */}
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
          <p>© 2026 Founders Wing. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              LinkedIn
            </Link>
            <Link href="mailto:hello@founderswing.com" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>

        {/* Giant brand name */}
        <ScrollReveal variant="fade-up" duration={800}>
          <div className="container mx-auto px-4 pb-8 md:pb-12">
            <h2
              className="text-[15vw] md:text-[12vw] font-extrabold leading-[0.85] tracking-tighter text-center select-none"
              style={{
                background: 'linear-gradient(180deg, rgba(30,41,59,0.18) 0%, rgba(30,41,59,0.03) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Founders Wing
            </h2>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  )
}
