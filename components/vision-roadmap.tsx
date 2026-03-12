"use client"

import { useEffect, useRef, useState } from "react"
import { Rocket, Users, Calendar, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const roadmapItems = [
  {
    quarter: "Q1 2026",
    title: "The Foundation",
    description: "Launch of the private online community. First 100 founding members onboarded. Slack channels active.",
    icon: Users,
    status: "upcoming",
  },
  {
    quarter: "Q2 2026",
    title: "First Gathering",
    description: "Inaugural Founder Summit in Bangalore. 2 days of deep dives, networking, and workshops.",
    icon: Calendar,
    status: "upcoming",
  },
  {
    quarter: "Q3 2026",
    title: "Global Expansion",
    description: "Opening chapters in London and San Francisco. Cross-border founder exchange program begins.",
    icon: Globe,
    status: "upcoming",
  },
  {
    quarter: "Q4 2026",
    title: "The Ecosystem",
    description:
      "Launch of the Founders Wing Investment Syndicate. Backing the best builders from within the community.",
    icon: Rocket,
    status: "upcoming",
  },
]

export function VisionRoadmap() {
  const [activeindex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      // Calculate how far we've scrolled into the component
      const progress = Math.min(Math.max((windowHeight / 2 - rect.top) / (rect.height / 2), 0), 1)

      const newIndex = Math.floor(progress * roadmapItems.length)
      setActiveIndex(newIndex)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="relative max-w-4xl mx-auto py-20">
      {/* Vertical Line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2">
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-white via-white to-transparent transition-all duration-500 ease-out"
          style={{ height: `${((activeindex + 1) / roadmapItems.length) * 100}%` }}
        />
      </div>

      <div className="space-y-24">
        {roadmapItems.map((item, index) => {
          const isActive = index <= activeindex
          const isLeft = index % 2 === 0

          return (
            <div
              key={index}
              className={cn(
                "relative flex items-center gap-8 md:gap-16 transition-all duration-700",
                isActive ? "opacity-100 translate-y-0" : "opacity-30 translate-y-8",
              )}
            >
              {/* Desktop Layout: Alternating sides */}
              <div className={cn("hidden md:block flex-1 text-right", !isLeft && "order-3 text-left")}>
                <div className="text-sm font-mono text-zinc-500 mb-2">{item.quarter}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-zinc-400">{item.description}</p>
              </div>

              {/* Center Icon */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-500 shrink-0",
                  isActive
                    ? "bg-black border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    : "bg-zinc-900 border-zinc-800",
                )}
              >
                <item.icon
                  className={cn("w-6 h-6 transition-colors duration-500", isActive ? "text-white" : "text-zinc-600")}
                />
              </div>

              {/* Mobile Layout: Always right */}
              <div className="md:hidden flex-1">
                <div className="text-sm font-mono text-zinc-500 mb-1">{item.quarter}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </div>

              {/* Desktop Spacer for alternating layout */}
              <div className="hidden md:block flex-1" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
