"use client"

import { Globe, MessageSquare, Video, BookOpen, Brain, Network, Wrench, Zap } from "lucide-react"
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

const includedFeatures = [
  {
    icon: Brain,
    label: "Weekly AI Breakdowns",
    desc: "Which AI tools actually help you make money? We break down one tool or strategy every week — with real use cases",
    color: "text-accent-cyan",
  },
  {
    icon: Network,
    label: "Accountability Groups",
    desc: "Get matched with 4-5 founders at your stage. Weekly check-ins so you stop planning and start doing",
    color: "text-blue-400",
  },
  {
    icon: Wrench,
    label: "AI Business Playbooks",
    desc: "Step-by-step templates to launch your first AI-powered service, product, or income stream",
    color: "text-violet-400",
  },
  {
    icon: Zap,
    label: "Direct Access to Prithal",
    desc: "Monthly live Q&As, community posts, and direct feedback on your ideas from someone who's been there",
    color: "text-amber-400",
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
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="space-y-8">
      {/* Primary: Online Hub Card */}
      <div
        className={cn(
          "transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        )}
      >
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={() => setGlow(prev => ({ ...prev, active: false }))}
          className="group relative rounded-3xl neu-flat p-5 md:p-10 overflow-hidden"
        >
          <CursorGlow x={glow.x} y={glow.y} active={glow.active} color="rgba(2,132,199,0.12)" />

          <div className="relative z-10">
            {/* "Live" badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-400 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Active Now
            </div>

            <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl neu-convex flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2 text-foreground">
                  The Community Hub
                </h3>
                <p className="text-muted-foreground text-sm md:text-lg leading-relaxed max-w-2xl">
                  A private space where aspiring founders share progress, ask questions, and help each other launch — powered by AI tools and real accountability.
                </p>
              </div>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: MessageSquare, label: "Founder Channels", desc: "Ideas, wins & challenges" },
                { icon: Video, label: "Weekly AI Sessions", desc: "Live tool walkthroughs" },
                { icon: BookOpen, label: "Launch Playbooks", desc: "Step-by-step templates" },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className={cn(
                    "rounded-2xl neu-pressed p-4 transition-all duration-500 flex flex-col items-start justify-start h-full",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: isVisible ? `${400 + i * 100}ms` : "0ms" }}
                >
                  <feature.icon className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-sm font-medium text-foreground leading-tight">{feature.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Sample message */}
            <div className="rounded-2xl neu-flat p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full neu-convex flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-emerald-400 font-bold">R</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rohan · 2min ago</p>
                  <p className="text-sm text-foreground leading-snug">Finally launched my AI content service last week after 3 months of overthinking. Got my first paying client yesterday. This community pushed me to just start. 🚀</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Included — 4 feature cards from Vision pillars */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 delay-200",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}>
        {includedFeatures.map((feature, i) => (
          <div
            key={feature.label}
            className={cn(
              "rounded-2xl neu-flat p-6 transition-all duration-500 group hover:border-white/10",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: isVisible ? `${500 + i * 100}ms` : "0ms" }}
          >
            <div className={cn("w-10 h-10 rounded-xl neu-convex flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300")}>
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
