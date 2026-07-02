'use client'

import { useEffect, useState, useCallback } from 'react'

type Member = {
  id: string
  created_at: string
  full_name: string
  email: string
  whatsapp?: string
  plan: string
  amount_paise: number
  status?: string
  source?: string
  razorpay_payment_id?: string
  member_no: number
}

type PlanFilter = 'all' | 'starter' | 'annual'

const rupees = (paise: number) => '₹' + (paise / 100).toLocaleString('en-IN')

export default function MembersPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [allData, setAllData] = useState<Member[]>([])
  const [view, setView] = useState<PlanFilter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    fetch('/api/leads/verify')
      .then(r => r.json())
      .then(d => { if (d.authenticated) { setAuthenticated(true); setUserEmail(d.email) } })
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
      if (d.success) { setAuthenticated(true); setUserEmail(d.email) }
      else setLoginError(d.error || 'Invalid credentials')
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
      const r = await fetch('/api/members/data')
      if (r.status === 401) { setAuthenticated(false); return }
      const data = await r.json()
      setAllData(Array.isArray(data) ? data : [])
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

  // newest first for display, but keep their join-order member number
  const filtered = allData
    .filter(m => {
      if (view !== 'all' && m.plan !== view) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = [m.full_name, m.email, m.whatsapp, m.plan, 'member ' + m.member_no].join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    .slice()
    .reverse()

  const now = new Date()
  const stats = {
    total: allData.length,
    starter: allData.filter(m => m.plan === 'starter').length,
    annual: allData.filter(m => m.plan === 'annual').length,
    thisMonth: allData.filter(m => {
      const d = new Date(m.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
    revenue: allData.reduce((sum, m) => sum + (m.amount_paise || 0), 0),
  }

  function exportCSV() {
    const data = filtered.length ? filtered : allData
    if (!data.length) return
    const headers = ['Member No', 'Name', 'Email', 'WhatsApp', 'Plan', 'Amount', 'Joined', 'Source', 'Payment ID']
    const rows = data.map(m =>
      [m.member_no, m.full_name, m.email, m.whatsapp || '', m.plan, rupees(m.amount_paise), m.created_at, m.source || '', m.razorpay_payment_id || '']
        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    )
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `founders-wing-members-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const viewTitles: Record<PlanFilter, string> = { all: 'All Members', starter: 'Starter Members', annual: 'Annual Members' }

  if (checking) return <div style={{ background: '#06090f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Checking authentication...</div>

  if (!authenticated) {
    return (
      <div style={{ background: 'radial-gradient(ellipse at center, #0c1a2a 0%, #06090f 70%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <form onSubmit={handleLogin} style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontSize: 24, fontWeight: 700, color: 'white', margin: '0 auto 24px' }}>FW</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, color: '#f1f5f9', marginBottom: 4 }}>Members Dashboard</h2>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 32 }}>Sign in with your authorized email</p>
          <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Email address" required style={{ width: '100%', padding: '14px 16px', background: '#06090f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
          <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Access code" required style={{ width: '100%', padding: '14px 16px', background: '#06090f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none', marginBottom: 16, letterSpacing: 2, boxSizing: 'border-box' }} />
          <button type="submit" disabled={loginLoading} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loginLoading ? 0.7 : 1 }}>
            {loginLoading ? 'Signing in...' : 'Sign In'}
          </button>
          {loginError && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 12 }}>{loginError}</p>}
          <p style={{ fontSize: 11, color: '#334155', marginTop: 24 }}>Access restricted to the account owner only</p>
        </form>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
        .mem-app * { margin: 0; padding: 0; box-sizing: border-box; }
        .mem-app { font-family: 'Inter', -apple-system, sans-serif; background: #06090f; color: #f1f5f9; height: 100vh; display: flex; overflow: hidden; }
        .mem-app button { cursor: pointer; font-family: inherit; }
        .m-sidebar { width: 240px; background: #0c1220; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; flex-shrink: 0; }
        .m-sidebar-header { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .m-logo { display: flex; align-items: center; gap: 12px; }
        .m-logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk'; font-weight: 700; color: white; font-size: 14px; }
        .m-logo span { font-family: 'Space Grotesk'; font-weight: 700; font-size: 16px; }
        .m-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; padding: 20px 20px 8px; }
        .m-nav { flex: 1; padding: 0 8px; }
        .m-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #94a3b8; border: none; background: none; width: 100%; text-align: left; transition: all 0.15s; margin-bottom: 2px; }
        .m-nav-item:hover { background: #1e293b; color: #f1f5f9; }
        .m-nav-item.active { background: rgba(6,182,212,0.12); color: #06b6d4; }
        .m-nav-count { margin-left: auto; background: #1e293b; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; }
        .m-nav-item.active .m-nav-count { background: rgba(6,182,212,0.2); }
        .m-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .m-footer .m-user { font-size: 11px; color: #475569; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; }
        .m-footer button { width: 100%; padding: 10px; background: #1e293b; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #94a3b8; font-size: 12px; transition: all 0.15s; }
        .m-footer button:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); }
        .m-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .m-topbar { padding: 16px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px; background: #0c1220; flex-shrink: 0; }
        .m-topbar h2 { font-family: 'Space Grotesk'; font-size: 18px; font-weight: 700; margin-right: 16px; }
        .m-search { position: relative; flex: 1; max-width: 360px; }
        .m-search input { width: 100%; padding: 9px 12px 9px 36px; background: #111827; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; color: #f1f5f9; font-size: 13px; outline: none; }
        .m-search input::placeholder { color: #475569; }
        .m-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #475569; }
        .m-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .m-btn { padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500; border: 1px solid rgba(255,255,255,0.06); background: #111827; color: #94a3b8; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .m-btn:hover { border-color: rgba(6,182,212,0.4); color: #f1f5f9; }
        .m-btn-primary { background: rgba(6,182,212,0.12); border-color: rgba(6,182,212,0.3); color: #06b6d4; }
        .m-live { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #10b981; padding: 6px 12px; background: rgba(16,185,129,0.12); border-radius: 20px; border: 1px solid rgba(16,185,129,0.2); }
        .m-live-dot { width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: m-pulse 2s infinite; }
        @keyframes m-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 4px rgba(16,185,129,0); } }
        .m-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; padding: 16px 28px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .m-stat { background: #111827; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; }
        .m-stat-label { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 4px; }
        .m-stat-value { font-family: 'Space Grotesk'; font-size: 24px; font-weight: 700; }
        .m-content { flex: 1; overflow-y: auto; }
        .m-table { width: 100%; border-collapse: collapse; }
        .m-table thead { position: sticky; top: 0; z-index: 10; }
        .m-table th { background: #0c1220; padding: 10px 16px; text-align: left; font-size: 10px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
        .m-table td { padding: 12px 16px; font-size: 13px; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
        .m-table tbody tr:hover { background: rgba(6,182,212,0.03); }
        .m-no { font-family: 'Space Grotesk'; color: #475569; font-weight: 600; font-variant-numeric: tabular-nums; }
        .m-td-name { color: #f1f5f9 !important; font-weight: 600; }
        .m-td-email { color: #06b6d4 !important; font-size: 12px !important; }
        .m-pill { display: inline-flex; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
        .m-pill-starter { background: rgba(148,163,184,0.14); color: #cbd5e1; }
        .m-pill-annual { background: rgba(6,182,212,0.14); color: #22d3ee; }
        .m-amount { font-variant-numeric: tabular-nums; color: #10b981; font-weight: 600; }
        .m-empty { text-align: center; padding: 80px 20px; color: #475569; }
        .m-spinner { width: 28px; height: 28px; border: 3px solid rgba(6,182,212,0.12); border-top-color: #06b6d4; border-radius: 50%; animation: m-spin 0.7s linear infinite; margin: 0 auto 14px; }
        @keyframes m-spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .m-sidebar { display: none; }
          .m-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="mem-app">
        <aside className="m-sidebar">
          <div className="m-sidebar-header">
            <div className="m-logo"><div className="m-logo-icon">FW</div><span>Founders Wing</span></div>
          </div>
          <div className="m-label">Membership</div>
          <nav className="m-nav">
            {([
              { key: 'all', label: 'All Members', count: stats.total },
              { key: 'starter', label: 'Starter', count: stats.starter },
              { key: 'annual', label: 'Annual', count: stats.annual },
            ] as { key: PlanFilter; label: string; count: number }[]).map(item => (
              <button key={item.key} className={`m-nav-item ${view === item.key ? 'active' : ''}`} onClick={() => setView(item.key)}>
                {item.label}
                <span className="m-nav-count">{item.count}</span>
              </button>
            ))}
          </nav>
          <div className="m-footer">
            <div className="m-user">{userEmail}</div>
            <button onClick={logout}>Sign Out</button>
          </div>
        </aside>

        <div className="m-main">
          <div className="m-topbar">
            <h2>{viewTitles[view]}</h2>
            <div className="m-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input placeholder="Search name, email, member no..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="m-actions">
              <div className="m-live"><div className="m-live-dot" />Live</div>
              <button className="m-btn" onClick={fetchData}>Refresh</button>
              <button className="m-btn m-btn-primary" onClick={exportCSV}>Export CSV</button>
            </div>
          </div>

          <div className="m-stats">
            <div className="m-stat"><div className="m-stat-label">Total Members</div><div className="m-stat-value">{stats.total}</div></div>
            <div className="m-stat"><div className="m-stat-label">Starter</div><div className="m-stat-value" style={{ color: '#cbd5e1' }}>{stats.starter}</div></div>
            <div className="m-stat"><div className="m-stat-label">Annual</div><div className="m-stat-value" style={{ color: '#22d3ee' }}>{stats.annual}</div></div>
            <div className="m-stat"><div className="m-stat-label">This Month</div><div className="m-stat-value" style={{ color: '#8b5cf6' }}>{stats.thisMonth}</div></div>
            <div className="m-stat"><div className="m-stat-label">Revenue</div><div className="m-stat-value" style={{ color: '#10b981' }}>{rupees(stats.revenue)}</div></div>
          </div>

          <div className="m-content">
            {loading ? (
              <div className="m-empty"><div className="m-spinner" /><div style={{ fontSize: 13 }}>Loading members...</div></div>
            ) : filtered.length === 0 ? (
              <div className="m-empty"><div style={{ fontSize: 48, marginBottom: 12 }}>👥</div><p>No members match your filters</p></div>
            ) : (
              <table className="m-table">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Member</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => {
                    const date = new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    return (
                      <tr key={m.id}>
                        <td className="m-no">Member {m.member_no}</td>
                        <td className="m-td-name">{m.full_name}</td>
                        <td className="m-td-email">{m.email}</td>
                        <td style={{ color: '#22d3ee', fontSize: 12 }}>{m.whatsapp || '—'}</td>
                        <td><span className={`m-pill m-pill-${m.plan}`}>{m.plan}</span></td>
                        <td className="m-amount">{rupees(m.amount_paise)}</td>
                        <td style={{ color: '#475569', fontSize: 12 }}>{date}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
