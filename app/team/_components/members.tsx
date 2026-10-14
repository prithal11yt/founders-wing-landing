'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  api, toast, Stat, Empty, CallLinks, Pill, Field, Modal, Chips, fmtDay, fmtDateTime, timeAgo, phoneDigits, label,
  MEMBER_REASON_LABELS, MEMBER_WANT_LABELS, OUTCOME_LABELS, type Member, type Touchpoint, type SessionLite, type Role,
} from './shared'

type Data = { members: Member[]; sessions: SessionLite[]; upcoming_session: SessionLite | null; last_session: SessionLite | null; next_session_day: string }
type View = 'to_call' | 'yes' | 'no' | 'missed' | 'all'
type Props = { role: Role; focusEmail?: string | null; onLogged: () => void }

const REASON_OPTS = Object.entries(MEMBER_REASON_LABELS).map(([value, label]) => ({ value, label }))
const WANT_OPTS = Object.entries(MEMBER_WANT_LABELS).map(([value, label]) => ({ value, label }))

export default function Members({ role, focusEmail, onLogged }: Props) {
  const [data, setData] = useState<Data | null>(null)
  const [view, setView] = useState<View>('to_call')
  const [search, setSearch] = useState('')
  const [openEmail, setOpenEmail] = useState<string | null>(null)
  const [logFor, setLogFor] = useState<Member | null>(null)

  const load = useCallback(async () => {
    try { setData(await api<Data>('/api/team/members')) } catch (e) { toast((e as Error).message, 'err') }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => { if (focusEmail) { setView('all'); setOpenEmail(focusEmail) } }, [focusEmail])

  const members = data?.members || []
  const counts = useMemo(() => ({
    to_call: members.filter(m => !m.contacted_this_week).length,
    yes: members.filter(m => m.rsvp_next === true).length,
    no: members.filter(m => m.rsvp_next === false).length,
    missed: members.filter(m => m.attended_last === false).length,
    attended_last: members.filter(m => m.attended_last === true).length,
  }), [members])

  const q = search.trim().toLowerCase()
  const visible = useMemo(() => {
    const f = members.filter(m => {
      if (view === 'to_call' && m.contacted_this_week) return false
      if (view === 'yes' && m.rsvp_next !== true) return false
      if (view === 'no' && m.rsvp_next !== false) return false
      if (view === 'missed' && m.attended_last !== false) return false
      return !q || [m.full_name, m.email, m.whatsapp].some(v => (v || '').toLowerCase().includes(q))
    })
    if (view === 'to_call') {
      // Priority: missed last session but used to come → never attended → regulars.
      const score = (m: Member) => (m.attended_last === false && m.attended_count > 0 ? 0 : m.attended_count === 0 ? 1 : 2)
      f.sort((a, b) => score(a) - score(b) || (a.last_touch_at || '').localeCompare(b.last_touch_at || ''))
    }
    return f
  }, [members, view, q])

  if (!data) return <Empty>Loading members…</Empty>
  const upcoming = data.upcoming_session
  const VIEWS: { key: View; label: string; count: number }[] = [
    { key: 'to_call', label: 'To call this week', count: counts.to_call }, { key: 'yes', label: 'Said yes', count: counts.yes },
    { key: 'no', label: 'Said no', count: counts.no }, { key: 'missed', label: 'Missed last session', count: counts.missed }, { key: 'all', label: 'All', count: members.length },
  ]

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="t-grid g4">
        <Stat n={members.length} label="members" />
        <Stat n={members.length - counts.to_call} label="contacted this week" sub={`since ${data.last_session ? fmtDay(data.last_session.call_date, false) : 'last Wed'}`} />
        <Stat n={counts.yes} label={`said yes for ${fmtDay(data.next_session_day, false)}`} tone={counts.yes > 0 ? 'ok' : undefined} />
        <Stat n={data.last_session ? data.last_session.attended : '—'} label="attended last session" sub={data.last_session ? fmtDay(data.last_session.call_date, false) : 'none yet'} />
      </div>

      {!upcoming && <div className="card small" style={{ background: '#fffbeb', borderColor: 'rgba(180,83,9,.2)', color: '#92400e' }}>No session created yet for {fmtDay(data.next_session_day)}. Create it from the Sessions tab so RSVPs attach to it.</div>}

      <input className="search" placeholder="Search members…" value={search} onChange={e => setSearch(e.target.value)} />
      <div className="chips">{VIEWS.map(v => <button key={v.key} className={`chip${view === v.key ? ' on' : ''}`} onClick={() => setView(v.key)}>{v.label}<span className="c">{v.count}</span></button>)}</div>

      <div className="list">
        {visible.length === 0 ? <Empty>{view === 'to_call' ? 'Everyone has been contacted this week. 🎉' : 'Nobody here.'}</Empty> : visible.map(m => {
          const open = openEmail === m.email
          return (
            <article key={m.email} className={`item${open ? ' open' : ''}`}>
              <button className="item-hd" onClick={() => setOpenEmail(open ? null : m.email)}>
                <div className="item-main">
                  <div className="item-name">{m.full_name} <span className="faint" style={{ fontWeight: 400, fontSize: 12 }}>#{m.member_no}</span></div>
                  <div className="item-meta">{m.whatsapp || 'No number'} · joined {fmtDay(m.joined_at.slice(0, 10), false)}</div>
                  <div className="item-tags">
                    <span className="row" style={{ gap: 5 }} title="Last 4 sessions, newest first">
                      <span className="dots">{m.recent_attendance.length ? m.recent_attendance.map((a, i) => <i key={i} className={`dot ${a ? 'y' : 'n'}`} />) : <i className="dot" />}</span>
                      <span className="tag">{m.attended_count} attended</span>
                    </span>
                    {m.last_touch_at ? <span className="tag">{label(OUTCOME_LABELS, m.last_outcome || '')} · {timeAgo(m.last_touch_at)}</span> : <span className="tag">never contacted</span>}
                  </div>
                </div>
                {m.rsvp_next === true ? <Pill bg="#ecfdf5" fg="#047857" dot="#10b981">Coming Wed</Pill> : m.rsvp_next === false ? <Pill bg="#fef2f2" fg="#b91c1c" dot="#ef4444">Not coming</Pill> : <Pill>Unknown</Pill>}
              </button>
              {open && (
                <div className="item-bd">
                  <CallLinks phone={m.whatsapp} email={m.email} />
                  <div className="row mt"><button className="btn btn-p" onClick={() => setLogFor(m)}>✎ Log call / nudge</button></div>
                  {m.touchpoints.length > 0 && (
                    <div className="hist">
                      <span className="lbl" style={{ marginTop: 12 }}>History</span>
                      {m.touchpoints.map(t => <TouchRow key={t.id} t={t} canDelete={role === 'admin' || t.actor === 'team'} onDeleted={() => { load(); onLogged() }} />)}
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <LogTouchModal member={logFor} nextDay={data.next_session_day} onClose={() => setLogFor(null)} onSaved={() => { setLogFor(null); load(); onLogged() }} />
    </div>
  )
}

function TouchRow({ t, canDelete, onDeleted }: { t: Touchpoint; canDelete: boolean; onDeleted: () => void }) {
  async function del() {
    if (!confirm('Delete this log entry?')) return
    try { await api(`/api/team/member-touchpoint?id=${t.id}`, { method: 'DELETE' }); onDeleted() } catch (e) { toast((e as Error).message, 'err') }
  }
  return (
    <div className="hist-row">
      <div className="row-sb">
        <span><span className="when">{fmtDateTime(t.created_at)}{t.actor === 'admin' ? ' · Prithal' : ''}</span> · <b>{t.channel === 'whatsapp' ? 'WhatsApp' : label(OUTCOME_LABELS, t.outcome)}</b>
          {t.will_attend_next === true && <span className="tag tag-green" style={{ marginLeft: 6 }}>will attend</span>}
          {t.will_attend_next === false && <span className="tag tag-red" style={{ marginLeft: 6 }}>not attending</span>}
          {t.follow_up_at && <span className="tag tag-amber" style={{ marginLeft: 6 }}>follow up {fmtDay(t.follow_up_at, false)}</span>}
        </span>
        {canDelete && <button className="btn btn-g btn-s" onClick={del} style={{ padding: '2px 7px' }}>✕</button>}
      </div>
      {(t.reasons.length > 0 || t.wants.length > 0) && <div className="item-tags" style={{ marginTop: 5 }}>
        {t.reasons.map(r => <span key={r} className="tag tag-amber">{label(MEMBER_REASON_LABELS, r)}</span>)}
        {t.wants.map(w => <span key={w} className="tag tag-blue">wants: {label(MEMBER_WANT_LABELS, w)}</span>)}
      </div>}
      {t.note && <div style={{ marginTop: 4 }}>{t.note}</div>}
    </div>
  )
}

function LogTouchModal({ member, nextDay, onClose, onSaved }: { member: Member | null; nextDay: string; onClose: () => void; onSaved: () => void }) {
  const [channel, setChannel] = useState<string[]>(['call'])
  const [outcome, setOutcome] = useState<string[]>([])
  const [attend, setAttend] = useState<string[]>([])
  const [reasons, setReasons] = useState<string[]>([])
  const [wants, setWants] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (member) { setChannel(['call']); setOutcome([]); setAttend([]); setReasons([]); setWants([]); setNote(''); setFollowUp('') } }, [member])
  if (!member) return null
  const isCall = channel[0] !== 'whatsapp'
  const spoke = !isCall || outcome[0] === 'answered'
  const d = phoneDigits(member.whatsapp)
  async function save() {
    if (isCall && !outcome[0]) { toast('Did they pick up?', 'err'); return }
    setSaving(true)
    try {
      await api('/api/team/member-touchpoint', { method: 'POST', json: {
        member_email: member!.email, channel: channel[0], outcome: isCall ? outcome[0] : 'messaged',
        will_attend_next: attend[0] === 'yes' ? true : attend[0] === 'no' ? false : null,
        reasons, wants, note, follow_up_at: followUp || null,
      } })
      toast('Logged'); onSaved()
    } catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  return (
    <Modal open title={<>Log · {member.full_name}</>} onClose={onClose}>
      {d && <div className="row mb"><a className="btn btn-call btn-s" href={`tel:+${d}`}>📞 Call</a><a className="btn btn-wa btn-s" href={`https://wa.me/${d}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></div>}
      <Field label="How did you reach out?"><Chips single value={channel} onChange={v => setChannel(v.length ? v : ['call'])} options={[{ value: 'call', label: '📞 Phone call' }, { value: 'whatsapp', label: '💬 WhatsApp message' }]} /></Field>
      {isCall && <Field label="Did they pick up?"><Chips single value={outcome} onChange={setOutcome} options={[{ value: 'answered', label: 'Yes, spoke' }, { value: 'no_answer', label: 'No answer' }, { value: 'callback', label: 'Asked to call back' }]} /></Field>}
      {spoke && <>
        <Field label={`Coming to the session on ${fmtDay(nextDay)}?`}><Chips single value={attend} onChange={setAttend} options={[{ value: 'yes', label: '✅ Yes' }, { value: 'no', label: '❌ No' }, { value: 'maybe', label: '🤷 Maybe' }]} /></Field>
        <Field label="Why have they been missing sessions?" hint="Tap all that apply — this is what Prithal reads to fix the sessions."><Chips value={reasons} onChange={setReasons} options={REASON_OPTS} /></Field>
        <Field label="What do they want from the live sessions?"><Chips value={wants} onChange={setWants} options={WANT_OPTS} /></Field>
      </>}
      <Field label="Notes"><textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="In their words." /></Field>
      <Field label="Follow up on (optional)"><div className="row"><input className="input" style={{ width: 'auto' }} type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} />
        <button className="btn btn-g btn-s" type="button" onClick={() => setFollowUp(nextDay)}>Session day</button>{followUp && <button className="btn btn-g btn-s" type="button" onClick={() => setFollowUp('')}>Clear</button>}</div></Field>
      <button className="btn btn-p btn-block" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button>
    </Modal>
  )
}
