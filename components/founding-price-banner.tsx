'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const DEADLINE = new Date("2026-07-02T15:00:00Z").getTime() // July 2, 2026, 8:30 PM IST

export function FoundingPriceBanner() {
  const pathname = usePathname()
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const tick = () => {
      const diff = DEADLINE - Date.now()
      if (diff <= 0) {
        setExpired(true)
        return
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  if (pathname?.startsWith("/leads") || pathname?.startsWith("/admin") || pathname?.startsWith("/members")) return null
  if (expired || !timeLeft) return null

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <Link
      href="/#apply"
      className="fixed top-0 left-0 right-0 z-[70] h-10 md:h-11 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-black border-b border-white/10 px-4 text-center hover:bg-neutral-900 transition-colors"
    >
      <span className="text-xs sm:text-sm font-medium text-gray-100">
        Founding member price closes today at 8:30 PM
      </span>
      <span className="font-mono font-bold text-xs sm:text-sm text-amber-400 tabular-nums">
        {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
      </span>
      <span className="hidden sm:inline text-xs text-white underline underline-offset-2">
        Join now
      </span>
    </Link>
  )
}
