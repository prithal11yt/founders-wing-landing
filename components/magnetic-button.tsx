'use client'

import React, { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    strength?: number
    disabled?: boolean
}

export function MagneticButton({
    children,
    className,
    strength = 0.3,
    disabled = false,
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (disabled || !ref.current) return
            const rect = ref.current.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const deltaX = (e.clientX - centerX) * strength
            const deltaY = (e.clientY - centerY) * strength
            setPosition({ x: deltaX, y: deltaY })
        },
        [strength, disabled]
    )

    const handleMouseLeave = useCallback(() => {
        setPosition({ x: 0, y: 0 })
    }, [])

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const id = Date.now()
        setRipples((prev) => [...prev, { x, y, id }])
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id))
        }, 600)
    }, [])

    return (
        <div
            ref={ref}
            className={cn('relative inline-block', className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: position.x === 0 && position.y === 0
                    ? 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)'
                    : 'transform 0.15s ease-out',
            }}
        >
            {children}
            {/* Ripple effects */}
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/20 pointer-events-none animate-ripple"
                    style={{
                        left: ripple.x - 5,
                        top: ripple.y - 5,
                        width: 10,
                        height: 10,
                    }}
                />
            ))}
        </div>
    )
}
