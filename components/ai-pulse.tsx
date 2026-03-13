'use client'

import { useEffect, useRef, useState } from 'react'
import { Marquee } from '@/components/marquee'

const aiTopicsRow1 = [
  { label: 'AI Agents', color: 'cyan' },
  { label: 'Claude vs GPT', color: 'blue' },
  { label: 'AI Ops Playbooks', color: 'purple' },
  { label: 'Fine-Tuning Models', color: 'cyan' },
  { label: 'AI Sales Automation', color: 'blue' },
  { label: 'Prompt Engineering', color: 'purple' },
  { label: 'RAG Pipelines', color: 'cyan' },
  { label: 'AI Hiring Strategy', color: 'blue' },
]

const aiTopicsRow2 = [
  { label: 'Voice AI', color: 'purple' },
  { label: 'AI Product Strategy', color: 'cyan' },
  { label: 'LLM Cost Optimization', color: 'blue' },
  { label: 'Vertical AI SaaS', color: 'purple' },
  { label: 'AI Workflows', color: 'cyan' },
  { label: 'Multi-Agent Systems', color: 'blue' },
  { label: 'AI GTM Playbooks', color: 'purple' },
  { label: 'Computer Use Agents', color: 'cyan' },
]

const colorMap = {
  cyan: {
    text: 'text-accent-cyan',
    dot: 'bg-accent-cyan',
  },
  blue: {
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  purple: {
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
}

function TopicPill({ label, color }: { label: string; color: 'cyan' | 'blue' | 'purple' }) {
  const c = colorMap[color]
  return (
    <div
      className={`px-5 py-3 md:px-6 md:py-3.5 rounded-full neu-convex text-sm md:text-base font-medium cursor-default shrink-0 transition-all duration-300 hover:scale-105 ${c.text}`}
    >
      <span className="relative flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full animate-pulse ${c.dot}`}
        />
        {label}
      </span>
    </div>
  )
}

export function AIPulse() {
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
    <section ref={sectionRef} className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Heading */}
          <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
              What&apos;s being discussed{' '}
              <span className="text-accent-cyan">right now.</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Real conversations happening inside Founders Wing —{' '}
              <span className="text-foreground">not LinkedIn reposts.</span>
            </p>
          </div>

          {/* Marquee rows */}
          <div className={`space-y-4 pt-8 transition-all duration-1000 transform delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Marquee speed={25} pauseOnHover>
              {aiTopicsRow1.map((topic) => (
                <TopicPill key={topic.label} label={topic.label} color={topic.color as 'cyan' | 'blue' | 'purple'} />
              ))}
            </Marquee>

            <Marquee speed={30} reverse pauseOnHover>
              {aiTopicsRow2.map((topic) => (
                <TopicPill key={topic.label} label={topic.label} color={topic.color as 'cyan' | 'blue' | 'purple'} />
              ))}
            </Marquee>
          </div>

          {/* Bottom statement */}
          <div className={`text-center transition-all duration-1000 transform delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="text-lg text-muted-foreground italic">
              These aren&apos;t theoretical — they&apos;re live threads from founders actively deploying AI.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
