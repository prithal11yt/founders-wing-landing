import { Phone } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/contact'
import { ACCENT, Wordmark } from './brand'
import { JOIN } from './ui'

const LINKS = [
  // Too many links for a tablet, so these three wait for wider screens.
  { label: 'What’s Included', href: '/#benefits', wideOnly: true },
  { label: 'Stories', href: '/#stories', wideOnly: true },
  { label: 'Our Why', href: '/#founder', wideOnly: true },
  { label: 'Events', href: '/events' },
  { label: 'Ideas', href: '/ideas' },
  { label: 'Grants', href: '/grants' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQs', href: '/#faq' },
]

/* Floating dark pill, sits under the offer banner. Links are absolute so it works on every page. */
export function SiteNav() {
  return (
    <header className="fixed top-[52px] md:top-[60px] left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl">
      <div className="flex items-center justify-between rounded-full bg-neutral-900/95 backdrop-blur-md text-white pl-5 pr-2 h-12 md:h-14 shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
        <a href="/" className="flex items-center" aria-label="Founders Wing home">
          <Wordmark className="text-[17px]" />
        </a>
        <nav className="hidden md:flex items-center gap-7 text-[13px] text-white/70">
          {LINKS.map(l => (
            <a key={l.href} href={l.href} className={`whitespace-nowrap hover:text-white transition-colors ${l.wideOnly ? 'hidden lg:inline' : ''}`}>{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <a href={PHONE_TEL} aria-label={`Call ${PHONE_DISPLAY}`} className="p-2.5 rounded-full text-white/75 hover:text-white hover:bg-white/10 transition-colors">
            <Phone className="w-4 h-4" />
          </a>
          <a href={JOIN} className="rounded-full h-9 md:h-10 px-4 md:px-5 inline-flex items-center whitespace-nowrap text-[13px] font-medium text-white hover:brightness-110 transition-all" style={{ background: ACCENT }}>
            Get Membership
          </a>
        </div>
      </div>
    </header>
  )
}
