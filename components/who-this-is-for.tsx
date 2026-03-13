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
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-16">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
            Who this is for.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* This is for */}
          <div
            className={`rounded-3xl p-8 neu-flat transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <div className="inline-block px-4 py-2 rounded-2xl neu-pressed text-accent-cyan text-sm font-medium mb-6">
              This is for
            </div>

            <h3 className="text-3xl font-bold mb-8 text-foreground">Founders who:</h3>

            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full neu-convex flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-accent-cyan" />
                </div>
                <span className="text-muted-foreground text-lg">Are actively building AI-powered products or integrating AI into their business</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full neu-convex flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-accent-cyan" />
                </div>
                <span className="text-muted-foreground text-lg">Want to understand AI deeply — not just read headlines</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full neu-convex flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-accent-cyan" />
                </div>
                <span className="text-muted-foreground text-lg">Are deploying AI agents, automation, and workflows in production</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full neu-convex flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 text-accent-cyan" />
                </div>
                <span className="text-muted-foreground text-lg">Want to learn from peers who are in the trenches — not influencers</span>
              </li>
            </ul>
          </div>

          {/* This is not for */}
          <div
            className={`rounded-3xl p-8 neu-pressed transition-all duration-1000 transform delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <div className="inline-block px-4 py-2 rounded-2xl neu-convex text-muted-foreground text-sm font-medium mb-6">
              This is not for
            </div>

            <h3 className="text-3xl font-bold mb-8 text-foreground opacity-70">People who:</h3>

            <ul className="space-y-6 opacity-80">
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full neu-flat flex items-center justify-center transition-colors">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground text-lg">Are passive AI observers who just want to &quot;stay updated&quot;</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full neu-flat flex items-center justify-center transition-colors">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground text-lg">Are service sellers or AI course promoters</span>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full neu-flat flex items-center justify-center transition-colors">
                  <X className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground text-lg">Are looking for hype without substance</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
