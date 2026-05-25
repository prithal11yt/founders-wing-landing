import Link from "next/link"
import type React from "react"
import { ArrowRight, Lightbulb, Sparkles, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean)

  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/)
        if (bold) return <strong key={index} className="font-semibold text-foreground">{bold[1]}</strong>

        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (link) {
          const href = link[2]
          const isInternal = href.startsWith("/")
          const className = "text-cyan-300 underline decoration-cyan-400/40 underline-offset-4 hover:text-cyan-200"
          return isInternal ? (
            <Link key={index} href={href} className={className}>{link[1]}</Link>
          ) : (
            <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={className}>{link[1]}</a>
          )
        }

        return part
      })}
    </>
  )
}

function BlogCTA({ variant = "membership" }: { variant?: string }) {
  const copy: Record<string, { eyebrow: string; title: string; body: string; button: string }> = {
    membership: {
      eyebrow: "Founders Wing",
      title: "Build with people who are done overthinking.",
      body: "Join weekly live sessions, AI-first playbooks, accountability, and a private community of aspiring founders taking action.",
      button: "Become a Founding Member",
    },
    "10k-sprint": {
      eyebrow: "30-Day Sprint",
      title: "Want help earning your first ₹10K online?",
      body: "Founders Wing members get access to the First ₹10K sprint, templates, check-ins, and a leaderboard built for momentum.",
      button: "Join the Sprint",
    },
    accountability: {
      eyebrow: "Accountability",
      title: "Stop trying to build alone.",
      body: "Get founder accountability, live check-ins, and a community that notices whether you shipped or just researched.",
      button: "Get Accountability",
    },
    "ai-tools": {
      eyebrow: "AI-First Building",
      title: "Use AI to move faster, not collect more tools.",
      body: "Learn the practical AI workflows members use for ideas, offers, content, outreach, and validation.",
      button: "Build With AI",
    },
  }
  const item = copy[variant] || copy.membership

  return (
    <div className="my-10 rounded-3xl border border-cyan-500/20 bg-cyan-500/[0.06] p-5 md:p-7">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">{item.eyebrow}</p>
      <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground md:text-2xl">{item.title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">{item.body}</p>
      <Button asChild className="rounded-full neu-button-primary">
        <Link href="/#apply">
          {item.button}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

function Callout({ line }: { line: string }) {
  const [rawType, ...rest] = line.replace(/^::callout\s*/, "").split("::")
  const type = rawType || "insight"
  const body = rest.join("::").trim()
  const Icon = type === "tip" ? Lightbulb : type === "warning" ? Target : Sparkles

  return (
    <div className={cn(
      "my-7 flex gap-3 rounded-2xl border p-4",
      type === "warning" ? "border-amber-500/25 bg-amber-500/10" : "border-cyan-500/20 bg-cyan-500/10",
    )}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", type === "warning" ? "text-amber-300" : "text-cyan-300")} />
      <p className="text-sm leading-relaxed text-foreground/80"><InlineText text={body} /></p>
    </div>
  )
}

export function MarkdownContent({ content, cta }: { content: string; cta?: string }) {
  const lines = content.split("\n")
  const blocks: React.ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()
    if (!line) {
      index += 1
      continue
    }

    if (line.startsWith("<JoinCTA")) {
      const variant = line.match(/variant="([^"]+)"/)?.[1] || cta
      blocks.push(<BlogCTA key={index} variant={variant} />)
      index += 1
      continue
    }

    if (line.startsWith("::callout")) {
      blocks.push(<Callout key={index} line={line} />)
      index += 1
      continue
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={index} className="mb-3 mt-8 text-xl font-bold tracking-tight text-foreground"><InlineText text={line.slice(4)} /></h3>)
      index += 1
      continue
    }

    if (line.startsWith("## ")) {
      blocks.push(<h2 key={index} className="mb-4 mt-12 text-2xl font-bold tracking-tight text-foreground md:text-3xl"><InlineText text={line.slice(3)} /></h2>)
      index += 1
      continue
    }

    if (line.startsWith("> ")) {
      blocks.push(<blockquote key={index} className="my-7 border-l-2 border-cyan-400/60 pl-5 text-lg font-medium leading-relaxed text-foreground"><InlineText text={line.slice(2)} /></blockquote>)
      index += 1
      continue
    }

    if (line.startsWith("- ")) {
      const items: string[] = []
      while (lines[index]?.trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2))
        index += 1
      }
      blocks.push(
        <ul key={index} className="my-5 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <span className="leading-relaxed"><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    const paragraph: string[] = [line]
    index += 1
    while (lines[index]?.trim() && !/^(## |### |- |> |<JoinCTA|::callout)/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim())
      index += 1
    }

    blocks.push(<p key={index} className="my-5 text-base leading-8 text-muted-foreground md:text-lg"><InlineText text={paragraph.join(" ")} /></p>)
  }

  return <div>{blocks}</div>
}
