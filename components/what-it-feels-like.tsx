'use client'

import { useEffect, useRef, useState } from 'react'

export function WhatItFeelsLike() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const values = [
    'Deep conversations',
    'Real learning',
    'Genuine connections',
    'Long-term relationships',
  ]

  return (
    <section ref={sectionRef} className="py-32 border-t border-white/5 relative overflow-hidden">
      {/* Blurred background elements */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-amber-900/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-amber-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Heading */}
          <div className={`transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              What it feels like <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">inside.</span>
            </h2>
          </div>

          {/* Subtitle */}
          <div className={`transition-all duration-1000 transform delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed max-w-3xl">
              This is a place <span className="text-white">for thoughtful conversations, shared learning, and genuine collaboration.</span>
            </p>
          </div>

          {/* Main card with quote */}
          <div
            className={`border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm transition-all duration-1000 transform delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Decorative line */}
            <div className="h-px bg-gradient-to-r from-amber-500/50 to-transparent mb-8" />

            <p className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-12 text-white">
              The value isn't in the number of messages — it's in the <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">quality of the people.</span>
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent mb-8" />

            {/* Value badges */}
            <div className="flex flex-wrap gap-3">
              {values.map((value, index) => (
                <div
                  key={value}
                  className={`px-6 py-3 rounded-full border border-amber-600/40 bg-amber-900/20 text-amber-200 text-sm md:text-base font-medium backdrop-blur-sm transition-all duration-500 transform delay-300 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${400 + index * 100}ms` : '0ms',
                  }}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom statement */}
          <div className={`transition-all duration-1000 transform delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-lg text-zinc-400 italic">
              No presentations. No noise. Just real founders helping real founders win.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
