"use client"

import { Globe, Users, ArrowRight, MessageSquare, Video, BookOpen, Utensils, MapPin, Calendar } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import Tilt from "react-parallax-tilt"

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

export function InteractiveBento() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const [glow1, setGlow1] = useState({ x: 0, y: 0, active: false })
  const [glow2, setGlow2] = useState({ x: 0, y: 0, active: false })

  const handleCardMouseMove = useCallback((e: React.MouseEvent, cardRef: React.RefObject<HTMLDivElement | null>, setter: typeof setGlow1) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setter({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true })
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
    <div ref={sectionRef} className="grid md:grid-cols-2 gap-8">
      {/* Online Community — Primary / Active Now */}
      <Tilt
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        glareEnable={true}
        glareMaxOpacity={0.08}
        glareColor="#ffffff"
        glarePosition="all"
        glareBorderRadius="1.5rem"
        scale={1.02}
        transitionSpeed={1200}
        className={cn(
          "transition-all duration-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        )}
      >
        <div
          ref={card1Ref}
          onMouseMove={(e) => handleCardMouseMove(e, card1Ref, setGlow1)}
          onMouseLeave={() => setGlow1(prev => ({ ...prev, active: false }))}
          className="group relative rounded-3xl neu-flat p-8 md:p-10 overflow-hidden h-full"
        >
          {/* Cursor glow */}
          <CursorGlow x={glow1.x} y={glow1.y} active={glow1.active} color="rgba(2,132,199,0.12)" />

          {/* Content */}
          <div className="relative z-10">
            {/* "Live" badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-medium text-cyan-700 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              Active Now
            </div>

            <div className="w-14 h-14 rounded-2xl neu-convex flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
              <Globe className="w-7 h-7 text-accent-cyan" />
            </div>

            <h3 className="text-3xl font-bold mb-3 text-foreground group-hover:translate-x-1 transition-transform duration-300">
              The Online Hub
            </h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Your AI command center. A private space for real-time AI strategy discussions, tool comparisons, and implementation help from founders actively deploying AI.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: MessageSquare, label: "AI Strategy Channels", desc: "Real-time discussions" },
                { icon: Video, label: "Weekly AI Deep Dives", desc: "Live sessions" },
                { icon: BookOpen, label: "Tool & Prompt Library", desc: "Curated resources" },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className={cn(
                    "rounded-2xl neu-pressed p-4 transition-all duration-500",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: isVisible ? `${400 + i * 100}ms` : "0ms" }}
                >
                  <feature.icon className="w-5 h-5 text-accent-cyan mb-2" />
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Mock chat UI */}
            <div className="rounded-2xl neu-flat p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full neu-convex flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-accent-cyan font-bold">R</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Rohan · 2min ago</p>
                  <p className="text-sm text-foreground">Just deployed a multi-agent workflow that cut our support ticket resolution from 4hrs to 12min. Happy to share the architecture 🔥</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full neu-convex flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-purple-400 font-bold">A</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ananya · just now</p>
                  <p className="text-sm text-foreground">Would love to see that! We&apos;re building something similar for our onboarding flow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tilt>

      {/* Physical Meetups — Coming Soon */}
      <Tilt
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        glareEnable={true}
        glareMaxOpacity={0.08}
        glareColor="#ffffff"
        glarePosition="all"
        glareBorderRadius="1.5rem"
        scale={1.02}
        transitionSpeed={1200}
        className={cn(
          "transition-all duration-700 delay-150",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
        )}
      >
        <div
          ref={card2Ref}
          onMouseMove={(e) => handleCardMouseMove(e, card2Ref, setGlow2)}
          onMouseLeave={() => setGlow2(prev => ({ ...prev, active: false }))}
          className="group relative rounded-3xl neu-flat p-8 md:p-10 overflow-hidden h-full"
        >
          {/* Cursor glow */}
          <CursorGlow x={glow2.x} y={glow2.y} active={glow2.active} color="rgba(147,51,234,0.10)" />

          {/* Content */}
          <div className="relative z-10">
            {/* "Coming Soon" badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-700 mb-8">
              <Calendar className="w-3 h-3" />
              Coming Soon
            </div>

            <div className="w-14 h-14 rounded-2xl neu-convex flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
              <Users className="w-7 h-7 text-purple-400" />
            </div>

            <h3 className="text-3xl font-bold mb-3 text-foreground group-hover:translate-x-1 transition-transform duration-300">
              Physical Meetups
            </h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Once the online community is thriving, we&apos;ll bring founders together IRL. Intimate, curated gatherings designed for depth — not keynotes.
            </p>

            {/* Planned events */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Utensils, label: "AI Demo Days", desc: "Show what you built" },
                { icon: MapPin, label: "City Meetups", desc: "Starting Bangalore" },
                { icon: Users, label: "Build Sessions", desc: "Hack together" },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className={cn(
                    "rounded-2xl neu-pressed p-4 transition-all duration-500",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: isVisible ? `${550 + i * 100}ms` : "0ms" }}
                >
                  <feature.icon className="w-5 h-5 text-purple-400 mb-2" />
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Roadmap hint */}
            <div className="rounded-2xl neu-pressed p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Physical events will be unlocked once we have a strong online foundation.
              </p>
              <p className="text-xs text-muted-foreground mt-2">We design for relationships that last years — not events that last hours.</p>
            </div>
          </div>
        </div>
      </Tilt>
    </div>
  )
}
