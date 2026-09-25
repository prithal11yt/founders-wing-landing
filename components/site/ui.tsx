import { ChevronRight } from 'lucide-react'
import { ACCENT } from './brand'

/* Shared bits of the Founders Wing site: where "Get Membership" goes, the plans,
   what membership includes, and the tool logos (public/tools/*.svg, Simple Icons). */

export const JOIN = '/#apply'

export const PLANS = {
  starter: { label: '6 months', price: '₹5,999', monthly: '₹1,000', billed: 'Billed ₹5,999 for 6 months' },
  annual: { label: '12 months', price: '₹9,999', monthly: '₹833', billed: 'Billed ₹9,999 for 12 months' },
} as const
export type PlanKey = keyof typeof PLANS

export const INCLUDED = [
  'Weekly live sessions with Prithal (26 every 6 months)',
  'Library of 10+ recorded sessions',
  'Real-time feedback on what you’re building',
  'Workshops: AI automations, SaaS building, local AI models',
  'A founder network that helps you get clients',
  'Private members-only WhatsApp group',
  'A new AI tool every week',
  'AI playbooks, templates & the 50 Business Ideas ebook',
]

export const TOOLS = {
  n8n: 'n8n', make: 'Make', zapier: 'Zapier', claude: 'Claude', cursor: 'Cursor', supabase: 'Supabase', vercel: 'Vercel',
  stripe: 'Stripe', ollama: 'Ollama', lmstudio: 'LM Studio', huggingface: 'Hugging Face', perplexity: 'Perplexity',
  elevenlabs: 'ElevenLabs', googlegemini: 'Gemini', notion: 'Notion', figma: 'Figma', razorpay: 'Razorpay', whatsapp: 'WhatsApp',
} as const
export type ToolSlug = keyof typeof TOOLS

export function ToolLogo({ slug, className = 'w-5 h-5' }: { slug: ToolSlug; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/tools/${slug}.svg`} alt={TOOLS[slug]} className={`${className} object-contain`} />
}

export function PrimaryCTA({
  children = 'Get Membership',
  href = JOIN,
  full = false,
  className = '',
}: {
  children?: React.ReactNode
  href?: string
  full?: boolean
  className?: string
}) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center justify-center gap-1.5 rounded-full h-12 px-7 text-[15px] font-medium text-white transition-all hover:brightness-110 ${full ? 'w-full' : ''} ${className}`}
      style={{ background: ACCENT }}
    >
      {children}
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  )
}
