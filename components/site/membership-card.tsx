'use client'

import { useState } from 'react'
import { WingMark, Wordmark } from './brand'
import { PLANS, type PlanKey } from './ui'

/* The membership card: matte navy, gold chip, hairline border, an iridescent sheen and a
   cursor-tracked glare with 3D tilt. Shown once on the homepage and on the payment page. */

const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='265'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`

export function MembershipCard({
  plan,
  memberNo,
  name,
  className = '',
}: {
  plan: PlanKey
  memberNo: number | null
  /** Shown in place of "Member" once we know who the card is for. */
  name?: string
  className?: string
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 40, on: false })
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setTilt({ rx: (0.5 - py) * 12, ry: (px - 0.5) * 14, gx: px * 100, gy: py * 100, on: true })
  }
  const reset = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 40, on: false })

  return (
    <div className={`w-full max-w-[440px] ${className}`} style={{ perspective: '1100px' }} onMouseMove={onMove} onMouseLeave={reset}>
      <div
        className="relative rounded-[22px] overflow-hidden text-white"
        style={{
          aspectRatio: '1.586',
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: tilt.on ? 'transform 90ms linear' : 'transform 700ms cubic-bezier(.2,.8,.2,1)',
          background: 'linear-gradient(135deg, #111c33 0%, #0b1224 45%, #05091a 100%)',
          boxShadow: '0 50px 100px -30px rgba(2,132,199,0.45), 0 30px 60px -30px rgba(0,0,0,0.7)',
        }}
      >
        {/* iridescent sheen */}
        <div className="absolute -inset-[40%] opacity-80 blur-2xl" style={{ background: 'conic-gradient(from 210deg at 72% 28%, transparent 0deg, rgba(56,189,248,0.55) 55deg, rgba(139,92,246,0.4) 115deg, transparent 175deg, rgba(14,165,233,0.35) 260deg, transparent 360deg)' }} />
        {/* fine grain, hairline border, top highlight */}
        <div className="absolute inset-0 opacity-[0.16] mix-blend-soft-light" style={{ backgroundImage: NOISE, backgroundSize: '220px 140px' }} />
        <div className="absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/15" />
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        {/* glare follows the cursor */}
        <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: tilt.on ? 1 : 0, background: `radial-gradient(55% 45% at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.22), transparent 70%)` }} />
        {/* watermark */}
        <WingMark className="absolute -right-8 -bottom-10 h-[112%] w-auto text-white/[0.05] select-none" />

        <div className="relative h-full p-6 md:p-7 flex flex-col">
          <div className="flex items-start justify-between">
            <Wordmark className="text-xl md:text-2xl" />
            <Chip />
          </div>
          <div className="mt-auto flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/50 truncate">{name || 'Member'}</p>
              <p className="mt-1 font-mono text-base md:text-lg tracking-[0.08em]">{memberNo ? `N° ${String(memberNo).padStart(3, '0')}` : 'N° ···'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/50">Valid</p>
              <p className="mt-1 font-mono text-base md:text-lg tracking-[0.08em]">{PLANS[plan].label}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip() {
  return (
    <div className="relative w-11 h-8 md:w-12 md:h-9 rounded-md overflow-hidden" style={{ background: 'linear-gradient(135deg, #f7e2a6 0%, #c9a24a 35%, #f5d78e 55%, #8a6416 100%)' }}>
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'linear-gradient(to right, transparent 30%, rgba(0,0,0,.45) 30%, rgba(0,0,0,.45) 32%, transparent 32%, transparent 66%, rgba(0,0,0,.45) 66%, rgba(0,0,0,.45) 68%, transparent 68%), linear-gradient(to bottom, transparent 48%, rgba(0,0,0,.45) 48%, rgba(0,0,0,.45) 52%, transparent 52%)' }} />
      <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-black/25" />
    </div>
  )
}
