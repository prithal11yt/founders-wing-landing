'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type Lead = {
  id: number
  created_at: string
  full_name: string
  email: string
  whatsapp?: string
  what_building: string
  join_reason: string
  heard_from: string
  status?: string
  call_status?: string
  starred?: boolean
  notes?: string
}

const CALL_STATUSES = [
  { value: 'not_called',     label: '— Not Called',     color: 'transparent',              text: '#475569' },
  { value: 'no_answer',      label: '📵 No Answer',      color: 'rgba(251,146,60,0.08)',    text: '#fb923c' },
  { value: 'callback',       label: '🔁 Callback',       color: 'rgba(250,204,21,0.08)',    text: '#facc15' },
  { value: 'not_interested', label: '🔴 Not Interested', color: 'rgba(239,68,68,0.08)',     text: '#ef4444' },
  { value: 'less_convinced', label: '🟡 Less Convinced', color: 'rgba(234,179,8,0.1)',      text: '#eab308' },
  { value: 'interested',     label: '🟢 Interested',     color: 'rgba(34,197,94,0.08)',     text: '#22c55e' },
  { value: 'very_convinced', label: '✅ Very Convinced', color: 'rgba(16,185,129,0.12)',    text: '#10b981' },
  { value: 'converted',      label: '💰 Converted',      color: 'rgba(6,182,212,0.12)',     text: '#06b6d4' },
]

function callStatusMeta(v?: string) {
  return CALL_STATUSES.find(s => s.value === (v || 'not_called')) ?? CALL_STATUSES[0]
}

type ViewFilter = 'all' | 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'starred' | 'members'

export default function LeadsPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Dashboard state
  const [allData, setAllData] = useState<Lead[]>([])
  const [filtered, setFiltered] = useState<Lead[]>([])
  const [currentView, setCurrentView] = useState<ViewFilter>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [panelLead, setPanelLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const notesRef = useRef<HTMLTextAreaElement>(null)

  // Check auth on mount
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

  // Login
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

  // Fetch data via secure server-side API
  const fetchData = useCallback(async () => {
    try {
      const r = await fetch('/api/leads/data')
      if (r.status === 401) { setAuthenticated(false); return }
      const data = await r.json()
      setAllData(data)
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [authenticated, fetchData])

  // Filter
  useEffect(() => {
    const q = search.toLowerCase()
    const result = allData.filter(d => {
      const s = d.status || 'new'
      if (currentView === 'new' && s !== 'new') return false
      if (currentView === 'reviewed' && s !== 'reviewed') return false
      if (currentView === 'shortlisted' && s !== 'shortlisted') return false
      if (currentView === 'rejected' && s !== 'rejected') return false
      if (currentView === 'starred' && !d.starred) return false
      if (currentView === 'members' && d.call_status !== 'converted') return false
      if (currentView !== 'members' && d.call_status === 'converted') return false
      if (q) {
        const haystack = [d.full_name, d.email, d.whatsapp, d.what_building, d.join_reason, d.heard_from].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
    setFiltered(result)
  }, [allData, currentView, search])

  // Stats
  const stats = {
    total: allData.length,
    new: allData.filter(d => (d.status || 'new') === 'new').length,
    shortlisted: allData.filter(d => d.status === 'shortlisted').length,
    reviewed: allData.filter(d => d.status === 'reviewed').length,
    rejected: allData.filter(d => d.status === 'rejected').length,
    starred: allData.filter(d => d.starred).length,
    converted: allData.filter(d => d.call_status === 'converted').length,
    very_convinced: allData.filter(d => d.call_status === 'very_convinced').length,
    not_called: allData.filter(d => !d.call_status || d.call_status === 'not_called').length,
  }

  // Actions via secure server-side API
  async function updateField(id: number, field: string, value: string | boolean) {
    const r = await fetch('/api/leads/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, field, value }),
    })
    if (r.status === 401) { setAuthenticated(false); return }
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      alert(`Save failed: ${err.error || r.status}`)
      return
    }
    setAllData(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)))
  }

  function toggleSelect(id: number, checked: boolean) {
    setSelected(prev => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    if (checked) setSelected(new Set(filtered.map(d => d.id)))
    else setSelected(new Set())
  }

  async function bulkAction(status: string) {
    for (const id of selected) await updateField(id, 'status', status)
    setSelected(new Set())
  }

  async function deleteLeads(ids: number[]) {
    if (!confirm(`Delete ${ids.length} lead${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return
    const r = await fetch('/api/leads/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    if (r.status === 401) { setAuthenticated(false); return }
    if (r.ok) {
      setAllData(prev => prev.filter(d => !ids.includes(d.id)))
      setSelected(new Set())
      if (panelLead && ids.includes(panelLead.id)) setPanelLead(null)
    }
  }

  function exportCSV() {
    const data = filtered.length ? filtered : allData
    if (!data.length) return
    const headers = ['ID', 'Date', 'Name', 'Email', 'WhatsApp', 'Building', 'Goal', 'Source', 'Status', 'Notes']
    const rows = data.map(d =>
      [d.id, d.created_at, d.full_name, d.email, d.whatsapp || '', d.what_building, d.join_reason, d.heard_from, d.status || 'new', d.notes || '']
        .map(v => `"${String(v || '').replace(/"/g, '""')}"`)
        .join(',')
    )
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `founders-wing-${currentView}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const viewTitles: Record<string, string> = {
    all: 'All Leads', new: 'New Leads', reviewed: 'Reviewed', shortlisted: 'Shortlisted',
    rejected: 'Rejected', starred: 'Starred', members: '💰 Members',
  }

  // ─── RENDER ───
  if (checking) return <div style={{ background: '#06090f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Checking authentication...</div>

  if (!authenticated) {
    return (
      <div style={{ background: 'radial-gradient(ellipse at center, #0c1a2a 0%, #06090f 70%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', margin: '0 auto 24px' }}>FW</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, color: '#f1f5f9', marginBottom: 4 }}>Lead Manager</h2>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 32 }}>Sign in with your authorized email</p>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email address" required style={{ width: '100%', padding: '14px 16px', background: '#06090f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Access code" required style={{ width: '100%', padding: '14px 16px', background: '#06090f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none', marginBottom: 16, letterSpacing: 2, boxSizing: 'border-box' }} />
          <button type="submit" disabled={loginLoading} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loginLoading ? 0.7 : 1 }}>
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>
          {loginError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 12 }}>{loginError}</p>}
          <p style={{ fontSize: 11, color: '#334155', marginTop: 24 }}>Access restricted to authorized members only</p>
        </form>
      </div>
    )
  }

  // ─── DASHBOARD ───
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        .leads-app * { margin: 0; padding: 0; box-sizing: border-box; }
        .leads-app { font-family: 'Inter', -apple-system, sans-serif; background: #06090f; color: #f1f5f9; height: 100vh; display: flex; overflow: hidden; }
        .leads-app button { cursor: pointer; font-family: inherit; }
        .l-sidebar { width: 260px; background: #0c1220; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; flex-shrink: 0; }
        .l-sidebar-header { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .l-sidebar-logo { display: flex; align-items: center; gap: 12px; }
        .l-sidebar-logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk'; font-weight: 700; color: white; font-size: 14px; }
        .l-sidebar-logo span { font-family: 'Space Grotesk'; font-weight: 700; font-size: 16px; }
        .l-sidebar-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; padding: 20px 20px 8px; }
        .l-nav { flex: 1; padding: 0 8px; }
        .l-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #94a3b8; border: none; background: none; width: 100%; text-align: left; transition: all 0.15s; margin-bottom: 2px; }
        .l-nav-item:hover { background: #1e293b; color: #f1f5f9; }
        .l-nav-item.active { background: rgba(6,182,212,0.12); color: #06b6d4; }
        .l-nav-count { margin-left: auto; background: #1e293b; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
        .l-nav-item.active .l-nav-count { background: rgba(6,182,212,0.2); }
        .l-sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .l-sidebar-footer .l-user { font-size: 11px; color: #475569; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; }
        .l-sidebar-footer button { width: 100%; padding: 10px; background: #1e293b; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #94a3b8; font-size: 12px; transition: all 0.15s; }
        .l-sidebar-footer button:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); }
        .l-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .l-topbar { padding: 16px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px; background: #0c1220; flex-shrink: 0; }
        .l-topbar h2 { font-family: 'Space Grotesk'; font-size: 18px; font-weight: 700; margin-right: 16px; }
        .l-search { position: relative; flex: 1; max-width: 360px; }
        .l-search input { width: 100%; padding: 9px 12px 9px 36px; background: #111827; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #f1f5f9; font-size: 13px; outline: none; }
        .l-search input::placeholder { color: #475569; }
        .l-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #475569; }
        .l-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .l-btn { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; border: 1px solid rgba(255,255,255,0.06); background: #111827; color: #94a3b8; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .l-btn:hover { border-color: rgba(6,182,212,0.4); color: #f1f5f9; }
        .l-btn-primary { background: rgba(6,182,212,0.12); border-color: rgba(6,182,212,0.3); color: #06b6d4; }
        .l-live { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #10b981; padding: 6px 12px; background: rgba(16,185,129,0.12); border-radius: 20px; border: 1px solid rgba(16,185,129,0.2); }
        .l-live-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: l-pulse 2s infinite; }
        @keyframes l-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 4px rgba(16,185,129,0); } }
        .l-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; padding: 16px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .l-stat { background: #111827; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; }
        .l-stat-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 4px; }
        .l-stat-value { font-family: 'Space Grotesk'; font-size: 24px; font-weight: 700; }
        .l-bulk { display: flex; padding: 10px 28px; background: rgba(6,182,212,0.12); border-bottom: 1px solid rgba(6,182,212,0.2); align-items: center; gap: 12px; flex-shrink: 0; }
        .l-bulk span { font-size: 13px; font-weight: 500; color: #06b6d4; }
        .l-bulk-actions { display: flex; gap: 8px; margin-left: auto; }
        .l-content { flex: 1; overflow-y: auto; }
        .l-table { width: 100%; border-collapse: collapse; }
        .l-table thead { position: sticky; top: 0; z-index: 10; }
        .l-table th { background: #0c1220; padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
        .l-table td { padding: 12px 16px; font-size: 13px; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .l-table tbody tr:hover { background: rgba(6,182,212,0.03); }
        .l-td-name { color: #f1f5f9 !important; font-weight: 600; cursor: pointer; }
        .l-td-name:hover { color: #06b6d4 !important; }
        .l-td-email { color: #06b6d4 !important; font-size: 12px !important; }
        .l-star { cursor: pointer; font-size: 16px; opacity: 0.3; transition: opacity 0.15s; background: none; border: none; color: #f1f5f9; }
        .l-star:hover, .l-star.starred { opacity: 1; }
        .l-pill { display: inline-flex; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; }
        .l-pill-new { background: rgba(59,130,246,0.12); color: #3b82f6; }
        .l-pill-reviewed { background: rgba(245,158,11,0.12); color: #f59e0b; }
        .l-pill-shortlisted { background: rgba(16,185,129,0.12); color: #10b981; }
        .l-pill-rejected { background: rgba(239,68,68,0.12); color: #ef4444; }
        .l-panel-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 200; }
        .l-panel { position: fixed; top: 0; right: 0; width: 520px; max-width: 100vw; height: 100vh; background: #0c1220; border-left: 1px solid rgba(255,255,255,0.06); z-index: 201; overflow-y: auto; display: flex; flex-direction: column; }
        .l-panel-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: flex-start; }
        .l-panel-name { font-family: 'Space Grotesk'; font-size: 22px; font-weight: 700; }
        .l-panel-email { color: #06b6d4; font-size: 13px; margin-top: 2px; }
        .l-panel-date { font-size: 11px; color: #475569; margin-top: 6px; }
        .l-panel-close { width: 32px; height: 32px; background: #1e293b; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #94a3b8; font-size: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .l-panel-close:hover { color: #ef4444; background: rgba(239,68,68,0.12); }
        .l-panel-actions { padding: 16px 24px; display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .l-panel-actions .l-btn { flex: 1; justify-content: center; padding: 10px; }
        .l-panel-body { padding: 20px 24px; flex: 1; overflow-y: auto; }
        .l-panel-section { margin-bottom: 20px; }
        .l-panel-section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; font-weight: 600; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .l-panel-field { background: #111827; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; }
        .l-panel-field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #475569; font-weight: 600; margin-bottom: 6px; }
        .l-panel-field-value { font-size: 13px; color: #f1f5f9; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
        .l-panel-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .l-panel-notes { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.06); }
        .l-panel-notes textarea { width: 100%; padding: 10px 12px; background: #111827; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #f1f5f9; font-size: 13px; font-family: inherit; resize: vertical; min-height: 72px; outline: none; box-sizing: border-box; }
        .l-empty { text-align: center; padding: 80px 20px; color: #475569; }
        .l-spinner { width: 28px; height: 28px; border: 3px solid rgba(6,182,212,0.12); border-top-color: #06b6d4; border-radius: 50%; animation: l-spin 0.7s linear infinite; margin: 0 auto 14px; }
        @keyframes l-spin { to { transform: rotate(360deg); } }
        .l-check { width: 16px; height: 16px; accent-color: #06b6d4; cursor: pointer; }
        .l-call-select { background: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 4px 6px; font-size: 11px; font-family: inherit; cursor: pointer; outline: none; min-width: 130px; }
        .l-call-select:hover { border-color: rgba(255,255,255,0.2); }
        @media (max-width: 768px) {
          .l-sidebar { display: none; }
          .l-stats { grid-template-columns: repeat(3, 1fr); }
          .l-panel { width: 100vw; }
        }
      `}</style>

      <div className="leads-app">
        {/* Sidebar */}
        <aside className="l-sidebar">
          <div className="l-sidebar-header">
            <div className="l-sidebar-logo">
              <div className="l-sidebar-logo-icon">FW</div>
              <span>Founders Wing</span>
            </div>
          </div>
          <div className="l-sidebar-label">Pipeline</div>
          <nav className="l-nav">
            {([
              { key: 'all', label: 'All Leads', count: stats.total },
              { key: 'new', label: 'New', count: stats.new },
              { key: 'reviewed', label: 'Reviewed', count: stats.reviewed },
              { key: 'shortlisted', label: 'Shortlisted', count: stats.shortlisted },
              { key: 'rejected', label: 'Rejected', count: stats.rejected },
              { key: 'starred', label: 'Starred', count: stats.starred },
            ] as { key: ViewFilter; label: string; count: number }[]).map(item => (
              <button key={item.key} className={`l-nav-item ${currentView === item.key ? 'active' : ''}`} onClick={() => { setCurrentView(item.key); setSelected(new Set()) }}>
                {item.label}
                <span className="l-nav-count">{item.count}</span>
              </button>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
            <a href="/admin/members" className="l-nav-item" style={{ textDecoration: 'none' }}>
              💰 Members
              <span className="l-nav-count">→</span>
            </a>
          </nav>
          <div className="l-sidebar-footer">
            <div className="l-user">{userEmail}</div>
            <button onClick={logout}>Sign Out</button>
          </div>
        </aside>

        {/* Main */}
        <div className="l-main">
          <div className="l-topbar">
            <h2>{viewTitles[currentView]}</h2>
            <div className="l-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input placeholder="Search name, email, building..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="l-actions">
              <div className="l-live"><div className="l-live-dot" />Live</div>
              <button className="l-btn" onClick={fetchData}>Refresh</button>
              <button className="l-btn l-btn-primary" onClick={exportCSV}>Export CSV</button>
            </div>
          </div>

          {/* Stats */}
          <div className="l-stats">
            <div className="l-stat"><div className="l-stat-label">Total Leads</div><div className="l-stat-value">{stats.total}</div></div>
            <div className="l-stat"><div className="l-stat-label">Not Called</div><div className="l-stat-value" style={{ color: '#475569' }}>{stats.not_called}</div></div>
            <div className="l-stat"><div className="l-stat-label">Very Convinced</div><div className="l-stat-value" style={{ color: '#10b981' }}>{stats.very_convinced}</div></div>
            <div className="l-stat"><div className="l-stat-label">Converted 💰</div><div className="l-stat-value" style={{ color: '#06b6d4' }}>{stats.converted}</div></div>
            <div className="l-stat"><div className="l-stat-label">Starred</div><div className="l-stat-value" style={{ color: '#8b5cf6' }}>{stats.starred}</div></div>
          </div>

          {/* Bulk Actions */}
          {selected.size > 0 && (
            <div className="l-bulk">
              <span>{selected.size} selected</span>
              <div className="l-bulk-actions">
                <button className="l-btn" onClick={() => bulkAction('shortlisted')}>Shortlist</button>
                <button className="l-btn" onClick={() => bulkAction('reviewed')}>Mark Reviewed</button>
                <button className="l-btn" onClick={() => bulkAction('rejected')} style={{ color: '#ef4444' }}>Reject</button>
                <button className="l-btn" onClick={() => deleteLeads([...selected])} style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>Delete</button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="l-content">
            {loading ? (
              <div className="l-empty"><div className="l-spinner" /><div style={{ fontSize: 13 }}>Loading leads...</div></div>
            ) : filtered.length === 0 ? (
              <div className="l-empty"><div style={{ fontSize: 48, marginBottom: 12 }}>📋</div><p>No leads match your filters</p></div>
            ) : (
              <table className="l-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}><input type="checkbox" className="l-check" checked={selected.size === filtered.length && filtered.length > 0} onChange={e => toggleAll(e.target.checked)} /></th>
                    <th style={{ width: 36 }}></th>
                    <th>Name</th>
                    <th>WhatsApp</th>
                    <th>Building</th>
                    <th>Source</th>
                    <th>Call Status</th>
                    <th>Status</th>
                    <th>Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => {
                    const st = d.status || 'new'
                    const cs = callStatusMeta(d.call_status)
                    const date = new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    return (
                      <tr key={d.id} style={{ background: cs.color }}>
                        <td style={{ textAlign: 'center' }}><input type="checkbox" className="l-check" checked={selected.has(d.id)} onChange={e => toggleSelect(d.id, e.target.checked)} /></td>
                        <td><button className={`l-star ${d.starred ? 'starred' : ''}`} onClick={() => updateField(d.id, 'starred', !d.starred)}>{d.starred ? '★' : '☆'}</button></td>
                        <td className="l-td-name" onClick={() => setPanelLead(d)}>{d.full_name}</td>
                        <td style={{ color: '#22d3ee', fontSize: 12 }}>{d.whatsapp || '—'}</td>
                        <td>{d.what_building}</td>
                        <td style={{ color: '#475569' }}>{d.heard_from}</td>
                        <td>
                          <select
                            className="l-call-select"
                            value={d.call_status || 'not_called'}
                            style={{ color: cs.text }}
                            onChange={async e => {
                              await updateField(d.id, 'call_status', e.target.value)
                            }}
                          >
                            {CALL_STATUSES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td><span className={`l-pill l-pill-${st}`}>{st.charAt(0).toUpperCase() + st.slice(1)}</span></td>
                        <td style={{ color: '#475569', fontSize: 12 }}>{date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {panelLead && (
          <>
            <div className="l-panel-overlay" onClick={() => setPanelLead(null)} />
            <div className="l-panel">
              <div className="l-panel-header">
                <div>
                  <div className="l-panel-name">{panelLead.full_name}</div>
                  <div className="l-panel-email">{panelLead.email}</div>
                  {panelLead.whatsapp && <div style={{ fontSize: 12, color: '#22d3ee', marginTop: 2 }}>📱 {panelLead.whatsapp}</div>}
                  <div className="l-panel-date">Applied {new Date(panelLead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <button className="l-panel-close" onClick={() => setPanelLead(null)}>&times;</button>
              </div>
              <div className="l-panel-actions" style={{ flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#475569', fontWeight: 600, alignSelf: 'center', whiteSpace: 'nowrap' }}>Call</div>
                  <select
                    className="l-call-select"
                    value={panelLead.call_status || 'not_called'}
                    style={{ color: callStatusMeta(panelLead.call_status).text, flex: 1, fontSize: 13 }}
                    onChange={async e => {
                      await updateField(panelLead.id, 'call_status', e.target.value)
                      setPanelLead({ ...panelLead, call_status: e.target.value })
                    }}
                  >
                    {CALL_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  {(['shortlisted', 'reviewed', 'rejected'] as const).map(s => (
                    <button key={s} className={`l-btn ${panelLead.status === s ? 'l-btn-primary' : ''}`} style={s === 'rejected' ? { color: '#ef4444', flex: 1, justifyContent: 'center' } : { flex: 1, justifyContent: 'center' }} onClick={async () => {
                      await updateField(panelLead.id, 'status', s)
                      setPanelLead({ ...panelLead, status: s })
                    }}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                  <button className="l-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', flex: 1, justifyContent: 'center' }} onClick={() => deleteLeads([panelLead.id])}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="l-panel-body">
                <div className="l-panel-section">
                  <div className="l-panel-section-title">Application</div>
                  <div className="l-panel-field"><div className="l-panel-field-label">WhatsApp</div><div className="l-panel-field-value" style={{ color: '#22d3ee' }}>{panelLead.whatsapp || '—'}</div></div>
                  <div className="l-panel-field"><div className="l-panel-field-label">What they&apos;re building / idea</div><div className="l-panel-field-value">{panelLead.what_building}</div></div>
                  <div className="l-panel-field"><div className="l-panel-field-label">Goal in next 3 months</div><div className="l-panel-field-value">{panelLead.join_reason}</div></div>
                </div>
                <div className="l-panel-section">
                  <div className="l-panel-section-title">Meta</div>
                  <div className="l-panel-field"><div className="l-panel-field-label">How they heard about us</div><div className="l-panel-field-value">{panelLead.heard_from}</div></div>
                </div>
              </div>
              <div className="l-panel-notes">
                <div style={{ fontSize: 10, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#475569', fontWeight: 600, marginBottom: 8 }}>Private Notes</div>
                <textarea ref={notesRef} defaultValue={panelLead.notes || ''} placeholder="Add your notes about this applicant..." />
                <button className="l-btn l-btn-primary" style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: 10 }} onClick={async () => {
                  if (notesRef.current) {
                    await updateField(panelLead.id, 'notes', notesRef.current.value)
                  }
                }}>Save Notes</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
