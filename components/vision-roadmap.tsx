"use client"

import { Brain, Network, Wrench, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { TiltCard } from "@/components/tilt-card"

const pillars = [
  {
    title: "AI Strategy Sessions",
    description: "Weekly deep dives on real AI implementation — not theory, not hype. Learn what's actually working from founders who are deploying AI today.",
    icon: Brain,
    iconColor: "text-cyan-400",
  },
  {
    title: "Founder AI Network",
    description: "Connect with founders actively deploying AI in their businesses. Share strategies, compare tools, and solve problems together in real time.",
    icon: Network,
    iconColor: "text-blue-400",
  },
  {
    title: "Tool & Prompt Library",
    description: "Curated, member-only collection of proven AI tools, workflows, and prompts. Skip the trial-and-error — use what's already been tested.",
    icon: Wrench,
    iconColor: "text-purple-400",
  },
  {
    title: "Early Access & Intel",
    description: "Get ahead with early signals on new AI models, tools, and strategies before they go mainstream. Be the first to know, the first to move.",
    icon: Zap,
    iconColor: "text-cyan-300",
  },
]

export function VisionRoadmap() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {pillars.map((pillar, index) => (
        <TiltCard
          key={index}
          tiltAmount={10}
        >
          <div
            className={cn(
              "group relative rounded-3xl p-8 cursor-default neu-flat neu-interactive",
            )}
          >
            <div className="relative z-10">
              {/* Icon */}
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 neu-convex",
                )}
              >
                <pillar.icon className={cn("w-7 h-7 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]", pillar.iconColor)} />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:translate-x-1 transition-transform duration-300">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                {pillar.description}
              </p>
            </div>
          </div>
        </TiltCard>
      ))}
    </div>
  )
}

