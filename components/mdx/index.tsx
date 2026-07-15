import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// Callout box
export function Callout({
  type = 'tip',
  children,
}: {
  type?: 'tip' | 'warning' | 'insight'
  children: React.ReactNode
}) {
  const styles = {
    tip: 'border-sky-500/30 bg-sky-500/5 text-sky-300',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
    insight: 'border-violet-500/30 bg-violet-500/5 text-violet-300',
  }
  const labels = { tip: '💡 Tip', warning: '⚠️ Note', insight: '🔍 Insight' }

  return (
    <div className={`my-6 rounded-xl border px-5 py-4 ${styles[type]}`}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest opacity-70">{labels[type]}</p>
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  )
}

// Inline CTA — placed mid-article
export function JoinCTA({ variant = 'default' }: { variant?: string }) {
  const messages: Record<string, { headline: string; sub: string }> = {
    default: {
      headline: 'Stop reading about it. Start building.',
      sub: 'Join Founders Wing — India\'s action-first founder community. From ₹2,999.',
    },
    '10k-sprint': {
      headline: 'Want to earn your first ₹10,000 online?',
      sub: 'The ₹10K Sprint Challenge runs every month inside Founders Wing. Join now.',
    },
    community: {
      headline: 'Looking for a founder community that actually delivers?',
      sub: 'Founders Wing is paid, focused, and built for doers — not lurkers.',
    },
    'ai-tools': {
      headline: 'Get weekly AI tool breakdowns for founders.',
      sub: 'Every week inside Founders Wing: one new AI tool, one real workflow, zero fluff.',
    },
  }
  const { headline, sub } = messages[variant] ?? messages.default

  return (
    <div className="my-8 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6">
      <p className="mb-1 text-lg font-bold text-foreground">{headline}</p>
      <p className="mb-4 text-sm text-muted-foreground">{sub}</p>
      <Link
        href="/secure-spot"
        className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors"
      >
        Get Membership <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

// MDX component map — applied globally to all blog posts
export const mdxComponents = {
  // Typography
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-5 leading-relaxed text-foreground/80" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-5 ml-5 list-disc space-y-1.5 text-foreground/80" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="mb-5 ml-5 list-decimal space-y-1.5 text-foreground/80" {...props} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li className="leading-relaxed" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="my-6 border-l-4 border-sky-500/50 pl-5 italic text-muted-foreground"
      {...props}
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-sky-400 underline underline-offset-4 hover:text-sky-300 transition-colors" {...props} />
  ),
  hr: () => <hr className="my-10 border-white/10" />,
  // Custom components available in MDX
  Callout,
  JoinCTA,
}
