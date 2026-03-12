'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, X } from 'lucide-react'

export function WhoThisIsFor() {
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

  return (
    <section ref={sectionRef} className="py-24 border-t border-white/5 relative overflow-hidden">
      {/* Blurred background elements */}
      <div className="absolute top-1/3 left-0 w-[600px] h-[400px] bg-amber-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-16">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Who this is for.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* This is for */}
          <div
            className={`border border-white/10 rounded-2xl p-8 backdrop-blur-sm transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium mb-6">
              This is for
            </div>

            <h3 className="text-3xl font-bold mb-8">Founders who:</h3>

            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center group-hover:bg-amber-500/50 transition-colors">
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </div>
                <span className="text-zinc-300 text-lg">Are already running a revenue-generating business</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center group-hover:bg-amber-500/50 transition-colors">
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </div>
                <span className="text-zinc-300 text-lg">Lead teams of 5+ people</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center group-hover:bg-amber-500/50 transition-colors">
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </div>
                <span className="text-zinc-300 text-lg">Care about learning, adapting, and long-term thinking</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/30 border border-amber-500/50 flex items-center justify-center group-hover:bg-amber-500/50 transition-colors">
                  <ArrowRight className="w-3 h-3 text-amber-300" />
                </div>
                <span className="text-zinc-300 text-lg">Are genuinely curious about AI, technology, and modern business</span>
              </li>
            </ul>
          </div>

          {/* This is not for */}
          <div
            className={`border border-white/10 rounded-2xl p-8 backdrop-blur-sm transition-all duration-1000 transform delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-zinc-700/30 border border-zinc-600/50 text-zinc-400 text-sm font-medium mb-6">
              This is not for
            </div>

            <h3 className="text-3xl font-bold mb-8">Pre-revenue founders:</h3>

            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-zinc-600/30 border border-zinc-600/50 flex items-center justify-center group-hover:bg-zinc-600/50 transition-colors">
                  <X className="w-3 h-3 text-zinc-400" />
                </div>
                <span className="text-zinc-400 text-lg">Pre-revenue or idea-stage founders</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-zinc-600/30 border border-zinc-600/50 flex items-center justify-center group-hover:bg-zinc-600/50 transition-colors">
                  <X className="w-3 h-3 text-zinc-400" />
                </div>
                <span className="text-zinc-400 text-lg">Service sellers or self-promoters</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-zinc-600/30 border border-zinc-600/50 flex items-center justify-center group-hover:bg-zinc-600/50 transition-colors">
                  <X className="w-3 h-3 text-zinc-400" />
                </div>
                <span className="text-zinc-400 text-lg">People looking for shortcuts or cheap access</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
