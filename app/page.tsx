import Image from "next/image"
import Link from "next/link"
import { WaitlistForm } from "@/components/waitlist-form"

export default function ComingSoonPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute left-1/4 bottom-0 w-[500px] h-[300px] rounded-full bg-violet-500/8 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="Founders Wing" width={28} height={28} className="object-contain" />
          <span className="font-semibold tracking-tight text-lg">Founders Wing</span>
        </div>
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Blog
        </Link>
      </nav>

      {/* Hero + Form */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-2xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1.5 text-sm font-medium text-sky-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
            </span>
            Launching Soon
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            India's AI-first{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
              founder community
            </span>{" "}
            is almost here.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-4 max-w-xl mx-auto">
            Stop overthinking. Stop going alone. Founders Wing brings together aspiring Indian
            founders to build real online income — with AI, accountability, and a community that
            actually shows up.
          </p>

          <p className="text-sm text-muted-foreground mb-12">
            Join the waitlist and we'll reach out the moment we open doors.
          </p>

          {/* Form card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 text-left">
            <WaitlistForm comingSoon={true} />
          </div>
        </div>

        {/* What to expect */}
        <div className="mt-20 w-full max-w-3xl mx-auto">
          <p className="text-center text-xs font-medium tracking-widest uppercase text-muted-foreground mb-8">
            What's inside when we launch
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "⚡",
                title: "Weekly AI Workflows",
                desc: "One new AI tool breakdown every week — built for founders, not tech bros.",
              },
              {
                icon: "🏆",
                title: "₹10K Sprint Challenge",
                desc: "A structured monthly challenge to earn your first ₹10,000 online.",
              },
              {
                icon: "🤝",
                title: "Real Accountability",
                desc: "Paid community = serious people. No lurkers, no noise.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; 2026 Founders Wing. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="https://www.linkedin.com/in/prithal-bhardwaj-058a56187/" target="_blank" className="hover:text-foreground transition-colors">LinkedIn</Link>
            <Link href="https://youtube.com/@thesoloentrepreneur07" target="_blank" className="hover:text-foreground transition-colors">YouTube</Link>
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
