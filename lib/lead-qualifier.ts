import { createClient } from '@supabase/supabase-js'

/* AI qualification of apply-form leads.

   1. Cheap checks catch obvious junk (gibberish, placeholders, fake numbers) without
      spending a model call.
   2. Everything else goes to the model in batches with a fixed rubric and comes back
      as a 0–100 score, a tier (hot / warm / cold / junk), a one-line reason and flags.
   3. Results are stored on waitlist_applications (ai_* columns) so both dashboards
      can filter and sort by them. New applications are scored right after they are
      saved (see app/api/waitlist). */

export const AI_VERSION = 'v1'
export type Tier = 'hot' | 'warm' | 'cold' | 'junk'
export const TIERS: { value: Tier; label: string; hint: string }[] = [
  { value: 'hot', label: 'Hot', hint: 'Specific project, clear outcome, call first' },
  { value: 'warm', label: 'Warm', hint: 'Genuine but vague; worth a call' },
  { value: 'cold', label: 'Cold', hint: 'Curious, little intent; low priority' },
  { value: 'junk', label: 'Junk', hint: 'Random or fake entry; skip' },
]

type LeadRow = { id: number; full_name: string | null; email: string | null; whatsapp: string | null; what_building: string | null; join_reason: string | null; heard_from: string | null }
export type Verdict = { score: number; tier: Tier; reason: string; flags: string[] }
export const tierForScore = (score: number): Tier => (score >= 75 ? 'hot' : score >= 45 ? 'warm' : score >= 20 ? 'cold' : 'junk')

function db() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/* ── Heuristics ── */
const PLACEHOLDERS = /^(test|testing|asdf+|qwerty|abc+|xyz|none|na|n\/a|nothing|hello|hi|ok|okay|\.+|-+|\?+|lorem.*|random|idk|dont know|don't know)$/i
const vowelRatio = (s: string) => { const letters = s.replace(/[^a-z]/gi, ''); if (!letters) return 0; return (letters.match(/[aeiou]/gi)?.length ?? 0) / letters.length }
const looksGibberish = (s: string) => {
  const t = s.trim()
  if (t.length < 3) return true
  if (PLACEHOLDERS.test(t)) return true
  if (/(.)\1{3,}/.test(t)) return true // aaaaa
  const words = t.split(/\s+/)
  const longNoVowel = words.filter(w => w.length >= 6 && vowelRatio(w) < 0.15).length
  if (longNoVowel >= Math.max(1, Math.ceil(words.length / 2))) return true
  if (t.length >= 8 && vowelRatio(t) < 0.18) return true
  return false
}

export function heuristics(l: LeadRow): { flags: string[]; junk: boolean } {
  const flags: string[] = []
  const name = (l.full_name ?? '').trim()
  const building = (l.what_building ?? '').trim()
  const goal = (l.join_reason ?? '').trim()
  const digits = (l.whatsapp ?? '').replace(/\D/g, '')
  if (name.length < 2 || !/[a-z]/i.test(name) || PLACEHOLDERS.test(name)) flags.push('fake_name')
  if (digits.length < 10 || digits.length > 15 || /^(\d)\1+$/.test(digits) || /^(0123456789|1234567890|9876543210)/.test(digits)) flags.push('bad_phone')
  if (l.email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(l.email)) flags.push('bad_email')
  if (!building || looksGibberish(building)) flags.push('empty_or_gibberish_building')
  if (!goal || looksGibberish(goal)) flags.push('empty_or_gibberish_goal')
  if (building && goal && building.toLowerCase() === goal.toLowerCase()) flags.push('same_text_twice')
  if (building.length + goal.length < 20) flags.push('very_short_answers')
  const hard = flags.filter(f => f !== 'very_short_answers' && f !== 'bad_email')
  // Two hard signals, or both answers worthless, is junk without asking the model.
  const junk = hard.length >= 2 || (flags.includes('empty_or_gibberish_building') && flags.includes('empty_or_gibberish_goal'))
  return { flags, junk }
}

/* ── Model ── */
const RUBRIC = `You qualify applications to Founders Wing, a paid Indian community (₹7,499 for 6 months) for people building SaaS, AI automations or AI businesses who want paying customers. The team calls every applicant; your job is to tell them who to call first and who to skip.

Score each applicant 0–100 and give a tier:
- hot (75–100): a specific thing they are building or a specific business they run, a concrete 3-month outcome (customers, revenue, launch, clients), answers that sound like a real person who has thought about it.
- warm (45–74): genuine intent but vague ("want to start something with AI", "learn and earn"), or specific but unrealistic.
- cold (20–44): mostly curiosity, no project and no outcome, one-word answers, or wants free content only.
- junk (0–19): random characters, placeholders, copy-pasted spam, jokes, obviously fake details, or answers that make no sense together.

Indian English and Hinglish are normal; short answers are not junk if they are specific. Never reward length for its own sake. The reason must be one plain sentence under 20 words that a caller can read in two seconds, naming the strongest or weakest signal.

Return ONLY a JSON array, one object per applicant in the same order: [{"id":<id>,"score":<0-100>,"tier":"hot|warm|cold|junk","reason":"...","flags":["..."]}]. Flags are short snake_case tags like vague_project, no_outcome, specific_customer, has_business, placeholder_text, spam.`

function formatLead(l: LeadRow): string {
  return [`id: ${l.id}`, `name: ${l.full_name ?? ''}`, `email: ${l.email ?? ''}`, `whatsapp: ${l.whatsapp ?? ''}`, `heard_from: ${l.heard_from ?? ''}`, `what_building: ${(l.what_building ?? '').slice(0, 600)}`, `goal_3_months: ${(l.join_reason ?? '').slice(0, 600)}`].join('\n')
}

async function askModel(batch: LeadRow[]): Promise<Map<number, Verdict>> {
  const anthropic = process.env.ANTHROPIC_API_KEY
  const openai = process.env.OPENAI_API_KEY
  const user = batch.map(formatLead).join('\n\n---\n\n')
  let text = ''
  if (anthropic) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'x-api-key': anthropic, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2000, system: RUBRIC, messages: [{ role: 'user', content: user }] }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const j = (await res.json()) as { content: { type: string; text?: string }[] }
    text = j.content.filter(c => c.type === 'text').map(c => c.text).join('')
  } else if (openai) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { Authorization: `Bearer ${openai}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', temperature: 0, max_tokens: 2000, messages: [{ role: 'system', content: RUBRIC }, { role: 'user', content: user }] }),
    })
    if (!res.ok) throw new Error(`OpenAI ${res.status}`)
    const j = (await res.json()) as { choices: { message: { content: string } }[] }
    text = j.choices[0]?.message.content ?? ''
  } else {
    throw new Error('No AI key configured (ANTHROPIC_API_KEY or OPENAI_API_KEY)')
  }
  const start = text.indexOf('['); const end = text.lastIndexOf(']')
  if (start < 0 || end < 0) throw new Error('Model returned no JSON')
  const arr = JSON.parse(text.slice(start, end + 1)) as { id: number; score: number; tier: string; reason: string; flags?: string[] }[]
  const out = new Map<number, Verdict>()
  for (const v of arr) {
    const score = Math.max(0, Math.min(100, Math.round(Number(v.score) || 0)))
    // The tier always follows the score bands in the rubric, so badge and number never disagree.
    const tier = tierForScore(score)
    out.set(Number(v.id), { score, tier, reason: String(v.reason ?? '').slice(0, 200), flags: Array.isArray(v.flags) ? v.flags.map(String).slice(0, 6) : [] })
  }
  return out
}

/* ── Orchestration ── */
export async function qualifyLeads(opts: { ids?: number[]; onlyUnscored?: boolean; limit?: number } = {}): Promise<{ scored: number; junkByRules: number; byModel: number; failed: number }> {
  const s = db()
  let q = s.from('waitlist_applications').select('id, full_name, email, whatsapp, what_building, join_reason, heard_from, ai_scored_at').order('created_at', { ascending: false })
  if (opts.ids?.length) q = q.in('id', opts.ids)
  else if (opts.onlyUnscored !== false) q = q.is('ai_scored_at', null)
  q = q.limit(opts.limit ?? 500)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  const leads = (data ?? []) as (LeadRow & { ai_scored_at: string | null })[]
  const stats = { scored: 0, junkByRules: 0, byModel: 0, failed: 0 }
  const now = new Date().toISOString()

  const save = async (id: number, v: Verdict) => {
    const { error } = await s.from('waitlist_applications').update({ ai_score: v.score, ai_tier: v.tier, ai_reason: v.reason, ai_flags: v.flags, ai_scored_at: now, ai_version: AI_VERSION }).eq('id', id)
    if (error) stats.failed++; else stats.scored++
  }

  const forModel: LeadRow[] = []
  for (const l of leads) {
    const h = heuristics(l)
    if (h.junk) {
      await save(l.id, { score: 5, tier: 'junk', reason: 'Fake or random entry: ' + h.flags.map(f => f.replace(/_/g, ' ')).join(', '), flags: h.flags })
      stats.junkByRules++
    } else forModel.push(l)
  }
  for (let i = 0; i < forModel.length; i += 8) {
    const batch = forModel.slice(i, i + 8)
    try {
      const verdicts = await askModel(batch)
      for (const l of batch) {
        const v = verdicts.get(l.id)
        if (!v) { stats.failed++; continue }
        const extra = heuristics(l).flags.filter(f => f === 'bad_phone' || f === 'bad_email')
        await save(l.id, { ...v, flags: [...new Set([...v.flags, ...extra])] })
        stats.byModel++
      }
    } catch (e) {
      console.error('[lead-qualifier] batch failed:', e)
      stats.failed += batch.length
    }
  }
  return stats
}
