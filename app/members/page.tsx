'use client'

import { useEffect, useState, useCallback } from 'react'
import { COHORT_1_SIZE } from '@/lib/cohort'
import { PathBoard, PathShell, type JourneyData } from '@/components/members/path-board'

type Member = {
  id: string
  full_name: string
  email: string
  plan: string
  created_at: string
  member_no: number | null
}

const firstName = (name?: string | null) => (name || 'Founder').split(' ')[0]

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-[24px] bg-neutral-200/70 ${className || ''}`} />
}

export default function MembersPortal() {
  const [checking, setChecking] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [setupToken, setSetupToken] = useState('')
  const [step, setStep] = useState<'email' | 'setup' | 'password'>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const invitation = new URLSearchParams(window.location.hash.slice(1))
    if (invitation.has('setup')) {
      setEmail(invitation.get('email') || '')
      setSetupToken(invitation.get('setup') || '')
      setStep('setup')
      window.history.replaceState(null, '', window.location.pathname)
      setChecking(false)
      return
    }
    fetch('/api/members/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.authenticated) setMember(d.member) })
      .finally(() => setChecking(false))
  }, [])

  async function post(body: object) {
    const r = await fetch('/api/members/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { ok: r.ok, data: await r.json() }
  }

  // Step 1: probe the email → find out whether to set or enter a password
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { ok, data } = await post({ email })
      if (data.needsSetup) setStep('setup')
      else if (data.needsPassword) setStep('password')
      else if (!ok) setError(data.error || 'Something went wrong')
    } catch {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: create password (first login) or enter it (returning)
  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (step === 'setup') {
      if (password.length < 12) { setError('Use at least 12 characters'); return }
      if (password !== confirmPw) { setError("Passwords don't match"); return }
    }
    setLoading(true)
    try {
      const { ok, data } = await post(step === 'setup' ? { email, password, mode: 'setup', setupToken } : { email, password })
      if (ok && data.success) setMember(data.member)
      else setError(data.error || 'Something went wrong')
    } catch {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function backToEmail() {
    setStep('email')
    setSetupToken('')
    setPassword('')
    setConfirmPw('')
    setError('')
  }

  async function logout() {
    await fetch('/api/members/session', { method: 'DELETE' })
    setMember(null)
    setEmail('')
    setPassword('')
    setConfirmPw('')
    setStep('email')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center text-neutral-600 text-sm">
        Loading…
      </div>
    )
  }

  // ── Login screen ──
  if (!member) {
    const inputCls = "w-full px-4 py-3.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 text-[15px] outline-none focus:border-sky-500 mb-4"
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4"
        >
        <form onSubmit={step === 'email' ? handleEmail : handlePassword}
          className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-8 md:p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: '#0284c7', fontFamily: 'Space Grotesk, sans-serif' }}>
            FW
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {step === 'setup' ? 'Create your password' : 'Founders Wing Members'}
          </h1>
          <p className="text-[13px] text-neutral-500 mb-8">
            {step === 'email' && 'Enter the email you joined with to access your member area.'}
            {step === 'setup' && 'First time here — set a password for your account. You\'ll use it every time you log in.'}
            {step === 'password' && <>Welcome back — enter the password for <span className="text-neutral-700">{email}</span></>}
          </p>

          {step === 'email' && (
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" required autoFocus className={inputCls} />
          )}
          {step === 'setup' && (
            <>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 12 characters)" required autoFocus className={inputCls} />
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Confirm password" required className={inputCls} />
            </>
          )}
          {step === 'password' && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password" required autoFocus className={inputCls} />
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70"
            style={{ background: '#0284c7' }}>
            {loading ? 'Checking…' : step === 'email' ? 'Continue' : step === 'setup' ? 'Set password & enter' : 'Enter'}
          </button>
          {error && <p className="text-red-600 text-xs mt-3">{error}</p>}

          {step !== 'email' ? (
            <button type="button" onClick={backToEmail} className="text-[12px] text-neutral-500 hover:text-neutral-900 mt-6">
              ← Use a different email
            </button>
          ) : (
            <p className="text-[11px] text-neutral-400 mt-6">
              First login or forgot your password? Ask Prithal on WhatsApp for a private setup link.
            </p>
          )}
        </form>
      </div>
    )
  }

  return <MemberDashboard member={member} onLogout={logout} />
}


/* The members' area is only the path board: where everyone is, from first idea to a
   business that grows with AI. Members can't edit anything here; the team moves
   markers from /team/members after each call. */
function MemberDashboard({ member, onLogout }: { member: Member; onLogout: () => void }) {
  const isFounding = !!member.member_no && member.member_no <= COHORT_1_SIZE
  const [journey, setJourney] = useState<JourneyData | null>(null)
  const [failed, setFailed] = useState(false)

  const loadJourney = useCallback(async () => {
    try {
      const r = await fetch('/api/members/journey')
      if (r.ok) setJourney(await r.json())
      else setFailed(true)
    } catch { setFailed(true) }
  }, [])

  useEffect(() => { loadJourney() }, [loadJourney])

  return (
    <PathShell who={member.plan === 'team' ? 'Team view' : `${firstName(member.full_name)} · ${isFounding ? 'Founding member' : 'Member'}${member.member_no ? ` #${member.member_no}` : ''}`} onLogout={onLogout}>
      {journey ? <PathBoard data={journey} /> : failed ? (
        <div className="bg-white border border-[#e6e8ef] rounded-2xl p-6 text-center">
          <p className="text-[17px] font-semibold">Couldn&apos;t load the path</p>
          <button onClick={() => { setFailed(false); loadJourney() }} className="mt-3 rounded-full bg-[#1d3fbf] text-white px-5 py-2 text-[14px] font-semibold">Try again</button>
        </div>
      ) : (
        <div className="space-y-3"><Skeleton className="h-40" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      )}
    </PathShell>
  )
}
