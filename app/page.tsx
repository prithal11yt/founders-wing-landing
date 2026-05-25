'use client';

import { useState, useEffect } from "react"
import { ArrowRight, Sparkles, Menu, X, MapPin, Users, Zap, Trophy, Youtube } from "lucide-react"
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

function useRandomSpots() {
  const [spots, setSpots] = useState(32)
  useEffect(() => {
    setSpots(Math.floor(Math.random() * (44 - 25 + 1)) + 25)
  }, [])
  return spots
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const spotsCount = useRandomSpots()

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
                      Get Membership
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </MagneticButton>
                  <p className="text-sm text-muted-foreground">No fluff, no courses — just founders helping founders</p>
                </div>
              </ScrollReveal>

              {/* Mini social proof in hero */}
              <ScrollReveal variant="fade-up" delay={1200} duration={800}>
                <div className="flex flex-col items-center gap-3 md:gap-4">
                  {/* Avatar row + channel pills */}
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="flex -space-x-2.5">
                        {[
                          { src: '/avatar-ind-1.jpg', alt: 'Member 1' },
                          { src: '/avatar-ind-2.jpg', alt: 'Member 2' },
                          { src: '/avatar-ind-3.jpg', alt: 'Member 3' },
                          { src: '/avatar-ind-4.jpg', alt: 'Member 4' },
                          { src: '/avatar-ind-5.jpg', alt: 'Member 5' },
                        ].map(({ src, alt }, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={alt}
                            src={src}
                            alt={alt}
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-background object-cover"
                            style={{ zIndex: 5 - i }}
                          />
                        ))}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Joined our community
                      </p>
                    </div>

                    {/* Channel stat pills */}
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-red-500/10 border-red-500/20 text-xs font-medium">
                        <Youtube className="w-3 h-3 text-red-400" />
                        <span className="font-bold text-red-400">36K+</span>
                        <span className="text-muted-foreground">Subscribers</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-amber-500/10 border-amber-500/20 text-xs font-medium">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                        </span>
                        <span className="font-bold text-amber-400">{spotsCount}</span>
                        <span className="text-muted-foreground">Founding Members</span>
                      </div>
                    </div>
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
                      <span className="text-base md:text-xl font-extrabold text-foreground tracking-tighter">From &#8377;2,999</span>
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
                  A 10-minute deep dive from Prithal — what Founders Wing is, who it&apos;s for, and why he built it.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="scale-up" delay={200} duration={1000}>
              <div className="neu-flat p-2 rounded-[2rem]">
                <div className="relative w-full rounded-[1.5rem] overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <iframe
                    src="https://www.youtube.com/embed/xegX8Ul_hGk"
                    title="What Is Founders Wing?"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
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
          <CTAStrip text="Spots are limited per cohort. Don't miss the next sprint." buttonText="Get Membership" />
        </div>

        {/* ═══════════════ FAQ ═══════════════ */}
        <div id="faq">
          <FAQSection />
        </div>

        {/* ═══════════════ Waitlist Form ═══════════════ */}
        <section id="apply" className="pt-16 pb-12 md:pt-20 md:pb-16 relative">
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
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${(spotsCount / 50) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-amber-400">{spotsCount} / 50</span>
                    <span className="text-xs text-muted-foreground">spots filled</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="scale-up" delay={200} duration={1000}>
                <GlowingCard className="p-5 md:p-10">
                  <WaitlistForm spotsCount={spotsCount} />
                </GlowingCard>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════ Explore Resources ═══════════════ */}
      <section className="relative z-10 py-10 border-t border-foreground/5">
        <div className="container mx-auto px-4">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-5">Explore Resources</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {[
              { href: '/community/founder-community-india', label: 'Founder Community India' },
              { href: '/guide/how-to-make-first-money-online-india', label: 'Make First Money Online' },
              { href: '/tools/ai-tools-for-founders-india', label: 'AI Tools for Founders' },
              { href: '/challenge/first-10k-challenge-india', label: '₹10K Challenge India' },
              { href: '/community/ai-founder-community', label: 'AI Founder Community' },
              { href: '/guide/how-to-start-online-business-india', label: 'Start Online Business India' },
              { href: '/guide/online-business-ideas-india-2025', label: 'Online Business Ideas 2025' },
              { href: '/community/entrepreneur-community-india', label: 'Entrepreneur Community India' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ Footer ═══════════════ */}
      <footer className="relative z-10 py-10 border-t border-foreground/5">
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
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="https://www.linkedin.com/in/prithal-bhardwaj-058a56187/" target="_blank" className="hover:text-foreground transition-colors">
                LinkedIn
              </Link>
              <Link href="https://youtube.com/@thesoloentrepreneur07" target="_blank" className="hover:text-foreground transition-colors">
                YouTube
              </Link>
              <Link href="mailto:prithalbhardwaj@gmail.com" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-foreground/5 flex flex-col items-center gap-3 md:flex-row md:justify-between text-xs text-muted-foreground">
            <p>&copy; 2026 Founders Wing. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
