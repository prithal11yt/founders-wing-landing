import { NextResponse } from 'next/server'
import { gaConfigured, runReports } from '@/lib/ga4'

/* Public status check for the analytics integration. Says whether Google
   Analytics is connected and answering, and whether an AI key exists. Returns no
   analytics data and no secrets. */

export const revalidate = 300

export async function GET() {
  const ai = process.env.ANTHROPIC_API_KEY ? 'anthropic' : process.env.OPENAI_API_KEY ? 'openai' : null
  if (!gaConfigured()) {
    return NextResponse.json({ ga: 'not configured', ai })
  }
  try {
    await runReports([{ metrics: ['sessions'], dateRanges: [{ startDate: 'yesterday', endDate: 'yesterday' }] }])
    return NextResponse.json({ ga: 'ok', ai })
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    const reason = /401|403|PERMISSION_DENIED/.test(msg) ? 'google rejected the key' : /token exchange|private_key|client_email/.test(msg) ? 'key is malformed' : 'request failed'
    return NextResponse.json({ ga: `error: ${reason}`, ai }, { status: 500 })
  }
}
