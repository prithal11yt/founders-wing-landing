import Link from "next/link"
import Image from "next/image"
import type React from "react"
import { ArrowRight } from "lucide-react"

/* ─────────────── Callout ─────────────── */
export function Callout({
  type = "tip",
  children,
}: {
  type?: "tip" | "warning" | "insight"
  children: React.ReactNode
}) {
  const styles = {
    tip: "border-sky-500/30 bg-sky-500/5 text-sky-300",
    warning: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    insight: "border-violet-500/30 bg-violet-500/5 text-violet-300",
  }
  const labels = { tip: "💡 Tip", warning: "⚠️ Note", insight: "🔍 Insight" }

  return (
    <div className={`my-6 rounded-xl border px-5 py-4 ${styles[type]}`}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest opacity-70">{labels[type]}</p>
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  )
}

/* ─────────────── JoinCTA ─────────────── */
export function JoinCTA({ variant = "membership" }: { variant?: string }) {
  const messages: Record<string, { headline: string; sub: string }> = {
    membership: {
      headline: "Stop reading about it. Start building.",
      sub: "Join Founders Wing — India's action-first founder community. From ₹2,999.",
    },
    "10k-sprint": {
      headline: "Want to earn your first ₹10,000 online?",
      sub: "The ₹10K Sprint Challenge runs every month inside Founders Wing. Join now.",
    },
    accountability: {
      headline: "Looking for accountability that actually works?",
      sub: "Founders Wing is paid, focused, and built for doers — not lurkers.",
    },
    "ai-tools": {
      headline: "Get weekly AI tool breakdowns for founders.",
      sub: "Every week inside Founders Wing: one new AI tool, one real workflow, zero fluff.",
    },
    // legacy aliases
    default: {
      headline: "Stop reading about it. Start building.",
      sub: "Join Founders Wing — India's action-first founder community. From ₹2,999.",
    },
    community: {
      headline: "Looking for a founder community that actually delivers?",
      sub: "Founders Wing is paid, focused, and built for doers — not lurkers.",
    },
  }
  const { headline, sub } = messages[variant] ?? messages.membership

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

/* ─────────────── mdxComponents map ─────────────── */
export const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground scroll-mt-20" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold text-foreground scroll-mt-20" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold text-foreground" {...props} />
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
    <blockquote className="my-6 border-l-4 border-sky-500/50 pl-5 italic text-muted-foreground" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-sky-400 underline underline-offset-4 hover:text-sky-300 transition-colors"
      target={props.href?.startsWith("/") ? undefined : "_blank"}
      rel={props.href?.startsWith("/") ? undefined : "noopener noreferrer"}
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-white/10" />,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-white/5" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="hover:bg-white/[0.02] transition-colors" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 text-left font-semibold text-foreground" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 text-foreground/80 align-top" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm font-mono text-sky-300" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-white/5 border border-white/10 p-5 text-sm font-mono text-foreground/80 leading-relaxed" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="my-8 w-full rounded-xl object-cover"
      loading="lazy"
      alt={props.alt ?? ""}
      {...props}
    />
  ),
  // Custom MDX components
  Callout,
  JoinCTA,
}
