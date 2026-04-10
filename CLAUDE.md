# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` (runs on port 3001)
- **Build**: `npm run build`
- **Lint**: `npm run lint` (eslint)
- No test framework is configured.

## Architecture

Next.js 16 (app router) + React 19 landing page for the Founders Wing AI-first founder community, deployed on Netlify.

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
- `app/api/waitlist/` — Waitlist form submission → Supabase insert
- `app/api/leads/` — Protected admin API (custom JWT auth, single authorized user)
- `app/leads/` — Protected leads dashboard (login + data table)
- `components/` — Section components (challenge-spotlight, meet-founder, faq-section, value-stack, interactive-bento, etc.)
- `hooks/` — Custom hooks (use-scroll-reveal, use-mobile, use-toast)
- `lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)

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

### Environment variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase admin key (server-side only)
- `LEADS_AUTH_SECRET` — JWT signing secret for leads dashboard
- `LEADS_PASSWORD` — Dashboard login password

### Build config
`next.config.mjs` ignores TypeScript build errors and uses unoptimized images. Netlify deployment configured in `netlify.toml`.
