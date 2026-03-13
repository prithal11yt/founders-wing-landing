'use client'

import React, { CSSProperties, useEffect, useState } from 'react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

type AnimationVariant =
    | 'fade-up'
    | 'fade-down'
    | 'fade-left'
    | 'fade-right'
    | 'fade-in'
    | 'scale-up'
    | 'scale-down'
    | 'blur-in'
    | 'slide-up-large'

interface ScrollRevealProps {
    children: React.ReactNode
    variant?: AnimationVariant
    delay?: number
    duration?: number
    className?: string
    once?: boolean
    threshold?: number
    as?: keyof React.JSX.IntrinsicElements
    staggerChildren?: number
    easing?: string
}

// Mobile-friendly reduced distances
const getVariantStyles = (isMobile: boolean): Record<AnimationVariant, { hidden: CSSProperties; visible: CSSProperties }> => ({
    'fade-up': {
        hidden: { opacity: 0, transform: `translateY(${isMobile ? 24 : 60}px)` },
        visible: { opacity: 1, transform: 'translateY(0)' },
    },
    'fade-down': {
        hidden: { opacity: 0, transform: `translateY(${isMobile ? -20 : -40}px)` },
        visible: { opacity: 1, transform: 'translateY(0)' },
    },
    'fade-left': {
        hidden: { opacity: 0, transform: `translateX(${isMobile ? -24 : -60}px)` },
        visible: { opacity: 1, transform: 'translateX(0)' },
    },
    'fade-right': {
        hidden: { opacity: 0, transform: `translateX(${isMobile ? 24 : 60}px)` },
        visible: { opacity: 1, transform: 'translateX(0)' },
    },
    'fade-in': {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    'scale-up': {
        hidden: { opacity: 0, transform: `scale(${isMobile ? 0.92 : 0.85})` },
        visible: { opacity: 1, transform: 'scale(1)' },
    },
    'scale-down': {
        hidden: { opacity: 0, transform: 'scale(1.05)' },
        visible: { opacity: 1, transform: 'scale(1)' },
    },
    'blur-in': {
        hidden: { opacity: 0, filter: `blur(${isMobile ? 4 : 12}px)`, transform: `translateY(${isMobile ? 10 : 20}px)` },
        visible: { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' },
    },
    'slide-up-large': {
        hidden: { opacity: 0, transform: `translateY(${isMobile ? 40 : 100}px)` },
        visible: { opacity: 1, transform: 'translateY(0)' },
    },
})

export function ScrollReveal({
    children,
    variant = 'fade-up',
    delay = 0,
    duration = 800,
    className,
    once = true,
    threshold = 0.15,
    as: Component = 'div',
    staggerChildren = 0,
    easing = 'cubic-bezier(0.16, 1, 0.3, 1)',
}: ScrollRevealProps) {
    const { ref, isVisible } = useScrollReveal({ threshold, once })
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])

    const styles = getVariantStyles(isMobile)[variant]

    // Cap delay and duration on mobile for snappier feel
    const effectiveDelay = isMobile ? Math.min(delay, 200) : delay
    const effectiveDuration = isMobile ? Math.min(duration, 600) : duration

    const baseStyle: CSSProperties = {
        ...(isVisible ? styles.visible : styles.hidden),
        transition: `all ${effectiveDuration}ms ${easing} ${effectiveDelay}ms`,
        // Only set willChange before animation, clear after
        willChange: isVisible ? 'auto' : 'transform, opacity',
    }

    if (staggerChildren > 0) {
        const effectiveStagger = isMobile ? Math.min(staggerChildren, 80) : staggerChildren
        return (
            <Component
                ref={ref as React.Ref<HTMLDivElement>}
                className={cn(className)}
            >
                {React.Children.map(children, (child, index) => {
                    if (!React.isValidElement(child)) return child
                    const childDelay = effectiveDelay + index * effectiveStagger
                    const childStyle: CSSProperties = {
                        ...(isVisible ? styles.visible : styles.hidden),
                        transition: `all ${effectiveDuration}ms ${easing} ${childDelay}ms`,
                        willChange: isVisible ? 'auto' : 'transform, opacity',
                    }
                    return (
                        <div style={childStyle}>
                            {child}
                        </div>
                    )
                })}
            </Component>
        )
    }

    return (
        <Component
            ref={ref as React.Ref<HTMLDivElement>}
            className={cn(className)}
            style={baseStyle}
        >
            {children}
        </Component>
    )
}

// Animated counter that counts up when visible
export function AnimatedCounter({
    value,
    suffix = '',
    prefix = '',
    duration = 2000,
    className,
}: {
    value: number | string
    suffix?: string
    prefix?: string
    duration?: number
    className?: string
}) {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.5 })
    const [displayValue, setDisplayValue] = React.useState(0)
    const numericValue = typeof value === 'number' ? value : parseInt(value, 10)
    const isNumeric = !isNaN(numericValue)

    React.useEffect(() => {
        if (!isVisible || !isNumeric) return

        let startTime: number
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setDisplayValue(Math.floor(easedProgress * numericValue))

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [isVisible, numericValue, duration, isNumeric])

    return (
        <span ref={ref} className={className}>
            {prefix}
            {isNumeric ? displayValue : value}
            {suffix}
        </span>
    )
}

// Text that reveals word by word
export function TextReveal({
    text,
    className,
    wordClassName,
    delay = 0,
    stagger = 50,
}: {
    text: string
    className?: string
    wordClassName?: string
    delay?: number
    stagger?: number
}) {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.3 })
    const words = text.split(' ')

    return (
        <span ref={ref} className={cn('inline', className)}>
            {words.map((word, i) => (
                <span
                    key={i}
                    className={cn('inline-block overflow-hidden', wordClassName)}
                    style={{ marginRight: '0.25em' }}
                >
                    <span
                        className="inline-block"
                        style={{
                            transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
                            opacity: isVisible ? 1 : 0,
                            transition: `all 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay + i * stagger}ms`,
                        }}
                    >
                        {word}
                    </span>
                </span>
            ))}
        </span>
    )
}

// Parallax wrapper — disabled on mobile for performance
export function Parallax({
    children,
    speed = 0.3,
    className,
}: {
    children: React.ReactNode
    speed?: number
    className?: string
}) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])

    // On mobile, render statically — no scroll tracking
    const { ref, scrollProgress } = useScrollReveal({ once: false, trackProgress: !isMobile })
    const offset = isMobile ? 0 : (scrollProgress - 0.5) * speed * 100

    return (
        <div
            ref={ref}
            className={className}
            style={isMobile ? undefined : {
                transform: `translateY(${offset}px)`,
                transition: 'transform 100ms linear',
                willChange: 'transform',
            }}
        >
            {children}
        </div>
    )
}
