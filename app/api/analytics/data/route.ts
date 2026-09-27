import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getSession } from '../../leads/verify/route'
import { buildDashboard, type RangeKey } from '@/lib/analytics'
import { aiSummary } from '@/lib/ai-takeaways'

/* Data for /analytics. Admin session required (same cookie as /admin).
   GA4 numbers are cached for 30 minutes and the AI summary for 6 hours, so
   refreshing the page does not burn API quota. */

const RANGES: RangeKey[] = ['7d', '28d', '90d', 'mtd', 'last-month']

const cachedDashboard = unstable_cache(async (range: RangeKey) => buildDashboard(range), ['analytics-dashboard-v1'], { revalidate: 1800 })

const cachedSummary = unstable_cache(
  async (range: RangeKey, day: string) => {
    void day // part of the cache key so the summary refreshes daily
    const d = await buildDashboard(range)
    if (!d.gaConfigured || d.error) return null
    return aiSummary(d)
  },
  ['analytics-ai-v1'],
  { revalidate: 21600 },
)

export async function GET(request: NextRequest) {
  const session = getSession(request)
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rangeParam = request.nextUrl.searchParams.get('range') ?? '28d'
  const range: RangeKey = (RANGES as string[]).includes(rangeParam) ? (rangeParam as RangeKey) : '28d'
  const wantAi = request.nextUrl.searchParams.get('ai') !== '0'

  try {
    const data = await cachedDashboard(range)
    const day = new Date().toISOString().slice(0, 10)
    const ai = wantAi && data.gaConfigured && !data.error ? await cachedSummary(range, day) : null
    return NextResponse.json({ ...data, aiSummary: ai }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) {
    console.error('[analytics] failed:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load analytics' }, { status: 500 })
  }
}
