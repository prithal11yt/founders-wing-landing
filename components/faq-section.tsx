'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'

const faqs = [
  {
    q: 'What kind of projects is this for?',
    a: 'Anything you are building with AI: SaaS products, AI automations for clients, apps, AI agencies, content businesses. The goal is the same for everyone. Get it built, get it launched, and get people paying for it.',
  },
  {
    q: "I haven't started anything yet — is this for me?",
    a: "Yes, 100%. Most of our members are in the same boat — full of ideas but stuck overthinking. This community is specifically designed to help you go from 'I want to start' to actually launching. You don't need experience, just the willingness to take action.",
  },
  {
    q: 'How much does it cost?',
    a: 'We offer two plans: ₹5,999 for 6 months (just ₹1,000/month) or ₹9,999 for a full year (just ₹833/month). No monthly option — we want committed members who are serious about building, not people who sign up and forget.',
  },
  {
    q: 'What do I actually get inside?',
    a: 'Weekly live sessions with Prithal (26 every 6 months), a library of recorded sessions, workshops on AI automations, SaaS building and local AI models, real-time feedback on what you’re building, a founder network that helps you get clients, a new AI tool every week, playbooks and templates, and a private WhatsApp group of action-takers.',
  },
  {
    q: 'How is this different from your free WhatsApp group?',
    a: "The free WhatsApp group is great for general discussion, but it's 5,000+ people. Founders Wing is smaller, focused, and action-oriented. You get weekly live sessions, feedback on your work, introductions to customers, and members who are committed (because they paid to be here).",
  },
  {
    q: 'What is the time commitment?',
    a: "There's no mandatory hours. Most members spend 2-3 hours per week — joining the weekly session, sharing progress, and asking for feedback. The key is consistency, not hours.",
  },
  {
    q: 'Can I cancel?',
    a: 'Your access continues for the full duration of your plan (6 or 12 months). After that, you can choose not to renew. There are no refunds — we want members who are committed to showing up and doing the work.',
  },
  {
    q: 'What happens after I apply?',
    a: 'Fill in the 2 minute form, complete the payment, and you’re in. You get the WhatsApp group link and onboarding details straight away, and the next live session is never more than a week out.',
  },
]

interface FaqItem {
  q: string
  a: string
}

export function FAQSection({ faqs: customFaqs }: { faqs?: FaqItem[] } = {}) {
  const items = customFaqs ?? faqs
  return (
    <section className="py-20 md:py-28 bg-neutral-50">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="text-center text-4xl md:text-6xl font-medium tracking-[-0.045em]">FAQs</h2>
        <Accordion.Root type="single" collapsible className="mt-12 border-t border-neutral-200">
          {items.map((faq, i) => (
            <Accordion.Item key={i} value={`faq-${i}`} className="border-b border-neutral-200">
              <Accordion.Trigger className="group w-full flex items-center justify-between gap-6 py-5 text-left text-base md:text-lg font-medium cursor-pointer">
                {faq.q}
                <Plus className="w-5 h-5 shrink-0 text-neutral-400 transition-transform group-data-[state=open]:rotate-45" />
              </Accordion.Trigger>
              <Accordion.Content className="overflow-hidden">
                <p className="pb-5 text-neutral-600 leading-relaxed">{faq.a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  )
}
