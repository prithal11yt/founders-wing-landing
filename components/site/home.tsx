'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { Check, Globe, Linkedin, MessageCircle, Phone, Plus, Play, Youtube, Zap, ShieldCheck, CreditCard } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '@/lib/contact'
import { COUPON_CODE, offerSpotsLeft } from '@/lib/offer'
import { ACCENT, WingMark, Wordmark } from '@/components/site/brand'
import { INCLUDED, PLANS, PrimaryCTA, ToolLogo, TOOLS, type PlanKey, type ToolSlug } from '@/components/site/ui'
import { MembershipCard } from '@/components/site/membership-card'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { WaitlistForm } from '@/components/waitlist-form'

/* The Founders Wing homepage. Real copy, real members, real live member count. */

const STORIES = [
  // focus = where the face sits in each vertical video, so the 4:5 crop keeps it in frame
  { name: 'Harjot Singh', role: 'Founder, DoLoyal', video: '/testimonials/harjot.mp4', poster: '/testimonials/harjot.jpg', focus: 'center 28%', quote: 'I consider joining Founders Wing the best decision of my life.' },
  { name: 'Aniruddha Das', role: 'Member since June 2026', video: '/testimonials/aniruddha.mp4', poster: '/testimonials/aniruddha.jpg', focus: 'center 28%', quote: 'We just share the ideas what we are building… helping each other. The impact is enormous for me.' },
  { name: 'Sanjay Sharma', role: "Accountant, 20+ years' experience", video: '/testimonials/sanjay.mp4', poster: '/testimonials/sanjay.jpg', focus: 'center 55%', context: 'New to AI — learning to make money with it.' },
]

const FAQS = [
  { q: 'What kind of projects is this for?', a: 'Anything you are building with AI: SaaS products, AI automations for clients, apps, AI agencies, content businesses. The goal is the same for everyone. Get it built, get it launched, and get people paying for it.' },
  { q: "I haven't started anything yet — is this for me?", a: "Yes, 100%. Most of our members are in the same boat — full of ideas but stuck overthinking. This community is specifically designed to help you go from 'I want to start' to actually launching. You don't need experience, just the willingness to take action." },
  { q: 'How much does it cost?', a: 'Two plans: ₹5,999 for 6 months (just ₹1,000/month) or ₹9,999 for a full year (just ₹833/month). No monthly option — we want committed members who are serious about building.' },
  { q: 'What is the time commitment?', a: "No mandatory hours. Most members spend 2-3 hours per week — joining the weekly session, checking in with their accountability buddy, and sharing progress. The key is consistency, not hours." },
  { q: 'How is this different from your free WhatsApp group?', a: "The free WhatsApp group is great for general discussion, but it's 5,000+ people. Founders Wing is smaller, focused, and action-oriented — weekly live sessions, accountability partners, Hot Seat coaching, and members who are committed because they paid to be here." },
  { q: 'Can I cancel?', a: 'Your access continues for the full duration of your plan (6 or 12 months). After that, you can choose not to renew. There are no refunds — we want members who are committed to showing up and doing the work.' },
]

function useMemberCount() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/public/member-count').then(r => r.json()).then(d => setCount(typeof d.count === 'number' ? d.count : null)).catch(() => {})
  }, [])
  return count
}

/* ─────────── Page ─────────── */
export function Home() {
  const count = useMemberCount()
  const nextMemberNo = count !== null ? count + 1 : null
  const couponOn = count !== null && offerSpotsLeft(count) > 0

  return (
    <div className="min-h-screen bg-white text-neutral-950 antialiased">
      <SiteNav />
      <Hero count={count} />
      <StatsStrip count={count} />
      <ToolsStrip />
      <FounderStory />
      <WhatYouGet />
      <Membership nextMemberNo={nextMemberNo} couponOn={couponOn} />
      <MemberStories />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <Apply nextMemberNo={nextMemberNo} />
      <SiteFooter />
    </div>
  )
}

/* Hero: message on the left, the founder intro video on the right.
   The membership card appears only once — in the membership section. */
function Hero({ count }: { count: number | null }) {
  const [playing, setPlaying] = useState(false)
  return (
    <section className="pt-36 md:pt-44 pb-16 md:pb-24">
      <div className="mx-auto max-w-6xl px-5 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-sm text-neutral-500 mb-5"><WingMark className="h-3.5 w-auto" gradient /> For people building with AI</p>
          <h1 className="text-[44px] leading-[1.02] md:text-7xl font-medium tracking-[-0.045em]">
            Build it with AI.
            <br />
            <span className="text-neutral-400">Get paying customers.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-md">
            For people building SaaS, AI automations and AI-powered businesses who want to make money from them. Build here, get feedback, and use the network to reach paying customers faster.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <PrimaryCTA />
            <a href={PHONE_TEL} className="inline-flex items-center gap-2 rounded-full h-12 px-6 text-[15px] font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors">
              <Phone className="w-4 h-4" style={{ color: ACCENT }} /> Enquire now
            </a>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {['harjot', 'aniruddha', 'sanjay'].map(n => (
                <Image key={n} src={`/testimonials/${n}.jpg`} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
              ))}
              <Image src="/prithal.jpg" alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-white" />
            </div>
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">{count ?? '40+'} founders</span> already inside
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-[22px] md:rounded-[26px] overflow-hidden bg-neutral-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.4)]" style={{ aspectRatio: '16 / 9' }}>
            {playing ? (
              <iframe
                src="https://www.youtube.com/embed/nIzxuXWG0Pc?autoplay=1&rel=0"
                title="What is Founders Wing?"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <button onClick={() => setPlaying(true)} aria-label="Play: What is Founders Wing?" className="group absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://img.youtube.com/vi/nIzxuXWG0Pc/maxresdefault.jpg" alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-white/95 flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-6 h-6 md:w-7 md:h-7 ml-1" style={{ color: ACCENT }} fill="currentColor" />
                </span>
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-[15px] font-medium">What is Founders Wing?</p>
              <p className="text-sm text-neutral-500">Watch Prithal explain it · 10 min</p>
            </div>
            <p className="hidden sm:flex items-center gap-1.5 text-sm text-neutral-500">
              <Zap className="w-4 h-4" style={{ color: ACCENT }} /> Weekly live sessions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsStrip({ count }: { count: number | null }) {
  const stats = [
    { v: '50K+', l: 'YouTube subscribers' },
    { v: count !== null ? String(count) : '40+', l: 'Founding members' },
    { v: '26', l: 'Live sessions every 6 months' },
    { v: '5,000+', l: 'In the free WhatsApp community' },
  ]
  return (
    <section className="border-y border-neutral-100">
      <div className="mx-auto max-w-6xl px-5 grid grid-cols-2 md:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.l} className={`py-8 md:py-10 px-2 md:px-6 ${i > 0 ? 'md:border-l border-neutral-100' : ''} ${i % 2 === 1 ? 'border-l md:border-l border-neutral-100' : ''} ${i > 1 ? 'border-t md:border-t-0 border-neutral-100' : ''}`}>
            <p className="text-3xl md:text-4xl font-medium tracking-[-0.03em]">{s.v}</p>
            <p className="text-sm text-neutral-500 mt-1">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* Superpower's "So we built superpower": black, huge type, lines light up as you scroll.
   Lines start grey (never invisible), so nothing depends on the observer firing. */
function FounderStory() {
  const lines = [
    'Anyone can build with AI now.',
    'Getting people to pay for it',
    'is the hard part.',
  ]
  return (
    <section id="founder" className="bg-neutral-950 text-white py-24 md:py-36">
      <div className="mx-auto max-w-4xl px-5">
        <div className="space-y-1 md:space-y-2">
          {lines.map(l => <RevealLine key={l} text={l} className="text-4xl md:text-6xl font-medium tracking-[-0.04em] leading-[1.08]" />)}
        </div>
        <p className="mt-12 md:mt-16 text-4xl md:text-6xl font-medium tracking-[-0.04em] leading-[1.05]">
          <span className="text-neutral-500">So we built</span>
          <br />
          <Wordmark gradient />
        </p>
        <p className="mt-8 max-w-2xl text-lg md:text-xl text-neutral-400 leading-relaxed">
          A paid room of people building SaaS, AI automations and AI businesses. You build, and the room helps you launch it, improve it and get in front of the people who&apos;ll pay for it. Faster than doing it alone.
        </p>
        <div className="mt-12 flex items-center gap-4">
          <Image src="/prithal.jpg" alt="Prithal Bhardwaj" width={56} height={56} className="w-14 h-14 rounded-full object-cover" />
          <div>
            <p className="font-medium">Prithal Bhardwaj</p>
            <p className="text-sm text-neutral-400">Founder · 5+ years building businesses · The Solo Entrepreneur on YouTube</p>
          </div>
        </div>
        {/* Same links as the live site's Meet the Founder section */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {[
            { href: 'https://youtube.com/@thesoloentrepreneur07', label: 'YouTube', sub: '50K+ subscribers', icon: <Youtube className="w-4 h-4 text-red-500" /> },
            { href: 'https://www.linkedin.com/in/prithal-bhardwaj-058a56187/', label: 'LinkedIn', sub: 'Prithal Bhardwaj', icon: <Linkedin className="w-4 h-4 text-sky-400" /> },
            { href: 'https://x.com/Prithal7', label: '𝕏', sub: '@Prithal7', icon: null },
            { href: 'https://thesoloentrepreneur.in', label: 'Website', sub: 'thesoloentrepreneur.in', icon: <Globe className="w-4 h-4 text-sky-400" /> },
          ].map(l => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 transition-colors pl-3 pr-4 py-2">
              {l.icon}
              <span className="text-sm font-medium">{l.label}</span>
              <span className="text-xs text-neutral-500">{l.sub}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function RevealLine({ text, className }: { text: string; className: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Light up once the line passes the lower quarter of the screen, then stay lit.
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setLit(true) }, { rootMargin: '0px 0px -25% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <p ref={ref} className={`${className} transition-colors duration-500 ${lit ? 'text-white' : 'text-neutral-600'}`}>{text}</p>
}

/* Superpower's membership block: card left, offer right, trust row, accordion. */
function Membership({ nextMemberNo, couponOn }: { nextMemberNo: number | null; couponOn: boolean }) {
  const [plan, setPlan] = useState<PlanKey>('starter')
  const [open, setOpen] = useState<number | null>(null)
  const extra = [
    { q: "What's included exactly?", a: INCLUDED.join(' · ') + '.' },
    { q: 'How do the live sessions work?', a: 'Every week Prithal runs a live call — AI tool breakdowns, your questions answered, and Hot Seat coaching where a member gets focused help on their specific blocker. Recordings are shared in the community.' },
  ]
  return (
    <section id="membership" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <div className="relative rounded-[28px] aspect-[5/4] flex items-center justify-center p-8 md:p-14" style={{ background: 'radial-gradient(70% 60% at 50% 45%, #e6f3fb 0%, #f4f4f5 72%)' }}>
            {nextMemberNo && (
              <div className="absolute top-4 right-4 md:top-5 md:right-5 rounded-full bg-neutral-900 text-white text-xs font-medium px-3.5 py-2">
                You&apos;d be member #{nextMemberNo}
              </div>
            )}
            <MembershipCard plan={plan} memberNo={nextMemberNo} className="max-w-[400px]" />
          </div>
        </div>

        <div>
          <p className="text-[15px] text-neutral-500">Two days of offline workshops cost ₹6,000+. Six months here is ₹5,999.</p>
          <h2 className="mt-3 text-5xl md:text-6xl font-medium tracking-[-0.045em] leading-[1.02]">Founders Wing<br />Membership</h2>
          <p className="mt-5 text-neutral-600 leading-relaxed">
            Everything you need to build your AI project, launch it and get customers, with people who are doing the same.
          </p>

          <div className="mt-7 inline-flex rounded-full bg-neutral-100 p-1">
            {(Object.keys(PLANS) as PlanKey[]).map(k => (
              <button key={k} onClick={() => setPlan(k)} className={`rounded-full px-5 h-9 text-sm font-medium transition-all ${plan === k ? 'bg-white shadow-sm text-neutral-950' : 'text-neutral-500'}`}>
                {PLANS[k].label}{k === 'annual' && <span className="ml-1.5 text-xs" style={{ color: ACCENT }}>Best value</span>}
              </button>
            ))}
          </div>

          <ul className="mt-7 space-y-3">
            {INCLUDED.map(i => (
              <li key={i} className="flex items-start gap-3 text-[15px]">
                <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: ACCENT }} strokeWidth={2.5} />
                <span>{i}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-6xl font-medium tracking-[-0.04em]">{PLANS[plan].monthly}</span>
            <span className="text-neutral-500">/month · {PLANS[plan].billed.toLowerCase()}</span>
          </div>
          {couponOn && (
            <p className="mt-2 text-sm text-neutral-500">
              Use code <span className="font-mono font-semibold text-neutral-900">{COUPON_CODE}</span> for 20% off at checkout
            </p>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
            <span>Pay with</span>
            {['UPI', 'Cards', 'Netbanking'].map(m => <span key={m} className="rounded-md border border-neutral-200 px-2 py-1 font-medium text-neutral-700">{m}</span>)}
          </div>

          <div className="mt-6"><PrimaryCTA full /></div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-neutral-500">
            <span className="inline-flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Instant access</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secure Razorpay checkout</span>
            <a href={PHONE_TEL} className="inline-flex items-center gap-1.5 hover:text-neutral-900"><Phone className="w-3.5 h-3.5" /> Questions? Call us</a>
          </div>

          <div className="mt-8 border-t border-neutral-200">
            {extra.map((f, i) => (
              <div key={f.q} className="border-b border-neutral-200">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between py-4 text-left text-[15px] font-medium">
                  {f.q}
                  <Plus className={`w-4 h-4 text-neutral-400 transition-transform ${open === i ? 'rotate-45' : ''}`} />
                </button>
                {open === i && <p className="pb-4 text-sm text-neutral-600 leading-relaxed">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────── Tools strip ─────────── */
function ToolsStrip() {
  const row: ToolSlug[] = ['n8n', 'make', 'zapier', 'claude', 'cursor', 'supabase', 'vercel', 'stripe', 'ollama', 'huggingface', 'perplexity', 'elevenlabs']
  return (
    <section className="py-10 md:py-12 border-b border-neutral-100">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-neutral-400">Tools you’ll learn to use inside</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-5 md:gap-x-10">
          {row.map(t => (
            <div key={t} className="flex items-center gap-2 text-neutral-500 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <ToolLogo slug={t} className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm font-medium">{TOOLS[t]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────── What you get: scroll-driven ───────────
   The section is tall; a sticky viewport stays put while scrolling swaps the scene on
   the right and lights up the matching benefit on the left (Apple/Linear pattern).
   Scenes are small UI illustrations of each benefit; member names/quotes are real,
   replies and session titles are placeholders to swap for real ones. */
const BENEFITS = [
  { k: 'workshops', stage: 'Build', n: '01', t: 'Workshops on AI automations, SaaS building and local AI', d: 'Hands-on sessions where you build along, with the tools the pros actually use.', scene: WorkshopScene },
  { k: 'library', stage: 'Build', n: '02', t: 'Weekly live sessions, plus a library of 10+ recordings', d: '26 live calls with Prithal every 6 months. Missed one? Every session is recorded and waiting for you.', scene: LibraryScene },
  { k: 'tools', stage: 'Build', n: '03', t: 'Learn new AI tools, every week', d: 'One new tool every week with a real workflow you can use the same day. Not just a demo.', scene: ToolScene },
  { k: 'feedback', stage: 'Launch', n: '04', t: 'Real-time feedback on what you’re building', d: 'Post your landing page, pitch or pricing and get honest feedback from founders the same day, not in three weeks.', scene: FeedbackScene },
  { k: 'network', stage: 'Get customers', n: '05', t: 'A network that gets you clients', d: 'Members bring their own networks. Ask for an intro and someone usually knows the exact person you need.', scene: NetworkScene },
  { k: 'builders', stage: 'Grow', n: '06', t: 'Founders already building SaaS, AI automations and apps', d: 'You’re in a room with people shipping real products, not just talking about them.', scene: BuildersScene },
  { k: 'community', stage: 'Grow', n: '07', t: 'Your private WhatsApp group', d: 'Members only. Wins, questions, feedback, and founders pushing each other to ship.', scene: CommunityScene },
]

function WhatYouGet() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', v => {
    setActive(Math.min(BENEFITS.length - 1, Math.max(0, Math.floor(v * BENEFITS.length))))
  })
  const bar = useTransform(scrollYProgress, [0, 1], ['4%', '100%'])
  const Scene = BENEFITS[active].scene

  return (
    <section ref={ref} id="benefits" className="relative bg-neutral-50" style={{ height: `${BENEFITS.length * 75}vh` }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col">
        <div className="mx-auto w-full max-w-6xl px-5 pt-28 md:pt-32 lg:hidden">
          <p className="text-[15px] text-neutral-500">What you get inside</p>
          <h2 className="mt-2 text-3xl md:text-5xl font-medium tracking-[-0.045em]">Build it. Launch it. Get customers.</h2>
        </div>

        <div className="mx-auto w-full max-w-6xl px-5 flex-1 grid lg:grid-cols-[0.95fr_1.05fr] gap-6 lg:gap-16 items-center pb-6 md:pb-10 lg:pt-28">
          {/* Desktop: heading + the list, active item expands */}
          <div className="hidden lg:block">
            <p className="text-[15px] text-neutral-500">What you get inside</p>
            <h2 className="mt-2 text-[44px] font-medium tracking-[-0.045em] leading-[1.05]">Build it. Launch it.<br />Get customers.</h2>
            <ol className="mt-7 space-y-2.5">
            {BENEFITS.map((b, i) => (
              <li key={b.k} className={`transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-30'}`}>
                {(i === 0 || BENEFITS[i - 1].stage !== b.stage) && (
                  <p className={`text-[11px] uppercase tracking-[0.18em] font-semibold ${i === 0 ? '' : 'mt-4'} mb-1.5`} style={{ color: ACCENT }}>{b.stage}</p>
                )}
                <div className="flex gap-4">
                  <span className="font-mono text-sm pt-1" style={{ color: ACCENT }}>{b.n}</span>
                  <div>
                    <p className="text-lg font-medium tracking-[-0.02em] leading-snug">{b.t}</p>
                    <div className={`grid transition-all duration-500 ${i === active ? 'grid-rows-[1fr] mt-1' : 'grid-rows-[0fr]'}`}>
                      <p className="overflow-hidden text-[15px] text-neutral-600 leading-relaxed">{b.d}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            </ol>
          </div>

          <div>
            <div className="relative rounded-[28px] bg-white border border-neutral-100 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)] overflow-hidden aspect-square lg:aspect-[5/4]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 28, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -18, scale: 0.98 }}
                  transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
                  className="absolute inset-0"
                >
                  <Scene />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Phones: only the active benefit's text */}
            <div className="lg:hidden mt-4 min-h-[96px]">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                  <p className="font-mono text-xs" style={{ color: ACCENT }}>{BENEFITS[active].n} / 0{BENEFITS.length} · <span className="uppercase tracking-[0.14em] font-sans font-semibold">{BENEFITS[active].stage}</span></p>
                  <p className="mt-1 text-lg font-medium tracking-[-0.02em] leading-snug">{BENEFITS[active].t}</p>
                  <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{BENEFITS[active].d}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 md:mt-5 h-1 rounded-full bg-neutral-200 overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ width: bar, background: ACCENT }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* Small chat-style row used by the feedback and network scenes. Authors are roles
   (or Prithal), never invented member names. */
function Reply({ who, text, when, tag }: { who: string; text: string; when: string; tag?: string }) {
  const isP = who === 'Prithal'
  return (
    <div className="flex gap-2.5">
      {isP ? (
        <Image src="/prithal.jpg" alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <span className="w-7 h-7 rounded-full bg-neutral-200 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-neutral-500"><span className="font-semibold text-neutral-800">{who}</span> · {when}{tag && <span className="ml-1.5 rounded-full bg-emerald-50 text-emerald-700 px-1.5 py-0.5 text-[10px] font-medium">{tag}</span>}</p>
        <p className="text-[13px] text-neutral-800 leading-snug">{text}</p>
      </div>
    </div>
  )
}

function FeedbackScene() {
  return (
    <div className="absolute inset-0 bg-neutral-50 p-4 md:p-6 flex flex-col">
      <div className="rounded-2xl bg-white border border-neutral-200 p-3.5">
        <p className="text-[11px] text-neutral-500"><span className="font-semibold text-neutral-800">You</span> · just now</p>
        <p className="mt-1 text-[13px] text-neutral-800">Landing page is up. Be brutal 🙏</p>
        <div className="mt-2.5 rounded-xl border border-neutral-200 overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: ACCENT }} />
          <div className="p-3">
            <div className="h-2.5 w-2/3 rounded bg-neutral-800" />
            <div className="mt-1.5 h-2 w-1/2 rounded bg-neutral-200" />
            <div className="mt-3 h-6 w-24 rounded-full" style={{ background: ACCENT }} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-3 overflow-hidden">
        <Reply who="Prithal" when="2 min" text="Lead with the outcome. Right now the headline is about the tool, not what they get." />
        <Reply who="SaaS founder" when="6 min" text="Where does the button go after signup? I clicked and got lost." />
        <Reply who="Agency owner" when="11 min" text="Would pay for this. DM me." />
      </div>
      <p className="text-[11px] text-neutral-500">3 replies in 11 minutes. That’s the normal speed here.</p>
    </div>
  )
}

function NetworkScene() {
  return (
    <div className="absolute inset-0 bg-white p-4 md:p-6 flex flex-col">
      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-800">Ask the room</span>
        <span>#clients</span>
      </div>
      <div className="mt-3 rounded-2xl p-3.5 text-white" style={{ background: ACCENT }}>
        <p className="text-[11px] text-white/70">You</p>
        <p className="mt-0.5 text-[13px] leading-snug">Looking for 3 D2C brands to pilot my WhatsApp automation. Anyone know founders who’d try it?</p>
      </div>
      <div className="mt-3 flex-1 space-y-3 overflow-hidden">
        <Reply who="Agency owner" when="18 min" tag="Intro made" text="Two of my clients fit. Sent both your way." />
        <Reply who="SaaS founder" when="40 min" tag="Intro made" text="My co-founder’s brother runs a skincare brand. Connecting you." />
        <Reply who="Prithal" when="1 hr" text="Also post this in the free group, I’ll pin it." />
      </div>
      <div className="hidden md:flex items-center gap-2 text-[11px] text-neutral-500">
        <span className="flex -space-x-1.5">{[0, 1, 2, 3, 4].map(i => <span key={i} className="w-5 h-5 rounded-full bg-neutral-200 ring-2 ring-white" />)}</span>
        Every member brings their own network. That’s the point.
      </div>
    </div>
  )
}

function BuildersScene() {
  const people = [
    { name: 'Harjot', what: 'DoLoyal · loyalty SaaS', src: '/testimonials/harjot.jpg', pos: 'center 28%' },
    { name: 'Aniruddha', what: 'Building with AI', src: '/testimonials/aniruddha.jpg', pos: 'center 28%' },
    { name: 'Sanjay', what: 'AI for accounting', src: '/testimonials/sanjay.jpg', pos: 'center 55%' },
  ]
  const kinds = ['SaaS apps', 'AI automations', 'Mobile apps', 'AI agencies', 'Local AI', 'Content businesses', 'Freelance with AI']
  return (
    <div className="absolute inset-0 bg-neutral-950 p-4 md:p-6 flex flex-col text-white">
      <p className="text-[11px] text-white/60">Who’s in the room</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {people.map(m => (
          <div key={m.name} className="relative rounded-xl overflow-hidden aspect-[4/5] bg-neutral-800">
            <Image src={m.src} alt="" fill sizes="200px" className="object-cover" style={{ objectPosition: m.pos }} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2 pt-6">
              <p className="text-[12px] font-medium leading-tight">{m.name}</p>
              <p className="text-[10px] text-white/70 leading-tight">{m.what}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-white/60">What members are building</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {kinds.map(k => <span key={k} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[12px]">{k}</span>)}
      </div>
      <p className="mt-auto pt-3 text-[11px] text-white/60">Shipping, not just talking about it.</p>
    </div>
  )
}

function WorkshopScene() {
  const rows: { t: string; d: string; tools: ToolSlug[] }[] = [
    { t: 'AI automations', d: 'Lead follow-ups, content pipelines, client reporting', tools: ['n8n', 'make', 'zapier'] },
    { t: 'SaaS building', d: 'Idea to paying users with AI writing the code', tools: ['claude', 'cursor', 'supabase', 'vercel', 'stripe'] },
    { t: 'Local AI models', d: 'Run models on your own laptop, no API bills', tools: ['ollama', 'lmstudio', 'huggingface'] },
  ]
  return (
    <div className="absolute inset-0 bg-neutral-50 p-4 md:p-6 flex flex-col">
      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-800">Workshops</span>
        <span>Build along, live</span>
      </div>
      <div className="mt-3 flex-1 flex flex-col gap-2.5">
        {rows.map(r => (
          <div key={r.t} className="flex-1 rounded-2xl bg-white border border-neutral-200 p-3 md:p-3.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] md:text-[14px] font-medium">{r.t}</p>
              <p className="hidden sm:block text-[12px] text-neutral-500 leading-snug">{r.d}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.tools.map(t => (
                <span key={t} className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center" title={TOOLS[t]}>
                  <ToolLogo slug={t} className="w-4 h-4" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LibraryScene() {
  // Placeholder titles, swap for the real session names.
  const vids = [
    { t: 'Build a lead magnet with AI', l: '58:20' },
    { t: 'Cold outreach that gets replies', l: '1:02:11' },
    { t: 'Your first SaaS with Claude Code', l: '1:14:05' },
    { t: 'Run AI models on your laptop', l: '49:37' },
    { t: 'Automate follow-ups with n8n', l: '55:48' },
    { t: 'Pricing your first 10 customers', l: '47:12' },
  ]
  return (
    <div className="absolute inset-0 bg-white p-4 md:p-6 flex flex-col">
      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-800">Session library</span>
        <span>10+ recordings · new one every week</span>
      </div>
      <div className="mt-3 flex-1 grid grid-cols-3 gap-2.5 content-start">
        {vids.map(v => (
          <div key={v.t}>
            <div className="relative rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-neutral-800 to-neutral-950">
              <WingMark className="absolute right-2 top-2 h-3 w-auto text-white/30" />
              <span className="absolute inset-0 flex items-center justify-center"><span className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"><Play className="w-3 h-3 ml-0.5 text-neutral-900" fill="currentColor" /></span></span>
              <span className="absolute right-1.5 bottom-1.5 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white font-mono">{v.l}</span>
            </div>
            <p className="mt-1.5 text-[11px] md:text-[12px] font-medium leading-snug line-clamp-2">{v.t}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToolScene() {
  const recent: ToolSlug[] = ['claude', 'cursor', 'perplexity', 'elevenlabs', 'googlegemini', 'ollama']
  const steps = ['Set it up in 10 minutes', 'Use it on your own business', 'Share what happened in the group']
  return (
    <div className="absolute inset-0 bg-white p-4 md:p-6 flex flex-col">
      <div className="flex items-center justify-between text-[11px] text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-800">Tool of the week</span>
        <span>One new tool, every week</span>
      </div>
      <div className="mt-3 rounded-2xl border border-neutral-200 p-3.5 flex items-center gap-3.5">
        <span className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0"><ToolLogo slug="n8n" className="w-7 h-7" /></span>
        <div className="min-w-0">
          <p className="text-[15px] font-medium">n8n</p>
          <p className="text-[12px] text-neutral-500 leading-snug">Automate lead follow-ups while you sleep</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 font-medium whitespace-nowrap">This week</span>
      </div>
      <ol className="mt-3 space-y-2">
        {steps.map((st, i) => (
          <li key={st} className="flex items-center gap-3 text-[13px]">
            <span className="w-6 h-6 rounded-full bg-neutral-100 text-[11px] font-mono flex items-center justify-center text-neutral-600">{i + 1}</span>{st}
          </li>
        ))}
      </ol>
      <p className="mt-auto pt-3 text-[11px] text-neutral-500">Recent weeks</p>
      <div className="mt-2 flex items-center gap-2">
        {recent.map(t => (
          <span key={t} className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center" title={TOOLS[t]}>
            <ToolLogo slug={t} className="w-4.5 h-4.5" />
          </span>
        ))}
      </div>
    </div>
  )
}

function CommunityScene() {
  const msgs = [
    { n: 'Harjot S.', t: 'I consider joining Founders Wing the best decision of my life 🙌' },
    { n: 'Aniruddha D.', t: 'We just share the ideas what we are building… helping each other. The impact is enormous for me.' },
    { n: 'You', t: 'Just joined. Here’s what I’m building 👇', self: true },
  ]
  return (
    <div className="absolute inset-0 bg-[#efeae2] p-4 md:p-5 flex flex-col">
      <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm">
        <span className="w-9 h-9 rounded-full bg-[#25D366]/15 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-[#128C7E]" /></span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold">Founders Wing 🚀</p>
          <p className="text-[11px] text-[#0f766e]">Members only · Private group</p>
        </div>
        <ToolLogo slug="whatsapp" className="ml-auto w-5 h-5" />
      </div>
      <div className="mt-3 flex-1 space-y-2.5 overflow-hidden">
        {msgs.map(m => (
          <div key={m.n} className={`flex ${m.self ? 'justify-end' : ''}`}>
            <div className={`rounded-xl px-3 py-2 max-w-[85%] shadow-sm ${m.self ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
              {!m.self && <p className="text-[10px] font-semibold text-[#0f766e]">{m.n}</p>}
              <p className="text-[13px] text-neutral-800 leading-snug">{m.t}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-neutral-500 text-center">Harjot and Aniruddha’s words, from their video stories.</p>
    </div>
  )
}

/* Superpower's "Member Stories": big video cards with name + quote over the footage. */
function MemberStories() {
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const [playing, setPlaying] = useState<number | null>(null)
  const play = (i: number) => {
    vids.current.forEach((v, j) => { if (v && j !== i) v.pause() })
    setPlaying(i)
    vids.current[i]?.play().catch(() => {})
  }
  return (
    <section id="stories" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-center text-[15px] text-neutral-500">Member Stories</p>
        <h2 className="mt-3 text-center text-4xl md:text-6xl font-medium tracking-[-0.045em]">Hear it from our members</h2>
        <div className="mt-12 md:mt-16 grid md:grid-cols-3 gap-4 md:gap-5">
          {STORIES.map((s, i) => (
            <figure key={s.name} className="relative rounded-[24px] overflow-hidden bg-neutral-900 aspect-[4/5]">
              <video
                ref={el => { vids.current[i] = el }}
                src={s.video}
                poster={s.poster}
                preload="none"
                playsInline
                controls={playing === i}
                onPause={() => setPlaying(p => (p === i ? null : p))}
                onPlay={() => setPlaying(i)}
                onEnded={e => { setPlaying(null); e.currentTarget.load() }}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: s.focus }}
              />
              {playing !== i && (
                <button onClick={() => play(i)} aria-label={`Play ${s.name}'s story`} className="absolute inset-0 text-left bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-5 md:p-6">
                  <span className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-white text-lg font-medium">{s.name.split(' ')[0]}&apos;s Story</span>
                      <span className="block text-white/70 text-xs">{s.role}</span>
                    </span>
                  </span>
                  {s.quote ? (
                    <span className="block text-white text-[15px] leading-snug">&ldquo;{s.quote}&rdquo;</span>
                  ) : (
                    <span className="block text-white/80 text-[15px] italic leading-snug">{s.context}</span>
                  )}
                </button>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', t: 'Join in 2 minutes', d: 'Fill a short form and pay securely. You are in the same day.' },
    { n: '02', t: 'Tell the room what you’re building', d: 'SaaS, automation, app, anything with AI. Post your intro and what you need.' },
    { n: '03', t: 'Build with the room', d: 'Weekly live sessions, workshops and a new tool every week. Ask the moment you’re stuck.' },
    { n: '04', t: 'Launch and get customers', d: 'Post it for feedback, ask for intros, and use the network to reach the people who’ll pay.' },
  ]
  return (
    <section className="py-20 md:py-28 border-t border-neutral-100">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-[15px] text-neutral-500">How it works</p>
        <h2 className="mt-3 text-4xl md:text-6xl font-medium tracking-[-0.045em] max-w-2xl">From idea to paying customers, one week at a time</h2>
        <div className="mt-12 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(s => (
            <div key={s.n} className="rounded-[22px] bg-neutral-50 p-6 md:p-7">
              <p className="font-mono text-sm" style={{ color: ACCENT }}>{s.n}</p>
              <p className="mt-10 md:mt-14 text-xl font-medium tracking-[-0.02em]">{s.t}</p>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section id="faq" className="py-20 md:py-28 bg-neutral-50">
      <div className="mx-auto max-w-3xl px-5">
        <h2 className="text-center text-4xl md:text-6xl font-medium tracking-[-0.045em]">FAQs</h2>
        <div className="mt-12 border-t border-neutral-200">
          {FAQS.map((f, i) => (
            <div key={f.q} className="border-b border-neutral-200">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-6 py-5 text-left text-base md:text-lg font-medium">
                {f.q}
                <Plus className={`w-5 h-5 shrink-0 text-neutral-400 transition-transform ${open === i ? 'rotate-45' : ''}`} />
              </button>
              {open === i && <p className="pb-5 text-neutral-600 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="bg-neutral-950 text-white py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <WingMark className="h-10 md:h-12 w-auto mx-auto mb-8" gradient />
        <h2 className="text-4xl md:text-7xl font-medium tracking-[-0.045em] leading-[1.02]">
          Your idea has waited
          <br />
          <span className="text-neutral-500">long enough.</span>
        </h2>
        <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">Build it with AI, launch it, and get your first paying customers. With people who are doing the same.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCTA />
          <a href={PHONE_TEL} className="inline-flex items-center gap-2 rounded-full h-12 px-6 text-[15px] font-medium border border-white/15 hover:bg-white/5 transition-colors">
            <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
          </a>
        </div>
        <p className="mt-6 text-sm text-neutral-500 inline-flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> From ₹833/month · UPI, cards &amp; netbanking</p>
      </div>
    </section>
  )
}


/* Application form: the lead the team follows up on. Payment happens on /secure-spot. */
function Apply({ nextMemberNo }: { nextMemberNo: number | null }) {
  return (
    <section id="apply" className="py-20 md:py-28 bg-neutral-50 border-t border-neutral-100">
      <div className="mx-auto max-w-6xl px-5 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-32">
          <p className="text-[15px] text-neutral-500">Apply in 2 minutes</p>
          <h2 className="mt-3 text-4xl md:text-6xl font-medium tracking-[-0.045em] leading-[1.02]">Tell us what you’re building</h2>
          <p className="mt-5 text-neutral-600 leading-relaxed max-w-md">
            Fill this in, pay on the next screen, and you’re in the same day. Nothing to install, nothing to wait for.
          </p>
          {nextMemberNo && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-white border border-neutral-200 pl-1.5 pr-4 py-1.5">
              <span className="flex -space-x-2">
                {['harjot', 'aniruddha', 'sanjay'].map(n => (
                  <Image key={n} src={`/testimonials/${n}.jpg`} alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover ring-2 ring-white" />
                ))}
              </span>
              <span className="text-sm text-neutral-600">You’d be member <span className="font-semibold text-neutral-900">#{nextMemberNo}</span></span>
            </div>
          )}
          <ul className="mt-8 space-y-3 text-[15px]">
            {['Instant access after payment', 'Secure Razorpay checkout · UPI, cards, netbanking', '6 or 12 months, no monthly plan'].map(t => (
              <li key={t} className="flex items-start gap-3">
                <Check className="w-4 h-4 mt-1 shrink-0" style={{ color: ACCENT }} strokeWidth={2.5} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-neutral-500">
            Questions first? <a href={PHONE_TEL} className="font-medium text-neutral-900 hover:underline">Call {PHONE_DISPLAY}</a> or{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-neutral-900 hover:underline">WhatsApp us</a>.
          </p>
        </div>
        <div className="rounded-[28px] bg-white border border-neutral-200 p-5 md:p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.2)]">
          <WaitlistForm nextMemberNo={nextMemberNo} />
        </div>
      </div>
    </section>
  )
}
