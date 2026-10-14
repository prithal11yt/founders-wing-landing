'use client'

import { useCallback, useEffect, useState } from 'react'
import { api, toast, CSS, Card, Stat, Empty, Pill, TargetBar, Field, Chips, statusMeta, fmtDay, fmtTime, addDays, todayISO, daysUntil, label, DOW,
  LEAD_TAG_LABELS, MEMBER_REASON_LABELS, MEMBER_WANT_LABELS, OUTCOME_LABELS, type Overview, type Targets, type Checkin } from '@/app/team/_components/shared'
import Ideas from '@/app/team/_components/ideas'
import Insights from '@/app/team/_components/insights'

// The founder's view of the intern's day: targets vs actuals, who was called,
// the check-in note, the 14-day record, patterns and the ideas inbox.
export default function AdminTeamTracker() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [role, setRole] = useState<'admin' | 'team'>('team')
  const [date, setDate] = useState(todayISO())
  const [o, setO] = useState<Overview | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [view, setView] = useState<'day' | 'patterns' | 'ideas' | 'settings'>('day')

  useEffect(() => {
    fetch('/api/leads/verify').then(r => r.json()).then(d => { setAuthed(!!d.authenticated); setRole(d.role === 'admin' ? 'admin' : 'team') }).catch(() => setAuthed(false))
  }, [])
  const load = useCallback(async () => {
    try {
      const [ov, ci] = await Promise.all([api<Overview>(`/api/team/overview?date=${date}`), api<Checkin[]>('/api/team/checkin')])
      setO(ov); setCheckins(Array.isArray(ci) ? ci : [])
    } catch (e) { toast((e as Error).message, 'err') }
  }, [date])
  useEffect(() => { if (authed) load() }, [authed, load])

  if (authed === null) return <div className="tw"><style>{CSS}</style><div className="lg-wrap muted">Loading…</div></div>
  if (!authed || role !== 'admin') return <div className="tw"><style>{CSS}</style><div className="lg-wrap"><div className="lg-card"><div className="lg-logo">FW</div><h1 className="lg-title">Admin only</h1><p className="lg-sub">Sign in at <a href="/admin">/admin</a> with the admin account, then come back.</p></div></div></div>

  const t = o?.targets
  const r = o?.today_row
  const ciToday = o?.checkin

  return (
    <div className="tw"><style>{CSS}</style>
      <header className="t-hd">
        <div className="t-hd-in">
          <div className="t-brand"><div className="t-logo">FW</div><div><div className="t-title">Shreyas · Daily Tracker</div><div className="t-sub">what got done, what people said</div></div></div>
          <div className="row" style={{ flexWrap: 'nowrap' }}><a className="btn btn-g btn-s" href="/team">Open workspace</a><a className="btn btn-g btn-s" href="/admin">← Admin</a></div>
        </div>
        <nav className="t-tabs">
          {([['day', '📅', 'Day'], ['patterns', '📈', 'Patterns'], ['ideas', '💡', 'Ideas'], ['settings', '🎯', 'Targets']] as const).map(([k, ic, l]) => (
            <button key={k} className={`t-tab${view === k ? ' on' : ''}`} onClick={() => setView(k)}><span className="ic">{ic}</span><span className="lb">{l}</span></button>
          ))}
        </nav>
      </header>

      <main className="t-main">
        {view === 'patterns' && <Insights />}
        {view === 'ideas' && <Ideas role="admin" />}
        {view === 'settings' && t && <TargetsEditor targets={t} onSaved={load} />}
        {view === 'day' && (!o || !t || !r ? <Empty>Loading…</Empty> : (
          <div className="col" style={{ gap: 14 }}>
            <div className="row-sb">
              <div className="row">
                <button className="btn btn-g btn-s" onClick={() => setDate(addDays(date, -1))}>‹</button>
                <input className="input input-s" type="date" value={date} max={todayISO()} onChange={e => e.target.value && setDate(e.target.value)} />
                <button className="btn btn-g btn-s" disabled={date >= todayISO()} onClick={() => setDate(addDays(date, 1))}>›</button>
                {date !== todayISO() && <button className="btn btn-g btn-s" onClick={() => setDate(todayISO())}>Today</button>}
                <span className="b">{fmtDay(date)}</span>{!r.working && <span className="tag">day off</span>}
              </div>
              <div className="row">
                {ciToday ? <Pill bg="#f0fdf4" fg="#15803d">Check-in ✓ {fmtTime(ciToday.updated_at)}</Pill> : <Pill bg="#fef2f2" fg="#b91c1c">No check-in</Pill>}
                <Pill>🔥 {o.streaks.checkin}-day streak</Pill>
              </div>
            </div>

            <div className="t-grid g3 stack">
              <Card title="Targets">
                <TargetBar label="Lead calls" value={r.lead_calls} target={t.lead_calls} hint={`${r.lead_reached} reached · ${r.lead_converted} joined`} />
                <TargetBar label="Member calls" value={r.member_calls} target={t.member_calls} hint={`${r.member_reached} answered · ${r.member_messages} WhatsApp nudges`} />
                <TargetBar label="Group post" value={r.whatsapp_posts} target={t.whatsapp_posts} hint={o.posts_today.map(p => p.category).join(', ') || 'none'} />
              </Card>
              <Card title="This week" right={<span className="faint small">7 days to {fmtDay(date, false)}</span>}>
                <div className="t-grid g2" style={{ gap: 8 }}>
                  <Stat n={o.week.lead_calls} label="lead calls" sub={`${o.week.lead_reached} reached`} />
                  <Stat n={o.week.lead_converted} label="joined" tone={o.week.lead_converted ? 'ok' : undefined} />
                  <Stat n={o.week.member_calls} label="member calls" sub={`${o.week.member_reached} answered`} />
                  <Stat n={`${o.week.checkins}/7`} label="check-ins" />
                </div>
              </Card>
              <Card title="Live session">
                {o.upcoming_session ? <>
                  <div className="b">{o.upcoming_session.title}</div>
                  <div className="small muted">{fmtDay(o.upcoming_session.call_date)} · {daysUntil(o.upcoming_session.call_date) === 0 ? 'tonight' : `in ${daysUntil(o.upcoming_session.call_date)}d`}{o.upcoming_session.topic && ` · ${o.upcoming_session.topic}`}</div>
                  <div className="mt"><TargetBar label="Said yes" value={o.upcoming_session.rsvp} target={o.upcoming_session.target_attendance || t.session_attendance} tone="#10b981" /></div>
                </> : <p className="small muted">No session created for {fmtDay(o.next_session_day)} yet.</p>}
                <div className="small muted mt">Members contacted since last session: <b>{o.members.contacted_since_last_session}/{o.members.total}</b></div>
                {o.past_sessions[0] && <div className="small muted">Last session ({fmtDay(o.past_sessions[0].call_date, false)}): <b>{o.past_sessions[0].attended}</b> attended{o.past_sessions[0].recap_posted ? ' · recap posted' : ' · recap pending'}</div>}
              </Card>
            </div>

            <div className="t-grid g2 stack">
              <Card title={`Calls on ${fmtDay(date, false)}`} right={<span className="faint small">{o.activity.length} logged</span>}>
                {o.activity.length === 0 ? <Empty>Nothing logged this day.</Empty> : <div className="feed">{o.activity.map(a => {
                  const m = a.kind === 'lead' ? statusMeta(a.outcome) : null
                  return <div key={a.kind + a.id} className="feed-row"><span className="feed-t">{fmtTime(a.ts)}</span><div className="feed-b">
                    <span className="b">{a.name}</span><span className="muted"> · {a.kind} · </span>
                    {m ? <Pill bg={m.bg} fg={m.fg} dot={m.dot}>{m.label}</Pill> : <span>{label(OUTCOME_LABELS, a.outcome)}{a.will_attend_next === true ? ' · will attend ✓' : a.will_attend_next === false ? ' · not attending' : ''}</span>}
                    {a.tags.length > 0 && <div className="item-tags" style={{ marginTop: 4 }}>{a.tags.map(tg => <span key={tg} className="tag">{label({ ...LEAD_TAG_LABELS, ...MEMBER_REASON_LABELS, ...MEMBER_WANT_LABELS }, tg)}</span>)}</div>}
                    {a.note && <div className="note">{a.note}</div>}
                  </div></div>
                })}</div>}
              </Card>
              <Card title="Check-in note">
                {!ciToday ? <Empty>No check-in for this day.</Empty> : <div className="col">
                  {ciToday.learned && <div><span className="lbl">Learned</span><p style={{ whiteSpace: 'pre-wrap', fontSize: 13.5, lineHeight: 1.5 }}>{ciToday.learned}</p></div>}
                  {ciToday.blockers && <div><span className="lbl">Blockers / needs from you</span><p style={{ whiteSpace: 'pre-wrap', fontSize: 13.5, lineHeight: 1.5, color: '#b45309' }}>{ciToday.blockers}</p></div>}
                  {ciToday.plan_tomorrow && <div><span className="lbl">Plan for next day</span><p style={{ whiteSpace: 'pre-wrap', fontSize: 13.5, lineHeight: 1.5 }}>{ciToday.plan_tomorrow}</p></div>}
                </div>}
                {checkins.filter(c => c.day !== date).length > 0 && <>
                  <span className="lbl" style={{ marginTop: 16 }}>Earlier check-ins</span>
                  <div className="col" style={{ gap: 6 }}>{checkins.filter(c => c.day !== date).slice(0, 6).map(c => (
                    <button key={c.day} className="hist-row" style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid rgba(15,23,42,.06)' }} onClick={() => setDate(c.day)}>
                      <span className="when">{fmtDay(c.day)}</span> · {(c.learned || c.blockers || c.plan_tomorrow || '').slice(0, 140)}{c.blockers && <span className="tag tag-amber" style={{ marginLeft: 6 }}>blocker</span>}
                    </button>
                  ))}</div>
                </>}
              </Card>
            </div>

            <Card title="Last 14 days" pad={false} right={<span className="faint small">green = target met</span>}>
              <table className="tbl">
                <thead><tr><th>Day</th><th>Lead calls</th><th>Reached</th><th>Joined</th><th>Member calls</th><th>Answered</th><th>Post</th><th>Check-in</th></tr></thead>
                <tbody>{[...o.days].reverse().map(d => {
                  const c = (v: number, tgt: number) => `cell ${v >= tgt && tgt > 0 ? 'ok' : v === 0 ? 'zero' : v >= tgt / 2 ? 'mid' : 'bad'}`
                  return <tr key={d.day} className={d.working ? '' : 'off'} style={{ cursor: 'pointer' }} onClick={() => setDate(d.day)}>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmtDay(d.day)}{d.day === todayISO() && <span className="tag tag-blue" style={{ marginLeft: 6 }}>today</span>}</td>
                    <td><span className={d.working ? c(d.lead_calls, t.lead_calls) : 'cell zero'}>{d.lead_calls}</span></td>
                    <td>{d.lead_reached}</td><td>{d.lead_converted ? <span className="cell ok">{d.lead_converted}</span> : <span className="faint">0</span>}</td>
                    <td><span className={d.working ? c(d.member_calls, t.member_calls) : 'cell zero'}>{d.member_calls}</span></td>
                    <td>{d.member_reached}</td>
                    <td><span className={d.working ? c(d.whatsapp_posts, t.whatsapp_posts) : 'cell zero'}>{d.whatsapp_posts}</span></td>
                    <td>{d.checkin ? <span className="cell ok">✓</span> : d.working && d.day < todayISO() ? <span className="cell bad">✕</span> : <span className="faint">–</span>}</td>
                  </tr>
                })}</tbody>
              </table>
            </Card>
          </div>
        ))}
      </main>
    </div>
  )
}

function TargetsEditor({ targets, onSaved }: { targets: Targets; onSaved: () => void }) {
  const [f, setF] = useState<Targets>(targets)
  const [saving, setSaving] = useState(false)
  useEffect(() => setF(targets), [targets])
  async function save() {
    setSaving(true)
    try { await api('/api/team/settings', { method: 'PUT', json: f }); toast('Targets saved'); onSaved() } catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  const n = (k: keyof Targets) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: Number(e.target.value) })
  return (
    <Card title="Daily targets" right={<span className="faint small">these drive the red/green on every screen</span>}>
      <div className="t-grid g2">
        <Field label="Lead calls per day"><input className="input" type="number" min={0} value={f.lead_calls} onChange={n('lead_calls')} /></Field>
        <Field label="Member calls per day"><input className="input" type="number" min={0} value={f.member_calls} onChange={n('member_calls')} /></Field>
        <Field label="WhatsApp posts per day"><input className="input" type="number" min={0} value={f.whatsapp_posts} onChange={n('whatsapp_posts')} /></Field>
        <Field label="Live session attendance target"><input className="input" type="number" min={1} value={f.session_attendance} onChange={n('session_attendance')} /></Field>
      </div>
      <Field label="Working days">
        <Chips value={f.working_days.map(String)} onChange={v => setF({ ...f, working_days: v.map(Number).sort() })} options={DOW.map((d, i) => ({ value: String(i), label: d }))} />
      </Field>
      <button className="btn btn-p" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save targets'}</button>
    </Card>
  )
}
