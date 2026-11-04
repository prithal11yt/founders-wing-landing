import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { crawlStep, enrichStep, eventsDb, saveRunStats, verifyStep } from '@/lib/events/refresh'
import { SOURCES, type SourceName } from '@/lib/events/sources'

/* Weekly refresh of the founder events directory, called by Vercel Cron (see vercel.json).
   ?step=eventbrite|meetup|luma|allevents crawls one source, ?step=enrich publishes what
   was found, and ?step=verify re-checks the booking links of upcoming events. */
export const maxDuration = 280
const BUDGET_MS = 250_000
const MIN_GAP_MS = 20 * 60 * 1000

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  const authed = secret
    ? request.headers.get('authorization') === `Bearer ${secret}`
    // Until CRON_SECRET is set, accept only Vercel's scheduler. A user agent can be
    // faked, so without the secret each step is also limited to one run per 20 minutes.
    : (request.headers.get('user-agent') ?? '').startsWith('vercel-cron/')
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const step = request.nextUrl.searchParams.get('step') ?? ''
  const deadline = Date.now() + BUDGET_MS
  try {
    if (!secret) {
      const { data } = await eventsDb().from('fw_settings').select('value').eq('key', 'events_refresh').maybeSingle()
      const last = (data?.value as Record<string, { at?: string }> | null)?.[step]?.at
      if (last && Date.now() - new Date(last).getTime() < MIN_GAP_MS) return NextResponse.json({ skipped: true, last }, { status: 429 })
    }
    let result: unknown
    if ((SOURCES as string[]).includes(step)) result = await crawlStep(step as SourceName, deadline)
    else if (step === 'enrich') result = await enrichStep(deadline)
    else if (step === 'verify') result = await verifyStep(deadline)
    else return NextResponse.json({ error: 'Unknown step' }, { status: 400 })

    await saveRunStats(step, result)
    revalidateTag('events', { expire: 0 })
    revalidatePath('/events', 'layout')
    revalidatePath('/sitemap.xml')
    return NextResponse.json({ ok: true, step, result })
  } catch (e) {
    console.error(`[cron/events] ${step} failed:`, e)
    await saveRunStats(step, { error: e instanceof Error ? e.message : 'failed' }).catch(() => {})
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
