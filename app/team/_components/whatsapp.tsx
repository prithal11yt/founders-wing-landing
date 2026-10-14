'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, toast, Card, Stat, Empty, Field, Chips, waCat, WA_CATEGORIES, fmtDay, todayISO, addDays, weekday, type WaPost, type Targets } from './shared'

type Props = { targets: Targets | null; onChanged: () => void }

export default function WhatsApp({ targets, onChanged }: Props) {
  const [posts, setPosts] = useState<WaPost[] | null>(null)
  const [f, setF] = useState({ posted_on: todayISO(), category: ['learning'], content: '', replies: 0, reactions: 0 })
  const [saving, setSaving] = useState(false)
  const today = todayISO()

  const load = useCallback(async () => { try { setPosts(await api<WaPost[]>('/api/team/whatsapp')) } catch (e) { toast((e as Error).message, 'err') } }, [])
  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    try {
      await api('/api/team/whatsapp', { method: 'POST', json: { ...f, category: f.category[0] || 'other' } })
      toast('Post logged'); setF({ posted_on: todayISO(), category: ['learning'], content: '', replies: 0, reactions: 0 }); load(); onChanged()
    } catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  async function patch(id: string, body: Record<string, unknown>) {
    try { await api('/api/team/whatsapp', { method: 'PATCH', json: { id, ...body } }); load() } catch (e) { toast((e as Error).message, 'err') }
  }
  async function del(id: string) {
    if (!confirm('Delete this post log?')) return
    try { await api(`/api/team/whatsapp?id=${id}`, { method: 'DELETE' }); load(); onChanged() } catch (e) { toast((e as Error).message, 'err') }
  }

  const days14 = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i - 13)), [today])
  const byDay = useMemo(() => { const m = new Map<string, WaPost[]>(); for (const p of posts || []) { if (!m.has(p.posted_on)) m.set(p.posted_on, []); m.get(p.posted_on)!.push(p) } return m }, [posts])
  const working = (d: string) => (targets?.working_days || [1, 2, 3, 4, 5, 6]).includes(weekday(d))
  const streak = useMemo(() => { let n = 0; for (let i = 13; i >= 0; i--) { const d = days14[i]; if (!working(d)) continue; if (byDay.has(d)) n++; else break } return n }, [days14, byDay, targets])
  const last30 = (posts || []).filter(p => p.posted_on >= addDays(today, -29))
  const catMix = useMemo(() => { const m = new Map<string, number>(); for (const p of last30) m.set(p.category, (m.get(p.category) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]) }, [last30])
  const missedWorking = days14.filter(d => working(d) && !byDay.has(d) && d < today).length

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="t-grid g4">
        <Stat n={byDay.get(today)?.length || 0} label="posted today" tone={byDay.has(today) ? 'ok' : 'warn'} />
        <Stat n={streak} label="day streak" sub="working days" />
        <Stat n={last30.length} label="posts, last 30 days" />
        <Stat n={missedWorking} label="working days missed (14d)" tone={missedWorking ? 'bad' : 'ok'} />
      </div>

      <Card title="Log a group post" right={<span className="faint small">one post every working day</span>}>
        <Field label="Type"><Chips single value={f.category} onChange={v => setF({ ...f, category: v })} options={WA_CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))} /></Field>
        <Field label="What did you post?"><textarea className="textarea" value={f.content} onChange={e => setF({ ...f, content: e.target.value })} placeholder="Paste the message or summarise it" /></Field>
        <div className="t-grid g3">
          <Field label="Date"><input className="input" type="date" value={f.posted_on} max={today} onChange={e => setF({ ...f, posted_on: e.target.value })} /></Field>
          <Field label="Replies"><input className="input" type="number" min={0} value={f.replies} onChange={e => setF({ ...f, replies: Number(e.target.value) })} /></Field>
          <Field label="Reactions"><input className="input" type="number" min={0} value={f.reactions} onChange={e => setF({ ...f, reactions: Number(e.target.value) })} /></Field>
        </div>
        <button className="btn btn-p" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save post'}</button>
      </Card>

      <div className="t-grid g2 stack">
        <Card title="Last 14 days">
          <div className="strip">
            {days14.map(d => {
              const ps = byDay.get(d) || []
              return <div key={d} title={ps.map(p => waCat(p.category).label).join(', ') || 'No post'}>
                <div className="strip-d">{fmtDay(d, false).split(' ')[0]}</div>
                <div className={`strip-b${ps.length ? ' ok' : ''}${working(d) ? '' : ' off'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{ps.length ? waCat(ps[0].category).icon : ''}</div>
                <div className="strip-d">{fmtDay(d, false).split(' ')[1]}</div>
              </div>
            })}
          </div>
        </Card>
        <Card title="Mix, last 30 days" right={<span className="faint small">vary it — polls and questions get replies</span>}>
          {catMix.length === 0 ? <Empty>No posts yet.</Empty> : <div className="chips">{catMix.map(([c, n]) => <span key={c} className="chip" style={{ cursor: 'default' }}>{waCat(c).icon} {waCat(c).label}<span className="c">{n}</span></span>)}</div>}
        </Card>
      </div>

      <Card title="Post log" pad={false}>
        {!posts ? <div style={{ padding: 16 }}><Empty>Loading…</Empty></div> : posts.length === 0 ? <div style={{ padding: 16 }}><Empty>Nothing logged yet.</Empty></div> : (
          <table className="tbl">
            <thead><tr><th>Date</th><th>Type</th><th>Post</th><th>Replies</th><th>Reactions</th><th></th></tr></thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDay(p.posted_on)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{waCat(p.category).icon} {waCat(p.category).label}</td>
                  <td style={{ maxWidth: 420, whiteSpace: 'pre-wrap', fontSize: 12.5, color: '#334155' }}>{p.content || <span className="faint">—</span>}</td>
                  <td><input className="input input-s" style={{ width: 62 }} type="number" min={0} defaultValue={p.replies} onBlur={e => { if (Number(e.target.value) !== p.replies) patch(p.id, { replies: Number(e.target.value) }) }} /></td>
                  <td><input className="input input-s" style={{ width: 62 }} type="number" min={0} defaultValue={p.reactions} onBlur={e => { if (Number(e.target.value) !== p.reactions) patch(p.id, { reactions: Number(e.target.value) }) }} /></td>
                  <td><button className="btn btn-g btn-s" onClick={() => del(p.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
