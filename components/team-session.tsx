'use client'

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'

/* Session handling shared by the team dashboards.
   The keep-alive renews the session while a page is open. When a session does end,
   the overlay signs the person back in over the top of the page instead of replacing
   it, so whatever they were typing is still there to save. */

const KEEP_ALIVE_MS = 30 * 60 * 1000

export function useSessionKeepAlive(active: boolean, onExpired: () => void) {
  const expiredRef = useRef(onExpired)
  useEffect(() => { expiredRef.current = onExpired })

  useEffect(() => {
    if (!active) return
    const ping = () => {
      // Only a definite 401 means signed out. Being offline for a moment doesn't.
      fetch('/api/leads/verify').then(r => { if (r.status === 401) expiredRef.current() }).catch(() => {})
    }
    const onVisible = () => { if (document.visibilityState === 'visible') ping() }
    const timer = setInterval(ping, KEEP_ALIVE_MS)
    document.addEventListener('visibilitychange', onVisible)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [active])
}

const input: CSSProperties = { width: '100%', padding: '11px 13px', border: '1px solid rgba(15,23,42,.14)', borderRadius: 10, fontSize: 16, marginBottom: 10, outline: 'none', background: '#fff', color: '#0f172a', boxSizing: 'border-box' }

export function SessionExpiredOverlay({ onSignedIn }: { onSignedIn: (account: { email: string; role: string }) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await fetch('/api/leads/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.success) onSignedIn({ email: d.email, role: d.role })
      else setError(d.error || 'Invalid credentials')
    } catch { setError("Couldn't reach the server. Check your internet and try again.") } finally { setBusy(false) }
  }

  return (
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <form onSubmit={submit} style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 380, boxShadow: '0 24px 80px rgba(15,23,42,.3)', color: '#0f172a' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>You were signed out</h2>
        <p style={{ fontSize: 14, color: '#475569', margin: '6px 0 16px', lineHeight: 1.5 }}>Sign in again to carry on. Everything you typed is still on the page. If you were saving something, press Save again afterwards.</p>
        <input style={input} type="email" required placeholder="Email address" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={input} type="password" required placeholder="Password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p style={{ color: '#b91c1c', fontSize: 13, margin: '0 0 10px' }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ width: '100%', padding: '12px 14px', border: 'none', borderRadius: 10, background: '#0284c7', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
