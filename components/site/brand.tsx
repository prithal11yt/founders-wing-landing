import type { CSSProperties } from 'react'

/* Founders Wing brand primitives.
   WingMark is traced from Logos/Untitled design (3).png — the real W mark (the SVGs in
   Logos/SVG do not match it). Wordmark reproduces the lockup in Logos/*.png: "Founders"
   with the mark standing in for the W of "Wing". */

export const ACCENT = '#0284c7' // sky-600, the site's button colour

const WING_PATH =
  'M 0.2,0.2 L 29.6,88.5 L 50.0,49.3 L 70.1,88.6 L 99.7,0.3 L 60.1,28.0 L 64.4,36.1 L 82.2,24.0 L 68.3,64.9 L 50.0,29.1 L 31.5,64.8 L 17.7,24.0 L 35.6,36.1 L 39.9,28.2 Z'

export function WingMark({ className = '', gradient = false, style }: { className?: string; gradient?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 88.8" className={className} style={style} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id="fw-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      )}
      <path fillRule="evenodd" fill={gradient ? 'url(#fw-cyan)' : 'currentColor'} d={WING_PATH} />
    </svg>
  )
}

export function Wordmark({ className = '', gradient = false }: { className?: string; gradient?: boolean }) {
  return (
    <span
      className={`inline-flex items-baseline whitespace-nowrap ${className}`}
      style={{ fontFamily: 'var(--font-display), var(--font-sans), sans-serif', fontWeight: 600, letterSpacing: '-0.015em' }}
      aria-label="Founders Wing"
    >
      <span>Founders</span>
      <WingMark gradient={gradient} className="inline-block h-[0.92em] w-auto ml-[0.26em] mr-[0.03em]" />
      <span>ing</span>
    </span>
  )
}
