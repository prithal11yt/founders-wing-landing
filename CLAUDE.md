# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (runs on port 3001)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (eslint)
- No test framework is configured.

## Architecture

Next.js 16 (app router) + React 19 landing page for the Founders Wing AI-first founder community, deployed on **Vercel** (not Netlify — `netlify.toml` exists but is unused; push to `main` = auto-deploy).

### Stack
- **Styling**: Tailwind CSS v4 via `@tailwindcss/postcss` — config is in `app/globals.css`, not a separate tailwind.config file
- **UI primitives**: shadcn/ui components in `components/ui/`
- **Headless components**: Radix UI (accordion, dialog, tabs, select, etc.)
- **Animations**: Framer Motion + custom IntersectionObserver-based `ScrollReveal` component
- **Forms**: react-hook-form + zod validation
- **Database**: Supabase (table: `waitlist_applications`)
- **Fonts**: Space Grotesk (display), Inter (body), JetBrains Mono (mono) — loaded via `next/font/google` in `app/layout.tsx`

### Key directories
- `app/page.tsx` — Main landing page, orchestrates all sections
- `app/api/waitlist/` — Waitlist form submission → Supabase insert (deduplicates by email)
- `app/api/leads/` — Protected admin API (custom JWT auth, single authorized user)
- `app/leads/` — Protected leads dashboard (login + data table with call_status tracking)
- `app/blog/` + `app/[category]/[slug]/` — MDX blog; source files in `content/blog/`, parsed via `lib/blog.ts` using gray-matter + next-mdx-remote
- `components/` — Section components (challenge-spotlight, meet-founder, faq-section, value-stack, interactive-bento, etc.)
- `components/mdx/` — MDX-specific render components
- `hooks/` — Custom hooks (use-scroll-reveal, use-mobile, use-toast)
- `lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `scripts/generate-seo-content.mjs` — Run with `npm run generate-seo` to generate blog/SEO content

### Neumorphic design system
Custom CSS classes defined in `globals.css` — use these instead of raw shadows/borders:
- `.neu-flat` — Glassmorphism card (blur, subtle border/shadow)
- `.neu-pressed` — Inset/pressed state
- `.neu-convex` — Raised/3D element
- `.neu-concave` — Sunken element
- `.neu-interactive` — Adds hover/active transforms and glow

Accent color tokens: `text-accent-cyan` (#0ea5e9), `text-violet-400`, `text-amber-400`.

### ScrollReveal pattern
Components use `<ScrollReveal variant="fade-up">` for scroll-triggered animations. The `InteractiveBento` component has its own IntersectionObserver — do NOT wrap it in an additional ScrollReveal (causes double-opacity-zero and cards won't appear).

### Leads dashboard call_status field
`waitlist_applications` Supabase table has a `call_status` column with values: `not_called | no_answer | callback | not_interested | less_convinced | interested | very_convinced | converted`. The `allowedFields` list in `app/api/leads/update/route.ts` must include any field you want to update — adding a field to the UI without adding it here silently returns 403.

### Team tracker (`/team`, `/admin/team`, `/api/team/*`)
Daily workspace for the intern (Shreyas) and the founder's view of it. Same auth as leads (`fw_leads_token`; role `team` = `TEAM_EMAIL`/`TEAM_PASSWORD`, role `admin` = Prithal). Everything is logged per action, never as an end-of-day summary:
- `app/team/page.tsx` — shell with tabs; screens live in `app/team/_components/` (`today`, `leads`, `members`, `sessions`, `whatsapp`, `ideas`, `insights`; `shared.tsx` has types, vocab labels, primitives and the CSS).
- `app/admin/team/page.tsx` — founder's day-by-day tracker (targets vs actuals, 14-day table, check-in notes, patterns, ideas, targets editor).
- `lib/server/tracker.ts` — shared server helpers: Supabase client, session, IST date helpers (sessions are Wednesdays), targets loader, tag vocabularies (the API validates tags against these — add new tags here *and* to the label maps in `shared.tsx`).
- Tables (migration in `supabase/migrations/20261014_team_tracker.sql`): `lead_call_events` (+`note`, `tags`), `fw_member_touchpoints`, `fw_whatsapp_posts`, `fw_ideas`, `fw_daily_checkins`, `fw_settings` (`team_targets`, `twitter_sync`), plus `fw_calls` session fields and `fw_attendance.marked_by`.
- Twitter outreach leads come from a Google Sheet (`TWITTER_LEADS_SHEET_ID`, default hard-coded); `/api/team/twitter-sync` upserts them into `waitlist_applications` with `heard_from='twitter'` and `source_ref='twitter:@handle'`. It runs on Leads-tab load, throttled to once per 10 min.
- Daily numbers always count `actor='team'`; anything the admin logs is kept out of the intern's stats.

### Environment variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase admin key (server-side only)
- `LEADS_AUTH_SECRET` — JWT signing secret for leads dashboard
- `LEADS_PASSWORD` — Dashboard login password

### Build config
`next.config.mjs` ignores TypeScript build errors and uses unoptimized images. `netlify.toml` exists but deployment is on Vercel — ignore it.
