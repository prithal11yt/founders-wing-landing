'use client'

import { useCallback, useEffect, useState } from 'react'
import { api, toast, Card, Stat, Empty, Bars, Pill, statusMeta, waCat, fmtDay, fmtDateTime, label, LEAD_TAG_LABELS, MEMBER_REASON_LABELS, MEMBER_WANT_LABELS, OUTCOME_LABELS, type Insights as T } from './shared'

export default function Insights({ defaultDays = 30 }: { defaultDays?: number }) {
  const [days, setDays] = useState(defaultDays)
  const [d, setD] = useState<T | null>(null)
  const load = useCallback(async () => { try { setD(await api<T>(`/api/team/insights?days=${days}`)) } catch (e) { toast((e as Error).message, 'err') } }, [days])
  useEffect(() => { load() }, [load])

  if (!d) return <Empty>Loading patterns…</Empty>
  const outcomeRows = d.leads.outcomes.map(o => ({ key: o.key, n: o.n }))
  const outcomeLabels = Object.fromEntries(d.leads.outcomes.map(o => [o.key, statusMeta(o.key).label]))
  const reach = d.leads.calls ? Math.round((d.leads.reached / d.leads.calls) * 100) : 0

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="row-sb">
        <div><div className="t-title" style={{ fontSize: 18 }}>What people are telling us</div><div className="muted small">Rolled up from every call note and tag. Read this before changing the pitch or the session format.</div></div>
        <div className="chips">{[7, 30, 90].map(n => <button key={n} className={`chip${days === n ? ' on' : ''}`} onClick={() => setDays(n)}>{n} days</button>)}</div>
      </div>

      <div className="t-grid g4">
        <Stat n={d.leads.calls} label="lead calls" sub={`${reach}% reached`} />
        <Stat n={d.leads.outcomes.find(o => o.key === 'converted')?.n || 0} label="joined" tone="ok" />
        <Stat n={d.members.touches} label="member touchpoints" sub={`${d.members.answered} answered`} />
        <Stat n={`${d.members.will_attend} / ${d.members.wont_attend}`} label="said yes / no to sessions" />
      </div>

      <div className="t-grid g2 stack">
        <Card title="Leads — what they say" right={<span className="faint small">tags from call logs</span>}><Bars rows={d.leads.tags} labels={LEAD_TAG_LABELS} /></Card>
        <Card title="Leads — call outcomes"><Bars rows={outcomeRows} labels={outcomeLabels} /></Card>
        <Card title="Members — why they skip sessions"><Bars rows={d.members.reasons} labels={MEMBER_REASON_LABELS} /></Card>
        <Card title="Members — what they want from sessions"><Bars rows={d.members.wants} labels={MEMBER_WANT_LABELS} /></Card>
      </div>

      <div className="t-grid g2 stack">
        <Card title="Session attendance" right={<span className="faint small">last {d.sessions.length}</span>}>
          {d.sessions.length === 0 ? <Empty>No sessions logged.</Empty> : <Bars rows={d.sessions.map(s => ({ key: `${fmtDay(s.call_date, false)}${s.topic ? ` · ${s.topic}` : ''}`, n: s.attended }))} max={Math.max(...d.sessions.map(s => s.target_attendance || 25), ...d.sessions.map(s => s.attended))} />}
        </Card>
        <Card title="WhatsApp — which posts get replies" pad={false}>
          {d.whatsapp.length === 0 ? <div style={{ padding: 16 }}><Empty>No posts logged.</Empty></div> : (
            <table className="tbl"><thead><tr><th>Type</th><th>Posts</th><th>Avg replies</th><th>Reactions</th></tr></thead>
              <tbody>{d.whatsapp.map(w => <tr key={w.category}><td>{waCat(w.category).icon} {waCat(w.category).label}</td><td>{w.posts}</td><td><b>{w.avg_replies}</b></td><td>{w.reactions}</td></tr>)}</tbody></table>
          )}
        </Card>
      </div>

      <div className="t-grid g2 stack">
        <Card title="In leads' own words" right={<span className="faint small">latest notes</span>}>
          {d.leads.notes.length === 0 ? <Empty>No call notes yet.</Empty> : <div className="feed">{d.leads.notes.map((n, i) => {
            const m = statusMeta(n.outcome)
            return <div key={i} className="feed-row"><div className="feed-b"><span className="b">{n.name}</span> <Pill bg={m.bg} fg={m.fg} dot={m.dot}>{m.label}</Pill> <span className="faint small">{fmtDateTime(n.ts)}</span>
              {n.tags.length > 0 && <div className="item-tags" style={{ marginTop: 3 }}>{n.tags.map(t => <span key={t} className="tag">{label(LEAD_TAG_LABELS, t)}</span>)}</div>}
              <div className="note">{n.note}</div></div></div>
          })}</div>}
        </Card>
        <Card title="In members' own words" right={<span className="faint small">latest notes</span>}>
          {d.members.notes.length === 0 ? <Empty>No member call notes yet.</Empty> : <div className="feed">{d.members.notes.map((n, i) => (
            <div key={i} className="feed-row"><div className="feed-b"><span className="b">{n.name}</span> <span className="muted small">{label(OUTCOME_LABELS, n.outcome)}</span> <span className="faint small">{fmtDateTime(n.ts)}</span>
              {n.tags.length > 0 && <div className="item-tags" style={{ marginTop: 3 }}>{n.tags.map(t => <span key={t} className={`tag ${MEMBER_WANT_LABELS[t] ? 'tag-blue' : 'tag-amber'}`}>{label({ ...MEMBER_REASON_LABELS, ...MEMBER_WANT_LABELS }, t)}</span>)}</div>}
              <div className="note">{n.note}</div></div></div>
          ))}</div>}
        </Card>
      </div>
    </div>
  )
}
