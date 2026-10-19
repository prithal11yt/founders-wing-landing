import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../verify/route'
import { qualifyLeads } from '@/lib/lead-qualifier'

/* Runs the AI qualifier. Team and admin only.
   POST {}                → score every lead that has no score yet
   POST { ids: [..] }     → (re)score those leads
   POST { rescore: true } → score everything again (new rubric version) */
export const maxDuration = 120

export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: { ids?: number[]; rescore?: boolean } = {}
  try { body = await request.json() } catch { /* empty body is fine */ }
  try {
    const stats = await qualifyLeads({ ids: body.ids, onlyUnscored: !body.rescore, limit: body.rescore ? 2000 : 500 })
    return NextResponse.json({ ok: true, ...stats })
  } catch (e) {
    console.error('[leads/qualify]', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
