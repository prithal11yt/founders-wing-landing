'use client'

import React, { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TiltCardProps {
    children: React.ReactNode
    className?: string
    tiltAmount?: number
    glowColor?: string
}

export function TiltCard({
    children,
    className,
    tiltAmount = 8,
    glowColor = 'rgba(6, 182, 212, 0.15)',
}: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [transform, setTransform] = useState('')
    const [glowPos, setGlowPos] = useState({ x: 50, y: 50 })
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!ref.current) return
            const rect = ref.current.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const y = (e.clientY - rect.top) / rect.height
            const rotateX = (0.5 - y) * tiltAmount
            const rotateY = (x - 0.5) * tiltAmount
            setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
            setGlowPos({ x: x * 100, y: y * 100 })
        },
        [tiltAmount]
    )

    const handleMouseLeave = useCallback(() => {
        setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
        setIsHovering(false)
    }, [])

    const handleMouseEnter = useCallback(() => {
        setIsHovering(true)
    }, [])

    return (
        <div
            ref={ref}
            className={cn('relative', className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                transform,
                transition: isHovering
                    ? 'transform 0.1s ease-out'
                    : 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
                transformStyle: 'preserve-3d',
                willChange: 'transform',
            }}
        >
            {/* Spotlight glow that follows cursor */}
            <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
                style={{
                    opacity: isHovering ? 1 : 0,
                    background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
                }}
            />
            {children}
        </div>
    )
}
