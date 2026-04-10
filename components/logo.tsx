'use client'

import Image from 'next/image'

export function WingMeshLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="Founders Wing"
      width={size}
      height={size}
      priority
      className={`object-contain ${className}`}
    />
  )
}
