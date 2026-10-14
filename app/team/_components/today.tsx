'use client'

import { useEffect, useState } from 'react'
import {
  api, toast, Card, Stat, TargetBar, Empty, CallLinks, Pill, Field, Modal, Chips, statusMeta, fmtTime, fmtDay, daysUntil, todayISO,
  LEAD_TAG_LABELS, MEMBER_REASON_LABELS, MEMBER_WANT_LABELS, OUTCOME_LABELS, WA_CATEGORIES, label, type Overview, type Role,
} from './shared'

type Props = { role: Role; overview: Overview | null; reload: () => void; goTo: (tab: string, focus?: { leadId?: number; memberEmail?: string }) => void }

export default function Today({ role, overview, reload, goTo }: Props) {
  const [ci, setCi] = useState({ learned: '', blockers: '', plan_tomorrow: '' })
  const [savingCi, setSavingCi] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const [post, setPost] = useState({ category: ['learning'], content: '', replies: 0, reactions: 0 })
  const [creatingSession, setCreatingSession] = useState(false)

  useEffect(() => {
    if (overview?.checkin) setCi({ learned: overview.checkin.learned || '', blockers: overview.checkin.blockers || '', plan_tomorrow: overview.checkin.plan_tomorrow || '' })
  }, [overview?.checkin])

  if (!overview) return <Empty>Loading today…</Empty>
  const o = overview, t = o.targets, r = o.today_row
  const toSession = daysUntil(o.next_session_day)
  const sessionLabel = toSession === 0 ? 'Session is tonight, 9pm' : toSession === 1 ? 'Session tomorrow, 9pm' : `Session in ${toSession} days`
  const toCall = Math.max(0, o.members.total - o.members.contacted_since_last_session)
  const allDone = r.lead_calls >= t.lead_calls && r.member_calls >= t.member_calls && r.whatsapp_posts >= t.whatsapp_posts

  async function saveCheckin() {
    setSavingCi(true)
    try { await api('/api/team/checkin', { method: 'PUT', json: { day: o.date, ...ci } }); toast('Check-in saved'); reload() }
    catch (e) { toast((e as Error).message, 'err') } finally { setSavingCi(false) }
  }
  async function savePost() {
    try {
      await api('/api/team/whatsapp', { method: 'POST', json: { posted_on: o.date, category: post.category[0] || 'other', content: post.content, replies: post.replies, reactions: post.reactions } })
      toast('Post logged'); setPostOpen(false); setPost({ category: ['learning'], content: '', replies: 0, reactions: 0 }); reload()
    } catch (e) { toast((e as Error).message, 'err') }
  }
  async function createSession() {
    setCreatingSession(true)
    try {
      await api('/api/team/sessions', { method: 'POST', json: { title: `Live Session — ${fmtDay(o.next_session_day, false)}`, call_date: o.next_session_day, target_attendance: t.session_attendance } })
      toast('Session created'); reload()
    } catch (e) { toast((e as Error).message, 'err') } finally { setCreatingSession(false) }
  }

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row-sb">
        <div>
          <div className="t-title" style={{ fontSize: 20 }}>{o.today ? 'Today' : fmtDay(o.date)}{o.today && <span className="muted" style={{ fontWeight: 500, fontSize: 14, marginLeft: 8 }}>{fmtDay(o.date)}</span>}</div>
          <div className="muted small" style={{ marginTop: 2 }}>{r.working ? sessionLabel : `Day off · ${sessionLabel.toLowerCase()}`}</div>
        </div>
        <div className="row">
          {o.streaks.checkin > 0 && <Pill bg="#f0fdf4" fg="#15803d">🔥 {o.streaks.checkin}-day check-in streak</Pill>}
          {allDone && <Pill bg="#ecfdf5" fg="#047857">All targets hit ✓</Pill>}
        </div>
      </div>

      {role === 'admin' && (
        <div className="card small" style={{ background: '#f0f9ff', borderColor: 'rgba(2,132,199,.2)', color: '#0c4a6e', padding: '10px 14px' }}>
          You're signed in as admin, so this page counts <b>your</b> calls and posts. Shreyas's day is in the <a href="/admin/team">Tracker</a>.
        </div>
      )}
      <div className="t-grid g3 stack">
        <Card title="Daily targets" right={<span className="faint small">{r.working ? 'Working day' : 'Not a working day'}</span>}>
          <TargetBar label="Lead calls" value={r.lead_calls} target={t.lead_calls} hint={`${r.lead_reached} reached · ${r.lead_converted} joined`} />
          <TargetBar label="Member calls" value={r.member_calls} target={t.member_calls} hint={`${r.member_reached} answered · ${r.member_messages} WhatsApp nudges`} />
          <TargetBar label="WhatsApp group post" value={r.whatsapp_posts} target={t.whatsapp_posts} hint={o.posts_today.length ? o.posts_today.map(p => `${label({}, p.category)}`).join(', ') : 'Nothing posted yet today'} />
          <div className="row mt">
            <button className="btn btn-p btn-s" onClick={() => goTo('leads')}>Log a lead call</button>
            <button className="btn btn-g btn-s" onClick={() => goTo('members')}>Call a member</button>
            <button className="btn btn-g btn-s" onClick={() => setPostOpen(true)}>Log WhatsApp post</button>
          </div>
        </Card>

        <Card title="Do next">
          <div className="col" style={{ gap: 8 }}>
            <NextRow n={o.followups_due.length} tone={o.followups_due.length ? 'warn' : 'ok'} text="lead follow-ups due" action="Open" onClick={() => goTo('leads', {})} />
            <NextRow n={toCall} tone={toCall > 0 && toSession <= 3 ? 'warn' : undefined} text={`members not contacted since last ${fmtDay(o.members.last_session_day, false)}`} action="Call list" onClick={() => goTo('members')} />
            {o.upcoming_session ? (
              <NextRow n={o.upcoming_session.rsvp} tone={o.upcoming_session.rsvp >= (o.upcoming_session.target_attendance || t.session_attendance) ? 'ok' : undefined}
                text={`said yes for ${fmtDay(o.upcoming_session.call_date, false)} · target ${o.upcoming_session.target_attendance || t.session_attendance}`} action="Session" onClick={() => goTo('sessions')} />
            ) : (
              <div className="row-sb" style={{ padding: '8px 0' }}>
                <span className="small muted">No session set up for {fmtDay(o.next_session_day, false)}</span>
                <button className="btn btn-p btn-s" disabled={creatingSession} onClick={createSession}>{creatingSession ? 'Creating…' : 'Create it'}</button>
              </div>
            )}
            {o.past_sessions[0] && !o.past_sessions[0].recap_posted && (
              <NextRow n={o.past_sessions[0].attended} tone={o.past_sessions[0].attended === 0 ? 'warn' : undefined} text={`attended ${fmtDay(o.past_sessions[0].call_date, false)} — mark attendance & post recap`} action="Go" onClick={() => goTo('sessions')} />
            )}
          </div>
        </Card>

        <Card title="This week" right={<span className="faint small">last 7 days</span>}>
          <div className="t-grid g2" style={{ gap: 8 }}>
            <Stat n={o.week.lead_calls} label="lead calls" sub={`${o.week.lead_reached} reached`} />
            <Stat n={o.week.lead_converted} label="joined" tone={o.week.lead_converted > 0 ? 'ok' : undefined} />
            <Stat n={o.week.member_calls} label="member calls" sub={`${o.week.member_reached} answered`} />
            <Stat n={o.week.whatsapp_posts} label="group posts" sub={`${o.streaks.whatsapp}-day streak`} />
          </div>
        </Card>
      </div>

      {o.followups_due.length > 0 && (
        <Card title={`Follow-ups due (${o.followups_due.length})`}>
          <div className="col" style={{ gap: 6 }}>
            {o.followups_due.slice(0, 8).map(l => {
              const m = statusMeta(l.call_status)
              const overdue = l.follow_up_at < o.date
              return (
                <div key={l.id} className="row-sb" style={{ padding: '7px 0', borderTop: '1px solid rgba(15,23,42,.06)' }}>
                  <div style={{ minWidth: 0 }}>
                    <button className="b" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 14 }} onClick={() => goTo('leads', { leadId: l.id })}>{l.full_name || 'Unnamed lead'}</button>
                    <div className="row" style={{ marginTop: 3 }}>
                      <Pill bg={m.bg} fg={m.fg} dot={m.dot}>{m.label}</Pill>
                      <span className={`tag ${overdue ? 'tag-red' : 'tag-amber'}`}>{overdue ? `Overdue · ${fmtDay(l.follow_up_at, false)}` : 'Due today'}</span>
                    </div>
                  </div>
                  <CallLinks phone={l.whatsapp} compact />
                </div>
              )
            })}
            {o.followups_due.length > 8 && <button className="btn btn-g btn-s" onClick={() => goTo('leads')}>See all {o.followups_due.length}</button>}
          </div>
        </Card>
      )}

      <div className="t-grid g2 stack">
        <Card title={`Activity ${o.today ? 'today' : 'that day'}`} right={<span className="faint small">{o.activity.length} logged</span>}>
          {o.activity.length === 0 ? <Empty>No calls logged yet. Every call you log shows up here with the time.</Empty> : (
            <div className="feed">
              {o.activity.map(a => {
                const m = a.kind === 'lead' ? statusMeta(a.outcome) : null
                return (
                  <div key={a.kind + a.id} className="feed-row">
                    <span className="feed-t">{fmtTime(a.ts)}</span>
                    <div className="feed-b">
                      <span className="b">{a.name}</span>
                      <span className="muted"> · {a.kind === 'lead' ? 'lead' : 'member'} · </span>
                      {m ? <Pill bg={m.bg} fg={m.fg} dot={m.dot}>{m.label}</Pill> : <span>{label(OUTCOME_LABELS, a.outcome)}{a.will_attend_next === true ? ' · will attend ✓' : a.will_attend_next === false ? ' · not attending' : ''}</span>}
                      {a.tags.length > 0 && <div className="item-tags" style={{ marginTop: 4 }}>{a.tags.map(tg => <span key={tg} className="tag">{label({ ...LEAD_TAG_LABELS, ...MEMBER_REASON_LABELS, ...MEMBER_WANT_LABELS }, tg)}</span>)}</div>}
                      {a.note && <div className="note">{a.note}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card title="End-of-day check-in" right={o.checkin ? <span className="tag tag-green">Saved {fmtTime(o.checkin.updated_at)}</span> : <span className="tag tag-amber">Not done</span>}>
          <Field label="What did you learn today? (patterns, what people said, what worked)">
            <textarea className="textarea" value={ci.learned} onChange={e => setCi({ ...ci, learned: e.target.value })} placeholder="e.g. 3 people said Wednesday 9pm clashes with family time. Twitter leads pick up faster than YouTube ones." />
          </Field>
          <Field label="Blockers / need from Prithal">
            <textarea className="textarea" style={{ minHeight: 56 }} value={ci.blockers} onChange={e => setCi({ ...ci, blockers: e.target.value })} placeholder="Anything stuck?" />
          </Field>
          <Field label="Plan for tomorrow">
            <textarea className="textarea" style={{ minHeight: 56 }} value={ci.plan_tomorrow} onChange={e => setCi({ ...ci, plan_tomorrow: e.target.value })} placeholder="Top 3 things" />
          </Field>
          <button className="btn btn-p" disabled={savingCi} onClick={saveCheckin}>{savingCi ? 'Saving…' : o.checkin ? 'Update check-in' : 'Save check-in'}</button>
        </Card>
      </div>

      <Card title="Last 14 days" right={<span className="faint small">bars = lead calls vs target · ✓ = check-in</span>}>
        <div className="strip">
          {o.days.map(d => {
            const pct = t.lead_calls ? Math.min(100, (d.lead_calls / t.lead_calls) * 100) : 0
            return (
              <div key={d.day} title={`${fmtDay(d.day)}: ${d.lead_calls} lead calls, ${d.member_calls} member calls, ${d.whatsapp_posts} posts`}>
                <div className="strip-d">{fmtDay(d.day, false).split(' ')[0]}</div>
                <div className={`strip-b${d.lead_calls >= t.lead_calls && t.lead_calls > 0 ? ' ok' : ''}${d.working ? '' : ' off'}`}><i style={{ height: `${pct}%` }} /></div>
                <div className="strip-d" style={{ color: d.checkin ? '#047857' : d.whatsapp_posts ? '#0284c7' : '#cbd5e1' }}>{d.checkin ? '✓' : d.whatsapp_posts ? '•' : '·'}</div>
              </div>
            )
          })}
        </div>
      </Card>

      <Modal open={postOpen} title="Log a WhatsApp group post" onClose={() => setPostOpen(false)}>
        <Field label="Type of post">
          <Chips single options={WA_CATEGORIES.map(c => ({ value: c.value, label: `${c.icon} ${c.label}` }))} value={post.category} onChange={v => setPost({ ...post, category: v })} />
        </Field>
        <Field label="What did you post? (paste or summarise)">
          <textarea className="textarea" value={post.content} onChange={e => setPost({ ...post, content: e.target.value })} />
        </Field>
        <div className="t-grid g2">
          <Field label="Replies so far"><input className="input" type="number" min={0} value={post.replies} onChange={e => setPost({ ...post, replies: Number(e.target.value) })} /></Field>
          <Field label="Reactions"><input className="input" type="number" min={0} value={post.reactions} onChange={e => setPost({ ...post, reactions: Number(e.target.value) })} /></Field>
        </div>
        <p className="hint" style={{ marginBottom: 12 }}>You can update the reply count later from the WhatsApp tab.</p>
        <button className="btn btn-p btn-block" onClick={savePost}>Save post</button>
      </Modal>
    </div>
  )
}

function NextRow({ n, text, action, onClick, tone }: { n: number; text: string; action: string; onClick: () => void; tone?: 'ok' | 'warn' }) {
  return (
    <div className="row-sb" style={{ padding: '8px 0', borderTop: '1px solid rgba(15,23,42,.06)' }}>
      <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
        <span className="stat-n" style={{ fontSize: 20, color: tone === 'warn' ? '#b45309' : tone === 'ok' ? '#047857' : '#0f172a', minWidth: 28, textAlign: 'right' }}>{n}</span>
        <span className="small" style={{ color: '#334155' }}>{text}</span>
      </div>
      <button className="btn btn-g btn-s" onClick={onClick}>{action} →</button>
    </div>
  )
}

export { todayISO }
