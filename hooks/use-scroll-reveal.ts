'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ScrollRevealOptions {
    threshold?: number
    rootMargin?: string
    once?: boolean
    trackProgress?: boolean // opt-in: only Parallax needs this
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
    const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true, trackProgress = false } = options
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (once) observer.unobserve(element)
                } else if (!once) {
                    setIsVisible(false)
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(element)
        return () => observer.disconnect()
    }, [threshold, rootMargin, once])

    // Only attach scroll listener when trackProgress is explicitly true
    useEffect(() => {
        if (!trackProgress) return

        let ticking = false
        const updateProgress = () => {
            if (!ref.current) return
            const rect = ref.current.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const elementTop = rect.top
            const elementHeight = rect.height

            const progress = Math.min(
                Math.max((windowHeight - elementTop) / (windowHeight + elementHeight), 0),
                1
            )
            setScrollProgress(progress)
            ticking = false
        }

        const onScroll = () => {
            if (!ticking) {
                ticking = true
                requestAnimationFrame(updateProgress)
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        updateProgress()
        return () => window.removeEventListener('scroll', onScroll)
    }, [trackProgress])

    return { ref, isVisible, scrollProgress }
}
