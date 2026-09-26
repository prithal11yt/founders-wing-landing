import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Globe, Instagram, Linkedin, Mail, Phone, Play, Youtube } from 'lucide-react'
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from '@/lib/contact'
import { SITE_URL } from '@/lib/site'
import { getLatestVideos, YT_CHANNEL_URL } from '@/lib/youtube'
import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { ACCENT, WingMark } from '@/components/site/brand'
import { PrimaryCTA } from '@/components/site/ui'
import { MemberCount } from '@/components/site/member-count'

export const metadata: Metadata = {
  title: 'Prithal Bhardwaj | Founder of Founders Wing',
  description:
    'Prithal Bhardwaj runs The Solo Entrepreneur on YouTube (50K+ subscribers, 675+ videos) and founded Founders Wing, India’s community for people building SaaS, AI automations and AI businesses.',
  alternates: { canonical: `${SITE_URL}/founder` },
  openGraph: {
    title: 'Prithal Bhardwaj | Founder of Founders Wing',
    description: 'Builder, creator, and the founder of Founders Wing. The Solo Entrepreneur on YouTube.',
    url: `${SITE_URL}/founder`,
    type: 'profile',
    images: [{ url: `${SITE_URL}/prithal-studio.jpg`, width: 1000, height: 1000, alt: 'Prithal Bhardwaj' }],
  },
}

const SOCIALS = [
  { href: YT_CHANNEL_URL, label: 'YouTube', sub: '@thesoloentrepreneur07', icon: Youtube, color: 'text-red-500' },
  { href: 'https://www.instagram.com/thesoloentrepreneur.yt', label: 'Instagram', sub: '@thesoloentrepreneur.yt', icon: Instagram, color: 'text-pink-500' },
  { href: 'https://www.linkedin.com/in/prithal-bhardwaj-058a56187/', label: 'LinkedIn', sub: 'Prithal Bhardwaj', icon: Linkedin, color: 'text-sky-500' },
  { href: 'https://x.com/Prithal7', label: '𝕏', sub: '@Prithal7', icon: null, color: '' },
  { href: 'https://thesoloentrepreneur.in', label: 'Website', sub: 'thesoloentrepreneur.in', icon: Globe, color: 'text-sky-500' },
]

const WORK = [
  {
    k: 'yt',
    t: 'The Solo Entrepreneur',
    d: 'The YouTube channel. 675+ videos on AI tools, vibe coding, automations, and online business ideas, with a new one every week. Every template and playbook started as a build on the channel.',
    href: YT_CHANNEL_URL,
    cta: 'Watch on YouTube',
    stat: '50K+ subscribers',
  },
  {
    k: 'fw',
    t: 'Founders Wing',
    d: 'A paid community for people building SaaS, AI automations and AI businesses. Weekly live sessions, workshops, real-time feedback, and a network that helps you get customers.',
    href: '/',
    cta: 'See what’s inside',
    stat: 'members inside',
    live: true,
  },
  {
    k: 'build',
    t: 'Building with Prithal',
    d: 'A live weekly build series for beginners. Your first SaaS, your first AI automation, your first AI agent, and how to get customers for it.',
    href: '/build',
    cta: 'About the series',
    stat: '4 live sessions',
  },
  {
    k: 'tse',
    t: 'Templates, playbooks & calls',
    d: 'Plug-and-play n8n and ChatGPT workflows, the 100 Business Ideas playbook with revenue models, a free 10 Startup Ideas ebook, and 30 or 60 minute calls to pressure-test your idea.',
    href: 'https://thesoloentrepreneur.in',
    cta: 'thesoloentrepreneur.in',
    stat: '600+ builds behind them',
  },
]

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default async function FounderPage() {
  const videos = await getLatestVideos(6)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Prithal Bhardwaj',
    url: `${SITE_URL}/founder`,
    image: `${SITE_URL}/prithal-studio.jpg`,
    jobTitle: 'Founder',
    worksFor: { '@type': 'Organization', name: 'Founders Wing', url: SITE_URL },
    sameAs: SOCIALS.map(s => s.href),
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav />

      <main>
        {/* ── Hero ── */}
        <section className="pt-36 md:pt-44 pb-16 md:pb-24">
          <div className="mx-auto max-w-6xl px-5 grid lg:grid-cols-[1fr_0.8fr] gap-10 lg:gap-16 items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-sm text-neutral-500"><WingMark className="h-3.5 w-auto" gradient /> About the founder</p>
              <h1 className="mt-5 text-5xl md:text-7xl font-medium tracking-[-0.045em] leading-[1.02]">Prithal Bhardwaj</h1>
              <p className="mt-5 text-xl md:text-2xl text-neutral-500 tracking-[-0.01em]">Builder, creator, and the founder of Founders Wing.</p>
              <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-xl">
                I’ve spent 5+ years building online businesses and the last few showing every step of it on YouTube as The Solo Entrepreneur. Founders Wing is the room I wished I had when I started: people building with AI, helping each other launch and get paid.
              </p>
              <div className="mt-8 flex flex-wrap gap-2.5">
                {SOCIALS.map(s => (
                  <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 rounded-full border border-neutral-200 hover:border-neutral-400 transition-colors pl-3 pr-4 py-2">
                    {s.icon && <s.icon className={`w-4 h-4 ${s.color}`} />}
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="text-xs text-neutral-500">{s.sub}</span>
                  </a>
                ))}
              </div>
            </div>
            <figure className="justify-self-center lg:justify-self-end w-full max-w-[440px]">
              <div className="relative aspect-[4/5] rounded-[28px] overflow-hidden bg-neutral-100">
                <Image src="/prithal-studio.jpg" alt="Prithal Bhardwaj" fill priority sizes="(max-width: 1024px) 90vw, 440px" className="object-cover" />
              </div>
            </figure>
          </div>
        </section>

        {/* ── Numbers ── */}
        <section className="border-y border-neutral-100">
          <div className="mx-auto max-w-6xl px-5 grid grid-cols-2 md:grid-cols-4">
            {[
              { v: '50K+', l: 'YouTube subscribers' },
              { v: '675+', l: 'Videos published' },
              { v: <MemberCount fallback="45+" />, l: 'Founders Wing members' },
              { v: '5,000+', l: 'In the free WhatsApp community' },
            ].map((s, i) => (
              <div key={s.l} className={`py-8 md:py-10 px-2 md:px-6 ${i > 0 ? 'md:border-l border-neutral-100' : ''} ${i % 2 === 1 ? 'border-l md:border-l border-neutral-100' : ''} ${i > 1 ? 'border-t md:border-t-0 border-neutral-100' : ''}`}>
                <p className="text-3xl md:text-4xl font-medium tracking-[-0.03em]">{s.v}</p>
                <p className="text-sm text-neutral-500 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Story ── */}
        <section className="bg-neutral-950 text-white py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-5">
            <p className="text-[15px] text-neutral-500">The story</p>
            <h2 className="mt-3 text-4xl md:text-6xl font-medium tracking-[-0.04em] leading-[1.05]">
              Anyone can build with AI now.
              <br />
              <span className="text-neutral-500">Getting people to pay for it is the hard part.</span>
            </h2>
            <div className="mt-10 space-y-6 text-lg md:text-xl text-neutral-400 leading-relaxed">
              <p>
                I started The Solo Entrepreneur to document one thing: how a single person, with no team and no funding, builds an online business. AI changed the speed of that completely. What used to take a developer and months now takes a weekend, and I’ve made hundreds of videos showing exactly how, from AI SaaS apps and automations to motion graphics and 3D websites.
              </p>
              <p>
                But the more people built along with me, the clearer the real problem became. Building was no longer the hard part. Finding the first customer was. Free communities didn’t fix it. Most members watch, like, and never ship, and there’s nobody to give you honest feedback or an introduction when you need one.
              </p>
              <p>
                So in 2026 I built Founders Wing: a smaller, paid room of people building SaaS, AI automations and AI businesses. Every week I run a live session. Members post what they’re building and get feedback the same day. When someone needs a client, someone in the room usually knows the exact person. The goal for every member is the same as mine: build it, launch it, and get paid for it.
              </p>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-3">
              <PrimaryCTA>Join Founders Wing</PrimaryCTA>
              <a href={YT_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full h-12 px-6 text-[15px] font-medium border border-white/15 hover:bg-white/5 transition-colors">
                <Youtube className="w-4 h-4 text-red-500" /> Watch the channel
              </a>
            </div>
          </div>
        </section>

        {/* ── What I do ── */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[15px] text-neutral-500">What I do</p>
            <h2 className="mt-3 text-4xl md:text-6xl font-medium tracking-[-0.045em] max-w-2xl">Everything I make, in one place</h2>
            <div className="mt-12 md:mt-16 grid sm:grid-cols-2 gap-4">
              {WORK.map(w => {
                const external = w.href.startsWith('http')
                const inner = (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-xl md:text-2xl font-medium tracking-[-0.02em]">{w.t}</p>
                      <ArrowUpRight className="w-5 h-5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="mt-3 text-neutral-600 leading-relaxed">{w.d}</p>
                    <div className="mt-8 flex items-center justify-between gap-4 text-sm">
                      <span className="font-medium" style={{ color: ACCENT }}>{w.cta}</span>
                      <span className="text-neutral-500">{w.live ? <><MemberCount fallback="45+" /> {w.stat}</> : w.stat}</span>
                    </div>
                  </>
                )
                const cls = 'group flex flex-col rounded-[24px] bg-neutral-50 border border-neutral-100 p-6 md:p-8 hover:border-neutral-300 transition-colors'
                return external ? (
                  <a key={w.k} href={w.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link key={w.k} href={w.href} className={cls}>{inner}</Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Latest on YouTube ── */}
        <section className="py-20 md:py-28 bg-neutral-50 border-y border-neutral-100">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[15px] text-neutral-500">Latest on YouTube</p>
                <h2 className="mt-3 text-4xl md:text-5xl font-medium tracking-[-0.045em]">New every week</h2>
              </div>
              <a href={YT_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
                All 675+ videos <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {videos.map(v => (
                <a key={v.id} href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" className="group">
                  <div className="relative aspect-video rounded-[18px] overflow-hidden bg-neutral-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                      <Play className="w-4 h-4 ml-0.5" style={{ color: ACCENT }} fill="currentColor" />
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] font-medium leading-snug line-clamp-2">{v.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{fmt(v.published)}</p>
                </a>
              ))}
            </div>
            <a href={YT_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="sm:hidden mt-8 inline-flex items-center gap-1.5 text-sm font-medium hover:underline">
              All 675+ videos <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-[15px] text-neutral-500">Get in touch</p>
              <h2 className="mt-3 text-4xl md:text-6xl font-medium tracking-[-0.045em] leading-[1.02]">Talk to me</h2>
              <p className="mt-5 text-neutral-600 leading-relaxed max-w-md">
                Questions about Founders Wing, a collaboration, or what you’re building. WhatsApp is the fastest way to reach me.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: WHATSAPP_URL, label: 'WhatsApp', sub: 'Fastest reply', icon: Phone, external: true },
                { href: PHONE_TEL, label: 'Call', sub: PHONE_DISPLAY, icon: Phone },
                { href: 'mailto:prithalbhardwaj@gmail.com', label: 'Email', sub: 'prithalbhardwaj@gmail.com', icon: Mail },
                { href: 'https://www.instagram.com/thesoloentrepreneur.yt', label: 'Instagram', sub: '@thesoloentrepreneur.yt', icon: Instagram, external: true },
              ].map(c => (
                <a key={c.label} href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="rounded-[22px] border border-neutral-200 p-5 hover:border-neutral-400 transition-colors">
                  <c.icon className="w-5 h-5" style={{ color: ACCENT }} />
                  <p className="mt-4 text-[15px] font-medium">{c.label}</p>
                  <p className="text-sm text-neutral-500 break-all">{c.sub}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-neutral-950 text-white py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <WingMark className="h-10 md:h-12 w-auto mx-auto mb-8" gradient />
            <h2 className="text-4xl md:text-7xl font-medium tracking-[-0.045em] leading-[1.02]">
              Build it with AI.
              <br />
              <span className="text-neutral-500">Get paying customers.</span>
            </h2>
            <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">Join the room. Weekly live sessions with me, feedback on what you build, and a network that helps you get customers.</p>
            <div className="mt-10"><PrimaryCTA /></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
