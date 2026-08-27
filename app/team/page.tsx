'use client'

import { useEffect, useState, useCallback } from 'react'

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
}

const CALL_STATUSES = [
  { value: 'not_called',     label: '— Not Called',      text: '#94a3b8' },
  { value: 'no_answer',      label: '📵 No Answer',       text: '#fb923c' },
  { value: 'callback',       label: '🔁 Callback',        text: '#facc15' },
  { value: 'not_interested', label: '🔴 Not Interested',  text: '#ef4444' },
  { value: 'less_convinced', label: '🟡 Less Convinced',  text: '#eab308' },
  { value: 'interested',     label: '🟢 Interested',      text: '#22c55e' },
  { value: 'very_convinced', label: '✅ Very Convinced',  text: '#10b981' },
  { value: 'converted',      label: '💰 Converted',       text: '#06b6d4' },
]

function statusMeta(v?: string) {
  return CALL_STATUSES.find(s => s.value === (v || 'not_called')) ?? CALL_STATUSES[0]
}

/** Indian numbers are stored inconsistently (with/without +91, spaces).
 *  Normalise to a bare international number for tel:/wa.me links. */
function phoneDigits(raw?: string): string {
  if (!raw) return ''
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `91${d}`
  return d
}

type Tab = 'to_call' | 'callback' | 'warm' | 'done'

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
  const [openId, setOpenId] = useState<number | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/leads/verify')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          setAuthenticated(true)
          setUserEmail(d.email)
        }
      })
      .finally(() => setChecking(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const r = await fetch('/api/leads/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const d = await r.json()
      if (d.success) {
        setAuthenticated(true)
        setUserEmail(d.email)
      } else {
        setLoginError(d.error || 'Invalid credentials')
      }
    } catch {
      setLoginError('Connection failed')
    } finally {
      setLoginLoading(false)
    }
  }

  function logout() {
    document.cookie = 'fw_leads_token=; path=/; max-age=0'
    setAuthenticated(false)
    setUserEmail('')
  }

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch('/api/leads/data')
      if (r.status === 401) { setAuthenticated(false); return }
      const data = await r.json()
      if (Array.isArray(data)) setLeads(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    fetchData()
    const t = setInterval(fetchData, 60000)
    return () => clearInterval(t)
  }, [authenticated, fetchData])

  async function updateField(id: number, field: 'call_status' | 'notes', value: string) {
    setSavingId(id)
    // Optimistic: the list re-buckets instantly so it feels responsive on mobile.
    setLeads(prev => prev.map(l => (l.id === id ? { ...l, [field]: value } : l)))
    try {
      const r = await fetch('/api/leads/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
    } finally {
      setSavingId(null)
    }
  }

  const counts = {
    to_call: leads.filter(l => !l.call_status || l.call_status === 'not_called').length,
    callback: leads.filter(l => ['callback', 'no_answer'].includes(l.call_status || '')).length,
    warm: leads.filter(l => ['interested', 'very_convinced'].includes(l.call_status || '')).length,
    done: leads.filter(l => ['converted', 'not_interested', 'less_convinced'].includes(l.call_status || '')).length,
  }

  const byTab: Record<Tab, (l: Lead) => boolean> = {
    to_call: l => !l.call_status || l.call_status === 'not_called',
    callback: l => ['callback', 'no_answer'].includes(l.call_status || ''),
    warm: l => ['interested', 'very_convinced'].includes(l.call_status || ''),
    done: l => ['converted', 'not_interested', 'less_convinced'].includes(l.call_status || ''),
  }

  const q = search.trim().toLowerCase()
  const visible = leads.filter(byTab[tab]).filter(l =>
    !q ||
    (l.full_name || '').toLowerCase().includes(q) ||
    (l.email || '').toLowerCase().includes(q) ||
    (l.whatsapp || '').includes(q)
  )

  if (checking) {
    return <div style={{ background: '#06090f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Checking…</div>
  }

  if (!authenticated) {
    return (
      <div style={{ background: 'radial-gradient(ellipse at center, #0c1a2a 0%, #06090f 70%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '48px 32px', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', margin: '0 auto 24px' }}>FW</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, color: '#f1f5f9', marginBottom: 4 }}>Team — Leads</h2>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 32 }}>Sign in to start calling</p>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email address" required autoComplete="username"
            style={{ width: '100%', padding: '14px 16px', background: '#06090f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#f1f5f9', fontSize: 16, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Password" required autoComplete="current-password"
            style={{ width: '100%', padding: '14px 16px', background: '#06090f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#f1f5f9', fontSize: 16, outline: 'none', marginBottom: 16, boxSizing: 'border-box' }} />
          <button type="submit" disabled={loginLoading}
            style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loginLoading ? 0.7 : 1 }}>
            {loginLoading ? 'Signing in…' : 'Sign In'}
          </button>
          {loginError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 12 }}>{loginError}</p>}
        </form>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'to_call',  label: 'To Call',   count: counts.to_call },
    { key: 'callback', label: 'Follow Up', count: counts.callback },
    { key: 'warm',     label: 'Warm',      count: counts.warm },
    { key: 'done',     label: 'Closed',    count: counts.done },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        .tm * { margin:0; padding:0; box-sizing:border-box; }
        .tm { font-family:'Inter',-apple-system,sans-serif; background:#06090f; color:#f1f5f9; min-height:100vh; }
        .tm button, .tm select, .tm textarea, .tm input { font-family:inherit; }
        .tm-head { position:sticky; top:0; z-index:20; background:#0c1220; border-bottom:1px solid rgba(255,255,255,0.06); padding:14px 16px; }
        .tm-title-row { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
        .tm-title { font-family:'Space Grotesk'; font-weight:700; font-size:17px; }
        .tm-sub { font-size:11px; color:#475569; margin-top:2px; }
        .tm-search { width:100%; padding:11px 14px; background:#06090f; border:1px solid rgba(255,255,255,0.07); border-radius:10px; color:#f1f5f9; font-size:15px; outline:none; }
        .tm-tabs { display:flex; gap:6px; overflow-x:auto; padding:12px 16px 0; }
        .tm-tabs::-webkit-scrollbar { display:none; }
        .tm-tab { flex:0 0 auto; padding:8px 14px; border-radius:999px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:#94a3b8; font-size:13px; font-weight:500; cursor:pointer; }
        .tm-tab.on { background:rgba(6,182,212,0.14); border-color:rgba(6,182,212,0.4); color:#22d3ee; }
        .tm-list { padding:12px 16px 80px; display:flex; flex-direction:column; gap:10px; max-width:760px; margin:0 auto; }
        .tm-card { background:#111827; border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        .tm-card-top { padding:14px; display:flex; align-items:flex-start; justify-content:space-between; gap:12px; cursor:pointer; }
        .tm-name { font-weight:600; font-size:15px; }
        .tm-meta { font-size:12px; color:#64748b; margin-top:3px; word-break:break-all; }
        .tm-pill { flex:0 0 auto; font-size:11px; font-weight:600; padding:5px 9px; border-radius:999px; background:rgba(255,255,255,0.05); }
        .tm-body { padding:0 14px 14px; border-top:1px solid rgba(255,255,255,0.05); }
        .tm-field { margin-top:12px; }
        .tm-label { font-size:10px; text-transform:uppercase; letter-spacing:0.09em; color:#475569; font-weight:600; margin-bottom:5px; }
        .tm-val { font-size:13.5px; color:#cbd5e1; line-height:1.55; white-space:pre-wrap; }
        .tm-actions { display:flex; gap:8px; margin-top:14px; }
        .tm-btn { flex:1; text-align:center; padding:11px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; border:none; }
        .tm-call { background:linear-gradient(135deg,#0891b2,#06b6d4); color:#fff; }
        .tm-wa { background:rgba(37,211,102,0.14); color:#25D366; border:1px solid rgba(37,211,102,0.3); }
        .tm-select, .tm-notes { width:100%; padding:11px 12px; background:#06090f; border:1px solid rgba(255,255,255,0.08); border-radius:10px; color:#f1f5f9; font-size:14px; outline:none; }
        .tm-notes { min-height:74px; resize:vertical; line-height:1.5; }
        .tm-empty { text-align:center; color:#475569; padding:60px 20px; font-size:14px; }
        @media (min-width:640px){ .tm-head{padding:16px 24px} .tm-tabs{padding:14px 24px 0} }
      `}</style>

      <div className="tm">
        <div className="tm-head">
          <div className="tm-title-row">
            <div>
              <div className="tm-title">Leads to Call</div>
              <div className="tm-sub">{userEmail}</div>
            </div>
            <button onClick={logout} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '7px 12px', borderRadius: 8, fontSize: 12.5, cursor: 'pointer' }}>Sign out</button>
          </div>
          <input className="tm-search" placeholder="Search name, email or number…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="tm-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`tm-tab${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="tm-list">
          {loading ? (
            <div className="tm-empty">Loading leads…</div>
          ) : visible.length === 0 ? (
            <div className="tm-empty">
              {tab === 'to_call' ? 'No leads left to call here. Nice work 🎉' : 'Nothing in this list yet.'}
            </div>
          ) : visible.map(lead => {
            const meta = statusMeta(lead.call_status)
            const digits = phoneDigits(lead.whatsapp)
            const open = openId === lead.id
            return (
              <div key={lead.id} className="tm-card">
                <div className="tm-card-top" onClick={() => setOpenId(open ? null : lead.id)}>
                  <div style={{ minWidth: 0 }}>
                    <div className="tm-name">{lead.full_name || 'Unnamed lead'}</div>
                    <div className="tm-meta">{lead.whatsapp || 'No number'} · {lead.email}</div>
                  </div>
                  <span className="tm-pill" style={{ color: meta.text }}>{meta.label}</span>
                </div>

                {open && (
                  <div className="tm-body">
                    {lead.what_building && (
                      <div className="tm-field">
                        <div className="tm-label">What they&apos;re building</div>
                        <div className="tm-val">{lead.what_building}</div>
                      </div>
                    )}
                    {lead.join_reason && (
                      <div className="tm-field">
                        <div className="tm-label">Why they want to join</div>
                        <div className="tm-val">{lead.join_reason}</div>
                      </div>
                    )}
                    <div className="tm-field">
                      <div className="tm-label">Source · Applied</div>
                      <div className="tm-val">{lead.heard_from || '—'} · {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>

                    {digits && (
                      <div className="tm-actions">
                        <a className="tm-btn tm-call" href={`tel:+${digits}`}>📞 Call</a>
                        <a className="tm-btn tm-wa" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                      </div>
                    )}

                    <div className="tm-field">
                      <div className="tm-label">Call outcome</div>
                      <select className="tm-select" value={lead.call_status || 'not_called'}
                        onChange={e => updateField(lead.id, 'call_status', e.target.value)}>
                        {CALL_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>

                    <div className="tm-field">
                      <div className="tm-label">Notes {savingId === lead.id && <span style={{ color: '#06b6d4' }}>· saving…</span>}</div>
                      <textarea className="tm-notes" defaultValue={lead.notes || ''} placeholder="What did they say? Anything to follow up on?"
                        onBlur={e => { if (e.target.value !== (lead.notes || '')) updateField(lead.id, 'notes', e.target.value) }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
