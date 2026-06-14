'use client'

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { CheckCircle2, Clock, ArrowRight, ShieldCheck, Users, Zap } from "lucide-react"
import { WingMeshLogo } from "@/components/logo"
import Link from "next/link"

// Checkout is hosted on thesoloentrepreneur.in (verified Razorpay account)
const CHECKOUT_BASE_URL = "https://www.thesoloentrepreneur.in/fw-membership"

function getCheckoutUrl(plan: "starter" | "annual", info: { name: string; email: string; whatsapp: string }) {
  const query = new URLSearchParams({ plan, ...info })
  return `${CHECKOUT_BASE_URL}?${query.toString()}`
}

const HOLD_HOURS = 24

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: HOLD_HOURS, minutes: 0, seconds: 0 })
  const endTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // Persist end time in sessionStorage so it survives refreshes
    const stored = sessionStorage.getItem("fw_spot_hold_end")
    if (stored) {
      endTimeRef.current = parseInt(stored)
    } else {
      const end = Date.now() + HOLD_HOURS * 60 * 60 * 1000
      endTimeRef.current = end
      sessionStorage.setItem("fw_spot_hold_end", String(end))
    }

    const tick = () => {
      const diff = (endTimeRef.current ?? 0) - Date.now()
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ hours: h, minutes: m, seconds: s })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="flex items-center gap-2 text-amber-400 font-mono text-lg font-bold">
      <Clock className="w-5 h-5 shrink-0" />
      <span>{pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}</span>
    </div>
  )
}

function SecureSpotContent() {
  const params = useSearchParams()
  const name = params.get("name") || ""
  const email = params.get("email") || ""
  const whatsapp = params.get("whatsapp") || ""
  const firstName = name.split(" ")[0]
  const checkoutInfo = { name, email, whatsapp }

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      {/* Minimal nav */}
      <header className="border-b border-white/5 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <WingMeshLogo size={28} />
          <span className="font-semibold text-sm">Founders Wing</span>
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-lg space-y-6">

          {/* Success indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-400">Founding member spot reserved</p>
              <p className="text-xs text-muted-foreground">Complete payment to lock it in</p>
            </div>
          </div>

          {/* Main card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {firstName ? `${firstName}, founding spot #26 is yours` : "Your founding spot is reserved"}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We&apos;re onboarding our first 50 founding members. Pay now to secure your spot — founding members get priority access to all offline events and sprint demo days, forever.
              </p>
            </div>

            {/* Countdown */}
            <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-400/70 font-medium uppercase tracking-wider mb-1">Spot reserved for</p>
                <CountdownTimer />
              </div>
              <p className="text-xs text-muted-foreground text-right max-w-[120px]">Cohort fills up fast — secure your place now</p>
            </div>

            {/* Plan options */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose your plan</p>

              {/* Starter */}
              <a
                href={getCheckoutUrl("starter", checkoutInfo)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/40 hover:bg-cyan-500/5 p-4 transition-all duration-200"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Starter</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">6 months</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Full access · ₹500/mo</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">₹2,999</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </a>

              {/* Annual - recommended */}
              <a
                href={getCheckoutUrl("annual", checkoutInfo)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-2xl border border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/60 hover:bg-cyan-500/10 p-4 transition-all duration-200 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">BEST VALUE</span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">Annual</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">12 months</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Everything + priority hot seat · ₹417/mo</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-cyan-400">₹4,999</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </a>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: <ShieldCheck className="w-4 h-4" />, label: "Razorpay secured" },
                { icon: <Users className="w-4 h-4" />, label: "UPI · Cards · EMI" },
                { icon: <Zap className="w-4 h-4" />, label: "Instant access" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] py-3 px-2">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What you get reminder */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What you unlock</p>
            <ul className="space-y-2">
              {[
                "Weekly live sessions with Prithal",
                "₹10K Sprint Challenge access + leaderboard",
                "Accountability buddy matching",
                "50 Business Ideas ebook (free)",
                "Templates, playbooks & AI tool guides",
                "Private founder community + hot seat coaching",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Questions? Reach out on{" "}
            <a href="https://twitter.com/NotesByPrithal" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              Twitter
            </a>{" "}
            or{" "}
            <a href="mailto:prithalbhardwaj@gmail.com" className="text-cyan-400 hover:underline">
              email
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function SecureSpotPage() {
  return (
    <Suspense>
      <SecureSpotContent />
    </Suspense>
  )
}
