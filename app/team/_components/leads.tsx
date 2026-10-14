'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  api, toast, Card, Stat, Empty, CallLinks, Pill, Field, Modal, Chips, statusMeta, LEAD_STATUSES, LEAD_TAG_LABELS, SOURCE_LABELS, label,
  fmtDateTime, fmtDay, timeAgo, todayISO, phoneDigits, type Lead, type LeadEvent, type Role,
} from './shared'

type Tab = 'to_call' | 'due' | 'working' | 'won' | 'closed'
type Props = { role: Role; focusLeadId?: number | null; onLogged: () => void }

const TAG_OPTIONS = Object.entries(LEAD_TAG_LABELS).map(([value, label]) => ({ value, label }))
const SOURCES = ['all', 'youtube', 'twitter', 'other']

export default function Leads({ role, focusLeadId, onLogged }: Props) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [events, setEvents] = useState<LeadEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('to_call')
  const [source, setSource] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [openId, setOpenId] = useState<number | null>(null)
  const [logFor, setLogFor] = useState<Lead | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const [l, e] = await Promise.all([api<Lead[]>('/api/leads/data'), api<LeadEvent[]>('/api/team/lead-events')])
      setLeads(Array.isArray(l) ? l : []); setEvents(Array.isArray(e) ? e : [])
    } catch (e) { toast((e as Error).message, 'err') } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    // Pull any new Twitter leads from the sheet (throttled server-side).
    api<{ added: number; skipped?: boolean }>('/api/team/twitter-sync', { method: 'POST' })
      .then(r => { if (r.added > 0) { toast(`${r.added} new Twitter lead${r.added === 1 ? '' : 's'} added`); load() } })
      .catch(() => {})
  }, [load])

  // Deep link from Today → open that lead.
  useEffect(() => {
    if (!focusLeadId || !leads.length) return
    const l = leads.find(x => x.id === focusLeadId)
    if (!l) return
    setTab(l.follow_up_at && l.follow_up_at <= todayISO() ? 'due' : bucketOf(l)); setSource('all'); setSearch(''); setOpenId(l.id)
    setTimeout(() => document.getElementById(`lead-${l.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }, [focusLeadId, leads])

  const today = todayISO()
  const buckets = useMemo(() => ({
    to_call: (l: Lead) => !l.call_status || l.call_status === 'not_called',
    due: (l: Lead) => !!l.follow_up_at && l.follow_up_at <= today && !['converted', 'not_interested'].includes(l.call_status || ''),
    working: (l: Lead) => ['no_answer', 'callback', 'less_convinced'].includes(l.call_status || ''),
    won: (l: Lead) => ['interested', 'very_convinced', 'converted'].includes(l.call_status || ''),
    closed: (l: Lead) => l.call_status === 'not_interested',
  }), [today])
  function bucketOf(l: Lead): Tab {
    if (buckets.won(l)) return 'won'; if (buckets.closed(l)) return 'closed'; if (buckets.working(l)) return 'working'; return 'to_call'
  }
  const srcOf = (l: Lead) => (l.heard_from === 'twitter' || l.heard_from === 'twitter-linkedin') ? 'twitter' : l.heard_from === 'youtube' ? 'youtube' : 'other'
  const bySource = useMemo(() => leads.filter(l => source === 'all' || srcOf(l) === source), [leads, source])

  const stats = useMemo(() => ({
    to_call: bySource.filter(buckets.to_call).length, due: bySource.filter(buckets.due).length,
    working: bySource.filter(buckets.working).length, won: bySource.filter(buckets.won).length, closed: bySource.filter(buckets.closed).length,
    calledToday: leads.filter(l => l.last_called_at && new Date(l.last_called_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) === today).length,
    joined: leads.filter(l => l.call_status === 'converted').length,
  }), [bySource, leads, buckets, today])

  const q = search.trim().toLowerCase()
  const visible = useMemo(() => bySource.filter(buckets[tab]).filter(l => !q || [l.full_name, l.email, l.whatsapp, l.twitter_handle, l.product].some(v => (v || '').toLowerCase().includes(q)))
    .sort((a, b) => {
      if (tab === 'due') return (a.follow_up_at || '').localeCompare(b.follow_up_at || '')
      const at = new Date(a.created_at).getTime(), bt = new Date(b.created_at).getTime()
      return sort === 'newest' ? bt - at : at - bt
    }), [bySource, buckets, tab, q, sort])

  const eventsFor = useMemo(() => {
    const m = new Map<number, LeadEvent[]>()
    for (const e of events) { if (!m.has(e.lead_id)) m.set(e.lead_id, []); m.get(e.lead_id)!.push(e) }
    return m
  }, [events])

  async function patch(id: number, field: 'notes' | 'follow_up_at', value: string) {
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, [field]: value || null } : l)))
    try { await api('/api/leads/update', { method: 'PATCH', json: { id, field, value } }) }
    catch (e) { toast((e as Error).message, 'err'); load() }
  }
  async function syncNow() {
    setSyncing(true)
    try { const r = await api<{ added: number; total: number }>('/api/team/twitter-sync?force=1', { method: 'POST' }); toast(`Sheet synced · ${r.added} new of ${r.total}`); load() }
    catch (e) { toast((e as Error).message, 'err') } finally { setSyncing(false) }
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'to_call', label: 'To call', count: stats.to_call }, { key: 'due', label: 'Follow-ups', count: stats.due },
    { key: 'working', label: 'In progress', count: stats.working }, { key: 'won', label: 'Interested', count: stats.won }, { key: 'closed', label: 'Not interested', count: stats.closed },
  ]

  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="t-grid g4">
        <Stat n={stats.to_call} label="To call" />
        <Stat n={stats.due} label="Follow-ups due" tone={stats.due ? 'warn' : undefined} />
        <Stat n={stats.calledToday} label="Called today" />
        <Stat n={stats.joined} label="Joined" tone="ok" />
      </div>

      <div className="row-sb">
        <div className="chips">
          {SOURCES.map(s => <button key={s} className={`chip${source === s ? ' on' : ''}`} onClick={() => setSource(s)}>{s === 'all' ? 'All sources' : label(SOURCE_LABELS, s)}<span className="c">{s === 'all' ? leads.length : leads.filter(l => srcOf(l) === s).length}</span></button>)}
        </div>
        <div className="row">
          <button className="btn btn-g btn-s" disabled={syncing} onClick={syncNow} title="Pull new rows from the Twitter leads Google Sheet">{syncing ? 'Syncing…' : '↻ Sync Twitter sheet'}</button>
          <button className="btn btn-p btn-s" onClick={() => setAddOpen(true)}>+ Add lead</button>
        </div>
      </div>

      <div className="row">
        <input className="search" placeholder="Search name, phone, email, handle…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="select" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value as 'newest' | 'oldest')}>
          <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="chips">
        {TABS.map(t => <button key={t.key} className={`chip${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>{t.label}<span className="c">{t.count}</span></button>)}
      </div>

      <div className="list" ref={listRef}>
        {loading ? <Empty>Loading leads…</Empty> : visible.length === 0 ? (
          <Empty>{tab === 'to_call' ? 'No leads left to call. Nice work.' : tab === 'due' ? 'No follow-ups due. You’re on top of it.' : 'Nothing here yet.'}</Empty>
        ) : visible.map(lead => {
          const meta = statusMeta(lead.call_status)
          const open = openId === lead.id
          const overdue = !!lead.follow_up_at && lead.follow_up_at < today
          const dueToday = lead.follow_up_at === today
          const hist = eventsFor.get(lead.id) || []
          return (
            <article key={lead.id} id={`lead-${lead.id}`} className={`item${open ? ' open' : ''}`}>
              <button className="item-hd" onClick={() => setOpenId(open ? null : lead.id)}>
                <div className="item-main">
                  <div className="item-name">{lead.full_name || 'Unnamed lead'} {lead.twitter_handle && <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>{lead.twitter_handle}</span>}</div>
                  <div className="item-meta">{lead.whatsapp || 'No number'}{lead.email && <> · {lead.email}</>}</div>
                  <div className="item-tags">
                    <span className={`tag ${srcOf(lead) === 'twitter' ? 'tag-blue' : ''}`}>{label(SOURCE_LABELS, lead.heard_from || 'other')}</span>
                    {(lead.call_attempts ?? 0) > 0 && <span className="tag">{lead.call_attempts} call{lead.call_attempts === 1 ? '' : 's'}{lead.last_called_at && <> · {timeAgo(lead.last_called_at)}</>}</span>}
                    {lead.follow_up_at && <span className={`tag${overdue ? ' tag-red' : dueToday ? ' tag-amber' : ''}`}>{overdue ? 'Overdue' : dueToday ? 'Follow up today' : `Follow up ${fmtDay(lead.follow_up_at, false)}`}</span>}
                  </div>
                </div>
                <Pill bg={meta.bg} fg={meta.fg} dot={meta.dot}>{meta.label}</Pill>
              </button>

              {open && (
                <div className="item-bd">
                  <div className="kv">
                    {lead.what_building && <div><span className="lbl">Building</span><p className="val">{lead.what_building}</p></div>}
                    {lead.join_reason && <div><span className="lbl">Why they want to join</span><p className="val">{lead.join_reason}</p></div>}
                    <div><span className="lbl">Applied</span><p className="val">{fmtDateTime(lead.created_at)}</p></div>
                    {lead.last_called_at && <div><span className="lbl">Last call</span><p className="val">{fmtDateTime(lead.last_called_at)}</p></div>}
                  </div>

                  <CallLinks phone={lead.whatsapp} email={lead.email} />
                  <div className="row mt">
                    <button className="btn btn-p" onClick={() => setLogFor(lead)}>✎ Log a call</button>
                    <label className="row" style={{ gap: 6 }}><span className="small muted">Follow up on</span>
                      <input className="input input-s" type="date" value={lead.follow_up_at || ''} onChange={e => patch(lead.id, 'follow_up_at', e.target.value)} />
                    </label>
                  </div>

                  {hist.length > 0 && (
                    <div className="hist">
                      <span className="lbl" style={{ marginTop: 12 }}>Call history</span>
                      {hist.map(e => {
                        const m = statusMeta(e.call_status)
                        return (
                          <div key={e.id} className="hist-row">
                            <span className="when">{fmtDateTime(e.created_at)}{e.actor === 'admin' ? ' · Prithal' : ''}</span> · <span style={{ color: m.fg, fontWeight: 600 }}>{m.label}</span>
                            {e.tags?.length > 0 && <span> · {e.tags.map(t => label(LEAD_TAG_LABELS, t)).join(', ')}</span>}
                            {e.note && <div>{e.note}</div>}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <span className="lbl" style={{ marginTop: 14 }}>Summary notes</span>
                  <textarea className="textarea" defaultValue={lead.notes || ''} placeholder="Running summary for this lead — budget, timing, what to say next time…"
                    onBlur={e => { if (e.target.value !== (lead.notes || '')) patch(lead.id, 'notes', e.target.value) }} />
                </div>
              )}
            </article>
          )
        })}
      </div>

      <LogCallModal lead={logFor} onClose={() => setLogFor(null)} onSaved={(ev, notes) => {
        setLeads(prev => prev.map(l => (l.id === ev.lead_id ? { ...l, call_status: ev.call_status, last_called_at: ev.created_at, call_attempts: (l.call_attempts ?? 0) + 1, notes, follow_up_at: logFor?.follow_up_at ?? l.follow_up_at } : l)))
        setEvents(prev => [ev, ...prev]); setLogFor(null); onLogged(); load()
      }} />
      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={() => { setAddOpen(false); load() }} />
    </div>
  )
}

function LogCallModal({ lead, onClose, onSaved }: { lead: Lead | null; onClose: () => void; onSaved: (ev: LeadEvent, notes: string | null) => void }) {
  const [status, setStatus] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (lead) { setStatus([]); setTags([]); setNote(''); setFollowUp(lead.follow_up_at || '') } }, [lead])
  if (!lead) return null
  const d = phoneDigits(lead.whatsapp)
  async function save() {
    if (!status[0]) { toast('Pick what happened on the call', 'err'); return }
    setSaving(true)
    try {
      const r = await api<{ event: LeadEvent; notes: string | null }>('/api/team/lead-call', { method: 'POST', json: { lead_id: lead!.id, call_status: status[0], tags, note, follow_up_at: followUp || null } })
      toast('Call logged'); onSaved(r.event, r.notes)
    } catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  const needsFollowUp = ['no_answer', 'callback', 'less_convinced', 'interested', 'very_convinced'].includes(status[0] || '')
  return (
    <Modal open title={<>Log call · {lead.full_name || 'Lead'}</>} onClose={onClose}>
      {d && <div className="row mb"><a className="btn btn-call btn-s" href={`tel:+${d}`}>📞 Call {lead.whatsapp}</a><a className="btn btn-wa btn-s" href={`https://wa.me/${d}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></div>}
      <Field label="What happened?">
        <Chips single value={status} onChange={setStatus} options={LEAD_STATUSES.map(s => ({ value: s.value, label: s.label }))} />
      </Field>
      <Field label="What did they say? (tap all that apply)" hint="These roll up into the Patterns tab so we learn what leads want.">
        <Chips value={tags} onChange={setTags} options={TAG_OPTIONS} />
      </Field>
      <Field label="Notes from the call">
        <textarea className="textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="In their words. What are they building, what's holding them back, what would make them join?" />
      </Field>
      <Field label={needsFollowUp ? 'Follow up on' : 'Follow up on (optional)'}>
        <div className="row">
          <input className="input" style={{ width: 'auto' }} type="date" value={followUp} onChange={e => setFollowUp(e.target.value)} />
          {[1, 2, 7].map(n => <button key={n} className="btn btn-g btn-s" type="button" onClick={() => setFollowUp(new Date(Date.now() + 5.5 * 36e5 + n * 864e5).toISOString().slice(0, 10))}>{n === 1 ? 'Tomorrow' : `+${n}d`}</button>)}
          {followUp && <button className="btn btn-g btn-s" type="button" onClick={() => setFollowUp('')}>Clear</button>}
        </div>
      </Field>
      <button className="btn btn-p btn-block" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save call'}</button>
    </Modal>
  )
}

function AddLeadModal({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [f, setF] = useState({ full_name: '', whatsapp: '', email: '', heard_from: 'other', what_building: '', twitter_handle: '' })
  const [saving, setSaving] = useState(false)
  async function save() {
    setSaving(true)
    try { await api('/api/team/add-lead', { method: 'POST', json: f }); toast('Lead added'); setF({ full_name: '', whatsapp: '', email: '', heard_from: 'other', what_building: '', twitter_handle: '' }); onAdded() }
    catch (e) { toast((e as Error).message, 'err') } finally { setSaving(false) }
  }
  return (
    <Modal open={open} title="Add a lead" onClose={onClose}>
      <div className="t-grid g2">
        <Field label="Name"><input className="input" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} /></Field>
        <Field label="Phone / WhatsApp"><input className="input" value={f.whatsapp} onChange={e => setF({ ...f, whatsapp: e.target.value })} /></Field>
        <Field label="Email (optional)"><input className="input" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Source">
          <select className="select" value={f.heard_from} onChange={e => setF({ ...f, heard_from: e.target.value })}>
            {Object.entries(SOURCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
      </div>
      {f.heard_from.startsWith('twitter') && <Field label="Twitter handle"><input className="input" value={f.twitter_handle} onChange={e => setF({ ...f, twitter_handle: e.target.value })} placeholder="@handle" /></Field>}
      <Field label="What are they building?"><input className="input" value={f.what_building} onChange={e => setF({ ...f, what_building: e.target.value })} /></Field>
      <button className="btn btn-p btn-block" disabled={saving} onClick={save}>{saving ? 'Adding…' : 'Add lead'}</button>
    </Modal>
  )
}

export { Card }
