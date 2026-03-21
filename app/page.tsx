'use client';

import { useState } from "react"
import { ArrowRight, Sparkles, Menu, X } from "lucide-react"
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
import { WingMeshLogo } from "@/components/logo"
import { MeetFounder } from "@/components/meet-founder"
import { CTAStrip } from "@/components/cta-strip"

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
            <WingMeshLogo size={28} />
            <span className="font-semibold tracking-tight">Founders Wing</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#community" className="hover:text-foreground transition-colors">
              Community
            </Link>
            <Link href="#who" className="hover:text-foreground transition-colors">
              Who It&apos;s For
            </Link>
            <Link href="#events" className="hover:text-foreground transition-colors">
              Events
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
            }}>Join Waitlist</a>
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
            { label: "Community", id: "community" },
            { label: "Who It's For", id: "who" },
            { label: "Events", id: "events" },
            { label: "FAQ", id: "faq" },
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
            className="mt-3 w-full rounded-full neu-button-primary h-12 text-base font-medium transition-colors"
            onClick={() => scrollTo("apply")}
          >
            Join the Waitlist
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
                  Q2 2026 Cohort · 50 Spots · Invite-Only
                </div>
              </ScrollReveal>

              {/* Headline */}
              <ScrollReveal variant="fade-up" delay={400} duration={1200}>
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                    AI is moving fast.
                    <br />
                    <span className="text-gradient-cyan">You shouldn&apos;t figure it out alone.</span>
                  </h1>
                </div>
              </ScrollReveal>

              {/* Subtitle */}
              <ScrollReveal variant="blur-in" delay={700} duration={1000}>
                <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
                  Join 50 vetted founders sharing what actually works in AI — strategies, tools, and honest playbooks. No hype.
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
                  <p className="text-sm text-muted-foreground">Rolling admissions · Every application reviewed personally</p>
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
                      From a community of <span className="text-foreground font-medium">5,000+ founders</span>
                    </p>
                  </div>

                  {/* Stats strip — always horizontal */}
                  <div className="inline-flex items-center gap-3 md:gap-8 px-4 py-2.5 md:px-8 md:py-4 neu-flat rounded-full text-sm">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-base md:text-xl font-extrabold text-foreground tracking-tighter tabular-nums">
                        <AnimatedCounter value={50} />
                      </span>
                      <span className="text-[10px] md:text-xs text-muted-foreground">/quarter</span>
                    </div>

                    <div className="w-px h-3 md:h-4 bg-white/10"></div>

                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-base md:text-xl font-extrabold text-foreground tracking-tighter">Vetted</span>
                    </div>

                    <div className="w-px h-3 md:h-4 bg-white/10"></div>

                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-base md:text-xl font-extrabold text-foreground tracking-tighter">&#8377;1,999<span className="text-sm md:text-base text-muted-foreground/50">+</span></span>
                      <span className="text-[10px] md:text-xs text-muted-foreground">/mo</span>
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
                <VideoEmbed videoId="rmdRVCFeOA0" />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════ Meet the Founder ═══════════════ */}
        <MeetFounder />

        {/* ═══════════════ Social Proof ═══════════════ */}
        <SocialProof />

        {/* CTA after social proof */}
        <div className="py-4">
          <CTAStrip text="50 spots per quarter. Applications open now." buttonText="Apply to Join" />
        </div>

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
                  Stop guessing which AI tools matter. Get real answers from founders who&apos;ve already tested, deployed, and scaled.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={200} duration={1000}>
              <InteractiveBento />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════ Who This Is For ═══════════════ */}
        <div id="who">
          <WhoThisIsFor />
        </div>

        {/* CTA after Who This Is For */}
        <div className="py-4">
          <CTAStrip text="Sound like you? Let's talk." buttonText="Start Your Application" />
        </div>

        {/* ═══════════════ Offline Experiences ═══════════════ */}
        <section id="events" className="py-16 md:py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal variant="fade-left" duration={800}>
              <div className="mb-16">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                  <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Offline Meetups &amp; Experiences</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-400 whitespace-nowrap w-fit">
                    Coming Q3 2026
                  </span>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  Once the online community is thriving, we bring founders together IRL. Starting in Bangalore with intimate, curated gatherings — not conferences.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={200} duration={800}>
              <ExpandableGallery />
            </ScrollReveal>
          </div>
        </section>

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
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Join the Waitlist</h2>
                  <p className="text-muted-foreground">
                    We review every application personally. We care less about resumes and more about what you&apos;re building with AI, how you think, and whether you&apos;ll actively contribute to the community.
                  </p>
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
                <WingMeshLogo size={22} />
                <span className="font-semibold tracking-tight">Founders Wing</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-first founder community. Invite-only.</p>
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
