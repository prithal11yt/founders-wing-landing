import { STAGE_PATH, STAGE_USUAL_DAYS } from '@/lib/crm'

/* Shared by the members' path board and its downloadable snapshot, so the two
   always look alike. */

// Bottom of the path first: Decide is stop 1, Grow with AI is stop 5.
export const PATH_ORDER = [...STAGE_PATH, 'grow'] as string[]

export const PATH_COLOR: Record<string, { solid: string; rail: string; soft: string }> = {
  decide: { solid: '#475569', rail: '#cbd5e1', soft: '#eef1f5' },
  build: { solid: '#1d4ed8', rail: '#a5c4fb', soft: '#e6eeff' },
  launch: { solid: '#6d28d9', rail: '#cbb8fb', soft: '#f1ebff' },
  sell: { solid: '#c2410c', rail: '#fbbf8a', soft: '#fff1e6' },
  grow: { solid: '#15803d', rail: '#93e2b0', soft: '#e5f7ec' },
}

export const STAGE_PLAIN: Record<string, { now: string; done: string }> = {
  decide: { now: "You're choosing what to build.", done: 'Done when 3–5 real people confirm the problem is worth solving.' },
  build: { now: "You've picked the idea. Now make it real.", done: 'Done when one core workflow works from start to finish.' },
  launch: { now: "It works, but people can't fully use it yet.", done: 'Done when real users can sign up and get through it.' },
  sell: { now: "It's live. Now it has to earn.", done: "Done when someone you don't know pays you." },
  grow: { now: 'You already run a business.', done: 'No finish line. Keep using AI to earn more or work less.' },
}

export const daysSince = (iso: string | null) => (iso ? Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) + 1) : null)

// Past the usual time for a stage the day count turns orange, past double it turns red.
export const paceColor = (stage: string, d: number | null) => {
  const usual = STAGE_USUAL_DAYS[stage]
  if (d == null || !usual) return '#8b93a7'
  if (d > usual * 2) return '#dc2626'
  if (d > usual) return '#ea7a0c'
  return '#8b93a7'
}
