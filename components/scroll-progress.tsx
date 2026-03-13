'use client'

import { useEffect, useRef, useState } from 'react'

export function ScrollProgress() {
    const [progress, setProgress] = useState(0)
    const ticking = useRef(false)

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            setProgress(scrollPercent)
            ticking.current = false
        }

        const onScroll = () => {
            if (!ticking.current) {
                ticking.current = true
                requestAnimationFrame(updateProgress)
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        updateProgress()
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-transparent">
            <div
                className="h-full"
                style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6)',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
                    transition: 'width 100ms ease-out',
                }}
            />
        </div>
    )
}
