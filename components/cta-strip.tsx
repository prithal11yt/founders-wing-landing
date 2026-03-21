'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/scroll-reveal'

export function CTAStrip({ text = "Ready to join?", buttonText = "Apply to Join" }: { text?: string; buttonText?: string }) {
  return (
    <ScrollReveal variant="fade-up" duration={800}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-6 px-5 md:py-8 md:px-8 neu-flat rounded-2xl">
          <p className="text-base md:text-lg font-semibold text-foreground text-center sm:text-left">{text}</p>
          <Button
            size="lg"
            className="rounded-full px-8 h-12 text-sm font-semibold neu-button-primary shadow-[0_0_20px_rgba(2,132,199,0.3)] shrink-0"
            onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </ScrollReveal>
  )
}
