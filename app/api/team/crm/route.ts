import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSession } from '../../leads/verify/route'
import { COHORT_1_SIZE } from '@/lib/cohort'
import { PROFILE_FIELDS, type Checkin, type CrmProfile, type Goal, type HistoryRow, type Member, type MemberTouch } from '@/lib/crm'
import { actorOf, countMemberContactOnce, istDayKey } from '@/lib/server/tracker'

/* Member Progress Dashboard data. Team (community manager) and admin can read and
   write; nothing here is reachable by members. Every stage, status, goal and
   renewal change is written to fw_crm_history with who, when and why. */

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const AUDITED: Partial<Record<string, string>> = {
  stage: 'Stage',
  membership_status: 'Membership status',
  renewal_signal: 'Renewal signal',
  main_outcome: 'Main outcome',
  blocker: 'Blocker',
}

async function loadAll(): Promise<Member[]> {
  const s = db()
  const [m, p, c, g, ch, h, tp] = await Promise.all([
    s.from('fw_memberships').select('full_name, email, whatsapp, plan, created_at').order('created_at', { ascending: true }),
    s.from('fw_member_profiles').select('member_email, what_building, who_its_for, problem, stage, need_help_with, link'),
    s.from('fw_crm_members').select('*'),
    s.from('fw_crm_goals').select('*').order('created_at', { ascending: false }),
    s.from('fw_crm_checkins').select('*').order('week_of', { ascending: false }).order('created_at', { ascending: false }),
    s.from('fw_crm_history').select('*').order('changed_at', { ascending: false }),
    s.from('fw_member_touchpoints').select('id, member_email, actor, channel, outcome, note, follow_up_at, created_at').order('created_at', { ascending: false }),
  ])
  for (const r of [m, p, c, g, ch, h, tp]) if (r.error) throw new Error(r.error.message)
  const lower = (e: string) => (e || '').trim().toLowerCase()
  const selfBy = new Map((p.data ?? []).map(x => [lower(x.member_email), x]))
  const crmBy = new Map((c.data ?? []).map(x => [lower(x.email), x as CrmProfile]))
  const group = <T extends { email: string }>(rows: T[]) => {
    const map = new Map<string, T[]>()
    for (const r of rows) { const k = lower(r.email); map.set(k, [...(map.get(k) ?? []), r]) }
    return map
  }
  const goalsBy = group((g.data ?? []) as Goal[])
  const checkBy = group((ch.data ?? []) as Checkin[])
  const histBy = group((h.data ?? []) as HistoryRow[])
  const touchBy = group(((tp.data ?? []) as MemberTouch[]).map(t => ({ ...t, email: t.member_email })))
  return (m.data ?? []).map((row, i) => {
    const k = lower(row.email)
    const self = selfBy.get(k)
    return {
      member_no: i + 1,
      cohort: i + 1 <= COHORT_1_SIZE ? 1 : 2,
      full_name: row.full_name,
      email: row.email,
      whatsapp: row.whatsapp ?? null,
      plan: row.plan ?? null,
      joined_at: row.created_at,
      self: self ? { what_building: self.what_building ?? null, who_its_for: self.who_its_for ?? null, problem: self.problem ?? null, stage: self.stage ?? null, need_help_with: self.need_help_with ?? null, link: self.link ?? null } : null,
      crm: crmBy.get(k) ?? null,
      goals: goalsBy.get(k) ?? [],
      checkins: checkBy.get(k) ?? [],
      history: histBy.get(k) ?? [],
      touchpoints: touchBy.get(k) ?? [],
    }
  })
}

function csv(members: Member[]): string {
  const cols = ['member_no', 'cohort', 'full_name', 'email', 'whatsapp', 'plan', 'joined_at', ...PROFILE_FIELDS, 'current_goal', 'goal_due', 'goal_status', 'last_checkin', 'last_checkin_status']
  const esc = (v: unknown) => { const s = v == null ? '' : Array.isArray(v) ? v.join('; ') : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  const lines = [cols.join(',')]
  for (const m of members) {
    const goal = m.goals.find(g => g.status === 'active') ?? m.goals[0]
    const ci = m.checkins[0]
    const c = m.crm ?? ({} as Partial<CrmProfile>)
    const row: Record<string, unknown> = { member_no: m.member_no, cohort: m.cohort, full_name: m.full_name, email: m.email, whatsapp: m.whatsapp, plan: m.plan, joined_at: m.joined_at.slice(0, 10) }
    for (const f of PROFILE_FIELDS) row[f] = (c as Record<string, unknown>)[f]
    row.current_goal = goal?.goal; row.goal_due = goal?.due_on; row.goal_status = goal?.status
    row.last_checkin = ci?.week_of; row.last_checkin_status = ci?.status
    lines.push(cols.map(k => esc(row[k])).join(','))
  }
  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  const session = getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const members = await loadAll()
    if (request.nextUrl.searchParams.get('export') === 'csv') {
      return new NextResponse(csv(members), {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="founders-wing-members-${new Date().toISOString().slice(0, 10)}.csv"` },
      })
    }
    return NextResponse.json({ members, me: session.email, role: session.role }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (e) {
    console.error('[team/crm] GET', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}

type Body =
  | { action: 'profile'; email: string; fields: Partial<CrmProfile>; reason?: string }
  | { action: 'goal'; email: string; goal: string; next_action?: string; due_on?: string }
  | { action: 'goal_review'; id: number; status: string; result?: string; proof?: string; learning?: string; next_action?: string; reason?: string }
  | { action: 'checkin'; email: string; fields: Partial<Checkin> }
  | { action: 'checkin_update'; id: number; fields: Partial<Checkin> }

export async function POST(request: NextRequest) {
  const session = getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const by = session.email
  let body: Body
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }
  const s = db()
  const now = new Date().toISOString()
  const today = istDayKey()
  // The audit trail matters, but a save that worked shouldn't report failure over it.
  const writeHistory = async (rows: object | object[]) => {
    const { error } = await s.from('fw_crm_history').insert(rows)
    if (error) console.error('[team/crm] history write failed:', error.message)
  }
  try {
    if (body.action === 'profile') {
      const email = (body.email || '').trim().toLowerCase()
      if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
      const fields: Record<string, unknown> = {}
      for (const f of PROFILE_FIELDS) if (f in body.fields) fields[f] = (body.fields as Record<string, unknown>)[f] === '' ? null : (body.fields as Record<string, unknown>)[f]
      const { data: before, error: readError } = await s.from('fw_crm_members').select('*').eq('email', email).maybeSingle()
      if (readError) throw new Error(readError.message)
      // New call notes mean a call happened, unless the date was set by hand.
      const notes = typeof fields.call_notes === 'string' ? fields.call_notes.trim() : ''
      const notesChanged = 'call_notes' in fields && !!notes && notes !== (before?.call_notes ?? '').trim()
      if (notesChanged && (!fields.last_contacted || fields.last_contacted === before?.last_contacted)) fields.last_contacted = today
      const { error } = await s.from('fw_crm_members').upsert({ email, ...fields, updated_at: now, updated_by: by }, { onConflict: 'email' })
      if (error) throw new Error(error.message)
      if (notesChanged) await countMemberContactOnce(s, { email, actor: actorOf(session), note: notes })
      const hist = Object.entries(AUDITED)
        .filter(([f]) => f in fields && String((before as Record<string, unknown> | null)?.[f] ?? '') !== String(fields[f] ?? ''))
        .map(([f, name]) => ({ email, field: name, old_value: (before as Record<string, unknown> | null)?.[f] ?? null, new_value: fields[f] ?? null, reason: body.reason ?? null, changed_by: by }))
      if (hist.length) await writeHistory(hist)
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'goal') {
      const email = (body.email || '').trim().toLowerCase()
      if (!email || !body.goal?.trim()) return NextResponse.json({ error: 'goal required' }, { status: 400 })
      // Only one active goal at a time; the previous one is closed as "changed by agreement".
      const { data: open, error: openError } = await s.from('fw_crm_goals').select('id, goal').eq('email', email).eq('status', 'active')
      if (openError) throw new Error(openError.message)
      // Save the new goal before closing the old one, so a failure can't leave the member with neither.
      const due = body.due_on || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
      const { error } = await s.from('fw_crm_goals').insert({ email, goal: body.goal.trim(), next_action: body.next_action?.trim() || null, due_on: due, set_on: today, created_by: by })
      if (error) throw new Error(error.message)
      if (open?.length) {
        const { error: closeError } = await s.from('fw_crm_goals').update({ status: 'changed', reviewed_on: today, updated_at: now }).in('id', open.map(o => o.id))
        if (closeError) throw new Error(closeError.message)
        await writeHistory(open.map(o => ({ email, field: 'Goal', old_value: o.goal, new_value: body.goal.trim(), reason: 'New goal set', changed_by: by })))
      } else {
        await writeHistory({ email, field: 'Goal', old_value: null, new_value: body.goal.trim(), reason: 'Goal set', changed_by: by })
      }
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'goal_review') {
      const { data: before, error: readError } = await s.from('fw_crm_goals').select('*').eq('id', body.id).maybeSingle()
      if (readError) throw new Error(readError.message)
      if (!before) return NextResponse.json({ error: 'goal not found' }, { status: 404 })
      const { error } = await s.from('fw_crm_goals').update({
        status: body.status, result: body.result ?? before.result, proof: body.proof ?? before.proof, learning: body.learning ?? before.learning,
        next_action: body.next_action ?? before.next_action, reviewed_on: body.status === 'active' ? before.reviewed_on : today, updated_at: now,
      }).eq('id', body.id)
      if (error) throw new Error(error.message)
      if (before.status !== body.status) await writeHistory({ email: before.email, field: 'Goal status', old_value: before.status, new_value: body.status, reason: body.reason ?? null, changed_by: by })
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'checkin') {
      const email = (body.email || '').trim().toLowerCase()
      if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
      const f = body.fields
      const { error } = await s.from('fw_crm_checkins').insert({
        email, week_of: f.week_of || today, progress: f.progress || null, evidence: f.evidence || null, blocker: f.blocker || null,
        help_requested: f.help_requested || null, next_action: f.next_action || null, status: f.status || 'on_track',
        followup_owner: f.followup_owner || null, followup_due: f.followup_due || null, followup_done: !!f.followup_done, created_by: by,
      })
      if (error) throw new Error(error.message)
      // A check-in counts as contact, here and on the daily tracker.
      const { error: contactError } = await s.from('fw_crm_members').upsert({ email, last_contacted: f.week_of || today, updated_at: now, updated_by: by }, { onConflict: 'email' })
      if (contactError) throw new Error(contactError.message)
      if ((f.week_of || today) === today) await countMemberContactOnce(s, { email, actor: actorOf(session), note: f.progress })
      return NextResponse.json({ ok: true })
    }
    if (body.action === 'checkin_update') {
      const allowed: (keyof Checkin)[] = ['followup_done', 'followup_owner', 'followup_due', 'status', 'next_action', 'help_requested', 'blocker', 'progress', 'evidence']
      const patch: Record<string, unknown> = {}
      for (const k of allowed) if (k in body.fields) patch[k] = (body.fields as Record<string, unknown>)[k]
      const { error } = await s.from('fw_crm_checkins').update(patch).eq('id', body.id)
      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('[team/crm] POST', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 })
  }
}
