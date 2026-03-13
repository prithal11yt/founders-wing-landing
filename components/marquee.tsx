'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps {
    children: React.ReactNode
    className?: string
    reverse?: boolean
    speed?: number // seconds for one full cycle
    pauseOnHover?: boolean
}

export function Marquee({
    children,
    className,
    reverse = false,
    speed = 30,
    pauseOnHover = true,
}: MarqueeProps) {
    const [isPaused, setIsPaused] = useState(false)

    return (
        <div
            className={cn('overflow-hidden relative', className)}
            onMouseEnter={() => pauseOnHover && setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Fade masks on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div
                className="flex gap-4 w-max"
                style={{
                    animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${speed}s linear infinite`,
                    animationPlayState: isPaused ? 'paused' : 'running',
                }}
            >
                {/* Duplicate children for seamless loop */}
                {children}
                {children}
            </div>
        </div>
    )
}
