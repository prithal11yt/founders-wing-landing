"use client"

import { Globe, MessageSquare, Video, BookOpen, Brain, Network, Wrench, Zap, Target, Gift, Newspaper, Users } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

function CursorGlow({ x, y, active, color = "rgba(2,132,199,0.15)" }: { x: number; y: number; active: boolean; color?: string }) {
  return (
    <div
      className="absolute pointer-events-none z-0 transition-opacity duration-300"
      style={{
        left: x - 200,
        top: y - 200,
        width: 400,
        height: 400,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity: active ? 1 : 0,
      }}
    />
  )
}

const topFeatures = [
  {
    icon: Video,
    label: "Weekly Live Sessions with Prithal",
    desc: "Every week, join a live call where Prithal breaks down AI tools, answers your questions, and helps you get unstuck. Not a webinar — a real conversation.",
    color: "text-cyan-400",
    tag: "26 sessions/year",
  },
  {
    icon: Target,
    label: '"First ₹10K" 30-Day Challenge',
    desc: "A structured, step-by-step challenge to help you pick an idea, build it with AI, and earn your first ₹10,000. No theory — just action with deadlines.",
    color: "text-emerald-400",
    tag: "Flagship program",
  },
]

const includedFeatures = [
  {
    icon: Gift,
    label: "₹299 Business Ideas Ebook — Free",
    desc: "50 AI-powered business ideas you can start this weekend. Normally sold for ₹299 — yours free as a member.",
    color: "text-amber-400",
  },
  {
    icon: Wrench,
    label: "Templates, Automations & Workflows",
    desc: "Copy-paste business kits: pricing templates, client outreach scripts, AI tool setups — ready to use, not theory.",
    color: "text-violet-400",
  },
  {
    icon: Newspaper,
    label: "AI News & How-To Guides",
    desc: "Weekly curated AI updates that matter for business. Plus guides on building products, getting sales, and using AI to move faster.",
    color: "text-blue-400",
  },
  {
    icon: Network,
    label: "Accountability Buddy System",
    desc: "Get paired with a founder at your stage. Weekly check-ins, shared goals, and someone who won't let you quit.",
    color: "text-rose-400",
  },
  {
    icon: Brain,
    label: "AI Tool of the Week",
    desc: "Every week we test one AI tool and share exactly how to make money with it — before it hits mainstream.",
    color: "text-accent-cyan",
  },
  {
    icon: Users,
    label: "Hot Seat Coaching",
    desc: "Get picked during live calls for 1-on-1 problem solving. Prithal and the community help you break through your blockers.",
    color: "text-emerald-400",
  },
]

export function InteractiveBento() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 0, y: 0, active: false })

  const handleCardMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setGlow({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Hero features — 2 big cards */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {topFeatures.map((feature, i) => (
          <div
            key={feature.label}
            ref={i === 0 ? cardRef : undefined}
            onMouseMove={i === 0 ? handleCardMouseMove : undefined}
            onMouseLeave={i === 0 ? () => setGlow(prev => ({ ...prev, active: false })) : undefined}
            className={cn(
              "group relative rounded-3xl neu-flat p-6 md:p-8 overflow-hidden transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
            )}
            style={{ transitionDelay: isVisible ? `${i * 150}ms` : '0ms' }}
          >
            {i === 0 && <CursorGlow x={glow.x} y={glow.y} active={glow.active} color="rgba(2,132,199,0.12)" />}

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={cn("w-6 h-6", feature.color)} />
                </div>
                <span className={cn(
                  "text-xs font-medium px-3 py-1 rounded-full border",
                  i === 0 ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                )}>
                  {feature.tag}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{feature.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Community Hub Card */}
      <div className={cn(
        "rounded-3xl neu-flat p-6 md:p-8 transition-all duration-700 delay-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}>
        <div className="flex items-start gap-4 md:gap-6 mb-6">
          <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg md:text-xl font-bold text-foreground">Private Community Hub</h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                Live
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dedicated channels for business ideas, AI tools, progress updates, and wins. This is where the action happens daily.
            </p>
          </div>
        </div>

        {/* Mini feature pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: MessageSquare, label: "Founder Channels", desc: "Ideas, wins & challenges" },
            { icon: BookOpen, label: "Resource Library", desc: "Playbooks & templates" },
            { icon: Video, label: "Session Replays", desc: "Never miss a session" },
          ].map((feature, i) => (
            <div
              key={feature.label}
              className={cn(
                "rounded-2xl neu-pressed p-4 transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              )}
              style={{ transitionDelay: isVisible ? `${500 + i * 100}ms` : "0ms" }}
            >
              <feature.icon className="w-4 h-4 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-foreground leading-tight">{feature.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid — 6 cards */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-700 delay-400",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}>
        {includedFeatures.map((feature, i) => (
          <div
            key={feature.label}
            className={cn(
              "rounded-2xl neu-flat p-5 md:p-6 transition-all duration-500 group hover:border-white/10",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: isVisible ? `${600 + i * 80}ms` : "0ms" }}
          >
            <div className="w-10 h-10 rounded-xl neu-convex flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <feature.icon className={cn("w-5 h-5", feature.color)} />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">{feature.label}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
