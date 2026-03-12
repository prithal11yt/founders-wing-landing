"use client"

import { useState } from "react"
import { Trophy, Coffee, Utensils, Plane } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  {
    id: 1,
    title: "Pickleball Tournaments",
    category: "Wellness & Sport",
    description: "Friendly competition to break a sweat and break the ice. Health is wealth.",
    icon: Trophy,
    image: "/people-playing-pickleball-sunny-day-active-lifesty.jpg",
  },
  {
    id: 2,
    title: "Coffee Roundtables",
    category: "Deep Dives",
    description: "Intimate, problem-solving sessions in curated cafes. Specific topics, no fluff.",
    icon: Coffee,
    image: "/coffee-shop-meeting-roundtable-discussion-cozy-atm.jpg",
  },
  {
    id: 3,
    title: "Luxury Dinners",
    category: "Networking",
    description: "High-end culinary experiences. Great food, better company, and meaningful conversation.",
    icon: Utensils,
    image: "/luxury-fine-dining-restaurant-table-setting-evenin.jpg",
  },
  {
    id: 4,
    title: "Founder Trips",
    category: "Retreats",
    description: "Escaping the daily grind. Hiking, exploring, and recharging with fellow builders.",
    icon: Plane,
    image: "/scenic-mountain-hiking-group-adventure-travel-natu.jpg",
  },
]

export function ExpandableGallery() {
  const [activeId, setActiveId] = useState<number | null>(1)

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[600px] lg:h-[500px] w-full">
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 ease-in-out border border-white/10",
            activeId === item.id ? "flex-[3]" : "flex-[1] hover:flex-[1.5]",
          )}
          onMouseEnter={() => setActiveId(item.id)}
          onClick={() => setActiveId(item.id)}
        >
          <div className="absolute inset-0">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div
              className={cn(
                "absolute inset-0 bg-black/40 transition-opacity duration-500",
                activeId === item.id ? "opacity-20" : "opacity-60",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          <div className="relative h-full flex flex-col justify-end p-6">
            <div className={cn("transition-all duration-500", activeId === item.id ? "mb-4" : "mb-2")}>
              <div className="flex items-center gap-2 text-zinc-300 mb-2">
                <item.icon className="w-4 h-4" />
                <span
                  className={cn(
                    "text-sm font-medium transition-opacity duration-300",
                    activeId === item.id ? "opacity-100" : "opacity-0 lg:opacity-100",
                  )}
                >
                  {item.category}
                </span>
              </div>
              <h3
                className={cn(
                  "font-bold text-white transition-all duration-300",
                  activeId === item.id ? "text-2xl" : "text-xl",
                )}
              >
                {item.title}
              </h3>
            </div>

            <p
              className={cn(
                "text-zinc-300 text-sm transition-all duration-500 overflow-hidden",
                activeId === item.id ? "max-h-20 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
