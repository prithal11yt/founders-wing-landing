'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, toast, Card, Empty, Field, Chips, Pill, IDEA_CATEGORIES, IDEA_STATUSES, timeAgo, type Idea, type Role } from './shared'

type Props = { role: Role; compact?: boolean }

export default function Ideas({ role, compact }: Props) {
  const [ideas, setIdeas] = useState<Idea[] | null>(null)
  const [f, setF] = useState({ title: '', detail: '', category: ['general'] })
  const [saving, setSaving] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const load = useCallback(async () => { try { setIdeas(await api<Idea[]>('/api/team/ideas')) } catch (e) { toast((e as Error).message, 'err') } }, [])
  useEffect(() => { load() }, [load])

  async function add() {
    if (!f.title.trim()) { toast('Give the idea a title', 'err'); return }
    setSaving(true)
    try { await api('/api/team/ideas', { method: 'POST', json: { title: f.title, detail: f.detail, category: f.category[0] || 'general' } }); toast('Idea captured'); setF({ title: '', detail: '', category: ['general'] }); load() }
    catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  async function patch(id: string, body: Record<string, unknown>) {
    setIdeas(prev => prev ? prev.map(i => (i.id === id ? { ...i, ...body } as Idea : i)) : prev)
    try { await api('/api/team/ideas', { method: 'PATCH', json: { id, ...body } }) } catch (e) { toast((e as Error).message, 'err'); load() }
  }
  async function del(id: string) {
    if (!confirm('Delete this idea?')) return
    try { await api(`/api/team/ideas?id=${id}`, { method: 'DELETE' }); load() } catch (e) { toast((e as Error).message, 'err') }
  }

  const groups = useMemo(() => {
    const g: Record<string, Idea[]> = {}
    for (const s of IDEA_STATUSES) g[s.value] = []
    for (const i of ideas || []) (g[i.status] ||= []).push(i)
    return g
  }, [ideas])

  const statusMeta = (s: string) => IDEA_STATUSES.find(x => x.value === s) || IDEA_STATUSES[0]

  const IdeaRow = ({ i }: { i: Idea }) => {
    const m = statusMeta(i.status)
    const isEditing = editing === i.id
    return (
      <div className="hist-row" style={{ background: '#fff', borderColor: 'rgba(15,23,42,.08)' }}>
        <div className="row-sb" style={{ alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            {isEditing ? (
              <input className="input input-s" style={{ width: '100%' }} defaultValue={i.title} autoFocus onBlur={e => { setEditing(null); if (e.target.value.trim() && e.target.value !== i.title) patch(i.id, { title: e.target.value.trim() }) }} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }} />
            ) : <div className="b" style={{ fontSize: 14, cursor: 'text' }} onClick={() => setEditing(i.id)}>{i.title}</div>}
            {i.detail && <div className="small" style={{ color: '#475569', marginTop: 3, whiteSpace: 'pre-wrap' }}>{i.detail}</div>}
            <div className="row" style={{ marginTop: 6, gap: 6 }}>
              <span className="tag">{i.category}</span>
              <span className="faint small">{i.raised_by === 'admin' ? 'Prithal' : 'Shreyas'} · {timeAgo(i.created_at)}{i.done_at && ` · done ${timeAgo(i.done_at)}`}</span>
            </div>
          </div>
          <div className="row" style={{ flexShrink: 0, gap: 6 }}>
            <select className="select input-s" value={i.status} onChange={e => patch(i.id, { status: e.target.value })} style={{ color: m.fg, background: m.bg, fontWeight: 600, borderColor: 'transparent' }}>
              {IDEA_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {(role === 'admin' || i.raised_by === 'team') && <button className="btn btn-g btn-s" onClick={() => del(i.id)} style={{ padding: '4px 8px' }}>✕</button>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="col" style={{ gap: 14 }}>
      <Card title="Capture an idea" right={<span className="faint small">anything — sales angle, post idea, session format, product</span>}>
        <div className="row" style={{ alignItems: 'stretch' }}>
          <input className="input" style={{ flex: 1, minWidth: 200 }} placeholder="The idea in one line" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} onKeyDown={e => { if (e.key === 'Enter' && !f.detail) add() }} />
          <button className="btn btn-p" disabled={saving} onClick={add}>{saving ? 'Saving…' : '+ Add'}</button>
        </div>
        {!compact && <>
          <div className="mt"><Chips single value={f.category} onChange={v => setF({ ...f, category: v.length ? v : ['general'] })} options={IDEA_CATEGORIES.map(c => ({ value: c, label: c }))} /></div>
          <Field label="Detail (optional)"><textarea className="textarea" style={{ minHeight: 56 }} value={f.detail} onChange={e => setF({ ...f, detail: e.target.value })} placeholder="Why, how, what it would take" /></Field>
        </>}
      </Card>

      {!ideas ? <Empty>Loading…</Empty> : ideas.length === 0 ? <Empty>No ideas captured yet. The next time either of you says "we should…", put it here.</Empty> : (
        <div className="t-grid g2 stack">
          {IDEA_STATUSES.filter(s => s.value !== 'done' && s.value !== 'parked').map(s => (
            <Card key={s.value} title={<span className="row"><Pill bg={s.bg} fg={s.fg}>{s.label}</Pill><span className="faint small">{groups[s.value].length}</span></span>}>
              {groups[s.value].length === 0 ? <p className="faint small">Empty</p> : <div className="col" style={{ gap: 8 }}>{groups[s.value].map(i => <IdeaRow key={i.id} i={i} />)}</div>}
            </Card>
          ))}
          <Card title={<span className="row"><Pill bg="#f0fdf4" fg="#15803d">Done</Pill><Pill>Parked</Pill><span className="faint small">{groups.done.length + groups.parked.length}</span></span>}
            right={<button className="btn btn-g btn-s" onClick={() => setShowDone(!showDone)}>{showDone ? 'Hide' : 'Show'}</button>}>
            {showDone ? <div className="col" style={{ gap: 8 }}>{[...groups.done, ...groups.parked].map(i => <IdeaRow key={i.id} i={i} />)}</div> : <p className="faint small">{groups.done.length} done · {groups.parked.length} parked</p>}
          </Card>
        </div>
      )}
    </div>
  )
}
