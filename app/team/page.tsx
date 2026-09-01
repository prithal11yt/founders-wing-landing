'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

type Lead = {
  id: number
  created_at: string
  full_name: string
  email: string
  whatsapp?: string
  what_building: string
  join_reason: string
  heard_from: string
  call_status?: string
  notes?: string
  last_called_at?: string | null
  call_attempts?: number | null
  follow_up_at?: string | null
}

const CALL_STATUSES = [
  { value: 'not_called',     label: 'Not called',     dot: '#94a3b8', bg: '#f1f5f9', fg: '#475569' },
  { value: 'no_answer',      label: 'No answer',      dot: '#f97316', bg: '#fff7ed', fg: '#c2410c' },
  { value: 'callback',       label: 'Callback',       dot: '#eab308', bg: '#fefce8', fg: '#a16207' },
  { value: 'less_convinced', label: 'Not sure',       dot: '#f59e0b', bg: '#fffbeb', fg: '#b45309' },
  { value: 'interested',     label: 'Interested',     dot: '#22c55e', bg: '#f0fdf4', fg: '#15803d' },
  { value: 'very_convinced', label: 'Very interested',dot: '#10b981', bg: '#ecfdf5', fg: '#047857' },
  { value: 'converted',      label: 'Joined',         dot: '#0284c7', bg: '#f0f9ff', fg: '#0369a1' },
  { value: 'not_interested', label: 'Not interested',  dot: '#ef4444', bg: '#fef2f2', fg: '#b91c1c' },
]
const statusMeta = (v?: string) =>
  CALL_STATUSES.find(s => s.value === (v || 'not_called')) ?? CALL_STATUSES[0]

/** Numbers are stored inconsistently (with/without +91, spaces). Normalise to a
 *  bare international number so tel: and wa.me links always work. */
function phoneDigits(raw?: string): string {
  if (!raw) return ''
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `91${d}`
  if (d.length === 11 && d.startsWith('0')) return `91${d.slice(1)}`
  return d
}

const todayISO = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD, local

function relativeTime(iso?: string | null): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const mins = Math.round((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function fullDateTime(iso?: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

type Tab = 'to_call' | 'due' | 'working' | 'won' | 'closed'

export default function TeamPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('to_call')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [openId, setOpenId] = useState<number | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/leads/verify')
      .then(r => r.json())
      .then(d => { if (d.authenticated) { setAuthenticated(true); setUserEmail(d.email) } })
      .finally(() => setChecking(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true); setLoginError('')
    try {
      const r = await fetch('/api/leads/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const d = await r.json()
      if (d.success) { setAuthenticated(true); setUserEmail(d.email) }
      else setLoginError(d.error || 'Invalid credentials')
    } catch { setLoginError('Connection failed') }
    finally { setLoginLoading(false) }
  }

  function logout() {
    document.cookie = 'fw_leads_token=; path=/; max-age=0'
    setAuthenticated(false); setUserEmail('')
  }

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch('/api/leads/data')
      if (r.status === 401) { setAuthenticated(false); return }
      const data = await r.json()
      if (Array.isArray(data)) setLeads(data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    fetchData()
    const t = setInterval(fetchData, 60000)
    return () => clearInterval(t)
  }, [authenticated, fetchData])

  async function updateField(id: number, field: 'call_status' | 'notes' | 'follow_up_at', value: string) {
    setSavingId(id)
    // Mirror the server's stamping locally so the card updates instantly.
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l
      const next: Lead = { ...l, [field]: value }
      if (field === 'call_status' && value && value !== 'not_called') {
        next.last_called_at = new Date().toISOString()
        next.call_attempts = (l.call_attempts ?? 0) + 1
      }
      return next
    }))
    try {
      const r = await fetch('/api/leads/update', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value }),
      })
      if (r.status === 401) { setAuthenticated(false); return }
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        alert(`Could not save: ${err.error || r.status}`)
        fetchData()
      }
    } catch {
      alert('Could not save — check your connection.')
      fetchData()
    } finally { setSavingId(null) }
  }

  const today = todayISO()

  const buckets = useMemo(() => ({
    to_call: (l: Lead) => !l.call_status || l.call_status === 'not_called',
    due:     (l: Lead) => !!l.follow_up_at && l.follow_up_at <= today
                          && !['converted', 'not_interested'].includes(l.call_status || ''),
    working: (l: Lead) => ['no_answer', 'callback', 'less_convinced'].includes(l.call_status || ''),
    won:     (l: Lead) => ['interested', 'very_convinced', 'converted'].includes(l.call_status || ''),
    closed:  (l: Lead) => l.call_status === 'not_interested',
  }), [today])

  const stats = useMemo(() => {
    const calledToday = leads.filter(l =>
      l.last_called_at && new Date(l.last_called_at).toLocaleDateString('en-CA') === today).length
    return {
      to_call: leads.filter(buckets.to_call).length,
      due: leads.filter(buckets.due).length,
      calledToday,
      won: leads.filter(l => l.call_status === 'converted').length,
    }
  }, [leads, buckets, today])

  const q = search.trim().toLowerCase()
  const visible = useMemo(() => {
    const list = leads.filter(buckets[tab]).filter(l =>
      !q ||
      (l.full_name || '').toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.whatsapp || '').includes(q)
    )
    return list.sort((a, b) => {
      // Overdue follow-ups first — they're the most time-sensitive thing here.
      if (tab === 'due') return (a.follow_up_at || '').localeCompare(b.follow_up_at || '')
      const at = new Date(a.created_at).getTime(), bt = new Date(b.created_at).getTime()
      return sort === 'newest' ? bt - at : at - bt
    })
  }, [leads, buckets, tab, q, sort])

  if (checking) {
    return <div className="fw-boot">Loading…<style>{BOOT_CSS}</style></div>
  }

  if (!authenticated) {
    return (
      <>
        <style>{CSS}</style>
        <div className="lg-wrap">
          <form onSubmit={handleLogin} className="lg-card">
            <div className="lg-logo">FW</div>
            <h1 className="lg-title">Lead Manager</h1>
            <p className="lg-sub">Sign in to view and call your leads</p>
            <input className="lg-input" type="email" placeholder="Email address" autoComplete="username"
              value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            <input className="lg-input" type="password" placeholder="Password" autoComplete="current-password"
              value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            <button className="lg-btn" type="submit" disabled={loginLoading}>
              {loginLoading ? 'Signing in…' : 'Sign in'}
            </button>
            {loginError && <p className="lg-err">{loginError}</p>}
          </form>
        </div>
      </>
    )
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'to_call', label: 'To call',      count: stats.to_call },
    { key: 'due',     label: 'Follow-ups',   count: stats.due },
    { key: 'working', label: 'In progress',  count: leads.filter(buckets.working).length },
    { key: 'won',     label: 'Interested',   count: leads.filter(buckets.won).length },
    { key: 'closed',  label: 'Not interested', count: leads.filter(buckets.closed).length },
  ]

  return (
    <>
      <style>{CSS}</style>
      <div className="fw">
        <header className="hd">
          <div className="hd-in">
            <div className="hd-brand">
              <div className="hd-logo">FW</div>
              <div>
                <div className="hd-title">Lead Manager</div>
                <div className="hd-sub">{userEmail}</div>
              </div>
            </div>
            <button className="btn-ghost" onClick={logout}>Sign out</button>
          </div>
        </header>

        <main className="main">
          <section className="stats">
            <div className="stat"><div className="stat-n">{stats.to_call}</div><div className="stat-l">To call</div></div>
            <div className={`stat${stats.due ? ' warn' : ''}`}>
              <div className="stat-n">{stats.due}</div><div className="stat-l">Follow-ups due</div>
            </div>
            <div className="stat"><div className="stat-n">{stats.calledToday}</div><div className="stat-l">Called today</div></div>
            <div className="stat ok"><div className="stat-n">{stats.won}</div><div className="stat-l">Joined</div></div>
          </section>

          <section className="toolbar">
            <input className="search" placeholder="Search name, email or number…"
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="sort" value={sort} onChange={e => setSort(e.target.value as 'newest' | 'oldest')}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </section>

          <nav className="tabs">
            {TABS.map(t => (
              <button key={t.key} className={`tab${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}<span className="tab-c">{t.count}</span>
              </button>
            ))}
          </nav>

          <section className="list">
            {loading ? (
              <div className="empty">Loading leads…</div>
            ) : visible.length === 0 ? (
              <div className="empty">
                {tab === 'to_call' ? 'No leads left to call. Nice work.' :
                 tab === 'due' ? 'No follow-ups due. You’re on top of it.' :
                 'Nothing here yet.'}
              </div>
            ) : visible.map(lead => {
              const meta = statusMeta(lead.call_status)
              const digits = phoneDigits(lead.whatsapp)
              const open = openId === lead.id
              const overdue = !!lead.follow_up_at && lead.follow_up_at < today
              const dueToday = lead.follow_up_at === today
              return (
                <article key={lead.id} className={`card${open ? ' open' : ''}`}>
                  <button className="card-hd" onClick={() => setOpenId(open ? null : lead.id)}>
                    <div className="card-main">
                      <div className="card-name">{lead.full_name || 'Unnamed lead'}</div>
                      <div className="card-meta">
                        {lead.whatsapp || 'No number'}
                        <span className="dotsep">·</span>
                        {lead.email}
                      </div>
                      <div className="card-tags">
                        {(lead.call_attempts ?? 0) > 0 && (
                          <span className="tag">
                            {lead.call_attempts} call{lead.call_attempts === 1 ? '' : 's'}
                            {lead.last_called_at && <> · {relativeTime(lead.last_called_at)}</>}
                          </span>
                        )}
                        {lead.follow_up_at && (
                          <span className={`tag${overdue ? ' tag-red' : dueToday ? ' tag-amber' : ''}`}>
                            {overdue ? 'Overdue' : dueToday ? 'Follow up today' : `Follow up ${new Date(lead.follow_up_at + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="pill" style={{ background: meta.bg, color: meta.fg }}>
                      <i className="pill-dot" style={{ background: meta.dot }} />{meta.label}
                    </span>
                  </button>

                  {open && (
                    <div className="card-body">
                      <div className="grid">
                        {lead.what_building && (
                          <div><div className="lbl">Building</div><p className="val">{lead.what_building}</p></div>
                        )}
                        {lead.join_reason && (
                          <div><div className="lbl">Why they want to join</div><p className="val">{lead.join_reason}</p></div>
                        )}
                      </div>
                      <div className="grid">
                        <div><div className="lbl">Source</div><p className="val">{lead.heard_from || '—'}</p></div>
                        <div><div className="lbl">Applied</div><p className="val">
                          {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p></div>
                      </div>

                      {lead.last_called_at && (
                        <div className="lastcall">Last call: {fullDateTime(lead.last_called_at)}</div>
                      )}

                      {digits && (
                        <div className="actions">
                          <a className="btn-call" href={`tel:+${digits}`}>Call</a>
                          <a className="btn-wa" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                          <a className="btn-mail" href={`mailto:${lead.email}`}>Email</a>
                        </div>
                      )}

                      <div className="fields">
                        <div>
                          <div className="lbl">Call outcome</div>
                          <select className="input" value={lead.call_status || 'not_called'}
                            onChange={e => updateField(lead.id, 'call_status', e.target.value)}>
                            {CALL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <div className="lbl">Follow up on</div>
                          <input className="input" type="date" value={lead.follow_up_at || ''}
                            onChange={e => updateField(lead.id, 'follow_up_at', e.target.value)} />
                        </div>
                      </div>

                      <div className="lbl">
                        Notes {savingId === lead.id && <span className="saving">saving…</span>}
                      </div>
                      <textarea className="input notes" defaultValue={lead.notes || ''}
                        placeholder="What did they say? Objections, budget, timing, anything to remember next time…"
                        onBlur={e => { if (e.target.value !== (lead.notes || '')) updateField(lead.id, 'notes', e.target.value) }} />
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        </main>
      </div>
    </>
  )
}

const BOOT_CSS = `.fw-boot{min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:#f5f7fb;color:#64748b;font-family:Inter,-apple-system,sans-serif;font-size:14px}`

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
.fw *,.lg-wrap *{margin:0;padding:0;box-sizing:border-box}
.fw,.lg-wrap{font-family:'Inter',-apple-system,sans-serif;background:#f5f7fb;color:#0f172a;min-height:100vh}
.fw button,.fw select,.fw input,.fw textarea{font-family:inherit}

/* login */
.lg-wrap{display:flex;align-items:center;justify-content:center;padding:24px}
.lg-card{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:20px;padding:40px 32px;
  width:100%;max-width:400px;text-align:center;box-shadow:0 12px 40px rgba(15,23,42,.08)}
.lg-logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0284c7,#0ea5e9);
  color:#fff;font-family:'Space Grotesk';font-weight:700;font-size:20px;display:flex;align-items:center;
  justify-content:center;margin:0 auto 20px}
.lg-title{font-family:'Space Grotesk';font-size:21px;font-weight:700;letter-spacing:-.3px}
.lg-sub{font-size:13.5px;color:#64748b;margin:4px 0 26px}
.lg-input{width:100%;padding:12px 14px;background:#f8fafc;border:1px solid rgba(15,23,42,.1);
  border-radius:10px;font-size:16px;margin-bottom:10px;outline:none;color:#0f172a}
.lg-input:focus{border-color:#0284c7;background:#fff;box-shadow:0 0 0 3px rgba(2,132,199,.1)}
.lg-btn{width:100%;padding:12px;margin-top:6px;border:none;border-radius:10px;cursor:pointer;
  background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;font-size:15px;font-weight:600}
.lg-btn:disabled{opacity:.65}
.lg-err{color:#dc2626;font-size:12.5px;margin-top:12px}

/* header */
.hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.85);backdrop-filter:blur(12px);
  border-bottom:1px solid rgba(15,23,42,.07)}
.hd-in{max-width:1080px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.hd-brand{display:flex;align-items:center;gap:11px;min-width:0}
.hd-logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#0ea5e9);
  color:#fff;font-family:'Space Grotesk';font-weight:700;font-size:13px;display:flex;align-items:center;
  justify-content:center;flex:0 0 auto}
.hd-title{font-family:'Space Grotesk';font-weight:700;font-size:15.5px;letter-spacing:-.2px}
.hd-sub{font-size:11.5px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px}
.btn-ghost{background:#fff;border:1px solid rgba(15,23,42,.12);color:#475569;padding:7px 13px;
  border-radius:8px;font-size:13px;cursor:pointer;flex:0 0 auto}
.btn-ghost:hover{background:#f8fafc}

.main{max-width:1080px;margin:0 auto;padding:18px 20px 72px}

/* stats */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}
.stat{background:#fff;border:1px solid rgba(15,23,42,.07);border-radius:12px;padding:14px 16px;
  box-shadow:0 1px 2px rgba(15,23,42,.04)}
.stat-n{font-family:'Space Grotesk';font-size:24px;font-weight:700;line-height:1.1}
.stat-l{font-size:11.5px;color:#64748b;margin-top:3px;font-weight:500}
.stat.warn .stat-n{color:#b45309}
.stat.ok .stat-n{color:#0369a1}

/* toolbar */
.toolbar{display:flex;gap:10px;margin-bottom:12px}
.search{flex:1;padding:11px 14px;background:#fff;border:1px solid rgba(15,23,42,.1);border-radius:10px;
  font-size:14.5px;outline:none;color:#0f172a}
.search:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.1)}
.sort{padding:11px 12px;background:#fff;border:1px solid rgba(15,23,42,.1);border-radius:10px;
  font-size:13.5px;color:#475569;cursor:pointer;outline:none}

/* tabs */
.tabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px}
.tabs::-webkit-scrollbar{display:none}
.tab{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;
  border:1px solid rgba(15,23,42,.1);background:#fff;color:#475569;font-size:13.5px;font-weight:500;cursor:pointer}
.tab:hover{border-color:rgba(15,23,42,.2)}
.tab.on{background:#0284c7;border-color:#0284c7;color:#fff}
.tab-c{font-size:11.5px;font-weight:700;background:rgba(15,23,42,.07);padding:1px 7px;border-radius:99px}
.tab.on .tab-c{background:rgba(255,255,255,.24)}

/* cards */
.list{display:flex;flex-direction:column;gap:9px}
.card{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:13px;overflow:hidden;
  box-shadow:0 1px 2px rgba(15,23,42,.04)}
.card.open{border-color:rgba(2,132,199,.35);box-shadow:0 4px 18px rgba(2,132,199,.09)}
.card-hd{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
  padding:14px 16px;background:none;border:none;text-align:left;cursor:pointer}
.card-main{min-width:0;flex:1}
.card-name{font-weight:600;font-size:15px;color:#0f172a}
.card-meta{font-size:12.5px;color:#64748b;margin-top:3px;overflow-wrap:anywhere}
.dotsep{margin:0 6px;color:#cbd5e1}
.card-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.tag{font-size:11px;font-weight:500;color:#475569;background:#f1f5f9;padding:3px 8px;border-radius:6px}
.tag-red{background:#fef2f2;color:#b91c1c}
.tag-amber{background:#fffbeb;color:#b45309}
.pill{flex:0 0 auto;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;
  padding:5px 10px;border-radius:999px;white-space:nowrap}
.pill-dot{width:6px;height:6px;border-radius:50%;display:inline-block}

.card-body{padding:0 16px 16px;border-top:1px solid rgba(15,23,42,.06)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}
.lbl{font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#94a3b8;margin-bottom:5px}
.val{font-size:13.5px;color:#334155;line-height:1.55}
.lastcall{margin-top:14px;font-size:12.5px;color:#64748b;background:#f8fafc;
  border:1px solid rgba(15,23,42,.06);border-radius:8px;padding:8px 11px}

.actions{display:flex;gap:8px;margin-top:14px}
.actions a{flex:1;text-align:center;padding:11px;border-radius:9px;font-size:14px;font-weight:600;
  text-decoration:none;border:1px solid transparent}
.btn-call{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff}
.btn-wa{background:#f0fdf4;color:#15803d;border-color:rgba(21,128,61,.22)!important}
.btn-mail{background:#f8fafc;color:#475569;border-color:rgba(15,23,42,.1)!important}

.fields{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.fields>div>.lbl{margin-bottom:5px}
.input{width:100%;padding:10px 12px;background:#fff;border:1px solid rgba(15,23,42,.12);
  border-radius:9px;font-size:14px;color:#0f172a;outline:none}
.input:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.1)}
.notes{margin-top:5px;min-height:80px;resize:vertical;line-height:1.55}
.saving{color:#0284c7;font-weight:600;text-transform:none;letter-spacing:0}
.empty{text-align:center;color:#64748b;padding:56px 20px;font-size:14px;background:#fff;
  border:1px dashed rgba(15,23,42,.12);border-radius:13px}

@media (max-width:640px){
  .stats{grid-template-columns:repeat(2,1fr)}
  .grid,.fields{grid-template-columns:1fr}
  .main{padding:14px 14px 64px}
  .hd-in{padding:11px 14px}
}
`
