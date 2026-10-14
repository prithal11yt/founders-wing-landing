'use client'

import { useCallback, useEffect, useState } from 'react'
import { api, CSS, type Overview, type Role } from './_components/shared'
import Today from './_components/today'
import Leads from './_components/leads'
import Members from './_components/members'
import Sessions from './_components/sessions'
import WhatsApp from './_components/whatsapp'
import Ideas from './_components/ideas'
import Insights from './_components/insights'

type Tab = 'today' | 'leads' | 'members' | 'sessions' | 'whatsapp' | 'ideas' | 'patterns'
const TABS: { key: Tab; label: string; ic: string }[] = [
  { key: 'today', label: 'Today', ic: '☀️' }, { key: 'leads', label: 'Leads', ic: '📞' }, { key: 'members', label: 'Members', ic: '👥' },
  { key: 'sessions', label: 'Sessions', ic: '🎥' }, { key: 'whatsapp', label: 'WhatsApp', ic: '💬' }, { key: 'ideas', label: 'Ideas', ic: '💡' }, { key: 'patterns', label: 'Patterns', ic: '📈' },
]
const isTab = (s: string): s is Tab => TABS.some(t => t.key === s)

export default function TeamPage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [role, setRole] = useState<Role>('team')
  const [email, setEmail] = useState('')
  const [login, setLogin] = useState({ email: '', password: '' })
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [tab, setTab] = useState<Tab>('today')
  const [focus, setFocus] = useState<{ leadId?: number; memberEmail?: string }>({})
  const [overview, setOverview] = useState<Overview | null>(null)

  useEffect(() => {
    fetch('/api/leads/verify').then(r => r.json())
      .then(d => { if (d.authenticated) { setAuthed(true); setEmail(d.email); setRole(d.role === 'admin' ? 'admin' : 'team') } })
      .catch(() => {}).finally(() => setChecking(false))
    const h = window.location.hash.replace('#', '')
    if (isTab(h)) setTab(h)
    const onUnauth = () => setAuthed(false)
    const onHash = () => { const h = window.location.hash.replace('#', ''); if (isTab(h)) setTab(h) }
    window.addEventListener('fw-unauth', onUnauth)
    window.addEventListener('hashchange', onHash)
    return () => { window.removeEventListener('fw-unauth', onUnauth); window.removeEventListener('hashchange', onHash) }
  }, [])

  const reload = useCallback(() => {
    api<Overview>('/api/team/overview').then(setOverview).catch(() => {})
  }, [])
  useEffect(() => { if (authed) { reload(); const t = setInterval(reload, 90_000); return () => clearInterval(t) } }, [authed, reload])

  function goTo(t: string, f?: { leadId?: number; memberEmail?: string }) {
    if (!isTab(t)) return
    setFocus(f || {}); setTab(t); window.location.hash = t; window.scrollTo({ top: 0 })
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault(); setLoggingIn(true); setLoginErr('')
    try {
      const r = await fetch('/api/leads/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) })
      const d = await r.json()
      if (d.success) { setAuthed(true); setEmail(d.email); setRole(d.role === 'admin' ? 'admin' : 'team') } else setLoginErr(d.error || 'Invalid credentials')
    } catch { setLoginErr('Connection failed') } finally { setLoggingIn(false) }
  }
  async function logout() {
    const r = await fetch('/api/leads/auth', { method: 'DELETE' })
    if (!r.ok) return
    setAuthed(false); setEmail('')
  }

  if (checking) return <div className="tw"><style>{CSS}</style><div className="lg-wrap muted">Loading…</div></div>

  if (!authed) return (
    <div className="tw"><style>{CSS}</style>
      <div className="lg-wrap">
        <form onSubmit={doLogin} className="lg-card">
          <div className="lg-logo">FW</div>
          <h1 className="lg-title">Team Workspace</h1>
          <p className="lg-sub">Leads, members, sessions and your daily targets</p>
          <input className="lg-input" type="email" placeholder="Email address" autoComplete="username" value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} required />
          <input className="lg-input" type="password" placeholder="Password" autoComplete="current-password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} required />
          <button className="btn btn-p btn-block" type="submit" disabled={loggingIn}>{loggingIn ? 'Signing in…' : 'Sign in'}</button>
          {loginErr && <p className="lg-err">{loginErr}</p>}
        </form>
      </div>
    </div>
  )

  return (
    <div className="tw"><style>{CSS}</style>
      <header className="t-hd">
        <div className="t-hd-in">
          <div className="t-brand">
            <div className="t-logo">FW</div>
            <div><div className="t-title">Team Workspace</div><div className="t-sub">{role === 'admin' ? 'Prithal (admin view)' : email}</div></div>
          </div>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            {role === 'admin' && <a className="btn btn-g btn-s" href="/admin/team">📊 Tracker</a>}
            <button className="btn btn-g btn-s" onClick={logout}>Sign out</button>
          </div>
        </div>
        <nav className="t-tabs">
          {TABS.map(t => <button key={t.key} className={`t-tab${tab === t.key ? ' on' : ''}`} onClick={() => goTo(t.key)}><span className="ic">{t.ic}</span><span className="lb">{t.label}</span>
            {t.key === 'leads' && overview && overview.followups_due.length > 0 && <span className="tag tag-amber" style={{ padding: '1px 6px' }}>{overview.followups_due.length}</span>}
          </button>)}
        </nav>
      </header>

      <main className="t-main">
        {tab === 'today' && <Today role={role} overview={overview} reload={reload} goTo={goTo} />}
        {tab === 'leads' && <Leads role={role} focusLeadId={focus.leadId} onLogged={reload} />}
        {tab === 'members' && <Members role={role} focusEmail={focus.memberEmail} onLogged={reload} />}
        {tab === 'sessions' && <Sessions role={role} nextSessionDay={overview?.next_session_day || ''} defaultTarget={overview?.targets.session_attendance || 25} onChanged={reload} />}
        {tab === 'whatsapp' && <WhatsApp targets={overview?.targets || null} onChanged={reload} />}
        {tab === 'ideas' && <Ideas role={role} />}
        {tab === 'patterns' && <Insights />}
      </main>
    </div>
  )
}
