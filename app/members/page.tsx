'use client'

import { useEffect, useState } from 'react'

type Member = {
  id: string
  full_name: string
  email: string
  plan: string
  created_at: string
  member_no: number | null
}

const planLabel = (p: string) => (p === 'annual' ? 'Annual · 12 months' : p === 'starter' ? 'Starter · 6 months' : p)

export default function MembersPortal() {
  const [checking, setChecking] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/members/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.authenticated) setMember(d.member) })
      .finally(() => setChecking(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/members/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await r.json()
      if (r.ok && d.success) setMember(d.member)
      else setError(d.error || 'Something went wrong')
    } catch {
      setError('Connection failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await fetch('/api/members/session', { method: 'DELETE' })
    setMember(null)
    setEmail('')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center text-slate-400 text-sm">
        Loading…
      </div>
    )
  }

  // ── Login screen ──
  if (!member) {
    return (
      <div className="min-h-screen bg-[#06090f] flex items-center justify-center px-4"
        style={{ background: 'radial-gradient(ellipse at center, #0c1a2a 0%, #06090f 70%)' }}>
        <form onSubmit={handleLogin}
          className="w-full max-w-md bg-[#111827] border border-white/[0.06] rounded-3xl p-8 md:p-10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold"
            style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)', fontFamily: 'Space Grotesk, sans-serif' }}>
            FW
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Founders Wing Members
          </h1>
          <p className="text-[13px] text-slate-500 mb-8">
            Enter the email you joined with to access your member area.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            className="w-full px-4 py-3.5 bg-[#06090f] border border-white/[0.06] rounded-xl text-slate-100 text-[15px] outline-none focus:border-cyan-500/40 mb-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
            {loading ? 'Checking…' : 'Enter'}
          </button>
          {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
          <p className="text-[11px] text-slate-600 mt-6">
            No password needed. We match your email against paid members.
          </p>
        </form>
      </div>
    )
  }

  // ── Member dashboard ──
  const joined = new Date(member.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  // Members 1–19 (inclusive) are Founding Members; everyone after is a regular member.
  const isFounding = !!member.member_no && member.member_no <= 19

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)', fontFamily: 'Space Grotesk, sans-serif' }}>
              FW
            </div>
            <span className="font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Founders Wing</span>
          </div>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Sign out
          </button>
        </div>

        {/* Welcome */}
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-cyan-500/[0.07] to-transparent p-6 md:p-8 mb-6">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            {isFounding ? 'Founding Member' : 'Member'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back, {member.full_name?.split(' ')[0] || 'Founder'}
          </h1>
          {member.member_no && (
            <p className="text-slate-400 text-sm">
              {isFounding ? (
                <>You&apos;re Founding Member <span className="text-cyan-400 font-semibold">#{member.member_no}</span></>
              ) : (
                <>You&apos;re Member <span className="text-cyan-400 font-semibold">#{member.member_no}</span></>
              )}
            </p>
          )}
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Your Plan</p>
            <p className="text-base font-semibold">{planLabel(member.plan)}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Member Since</p>
            <p className="text-base font-semibold">{joined}</p>
          </div>
        </div>

        {/* Coming soon: gamified dashboard */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-slate-300 font-medium mb-1">Your Wings dashboard is on the way 🪽</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Track your weekly goals, mark attendance for live sessions, earn Wings, and climb the monthly
            leaderboard. Launching here soon.
          </p>
        </div>
      </div>
    </div>
  )
}
