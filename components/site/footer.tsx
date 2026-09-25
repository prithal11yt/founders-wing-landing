import Link from 'next/link'
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '@/lib/contact'
import { Wordmark } from './brand'

// The resource links feed the SEO pages; keep them on every page.
const RESOURCES = [
  { href: '/community/founder-community-india', label: 'Founder community India' },
  { href: '/guide/how-to-make-first-money-online-india', label: 'Make your first money online' },
  { href: '/tools/ai-tools-for-founders-india', label: 'AI tools for founders' },
  { href: '/guide/how-to-get-first-client-india', label: 'Get your first client' },
  { href: '/community/ai-founder-community', label: 'AI founder community' },
  { href: '/guide/how-to-start-online-business-india', label: 'Start an online business' },
  { href: '/community/entrepreneur-community-india', label: 'Entrepreneur community India' },
  { href: '/guide/how-to-use-ai-to-start-a-business', label: 'Use AI to start a business' },
]

const SITE = [
  { href: '/', label: 'Home' },
  { href: '/#benefits', label: 'What’s included' },
  { href: '/#stories', label: 'Member stories' },
  { href: '/build', label: 'Building with Prithal' },
  { href: '/blog', label: 'Blog' },
  { href: '/#faq', label: 'FAQs' },
]

const CONTACT = [
  { href: PHONE_TEL, label: PHONE_DISPLAY },
  { href: WHATSAPP_URL, label: 'WhatsApp', external: true },
  { href: 'mailto:prithalbhardwaj@gmail.com', label: 'prithalbhardwaj@gmail.com' },
  { href: 'https://youtube.com/@thesoloentrepreneur07', label: 'YouTube', external: true },
  { href: 'https://www.linkedin.com/in/prithal-bhardwaj-058a56187/', label: 'LinkedIn', external: true },
  { href: 'https://x.com/Prithal7', label: 'X', external: true },
]

function Col({ title, links }: { title: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 font-semibold">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map(l => (
          <li key={l.href}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-300 hover:text-white transition-colors">{l.label}</a>
            ) : (
              <Link href={l.href} className="text-sm text-neutral-300 hover:text-white transition-colors">{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-6xl px-5 py-14 md:py-16 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Wordmark className="text-white text-lg" />
          <p className="mt-4 text-sm leading-relaxed max-w-xs">
            Build it with AI. Get paying customers. India’s community for people building SaaS, AI automations and AI businesses.
          </p>
        </div>
        <Col title="Founders Wing" links={SITE} />
        <Col title="Resources" links={RESOURCES} />
        <Col title="Contact" links={CONTACT} />
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-5 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 Founders Wing. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
