'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

// Scarcity that's actually true: the discount is held for the next
// OFFER_SPOTS members after OFFER_BASELINE, and the number shown counts down
// against the real membership count. When the spots run out the banner
// removes itself, so it can never promise an offer that's gone.
import { COUPON_CODE, offerSpotsLeft } from "@/lib/offer"
const CHECKOUT_URL = `https://www.thesoloentrepreneur.in/fw-membership?coupon=${COUPON_CODE}`

export function FoundingPriceBanner() {
  const pathname = usePathname()
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch("/api/public/member-count")
        const data = await res.json()
        if (cancelled || typeof data.count !== "number") return
        setRemaining(offerSpotsLeft(data.count))
      } catch {
        // Leave the banner hidden rather than guess a number.
      }
    }

    load()
    // Refresh periodically so a visitor who leaves the tab open sees the count
    // move as people actually join.
    const id = setInterval(load, 120000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  // Internal tools shouldn't carry marketing chrome.
  if (pathname?.startsWith("/leads") || pathname?.startsWith("/admin") ||
      pathname?.startsWith("/members") || pathname?.startsWith("/team")) return null

  if (remaining === null || remaining <= 0) return null

  return (
    <Link
      href={CHECKOUT_URL}
      className="fixed top-0 left-0 right-0 z-[70] h-10 md:h-11 flex flex-wrap items-center justify-center gap-x-2 gap-y-0 sm:gap-x-3 bg-black border-b border-white/10 px-4 text-center hover:bg-neutral-900 transition-colors"
    >
      <span className="text-xs sm:text-sm font-medium text-gray-100">
        <span className="font-bold text-amber-400">20% off</span> with code{" "}
        <span className="font-mono font-bold tracking-wide text-amber-400">{COUPON_CODE}</span>
      </span>
      <span className="hidden xs:inline text-white/25">·</span>
      <span className="text-xs sm:text-sm font-semibold text-white tabular-nums">
        {remaining === 1 ? "1 spot left" : `${remaining} spots left`}
      </span>
      <span className="hidden sm:inline text-xs text-white underline underline-offset-2">
        Claim yours
      </span>
    </Link>
  )
}
