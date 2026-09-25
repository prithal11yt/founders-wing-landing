import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Clock,
  Code2,
  MessageSquare,
  Radio,
  Sparkles,
  Target,
  Users,
  Workflow,
} from "lucide-react"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import { SiteNav } from "@/components/site/nav"
import { SiteFooter } from "@/components/site/footer"

export const metadata: Metadata = {
  title: "Building with Prithal | Live Build Series for Beginners",
  description:
    "A live weekly series where you build alongside me — your first SaaS, your first AI automation, your first AI agent, and how to get customers for it. Beginner-friendly, nothing assumed.",
  alternates: {
    canonical: `${SITE_URL}/build`,
  },
  openGraph: {
    title: "Building with Prithal | Live Build Series",
    description:
      "Build your first SaaS, AI automation and AI agent — live, alongside me. Then learn how to get customers for it.",
    url: `${SITE_URL}/build`,
    siteName: SITE_NAME,
    type: "website",
  },
}

const sessions = [
  {
    n: "01",
    label: "Session 1",
    title: "Build Your First SaaS",
    tag: "From blank screen to a live product with real users",
    icon: Code2,
    accent: "cyan",
    build:
      "A working SaaS app — real logins, a database that saves user data, and a live URL you can send to anyone. Not a demo. An actual product.",
    learn: [
      "How to describe what you want so AI builds the right thing",
      "Logins, accounts and databases — explained without jargon",
      "Getting it online so real people can use it",
    ],
  },
  {
    n: "02",
    label: "Session 2",
    title: "Build Your First AI Automation",
    tag: "Systems that keep running after you close the laptop",
    icon: Workflow,
    accent: "violet",
    build:
      "An automation that runs without you — it pulls in data, processes it with AI, and delivers the result. We'll take one genuinely boring task and kill it forever.",
    learn: [
      "Spotting which parts of any business can be automated",
      "Connecting tools together so they talk to each other",
      "Where AI fits in a workflow — and where it doesn't",
    ],
  },
  {
    n: "03",
    label: "Session 3",
    title: "Build Your First AI Agent",
    tag: "The thing local businesses are actually paying for",
    icon: MessageSquare,
    accent: "emerald",
    build:
      "An AI agent that talks to real people — answers questions, handles enquiries and books things, on WhatsApp or on a website.",
    learn: [
      "Why an agent is different from a chatbot",
      "Training it on a real business's information",
      "Why this is the easiest AI service to sell in India right now",
    ],
  },
  {
    n: "04",
    label: "Finale",
    title: "Masterclass: Getting Customers",
    tag: "The part nobody teaches — and the reason most builders stay broke",
    icon: Target,
    accent: "amber",
    build:
      "A real plan to get people using and paying for what you built — where to find them, what to say, what to charge, and how to close.",
    learn: [
      "Finding your first 10 users when nobody knows you exist",
      "Cold outreach that works in India (with the exact scripts)",
      "Pricing your work and handling \"it's too expensive\"",
    ],
  },
]

const accentMap: Record<string, { text: string; ring: string; chip: string; dot: string }> = {
  cyan: {
    text: "text-cyan-700",
    ring: "border-cyan-500/30",
    chip: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
    dot: "bg-cyan-600",
  },
  violet: {
    text: "text-violet-700",
    ring: "border-violet-500/30",
    chip: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    dot: "bg-violet-600",
  },
  emerald: {
    text: "text-emerald-700",
    ring: "border-emerald-500/30",
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    dot: "bg-emerald-600",
  },
  amber: {
    text: "text-amber-700",
    ring: "border-amber-500/30",
    chip: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    dot: "bg-amber-600",
  },
}

const howItWorks = [
  {
    icon: Radio,
    title: "We build live, together",
    body: "I share my screen and build it in front of you. You build the same thing alongside me on your own machine — not watching a tutorial, actually building.",
  },
  {
    icon: Clock,
    title: "90 minutes, one finished thing",
    body: "Every session ends with something that works. You don't leave with notes, you leave with a link you can send to someone.",
  },
  {
    icon: Users,
    title: "We stop until you're unstuck",
    body: "The last stretch of every session is fixing whatever broke on your screen. Nobody gets left behind at step 4.",
  },
]

export default function BuildPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <SiteNav />

      {/* ═══════════ Hero ═══════════ */}
      <section className="relative overflow-hidden px-4 pb-16 pt-36 md:pb-24 md:pt-44">
        <div className="container relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-600" />
              </span>
              Live weekly series
            </span>

            <h1 className="mt-6 text-4xl font-medium tracking-[-0.03em] md:text-6xl">
              Building with <span className="text-neutral-400">Prithal</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-neutral-600 md:text-xl">
              Every week we build one real thing together — live. Your first SaaS, your first AI automation,
              your first AI agent. Then we talk about the part nobody teaches: getting customers.
            </p>

            <p className="mt-4 text-base font-medium text-neutral-900">
              Never built anything before? That&apos;s exactly who this is for.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/#membership"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 hover:brightness-110 px-7 py-3.5 text-base font-semibold text-white sm:w-auto"
              >
                Join Founders Wing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://www.youtube.com/@thesoloentrepreneur07"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-7 py-3.5 text-base font-medium transition-colors hover:bg-neutral-50 sm:w-auto"
              >
                Watch on YouTube
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />4 live sessions</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />90 minutes each</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-600" />No coding background needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ How it works ═══════════ */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {howItWorks.map((item) => (
              <div key={item.title} className="rounded-[24px] bg-white border border-neutral-200 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <item.icon className="h-5 w-5 text-cyan-700" />
                </div>
                <h3 className="text-base font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ The sessions ═══════════ */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl md:mb-14">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-700">The series</p>
            <h2 className="text-3xl font-medium tracking-[-0.03em] md:text-4xl">
              Four sessions. Three things you build. One way to get paid for them.
            </h2>
            <p className="mt-4 text-neutral-600">
              Each session stands on its own, so you can join at any point. But taken together they take you
              from never having built anything to having something real that people pay for.
            </p>
          </div>

          <div className="space-y-4 md:space-y-5">
            {sessions.map((s) => {
              const a = accentMap[s.accent]
              return (
                <div key={s.n} className={`rounded-[24px] bg-white border border-neutral-200 border ${a.ring} p-6 md:p-8`}>
                  <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-8">
                    {/* Number + icon */}
                    <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 ${a.text}`}>
                        <s.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className={`font-mono text-2xl font-bold ${a.text} md:text-3xl`}>{s.n}</p>
                        <p className="text-xs uppercase tracking-widest text-neutral-600">{s.label}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h3 className="text-xl font-medium tracking-[-0.03em] md:text-2xl">{s.title}</h3>
                      <p className={`mt-1.5 text-sm font-medium italic ${a.text}`}>{s.tag}</p>

                      <div className="mt-5">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-neutral-600">
                          What you&apos;ll walk away with
                        </p>
                        <p className="text-[15px] leading-relaxed text-neutral-800">{s.build}</p>
                      </div>

                      <div className="mt-5">
                        <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-neutral-600">
                          What you&apos;ll learn
                        </p>
                        <ul className="space-y-2">
                          {s.learn.map((l) => (
                            <li key={l} className="flex items-start gap-2.5 text-sm text-neutral-600">
                              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`} />
                              {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ Who it's for ═══════════ */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-[24px] bg-white border border-neutral-200 p-6 md:p-10">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-medium tracking-[-0.03em]">Built for people starting from zero</h2>
                <p className="mt-4 leading-relaxed text-neutral-600">
                  Most build-alongs assume you already know what an API is, or quietly skip the step where you
                  got stuck. This one doesn&apos;t. Every term gets explained the first time it comes up, and we
                  move at the pace of the person who&apos;s furthest behind — not the fastest one in the room.
                </p>
                <p className="mt-4 leading-relaxed text-neutral-600">
                  You&apos;ll get a setup message the day before each session telling you exactly what to install,
                  so we never lose 20 minutes to &quot;it&apos;s not working on my laptop.&quot;
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "You've watched a hundred AI videos and built nothing",
                  "You can't code, and you're tired of that being the reason",
                  "You want to sell AI services but have never built one",
                  "You have an idea but no clue what the first step is",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-neutral-50 border border-neutral-200 px-4 py-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span className="text-sm text-neutral-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Members get more ═══════════ */}
      <section className="px-4 pb-16 md:pb-24">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-cyan-700">Watching vs building</p>
            <h2 className="text-3xl font-medium tracking-[-0.03em] md:text-4xl">
              Anyone can watch. Members actually get it built.
            </h2>
            <p className="mt-4 text-neutral-600">
              The sessions stream live on YouTube — free, for everyone. What members get is everything that
              happens around them.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            <div className="rounded-[24px] bg-white border border-neutral-200 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Watching on YouTube</p>
              <p className="mt-2 text-xl font-medium">Free</p>
              <ul className="mt-5 space-y-2.5">
                {["Watch the full live build", "Ask questions in live chat", "Rewatch the recording anytime"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent p-6 shadow-[0_0_40px_rgba(2,132,199,0.12)] md:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">Founders Wing members</p>
              <p className="mt-2 text-xl font-medium">Everything above, plus</p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "The actual files, code and prompts I use",
                  "A private Q&A after every stream — on your build",
                  "Your project reviewed live, by name",
                  "A help thread all week when you get stuck",
                  "You vote on what we build next",
                  "Weekly accountability so you actually finish",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-800">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/#membership"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 hover:brightness-110 px-6 py-3 text-sm font-semibold text-white"
              >
                Join Founders Wing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Closing CTA ═══════════ */}
      <section className="px-4 pb-20 md:pb-28">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-medium tracking-[-0.03em] md:text-4xl">
            You&apos;ve watched enough. Let&apos;s build something.
          </h2>
          <p className="mt-4 text-neutral-600">
            Next session goes live soon. Come as you are — no setup, no experience, no idea needed.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/#membership"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 hover:brightness-110 px-7 py-3.5 text-base font-semibold text-white sm:w-auto"
            >
              Join Founders Wing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.youtube.com/@thesoloentrepreneur07"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-7 py-3.5 text-base font-medium transition-colors hover:bg-neutral-50 sm:w-auto"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
