"use client"

import { Globe, Users, ArrowRight } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function InteractiveBento() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Online Community */}
      <div
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black h-[500px] transition-all duration-500 hover:border-white/20"
        onMouseEnter={() => setHoveredIndex(0)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <div className="absolute inset-0">
          <img
            src="/online-community-large.jpg"
            alt="Online Community"
            className={cn(
              "h-full w-full object-cover object-center opacity-60 transition-transform duration-700",
              hoveredIndex === 0 ? "scale-110" : "scale-105",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        {/* Animated Overlay Content */}
        <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <Globe className="w-6 h-6" />
          </div>

          <h3 className="text-3xl font-bold mb-4 transform transition-transform duration-500 group-hover:translate-x-2">
            The Online Hub
          </h3>

          <p className="text-zinc-300 text-lg mb-6 transform transition-all duration-500 group-hover:-translate-y-2">
            Your daily operating room. A private Slack space for fast feedback, thoughtful discussion, and real-time help from founders who are actively building.
          </p>

          <ul className="space-y-3 text-zinc-400 transform transition-all duration-500 delay-100 group-hover:-translate-y-2">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Private Slack Channels
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75" />
              Weekly Virtual Deep Dives
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-150" />
              Member Directory & Intros
            </li>
          </ul>

          <div
            className={cn(
              "absolute bottom-12 right-12 opacity-0 transform translate-x-4 transition-all duration-500",
              hoveredIndex === 0 ? "opacity-100 translate-x-0" : "",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Physical Meetups */}
      <div
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black h-[500px] transition-all duration-500 hover:border-white/20"
        onMouseEnter={() => setHoveredIndex(1)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <div className="absolute inset-0">
          <img
            src="/luxury-dinner-party-networking-event-dark-moody-at.jpg"
            alt="Physical Meetups"
            className={cn(
              "h-full w-full object-cover object-center opacity-60 transition-transform duration-700",
              hoveredIndex === 1 ? "scale-110" : "scale-105",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        </div>

        <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6 border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
            <Users className="w-6 h-6" />
          </div>

          <h3 className="text-3xl font-bold mb-4 transform transition-transform duration-500 group-hover:translate-x-2">
            Physical Meetups
          </h3>

          <p className="text-zinc-300 text-lg mb-6 transform transition-all duration-500 group-hover:-translate-y-2">
            Designed for depth, not scale. Small, curated gatherings where conversations continue long after the event ends.
          </p>

          <ul className="space-y-3 text-zinc-400 transform transition-all duration-500 delay-100 group-hover:-translate-y-2">
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              Small Group Gatherings
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-75" />
              Member-only Experiences
            </li>
            <li className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse delay-150" />
              Deep Connections
            </li>
          </ul>
          
          <p className="text-zinc-400 text-sm mt-6 transform transition-all duration-500 group-hover:-translate-y-2">
            We design for relationships that last years, not events that last hours.
          </p>

          <div
            className={cn(
              "absolute bottom-12 right-12 opacity-0 transform translate-x-4 transition-all duration-500",
              hoveredIndex === 1 ? "opacity-100 translate-x-0" : "",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
