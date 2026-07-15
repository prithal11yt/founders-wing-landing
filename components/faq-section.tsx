'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'

const faqs = [
  {
    q: "What is the 'First ₹10K in 30 Days' challenge?",
    a: "It's our flagship 30-day sprint where a cohort of founders each pick an AI-friendly idea, build together, and race to earn their first ₹10,000. You get daily action prompts, a live leaderboard to track everyone's progress, an accountability buddy, weekly group calls with Prithal, and a private sprint channel. New cohorts start every month.",
  },
  {
    q: "I haven't started anything yet — is this for me?",
    a: "Yes, 100%. Most of our members are in the same boat — full of ideas but stuck overthinking. This community is specifically designed to help you go from 'I want to start' to actually launching. You don't need experience, just the willingness to take action.",
  },
  {
    q: 'How much does it cost?',
    a: "We offer two plans: ₹2,999 for 6 months (just ₹500/month) or ₹4,999 for a full year (just ₹417/month). No monthly option — we want committed members who are serious about building, not people who sign up and forget.",
  },
  {
    q: 'What do I actually get inside?',
    a: "Weekly AI tool breakdowns with real use cases, accountability groups (4-5 founders at your stage), step-by-step launch playbooks, monthly live Q&As with Prithal, and a private community of action-takers. Think of it as your founder support system.",
  },
  {
    q: 'What platform does the community run on?',
    a: 'We run on a private platform with channels for business ideas, AI tools, progress updates, and weekly sessions. You get instant access once your application is approved.',
  },
  {
    q: 'How is this different from your free WhatsApp group?',
    a: "The free WhatsApp group is great for general discussion, but it's 5,000+ people. Founders Wing is smaller, focused, and action-oriented. You get structured sprints, accountability partners, leaderboard competitions, and members who are committed (because they paid to be here).",
  },
  {
    q: 'What is the time commitment?',
    a: "There's no mandatory hours. Most members spend 2-3 hours per week — joining the weekly session, checking in with their accountability group, and sharing progress. The key is consistency, not hours.",
  },
  {
    q: 'Can I cancel?',
    a: "Your access continues for the full duration of your plan (6 or 12 months). After that, you can choose not to renew. There are no refunds — we want members who are committed to showing up and doing the work.",
  },
  {
    q: 'What happens after I apply?',
    a: "We review applications within 3-5 days. We're looking for people who are genuinely serious about starting — not lurkers. If approved, you'll get an email with payment link and onboarding details.",
  },
]

interface FaqItem {
  q: string
  a: string
}

export function FAQSection({ faqs: customFaqs }: { faqs?: FaqItem[] } = {}) {
  const items = customFaqs ?? faqs
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10 max-w-3xl">
        <ScrollReveal variant="fade-up" duration={800}>
          <div className="text-center mb-16 space-y-4">
            <p className="text-sm font-medium tracking-widest uppercase text-violet-600">Common questions</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200} duration={800}>
          <Accordion.Root type="single" collapsible className="space-y-3">
            {items.map((faq, i) => (
              <Accordion.Item
                key={i}
                value={`faq-${i}`}
                className="neu-flat rounded-2xl overflow-hidden transition-colors data-[state=open]:border-violet-500/20"
              >
                <Accordion.Trigger className="w-full flex items-center justify-between px-6 py-5 text-left group cursor-pointer">
                  <span className="text-base font-medium text-foreground pr-4 group-hover:text-violet-600 transition-colors">
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
