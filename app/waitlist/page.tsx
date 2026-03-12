"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { InteractiveBackground } from "@/components/interactive-background"
import { VisionRoadmap } from "@/components/vision-roadmap"
import { GlowingCard } from "@/components/glowing-card"
import { WaitlistForm } from "@/components/waitlist-form"

export default function WaitlistPage() {
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
          <Button
            asChild
            variant="outline"
            className="hidden md:inline-flex border-white/10 hover:bg-white hover:text-black transition-all bg-transparent text-white"
          >
            <Link href="/">Back to Site</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                Limited Spots Available
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                Build Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                  Founder Legacy
                </span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Join a curated community of serious founders building online businesses. Get honest feedback, real
                support, and authentic friendships with people who understand the journey.
              </p>

              <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <a
                  href="#application-form"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("application-form")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <Button size="lg" className="rounded-full px-8 h-12 text-base bg-white text-black hover:bg-zinc-200">
                    Join the Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 border-t border-white/5 bg-zinc-950/50 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8 mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Our Launch Timeline</h2>
              <p className="text-lg text-zinc-400">We're building intentionally. Here's what's coming.</p>
            </div>

            <VisionRoadmap />
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-24 border-t border-white/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 text-center">Why Join?</h2>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Scale Your Business",
                    description:
                      "Connect with founders who understand the unique challenges of building online businesses. Get tactical advice from people doing it right now.",
                  },
                  {
                    title: "Find Your People",
                    description:
                      "Stop networking alone. Meet a curated circle of like-minded builders who share your ambition and values.",
                  },
                  {
                    title: "Move Faster",
                    description:
                      "Access collective wisdom, avoid common pitfalls, and accelerate your growth through direct relationships.",
                  },
                  {
                    title: "Real Support",
                    description:
                      "No BS, no pitches. Just real conversations with founders who are in the trenches building their dreams.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="space-y-4 p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-default"
                  >
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-zinc-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section id="application-form" className="relative py-24 md:py-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Apply to Join</h2>
              <p className="text-zinc-400">
                We review every application personally. Take a few minutes to tell us about yourself and your vision.
              </p>
            </div>

            <GlowingCard className="p-8 md:p-12">
              <WaitlistForm />
            </GlowingCard>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-24 border-t border-white/5 bg-zinc-950/50 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready?</h2>
              <p className="text-lg text-zinc-400">
                We're only accepting a limited number of serious founders. If you're building and ready to be part of
                something special, apply now.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-12 text-base bg-white text-black hover:bg-zinc-200"
              >
                <Link href="#application-form">
                  Apply for Membership
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 bg-black text-zinc-500 text-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2025 Founders Wing. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">
              Main Site
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
