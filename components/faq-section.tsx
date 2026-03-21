'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'

const faqs = [
  {
    q: 'What platform does the community run on?',
    a: 'We run on a private, invite-only platform with dedicated channels for AI strategy, tool comparisons, implementation help, and weekly deep dives. You get access the moment your application is approved.',
  },
  {
    q: 'What does the monthly fee include?',
    a: 'Your membership covers full access to the online community, weekly AI deep dive sessions, the curated tool & prompt library, early access to new AI models and strategies, and priority invitations to physical events when they launch.',
  },
  {
    q: 'How are members selected?',
    a: "We review every application personally. We're looking for founders who are actively building with AI, have something concrete to contribute, and are willing to engage — not lurk. We care less about your resume and more about what you're doing right now.",
  },
  {
    q: 'What is the time commitment?',
    a: "There's no mandatory time commitment. Most members engage 2-3 times per week — dropping into discussions, sharing wins or challenges, and attending the weekly deep dive. You get out what you put in.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Membership is month-to-month with no lock-in. If the community stops being valuable, you can cancel with one click. We earn your membership every month.',
  },
  {
    q: 'Is this only for Indian founders?',
    a: "We started in India and our physical events will initially be in Bangalore, but the online community is global. If you're building with AI and meet our criteria, you're welcome regardless of location.",
  },
  {
    q: 'What happens after I apply?',
    a: "We review applications within 3-5 business days. If you're a fit, you'll receive an email with your invitation and onboarding details. If we need more information, we'll reach out directly.",
  },
]

export function FAQSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 max-w-3xl">
        <ScrollReveal variant="fade-up" duration={800}>
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm font-medium tracking-widest uppercase text-violet-400">Common questions</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200} duration={800}>
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <Accordion.Item
                key={i}
                value={`faq-${i}`}
                className="neu-flat rounded-2xl overflow-hidden transition-colors data-[state=open]:border-violet-500/20"
              >
                <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group cursor-pointer">
                  <span className="text-base font-medium text-foreground pr-4 group-hover:text-violet-300 transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
                <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                  <div className="px-6 pb-5 text-muted-foreground leading-relaxed text-sm">
                    {faq.a}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </ScrollReveal>
      </div>
    </section>
  )
}
