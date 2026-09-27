import type { Dashboard } from './analytics'

/* A short written summary of the dashboard, from whichever model key is configured.
   Uses ANTHROPIC_API_KEY first, then OPENAI_API_KEY. Returns null when neither is set,
   so the dashboard falls back to the computed takeaways only. */

function summarise(d: Dashboard): string {
  const k = (key: string) => d.kpis.find(x => x.key === key)
  const line = (key: string, label: string) => {
    const v = k(key)
    return v ? `${label}: ${Math.round(v.value)} (previous ${Math.round(v.previous)})` : ''
  }
  const top = (rows: { name: string; value: number; previous: number }[], n = 6) =>
    rows.slice(0, n).map(r => `${r.name}: ${Math.round(r.value)} (prev ${Math.round(r.previous)})`).join('; ')
  const months = d.monthly.slice(-4).map(m => `${m.label}: ${m.sessions} visits, ${m.users} visitors, ${m.checkout} reached checkout, ${m.applications} applications, ${m.members} paid (₹${Math.round(m.revenue)})`).join('\n')
  return [
    `Site: founderswing.com, a paid community (₹5,999/6mo, ₹9,999/yr) for Indians building SaaS and AI automations. Founder Prithal runs a YouTube channel (50K subs); most traffic comes from video description links.`,
    `Period: ${d.current.label} (${d.current.start} to ${d.current.end}) vs ${d.previous.label}.`,
    line('users', 'Visitors'), line('sessions', 'Visits'), line('newUsers', 'New visitors'), line('engagement', 'Engaged %'), line('duration', 'Avg seconds on site'),
    line('checkout', 'Reached checkout page'), line('applications', 'Applications (form submissions)'), line('members', 'New paying members'), line('revenue', 'Revenue ₹'),
    `Channels: ${top(d.channels)}`,
    `Top sources: ${top(d.sources, 8)}`,
    `Sources that led to checkout: ${top(d.checkoutBySource, 5)}`,
    `Top pages (views): ${top(d.pages, 8)}`,
    `Devices: ${top(d.devices)}`,
    `Cities: ${top(d.cities, 6)}`,
    `Applications by how they heard: ${top(d.heardFrom, 6)}`,
    `Last months:\n${months}`,
  ].filter(Boolean).join('\n')
}

const PROMPT = `You are a growth analyst writing for a founder who finds analytics confusing. Read the numbers and write:
1. "What happened" — 4 to 6 short bullet points, plain English, no jargon, each with the number that matters.
2. "What to do next" — 3 specific actions for the next two weeks, based only on these numbers.
Rules: never invent numbers, say "previous period" not "MoM", keep every bullet under 25 words, use ₹ for money, no headings other than the two above, no preamble.`

export async function aiSummary(d: Dashboard): Promise<{ text: string; provider: string } | null> {
  const anthropic = process.env.ANTHROPIC_API_KEY
  const openai = process.env.OPENAI_API_KEY
  const data = summarise(d)
  try {
    if (anthropic) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': anthropic, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 700, system: PROMPT, messages: [{ role: 'user', content: data }] }),
      })
      if (!res.ok) throw new Error(`Anthropic ${res.status}`)
      const j = (await res.json()) as { content: { type: string; text?: string }[] }
      return { text: j.content.filter(c => c.type === 'text').map(c => c.text).join('\n'), provider: 'Claude' }
    }
    if (openai) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${openai}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 700, messages: [{ role: 'system', content: PROMPT }, { role: 'user', content: data }] }),
      })
      if (!res.ok) throw new Error(`OpenAI ${res.status}`)
      const j = (await res.json()) as { choices: { message: { content: string } }[] }
      return { text: j.choices[0]?.message.content ?? '', provider: 'GPT' }
    }
  } catch (e) {
    console.error('[analytics] AI summary failed:', e)
  }
  return null
}
