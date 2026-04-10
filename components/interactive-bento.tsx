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
                <Video className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
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
                  <span className="text-[9px] text-red-400 font-medium">LIVE</span>
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
                    p.speaking ? "bg-cyan-500/15 ring-1 ring-cyan-400/40" : "bg-white/[0.03]"
                  )}>
                    <div className={cn(
                      "w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold",
                      p.speaking ? "bg-cyan-500/30 text-cyan-300" : "bg-white/10 text-foreground/40"
                    )}>
                      {p.initials}
                    </div>
                    <span className={cn(
                      "text-[8px] leading-none",
                      p.speaking ? "text-cyan-400" : "text-foreground/30"
                    )}>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {["Ask anything — no question too basic", "AI tool demos & walkthroughs", "Recordings available if you miss one"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
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
            <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center p-4">
              <Image
                src="/ebook-cover.png"
                alt="50 Business Ideas Ebook"
                width={160}
                height={240}
                className="rounded-lg shadow-2xl shadow-black/40 group-hover:scale-105 transition-transform duration-500"
                style={{ width: 'auto', height: 'auto', maxHeight: '220px' }}
              />
            </div>
            <div className="p-5 md:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-3 py-1 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-400">
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
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
              Dedicated channels for business ideas, AI tools, progress updates, and wins. This is where like-minded founders connect and push each other daily.
            </p>
          </div>
        </div>
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
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
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
                { tool: "Claude Mythos", desc: "Most capable AI model yet", time: "2h ago", color: "bg-orange-500/15 text-orange-400", dot: "bg-orange-400" },
                { tool: "OpenClaw", desc: "Open-source AI agent framework", time: "1d ago", color: "bg-emerald-500/15 text-emerald-400", dot: "bg-emerald-400" },
                { tool: "Lovable v2", desc: "Ship full-stack apps with AI", time: "3d ago", color: "bg-violet-500/15 text-violet-400", dot: "bg-violet-400" },
                { tool: "Runway Gen-4", desc: "AI video generation upgrade", time: "5d ago", color: "bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
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
              <Wrench className="w-6 h-6 text-violet-400" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-violet-500/10 border-violet-500/20 text-violet-400">
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
              <Network className="w-6 h-6 text-rose-400" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-rose-500/10 border-rose-500/20 text-rose-400">
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
              <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-[8px] font-bold text-rose-400">AK</div>
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
                    msg.from === "you" ? "bg-cyan-500/20 text-cyan-400" : "bg-rose-500/20 text-rose-400"
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
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
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
              <span className="text-[10px] text-amber-400 font-medium uppercase tracking-wider">Hot Seat — Live Now</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[9px] text-red-400 font-medium">LIVE</span>
              </div>
            </div>

            {/* Spotlight person */}
            <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/15 p-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400 ring-2 ring-amber-400/30">
                SM
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-foreground">Sneha M.</p>
                <p className="text-[10px] text-muted-foreground">&quot;How do I price my AI automation service?&quot;</p>
              </div>
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
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
              <Target className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full border bg-amber-500/10 border-amber-500/20 text-amber-400">
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
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] text-foreground/60 font-medium">Sprint #4 — Day 18 of 30</span>
            </div>
            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 w-[60%] transition-all" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/50">Day 1</span>
                <span className="text-[9px] text-amber-400 font-medium">60% complete</span>
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
