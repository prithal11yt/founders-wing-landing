'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { COHORT_1_SIZE, EARLY_SPOTS, earlySpotsLeft } from "@/lib/cohort"
import { COUPON, COUPON_ENDS_LABEL, couponActive, discounted } from "@/lib/offer"
import { PRICING, inrFmt } from "@/lib/pricing"

// The top strip. While the DIWALI code runs it advertises the code; after that it
// falls back to the Cohort 2 early spots (first EARLY_SPOTS members also join the
// Cohort 1 group), counted against the real membership total. Hidden on internal tools.
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

  const cls = "fixed top-0 left-0 right-0 z-[70] h-10 md:h-11 flex flex-wrap items-center justify-center gap-x-2 gap-y-0 sm:gap-x-3 bg-black border-b border-white/10 px-4 text-center hover:bg-neutral-900 transition-colors"

  if (couponActive()) {
    return (
      <Link href="/#membership" className={cls}>
        <span className="text-xs sm:text-sm font-medium text-gray-100">
          <span className="font-bold text-amber-400">{COUPON.percent}% off</span> with code{" "}
          <span className="font-mono font-bold tracking-wide text-amber-400">{COUPON.code}</span>
        </span>
        <span className="hidden xs:inline text-white/25">·</span>
        <span className="text-xs sm:text-sm font-semibold text-white tabular-nums">
          {inrFmt(PRICING.starter.price)} → {inrFmt(discounted(PRICING.starter.price))} for 6 months
        </span>
        <span className="hidden sm:inline text-xs text-white/70">Ends {COUPON_ENDS_LABEL}</span>
      </Link>
    )
  }

  if (left === null || left <= 0) return null
  return (
    <Link href="/#membership" className={cls}>
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
