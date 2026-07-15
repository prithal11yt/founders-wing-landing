"use client"

import { Globe, MessageSquare, Video, BookOpen, Brain, Network, Wrench, Target, Users, Check, ArrowRight, FileText, Zap } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

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
    <div ref={sectionRef} className="space-y-5">

      {/* ─── Row 1: Live Sessions | Ebook ─── */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-5">

        {/* Weekly Live Sessions with meeting mockup */}
        <div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={() => setGlow(prev => ({ ...prev, active: false }))}
          className={cn(
            "group relative rounded-3xl neu-flat p-6 md:p-8 overflow-hidden transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
          )}
        >
          <CursorGlow x={glow.x} y={glow.y} active={glow.active} color="rgba(2,132,199,0.12)" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Video className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-cyan-500/10 border-cyan-500/20 text-cyan-600">
                26 sessions/year
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Weekly Live Sessions with Prithal</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Every week, jump on a live call where Prithal breaks down AI tools, answers your specific questions, and helps you get unstuck. Not a webinar — a real conversation with a small group.
            </p>

            {/* Meeting screen mockup */}
            <div className="rounded-xl neu-pressed p-3 mb-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400/60" />
                  <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
                </div>
                <span className="text-[10px] text-muted-foreground/60 ml-1">Founders Wing — Weekly Call</span>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[9px] text-red-600 font-medium">LIVE</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { initials: "PB", label: "Prithal", speaking: true },
                  { initials: "AK", label: "Arjun", speaking: false },
                  { initials: "SM", label: "Sneha", speaking: false },
                  { initials: "RV", label: "Rahul", speaking: false },
                  { initials: "NK", label: "Neha", speaking: false },
                  { initials: "DM", label: "Dev", speaking: false },
                  { initials: "PS", label: "Priya", speaking: false },
                  { initials: "VT", label: "You?", speaking: false },
                ].map((p) => (
                  <div key={p.initials} className={cn(
                    "rounded-lg aspect-video flex flex-col items-center justify-center gap-0.5",
                    p.speaking ? "bg-cyan-500/15 ring-1 ring-cyan-500/50" : "bg-slate-900/[0.05] border border-slate-900/[0.06]"
                  )}>
                    <div className={cn(
                      "w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold",
                      p.speaking ? "bg-cyan-500/30 text-cyan-700" : "bg-slate-900/10 text-slate-600"
                    )}>
                      {p.initials}
                    </div>
                    <span className={cn(
                      "text-[8px] leading-none",
                      p.speaking ? "text-cyan-700" : "text-slate-500"
                    )}>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {["Ask anything — no question too basic", "AI tool demos & walkthroughs", "Recordings available if you miss one"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span className="text-xs text-foreground/70">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 50 Business Ideas Ebook */}
        <div
          className={cn(
            "group relative rounded-3xl neu-flat overflow-hidden transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12",
          )}
          style={{ transitionDelay: isVisible ? '150ms' : '0ms' }}
        >
          <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] h-full">
            <div className="relative bg-gradient-to-br from-amber-100/70 via-slate-100 to-slate-200 flex items-center justify-center p-5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
              <Image
                src="/ebook-cover.png"
                alt="50 Business Ideas Ebook"
                width={160}
                height={240}
                className="rounded-lg group-hover:scale-105 group-hover:rotate-0 transition-all duration-500 -rotate-2 relative z-10"
                style={{ width: 'auto', height: 'auto', maxHeight: '210px', boxShadow: '0 16px 40px rgba(15,23,42,0.25)' }}
              />
            </div>
            <div className="p-5 md:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-3 py-1 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-600">
                  FREE with membership
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">50 Business Ideas Ebook</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Normally sold for ₹299 — yours free as a member. Complete business plans with revenue projections, templates, and step-by-step roadmaps.
              </p>
              <div className="space-y-1.5">
                {["Done-for-you revenue projections", "Time-saving templates", "Step-by-step roadmaps"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-xs text-foreground/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Community Hub ─── */}
      <div className={cn(
        "rounded-3xl neu-flat overflow-hidden transition-all duration-700 delay-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}>
        <div className="grid md:grid-cols-[1fr_280px] gap-0">
          {/* Left: content */}
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-5 mb-6">
              {/* WhatsApp icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg md:text-xl font-bold text-foreground">Private WhatsApp Community</h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25D366]/10 border border-[#25D366]/25 text-xs font-medium text-[#25D366]">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#25D366]" />
                    </span>
                    Active
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A private WhatsApp group exclusively for paying members — no lurkers, no noise. Daily AI updates, wins, challenges, and founders pushing each other to ship.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: MessageSquare, label: "Daily Check-ins", desc: "Progress & accountability" },
                { icon: BookOpen, label: "Resource Drops", desc: "Playbooks & templates" },
                { icon: Video, label: "Session Links", desc: "Never miss a call" },
              ].map((feature, i) => (
                <div
                  key={feature.label}
                  className={cn(
                    "rounded-2xl neu-pressed p-4 transition-all duration-500",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: isVisible ? `${500 + i * 100}ms` : "0ms" }}
                >
                  <feature.icon className="w-4 h-4 text-[#25D366] mb-2" />
                  <p className="text-sm font-medium text-foreground leading-tight">{feature.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: WhatsApp group mockup */}
          <div className="bg-[#f3efe7] border-t md:border-t-0 md:border-l border-black/5 p-5 md:p-6 flex flex-col justify-center">
            {/* Group header */}
            <div className="flex items-center gap-3 pb-3 mb-3 border-b border-black/10">
              <div className="w-9 h-9 rounded-full bg-[#128C7E]/15 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#128C7E"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Founders Wing 🚀</p>
                <p className="text-[10px] font-medium text-[#0f766e]">Members only · Private group</p>
              </div>
            </div>
            {/* Messages */}
            <div className="space-y-2.5">
              {[
                { name: "Rahul M.", msg: "Just closed my first ₹8K client using the outreach swipe 🙌", time: "9:14 AM", self: false },
                { name: "Sneha K.", msg: "Sprint Day 18 — ₹5,200 earned so far. Actually might hit ₹10K 😅", time: "10:02 AM", self: false },
                { name: "You", msg: "Just joined — super stoked to be here!", time: "10:30 AM", self: true },
              ].map((m) => (
                <div key={m.time} className={cn("flex gap-2", m.self ? "flex-row-reverse" : "")}>
                  {!m.self && (
                    <div className="w-5 h-5 rounded-full bg-[#128C7E] flex items-center justify-center text-[7px] font-bold text-white shrink-0 mt-0.5">
                      {m.name[0]}
                    </div>
                  )}
                  <div className={cn("rounded-xl px-3 py-1.5 max-w-[85%] shadow-sm", m.self ? "bg-[#d9fdd3]" : "bg-white")}>
                    {!m.self && <p className="text-[9px] font-semibold text-[#0f766e] mb-0.5">{m.name}</p>}
                    <p className="text-[11px] text-slate-800 leading-relaxed">{m.msg}</p>
                    <p className="text-[8px] text-slate-400 mt-0.5 text-right">{m.time} <span className="text-[#53bdeb]">✓✓</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── AI News, Tools & How-To Guides (merged) with notification feed ─── */}
      <div className={cn(
        "rounded-3xl neu-flat overflow-hidden transition-all duration-700 delay-400",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}>
        <div className="grid md:grid-cols-[1fr_320px] gap-0">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center">
                <Brain className="w-6 h-6 text-accent-cyan" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-cyan-500/10 border-cyan-500/20 text-cyan-600">
                Every week
              </span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">AI News, Tools & How-To Guides</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Weekly curated AI updates that matter for business. We test new tools, break down how to use them, and share step-by-step guides on building products and getting sales — so you stay ahead.
            </p>
            <div className="space-y-2">
              {["New AI tools tested with real business use cases", "Step-by-step guides on building & selling", "Curated updates — no noise, only what matters", "Revenue ideas for each tool before mainstream"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                  <span className="text-xs text-foreground/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notification feed */}
          <div className="bg-white/[0.02] border-t md:border-t-0 md:border-l border-white/5 p-5 md:p-6 flex flex-col justify-center">
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-3 font-medium">Latest drops</p>
            <div className="space-y-2.5">
              {[
                { tool: "Claude Mythos", desc: "Most capable AI model yet", time: "2h ago", color: "bg-orange-500/15 text-orange-600", dot: "bg-orange-400" },
                { tool: "OpenClaw", desc: "Open-source AI agent framework", time: "1d ago", color: "bg-emerald-500/15 text-emerald-600", dot: "bg-emerald-400" },
                { tool: "Lovable v2", desc: "Ship full-stack apps with AI", time: "3d ago", color: "bg-violet-500/15 text-violet-600", dot: "bg-violet-400" },
                { tool: "Runway Gen-4", desc: "AI video generation upgrade", time: "5d ago", color: "bg-blue-500/15 text-blue-600", dot: "bg-blue-400" },
              ].map((item, i) => (
                <div
                  key={item.tool}
                  className={cn(
                    "rounded-xl neu-pressed p-3 flex items-center gap-3 transition-all duration-500",
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  )}
                  style={{ transitionDelay: isVisible ? `${800 + i * 100}ms` : '0ms' }}
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", item.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground truncate">{item.tool}</span>
                      <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded-full", item.color)}>NEW</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{item.desc}</p>
                  </div>
                  <span className="text-[9px] text-muted-foreground/50 shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 2: Templates | Accountability Buddy ─── */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-5">

        {/* Templates, Automations & Workflows with file browser mockup */}
        <div className={cn(
          "rounded-3xl neu-flat p-6 md:p-8 transition-all duration-700 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}>
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center">
              <Wrench className="w-6 h-6 text-violet-600" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-violet-500/10 border-violet-500/20 text-violet-600">
              Ready to use
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Templates, Automations & Workflows</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Copy-paste business kits — pricing templates, client outreach scripts, AI tool setups, landing page frameworks. Ready to deploy, not theory to read.
          </p>

          {/* File browser mockup */}
          <div className="rounded-xl neu-pressed p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400/60" />
                <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-400/60" />
              </div>
              <span className="text-[10px] text-muted-foreground/60 ml-1">Founders Wing / Templates</span>
            </div>
            <div className="space-y-1">
              {[
                { name: "Client-Outreach-Email-Swipes.pdf", icon: "📧", size: "12 KB" },
                { name: "Pricing-Calculator-Template.xlsx", icon: "📊", size: "8 KB" },
                { name: "Landing-Page-Framework.fig", icon: "🎨", size: "2 MB" },
                { name: "AI-Automation-Workflows.json", icon: "⚡", size: "4 KB" },
                { name: "First-Sale-Playbook.pdf", icon: "📕", size: "24 KB" },
              ].map((file, i) => (
                <div
                  key={file.name}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white/[0.03] transition-colors",
                    i === 0 ? "bg-violet-500/5" : ""
                  )}
                >
                  <span className="text-sm">{file.icon}</span>
                  <span className="text-[11px] text-foreground/70 flex-1 truncate font-mono">{file.name}</span>
                  <span className="text-[9px] text-muted-foreground/40 shrink-0">{file.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accountability Buddy System with chat mockup */}
        <div className={cn(
          "rounded-3xl neu-flat p-6 md:p-8 transition-all duration-700 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}>
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center">
              <Network className="w-6 h-6 text-rose-600" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-rose-500/10 border-rose-500/20 text-rose-600">
              Matched pairs
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Accountability Buddy System</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Get paired with a founder at your stage. Weekly check-ins, shared goals, and someone who holds you to your commitments.
          </p>

          {/* Chat mockup */}
          <div className="rounded-xl neu-pressed p-3">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
              <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[8px] font-bold text-rose-600">AK</div>
              <span className="text-[10px] text-foreground/60 font-medium">Arjun (your buddy)</span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-2.5">
              {[
                { from: "buddy", name: "AK", msg: "Shipped my landing page yesterday! 🎉 How's the outreach template going?", time: "Mon 9:12 AM" },
                { from: "you", name: "You", msg: "Nice!! I got 3 cold emails sent using the swipe file. One replied 👀", time: "Mon 10:30 AM" },
                { from: "buddy", name: "AK", msg: "Let's review each other's pitch on the call tomorrow?", time: "Mon 10:32 AM" },
                { from: "you", name: "You", msg: "Done. Setting a reminder now 💪", time: "Mon 10:33 AM" },
              ].map((msg) => (
                <div key={msg.time} className={cn("flex gap-2", msg.from === "you" ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 mt-0.5",
                    msg.from === "you" ? "bg-cyan-500/20 text-cyan-600" : "bg-rose-500/20 text-rose-600"
                  )}>
                    {msg.name === "You" ? "U" : msg.name}
                  </div>
                  <div className={cn(
                    "rounded-xl px-3 py-1.5 max-w-[80%]",
                    msg.from === "you" ? "bg-cyan-500/10" : "bg-white/[0.04]"
                  )}>
                    <p className="text-[11px] text-foreground/75 leading-relaxed">{msg.msg}</p>
                    <p className="text-[8px] text-muted-foreground/40 mt-0.5">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Row 3: Hot Seat Coaching | ₹10K Sprint Access ─── */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-5">

        {/* Hot Seat Coaching with spotlight mockup */}
        <div className={cn(
          "rounded-3xl neu-flat p-6 md:p-8 transition-all duration-700 delay-600",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}>
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
              During live calls
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">Hot Seat Coaching</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Get picked during live calls for focused problem solving. Prithal and the community help you break through your specific blockers — live.
          </p>

          {/* Hot seat spotlight mockup */}
          <div className="rounded-xl neu-pressed p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">Hot Seat — Live Now</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[9px] text-red-600 font-medium">LIVE</span>
              </div>
            </div>

            {/* Spotlight person */}
            <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/15 p-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-600 ring-2 ring-amber-400/30">
                SM
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">Sneha M.</p>
                <p className="text-[10px] text-muted-foreground">&quot;How do I price my AI automation service?&quot;</p>
              </div>
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            </div>

            {/* Audience watching */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {["PB", "AK", "RV", "NK", "DM"].map((initials) => (
                  <div key={initials} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[7px] font-bold text-foreground/40 border border-background">
                    {initials}
                  </div>
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground/50">+12 watching & helping</span>
            </div>
          </div>
        </div>

        {/* ₹10K Sprint Access */}
        <div className={cn(
          "rounded-3xl neu-flat p-6 md:p-8 transition-all duration-700 delay-600",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}>
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-2xl neu-convex flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-600">
              Monthly cohorts
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">₹10K Sprint Access</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Every member gets access to our flagship 30-day sprint challenge — pick an idea, build with your cohort, and race to earn your first ₹10K.
          </p>

          {/* Sprint progress mockup */}
          <div className="rounded-xl neu-pressed p-3">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] text-foreground/60 font-medium">Sprint #4 — Day 18 of 30</span>
            </div>
            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 w-[60%] transition-all" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/50">Day 1</span>
                <span className="text-[9px] text-amber-600 font-medium">60% complete</span>
                <span className="text-[9px] text-muted-foreground/50">Day 30</span>
              </div>
            </div>
            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Your revenue", value: "₹4,200" },
                { label: "Cohort avg", value: "₹3,800" },
                { label: "Top earner", value: "₹12,400" },
              ].map((stat) => (
                <div key={stat.label} className="text-center rounded-lg bg-white/[0.02] py-2">
                  <p className="text-xs font-bold text-foreground/80">{stat.value}</p>
                  <p className="text-[8px] text-muted-foreground/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
