"use client"

import { useState, useEffect, useRef } from "react"
import { Trophy, Coffee, Utensils, Plane, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TiltCard } from "@/components/tilt-card"

const items = [
  {
    id: 1,
    title: "Pickleball Tournaments",
    category: "Wellness & Sport",
    description: "Friendly competition to break a sweat and break the ice. Because the best conversations happen when you're not trying to network.",
    icon: Trophy,
    iconColor: "text-accent-cyan",
  },
  {
    id: 2,
    title: "Coffee Roundtables",
    category: "Deep Dives",
    description: "Intimate, problem-solving sessions in curated cafes. One topic, 8 founders, zero fluff. Bring your hardest AI challenge.",
    icon: Coffee,
    iconColor: "text-blue-600",
  },
  {
    id: 3,
    title: "Luxury Dinners",
    category: "Networking",
    description: "High-end culinary experiences with curated seating. Great food, better company, and the kind of conversation you can't find on Slack.",
    icon: Utensils,
    iconColor: "text-purple-600",
  },
  {
    id: 4,
    title: "Founder Retreats",
    category: "Retreats",
    description: "Multi-day escapes to recharge and strategize. Hike, explore, and build deeper bonds with fellow AI-first founders.",
    icon: Plane,
    iconColor: "text-accent-cyan",
  },
]

export function ExpandableGallery() {
  const [activeId, setActiveId] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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
    <div ref={sectionRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {items.map((item, index) => (
        <TiltCard
          key={item.id}
          tiltAmount={12}
        >
          <div
            className={cn(
              "group relative rounded-2xl md:rounded-3xl p-4 md:p-6 transition-all duration-500 cursor-pointer h-full neu-flat neu-interactive flex flex-col",
              activeId === item.id && "neu-pressed !transform-none",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            onMouseEnter={() => setActiveId(item.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            {/* Icon */}
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 transition-transform duration-500 group-hover:scale-110 neu-convex shrink-0",
            )}>
              <item.icon className={cn("w-5 h-5 md:w-6 md:h-6", item.iconColor)} />
            </div>

            {/* Category tag */}
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 md:mb-2">
              {item.category}
            </p>

            {/* Title */}
            <h3 className="text-base md:text-xl font-bold text-foreground mb-2 md:mb-3 group-hover:translate-x-1 transition-transform duration-300">
              {item.title}
            </h3>

            {/* Description */}
            <div className="flex-1 flex flex-col justify-end">
              <p className={cn(
                "text-xs md:text-sm text-muted-foreground leading-relaxed transition-all duration-500",
                activeId === item.id ? "opacity-100 max-h-32" : "opacity-70 max-h-20",
              )}>
                {item.description}
              </p>

              {/* Arrow indicator on hover */}
              <div className={cn(
                "mt-4 flex items-center gap-1 text-xs font-medium transition-all duration-300",
                activeId === item.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
                item.iconColor,
              )}>
                Learn more <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </TiltCard>
      ))}
    </div>
  )
}
