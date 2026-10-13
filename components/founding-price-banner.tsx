'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { COHORT_1_SIZE, EARLY_SPOTS, earlySpotsLeft } from "@/lib/cohort"

// Scarcity that's true: the first EARLY_SPOTS members of Cohort 2 also join the
// Cohort 1 group. The count comes from the real membership total, and the banner
// removes itself when those spots are gone.
export function FoundingPriceBanner() {
  const pathname = usePathname()
  const [left, setLeft] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/public/member-count")
        const data = await res.json()
        if (cancelled || typeof data.count !== "number") return
        setLeft(data.count < COHORT_1_SIZE ? 0 : earlySpotsLeft(data.count))
      } catch {
        // Leave the banner hidden rather than guess a number.
      }
    }
    load()
    const id = setInterval(load, 120000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  if (pathname?.startsWith("/leads") || pathname?.startsWith("/admin") ||
      pathname?.startsWith("/members") || pathname?.startsWith("/team") ||
      pathname?.startsWith("/analytics")) return null

  if (left === null || left <= 0) return null

  return (
    <Link
      href="/#membership"
      className="fixed top-0 left-0 right-0 z-[70] h-10 md:h-11 flex flex-wrap items-center justify-center gap-x-2 gap-y-0 sm:gap-x-3 bg-black border-b border-white/10 px-4 text-center hover:bg-neutral-900 transition-colors"
    >
      <span className="text-xs sm:text-sm font-medium text-gray-100">
        <span className="font-bold text-amber-400">Cohort 2 is open.</span> First {EARLY_SPOTS} members also join the Cohort 1 group
      </span>
      <span className="hidden xs:inline text-white/25">·</span>
      <span className="text-xs sm:text-sm font-semibold text-white tabular-nums">
        {left === 1 ? "1 spot left" : `${left} spots left`}
      </span>
    </Link>
  )
}
