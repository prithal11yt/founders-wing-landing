'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, toast, Card, Stat, Empty, Field, Modal, fmtDay, daysUntil, todayISO, type Session, type Member, type Role } from './shared'

type Props = { role: Role; nextSessionDay: string; defaultTarget: number; onChanged: () => void }

export default function Sessions({ role, nextSessionDay, defaultTarget, onChanged }: Props) {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [target, setTarget] = useState(defaultTarget)
  const [creating, setCreating] = useState(false)
  const [markFor, setMarkFor] = useState<Session | null>(null)
  const [editFor, setEditFor] = useState<Session | null>(null)
  const today = todayISO()

  const load = useCallback(async () => {
    try { const d = await api<{ sessions: Session[]; default_target: number }>('/api/team/sessions'); setSessions(d.sessions); setTarget(d.default_target) }
    catch (e) { toast((e as Error).message, 'err') }
  }, [])
  useEffect(() => { load() }, [load])

  const upcoming = useMemo(() => (sessions || []).filter(s => s.call_date >= today).sort((a, b) => a.call_date.localeCompare(b.call_date))[0] || null, [sessions, today])
  const past = useMemo(() => (sessions || []).filter(s => s.call_date < today), [sessions, today])
  const last4 = past.slice(0, 4)
  const avg = last4.length ? Math.round(last4.reduce((s, c) => s + c.attended, 0) / last4.length) : 0

  async function create() {
    setCreating(true)
    try { await api('/api/team/sessions', { method: 'POST', json: { title: `Live Session — ${fmtDay(nextSessionDay, false)}`, call_date: nextSessionDay, target_attendance: target } }); toast('Session created'); load(); onChanged() }
    catch (e) { toast((e as Error).message, 'err') } finally { setCreating(false) }
  }
  async function patch(id: string, body: Record<string, unknown>) {
    try { await api('/api/team/sessions', { method: 'PATCH', json: { id, ...body } }); load(); onChanged() } catch (e) { toast((e as Error).message, 'err') }
  }
  async function del(id: string) {
    if (!confirm('Delete this session and its attendance?')) return
    try { await api(`/api/team/sessions?id=${id}`, { method: 'DELETE' }); load(); onChanged() } catch (e) { toast((e as Error).message, 'err') }
  }

  if (!sessions) return <Empty>Loading sessions…</Empty>
  const chartRows = [...past].slice(0, 10).reverse()
  const maxBar = Math.max(target, ...chartRows.map(r => r.attended), 1)

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="t-grid g4">
        <Stat n={target} label="attendance target" />
        <Stat n={avg} label="avg of last 4 sessions" tone={avg >= target ? 'ok' : avg > 0 ? 'warn' : undefined} />
        <Stat n={past[0]?.attended ?? '—'} label="last session" sub={past[0] ? fmtDay(past[0].call_date, false) : 'none yet'} />
        <Stat n={upcoming?.rsvp ?? 0} label="said yes for next" sub={upcoming ? `${upcoming.members_contacted} members contacted` : 'no session yet'} />
      </div>

      {upcoming ? (
        <Card title={<>Next: {upcoming.title}</>} right={<span className="tag tag-blue">{daysUntil(upcoming.call_date) === 0 ? 'Tonight 9pm' : `${fmtDay(upcoming.call_date)} · in ${daysUntil(upcoming.call_date)}d`}</span>}>
          <div className="kv" style={{ marginTop: 0 }}>
            <div><span className="lbl">Topic</span><p className="val">{upcoming.topic || <span className="faint">Not set — what's this week about?</span>}</p></div>
            <div><span className="lbl">Target</span><p className="val">{upcoming.target_attendance} people · {upcoming.rsvp} said yes so far</p></div>
          </div>
          <div className="bar mt"><i style={{ width: `${Math.min(100, (upcoming.rsvp / (upcoming.target_attendance || 1)) * 100)}%`, background: '#10b981' }} /></div>
          <div className="row mt">
            <button className="btn btn-g btn-s" onClick={() => setEditFor(upcoming)}>Edit topic / target</button>
            {upcoming.call_date <= today && <button className="btn btn-p btn-s" onClick={() => setMarkFor(upcoming)}>Mark attendance</button>}
          </div>
        </Card>
      ) : (
        <Card title={`No session yet for ${fmtDay(nextSessionDay)}`}>
          <p className="small muted mb">Create it so member RSVPs attach to it and members can self-mark attendance in the portal.</p>
          <button className="btn btn-p" disabled={creating} onClick={create}>{creating ? 'Creating…' : `Create ${fmtDay(nextSessionDay, false)} session`}</button>
        </Card>
      )}

      <Card title="Attendance trend" right={<span className="faint small">target line = {target}</span>}>
        {chartRows.length === 0 ? <Empty>No past sessions logged. Attendance shows here after you mark it.</Empty> : (
          <svg viewBox={`0 0 ${Math.max(360, chartRows.length * 64)} 180`} width="100%" style={{ display: 'block', maxHeight: 220 }}>
            {(() => {
              const W = Math.max(360, chartRows.length * 64), H = 180, padB = 28, padT = 14, base = H - padB
              const sy = (v: number) => (base - padT) * (v / maxBar)
              const ty = base - sy(target)
              return <>
                <line x1={0} x2={W} y1={ty} y2={ty} stroke="#10b981" strokeDasharray="4 4" />
                <text x={W - 4} y={ty - 4} fontSize={10} fill="#047857" textAnchor="end">target {target}</text>
                {chartRows.map((r, i) => {
                  const bw = W / chartRows.length, x = i * bw + bw * 0.25, w = bw * 0.5, h = sy(r.attended)
                  const ok = r.attended >= (r.target_attendance || target)
                  return <g key={r.id}>
                    <rect x={x} y={base - h} width={w} height={h} rx={4} fill={ok ? '#10b981' : '#0284c7'} opacity={0.85} />
                    <text x={x + w / 2} y={base - h - 5} fontSize={11} fontWeight={700} fill="#0f172a" textAnchor="middle">{r.attended}</text>
                    <text x={x + w / 2} y={H - 8} fontSize={10} fill="#94a3b8" textAnchor="middle">{fmtDay(r.call_date, false)}</text>
                  </g>
                })}
              </>
            })()}
          </svg>
        )}
      </Card>

      <Card title="Past sessions" pad={false}>
        {past.length === 0 ? <div style={{ padding: 16 }}><Empty>Nothing yet.</Empty></div> : (
          <table className="tbl">
            <thead><tr><th>Date</th><th>Session</th><th>Attended</th><th>Said yes</th><th>Recap</th><th></th></tr></thead>
            <tbody>
              {past.map(s => (
                <tr key={s.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtDay(s.call_date, false)}</td>
                  <td><div className="b">{s.title}</div>{s.topic && <div className="small muted">{s.topic}</div>}</td>
                  <td><span className={`cell ${s.attended >= (s.target_attendance || target) ? 'ok' : s.attended > 0 ? 'mid' : 'zero'}`}>{s.attended}</span><span className="faint small"> /{s.target_attendance || target}</span></td>
                  <td>{s.rsvp}</td>
                  <td><label className="row small" style={{ gap: 5, cursor: 'pointer' }}><input type="checkbox" checked={s.recap_posted} onChange={e => patch(s.id, { recap_posted: e.target.checked })} /> posted</label></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-g btn-s" onClick={() => setMarkFor(s)}>Attendance</button>{' '}
                    <button className="btn btn-g btn-s" onClick={() => setEditFor(s)}>Edit</button>
                    {role === 'admin' && <> <button className="btn btn-d btn-s" onClick={() => del(s.id)}>✕</button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <MarkAttendanceModal session={markFor} onClose={() => setMarkFor(null)} onSaved={() => { setMarkFor(null); load(); onChanged() }} />
      <EditSessionModal session={editFor} onClose={() => setEditFor(null)} onSaved={() => { setEditFor(null); load(); onChanged() }} />
    </div>
  )
}

function MarkAttendanceModal({ session, onClose, onSaved }: { session: Session | null; onClose: () => void; onSaved: () => void }) {
  const [members, setMembers] = useState<Member[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [initial, setInitial] = useState<Set<string>>(new Set())
  const [q, setQ] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (!session) return
    const init = new Set(session.attendance.map(a => a.member_email.toLowerCase()))
    setChecked(new Set(init)); setInitial(init); setQ('')
    api<{ members: Member[] }>('/api/team/members').then(d => setMembers(d.members)).catch(() => {})
  }, [session])
  if (!session) return null
  const toggle = (e: string) => setChecked(prev => { const n = new Set(prev); n.has(e) ? n.delete(e) : n.add(e); return n })
  const vis = members.filter(m => !q || m.full_name.toLowerCase().includes(q.toLowerCase()))
  async function save() {
    const add = [...checked].filter(e => !initial.has(e)), remove = [...initial].filter(e => !checked.has(e))
    if (!add.length && !remove.length) { onClose(); return }
    setSaving(true)
    try { const r = await api<{ attended: number }>('/api/team/attendance', { method: 'POST', json: { call_id: session!.id, add, remove } }); toast(`${r.attended} marked attended`); onSaved() }
    catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  return (
    <Modal open title={<>Attendance · {fmtDay(session.call_date, false)}</>} onClose={onClose} wide>
      <p className="small muted mb">Tick everyone who was on the Google Meet. {checked.size} selected.</p>
      <input className="search mb" placeholder="Filter by name…" value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6, maxHeight: '50vh', overflowY: 'auto' }}>
        {vis.map(m => {
          const e = m.email.toLowerCase(), on = checked.has(e)
          return <label key={e} className="row" style={{ gap: 8, padding: '8px 10px', borderRadius: 8, background: on ? '#ecfdf5' : '#f8fafc', cursor: 'pointer', fontSize: 13.5 }}>
            <input type="checkbox" checked={on} onChange={() => toggle(e)} /><span style={{ fontWeight: on ? 600 : 400 }}>{m.full_name}</span>
            {m.rsvp_next === true && session.call_date >= todayISO() && <span className="tag tag-green" style={{ marginLeft: 'auto' }}>said yes</span>}
          </label>
        })}
      </div>
      <div className="row mt"><button className="btn btn-p" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save attendance'}</button><button className="btn btn-g" onClick={onClose}>Cancel</button></div>
    </Modal>
  )
}

function EditSessionModal({ session, onClose, onSaved }: { session: Session | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ title: '', topic: '', target_attendance: 25, notes: '', call_date: '' })
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (session) setF({ title: session.title, topic: session.topic || '', target_attendance: session.target_attendance || 25, notes: session.notes || '', call_date: session.call_date }) }, [session])
  if (!session) return null
  async function save() {
    setSaving(true)
    try { await api('/api/team/sessions', { method: 'PATCH', json: { id: session!.id, ...f } }); toast('Saved'); onSaved() }
    catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  return (
    <Modal open title="Edit session" onClose={onClose}>
      <Field label="Title"><input className="input" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Topic / agenda"><input className="input" value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })} placeholder="e.g. Building a landing page with AI in 40 minutes" /></Field>
      <div className="t-grid g2">
        <Field label="Date"><input className="input" type="date" value={f.call_date} onChange={e => setF({ ...f, call_date: e.target.value })} /></Field>
        <Field label="Attendance target"><input className="input" type="number" min={1} value={f.target_attendance} onChange={e => setF({ ...f, target_attendance: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Notes (what happened, what to improve)"><textarea className="textarea" value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} /></Field>
      <button className="btn btn-p btn-block" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
    </Modal>
  )
}
