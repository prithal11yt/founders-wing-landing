'use client';

import { ArrowRight, Users, Sparkles } from "lucide-react"
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
import { WhatItFeelsLike } from "@/components/what-it-feels-like"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <InteractiveBackground />
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-full" />
            </div>
            <span className="font-semibold tracking-tight">Founders Wing</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="#vision" className="hover:text-white transition-colors">
              Vision
            </Link>
            <Link href="#community" className="hover:text-white transition-colors">
              Community
            </Link>
            <Link href="#events" className="hover:text-white transition-colors">
              Events
            </Link>
            <Link href="#apply" className="hover:text-white transition-colors">
              Waitlist
            </Link>
          </nav>
          <Button
            asChild
            variant="outline"
            className="hidden md:inline-flex border-white/10 hover:bg-white hover:text-black transition-all bg-transparent"
          >
            <a href="#apply" onClick={(e) => {
              e.preventDefault()
              document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })
            }}>Join Waitlist</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 animate-in fade-in slide-in-from-bottom-4 duration-1000 hover:bg-white/10 transition-colors cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Invite-only • Paid • Only accepting 50 members every quarter                
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                Build in good <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600 animate-pulse">
                  company.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                A private, paid community for founders who are actively building and take the work seriously.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-base bg-white text-black hover:bg-zinc-200"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Join the Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-sm text-zinc-500">Rolling admissions • We review every application personally</p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-24 border-t border-white/5 bg-black relative">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">See What We're Building</h2>
              <p className="text-zinc-400">
                Understand who this community is for and what makes us different.
              </p>
            </div>
            <VideoEmbed videoId="rmdRVCFeOA0" />
          </div>
        </section>

        {/* Vision Section */}
        <section id="vision" className="py-24 border-t border-white/5 bg-zinc-950/50 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8 mb-20">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Our Vision</h2>
              <div className="space-y-6 text-lg md:text-xl text-zinc-400 leading-relaxed">
                <p>
                  Founders Wing exists because building a company requires a different kind of support.
                </p>
                <p>
                  This is a space where founders can speak honestly about revenue pressure, co-founder tension, hiring mistakes, and uncertainty—without judgment or performative networking.
                </p>
                <p className="text-white font-medium">We believe trust compounds faster than content.</p>
              </div>
            </div>

            <VisionRoadmap />
          </div>
        </section>

        {/* Who This Is For Section */}
        <WhoThisIsFor />

        {/* What It Feels Like Section */}
        <WhatItFeelsLike />

        {/* Philosophy Section */}
        <section className="py-24 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Not for everyone. <br />
                  <span className="text-zinc-500">Just for builders.</span>
                </h2>
                <div className="space-y-6 text-lg text-zinc-400 leading-relaxed">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 space-y-3">
                    <p className="font-semibold text-white">This is a Paid, Invite-Only Community</p>
                    <p>
                      Founders Wing is intentionally paid. We charge to keep the bar high, the conversations honest, and the community free from noise. Membership fees directly fund facilitation, tooling, and curated member-only experiences.
                    </p>
                    <p>
                      This community is not for students, early idea-stage explorers, or people looking to 'network.' It is for founders who are actively building and willing to both give and receive help.
                    </p>
                    <p className="text-sm text-blue-300">
                      Membership typically ranges from ₹1,999 to ₹4,999+ per month, depending on access and involvement.
                    </p>
                  </div>

                  <p>
                    We design for relationships that last years, not events that last hours.
                  </p>
                  <p>
                    The best learning happens through honest conversation between peers who are actively building. No sales pitches. No passive listening. Just real founders helping each other win.
                  </p>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs text-zinc-500"
                        >
                          <Users className="w-4 h-4" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-zinc-500">Curated members only</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 p-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer" />
                <img
                  src="/group-of-diverse-founders-collaborating-in-modern-.jpg"
                  alt="Founders collaborating"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Community Structure */}
        <section id="community" className="py-24 bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Two Worlds, One Community</h2>
              <p className="text-zinc-400">
                Your online operating room and curated in-person gatherings designed for depth, not scale.
              </p>
            </div>

            <InteractiveBento />
          </div>
        </section>

        {/* Physical Events Detail */}
        <section id="events" className="py-24 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Curated Experiences</h2>
              <p className="text-zinc-400 max-w-2xl">
                These aren't conferences. They're shared experiences designed to turn peers into friends.
              </p>
            </div>

            <ExpandableGallery />
          </div>
        </section>

        {/* Waitlist Form */}
        <section id="apply" className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-black pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Join the Waitlist</h2>
                <p className="text-zinc-400">
                  We review every application personally. We care less about resumes and more about what you're building, how you think, and whether you'll actively contribute to the community.
                </p>
              </div>

              <GlowingCard className="p-8 md:p-10">
                <WaitlistForm />
              </GlowingCard>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black text-zinc-500 text-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 Founders Wing. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Twitter
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              LinkedIn
            </Link>
            <Link href="mailto:hello@founderswing.com" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
