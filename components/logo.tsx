'use client'

export function WingMeshLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * (44 / 52)}
      viewBox="0 0 52 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Edges forming wing shape */}
      <line x1="6" y1="28" x2="18" y2="20" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.5" />
      <line x1="6" y1="28" x2="16" y2="34" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.5" />
      <line x1="18" y1="20" x2="30" y2="14" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.4" />
      <line x1="18" y1="20" x2="28" y2="28" stroke="#0ea5e9" strokeWidth="1.2" opacity="0.4" />
      <line x1="16" y1="34" x2="28" y2="28" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="14" x2="40" y2="8" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />
      <line x1="30" y1="14" x2="42" y2="22" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />
      <line x1="28" y1="28" x2="42" y2="22" stroke="#0ea5e9" strokeWidth="1" opacity="0.25" />
      <line x1="40" y1="8" x2="48" y2="14" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
      <line x1="42" y1="22" x2="48" y2="14" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
      {/* Glow on anchor node */}
      <circle cx="6" cy="28" r="8" fill="#0ea5e9" opacity="0.06" />
      {/* Nodes */}
      <circle cx="6" cy="28" r="4" fill="#0ea5e9" />
      <circle cx="18" cy="20" r="3" fill="#0ea5e9" opacity="0.8" />
      <circle cx="16" cy="34" r="2.5" fill="#0ea5e9" opacity="0.6" />
      <circle cx="30" cy="14" r="2.5" fill="#0ea5e9" opacity="0.7" />
      <circle cx="28" cy="28" r="2.5" fill="#0ea5e9" opacity="0.6" />
      <circle cx="40" cy="8" r="2" fill="#0ea5e9" opacity="0.5" />
      <circle cx="42" cy="22" r="2" fill="#0ea5e9" opacity="0.5" />
      <circle cx="48" cy="14" r="1.5" fill="#0ea5e9" opacity="0.35" />
    </svg>
  )
}
