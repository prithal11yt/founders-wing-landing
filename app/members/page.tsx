'use client'

import { useEffect, useState, useCallback } from 'react'

type Member = {
  id: string
  full_name: string
  email: string
  plan: string
  created_at: string
  member_no: number | null
}

type Goal = {
  id: string
  member_email: string
  member_name: string | null
  what_building: string
  who_its_for: string | null
  problem: string | null
  goal: string
  community_ask: string | null
  status: string
  created_at: string
}

const planLabel = (p: string) => (p === 'annual' ? 'Annual · 12 months' : p === 'starter' ? 'Starter · 6 months' : p)

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  in_progress: { label: 'In progress', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  achieved: { label: 'Achieved ✅', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  missed: { label: 'Missed', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

const firstName = (name?: string | null) => (name || 'Founder').split(' ')[0]

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

  return <MemberDashboard member={member} onLogout={logout} />
}

function MemberDashboard({ member, onLogout }: { member: Member; onLogout: () => void }) {
  const joined = new Date(member.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const isFounding = !!member.member_no && member.member_no <= 19

  const [mine, setMine] = useState<Goal[]>([])
  const [feed, setFeed] = useState<Goal[]>([])
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [tab, setTab] = useState<'mine' | 'community'>('mine')

  const loadGoals = useCallback(async () => {
    try {
      const r = await fetch('/api/members/goals')
      if (r.ok) {
        const d = await r.json()
        setMine(d.mine || [])
        setFeed(d.feed || [])
      }
    } finally {
      setLoadingGoals(false)
    }
  }, [])

  useEffect(() => { loadGoals() }, [loadGoals])

  async function setGoalStatus(id: string, status: string) {
    const prev = mine
    setMine((gs) => gs.map((g) => (g.id === id ? { ...g, status } : g)))
    const r = await fetch('/api/members/goals', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!r.ok) { setMine(prev); alert('Could not update status. Try again.') }
    else loadGoals()
  }

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
          <button onClick={onLogout} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Sign out
          </button>
        </div>

        {/* Welcome */}
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-cyan-500/[0.07] to-transparent p-6 md:p-8 mb-6">
          <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            {isFounding ? 'Founding Member' : 'Member'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back, {firstName(member.full_name)}
          </h1>
          {member.member_no && (
            <p className="text-slate-400 text-sm">
              {isFounding
                ? <>You&apos;re Founding Member <span className="text-cyan-400 font-semibold">#{member.member_no}</span></>
                : <>You&apos;re Member <span className="text-cyan-400 font-semibold">#{member.member_no}</span></>}
            </p>
          )}
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Your Plan</p>
            <p className="text-base font-semibold">{planLabel(member.plan)}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5">Member Since</p>
            <p className="text-base font-semibold">{joined}</p>
          </div>
        </div>

        {/* Weekly goal submission */}
        <GoalForm onSubmitted={loadGoals} />

        {/* Tabs: mine / community */}
        <div className="flex items-center gap-1 mb-4 mt-8 border-b border-white/[0.06]">
          {([['mine', 'My Goals'], ['community', "What Everyone's Building"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className="px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={{ color: tab === k ? '#06b6d4' : '#64748b' }}>
              {label}
              {tab === k && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />}
            </button>
          ))}
        </div>

        {loadingGoals ? (
          <p className="text-slate-500 text-sm py-8 text-center">Loading…</p>
        ) : tab === 'mine' ? (
          mine.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">
              You haven&apos;t set a weekly goal yet. Add one above to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {mine.map((g) => <MyGoalCard key={g.id} goal={g} onStatus={setGoalStatus} />)}
            </div>
          )
        ) : (
          feed.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No goals shared yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {feed.map((g) => <FeedGoalCard key={g.id} goal={g} isMe={g.member_email.toLowerCase() === member.email.toLowerCase()} />)}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function GoalForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState({ what_building: '', who_its_for: '', problem: '', goal: '', community_ask: '' })

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const r = await fetch('/api/members/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      })
      const d = await r.json()
      if (r.ok && d.success) {
        setF({ what_building: '', who_its_for: '', problem: '', goal: '', community_ask: '' })
        setOpen(false)
        onSubmitted()
      } else setErr(d.error || 'Could not save')
    } catch {
      setErr('Connection failed')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.08] hover:bg-cyan-500/[0.14] transition-colors p-5 text-left flex items-center justify-between group">
        <div>
          <p className="text-sm font-semibold text-cyan-300">Set this week&apos;s goal 🎯</p>
          <p className="text-xs text-slate-500 mt-0.5">Share what you&apos;re building and your 7-day target with the group.</p>
        </div>
        <span className="text-cyan-400 text-xl group-hover:translate-x-0.5 transition-transform">+</span>
      </button>
    )
  }

  const fields: { key: keyof typeof f; label: string; placeholder: string; required?: boolean }[] = [
    { key: 'what_building', label: "What I'm building or exploring", placeholder: 'e.g. A B2B SaaS tool for automating invoicing…', required: true },
    { key: 'who_its_for', label: 'Who it is for', placeholder: 'e.g. SaaS founders and product teams…' },
    { key: 'problem', label: 'The problem I think they have', placeholder: 'e.g. Balancing AI capability with reliability…' },
    { key: 'goal', label: 'My goal for the next 7 days', placeholder: 'e.g. Validate backend feasibility of 2 core ideas…', required: true },
    { key: 'community_ask', label: 'One specific ask from the community', placeholder: "e.g. What's your biggest bottleneck adopting AI?" },
  ]

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-100">Set this week&apos;s goal</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
      </div>
      {fields.map((fld) => (
        <div key={fld.key}>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            {fld.label}{fld.required && <span className="text-cyan-400"> *</span>}
          </label>
          <textarea
            value={f[fld.key]}
            onChange={set(fld.key)}
            placeholder={fld.placeholder}
            required={fld.required}
            rows={2}
            className="w-full px-3.5 py-2.5 bg-[#06090f] border border-white/[0.06] rounded-xl text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none"
          />
        </div>
      ))}
      {err && <p className="text-red-400 text-xs">{err}</p>}
      <button type="submit" disabled={saving}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
        {saving ? 'Sharing…' : 'Share with the group'}
      </button>
    </form>
  )
}

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.in_progress
  return (
    <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  )
}

function GoalRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
      <p className="text-[13px] text-slate-300 leading-relaxed">{value}</p>
    </div>
  )
}

function MyGoalCard({ goal, onStatus }: { goal: Goal; onStatus: (id: string, status: string) => void }) {
  const date = new Date(goal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">Week of {date}</span>
        <StatusPill status={goal.status} />
      </div>
      <GoalRow label="Building / exploring" value={goal.what_building} />
      <GoalRow label="Who it's for" value={goal.who_its_for} />
      <GoalRow label="Problem" value={goal.problem} />
      <GoalRow label="7-day goal" value={goal.goal} />
      <GoalRow label="Ask from the group" value={goal.community_ask} />
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-slate-500">Mark as:</span>
        {(['in_progress', 'achieved', 'missed'] as const).map((s) => (
          <button key={s} onClick={() => onStatus(goal.id, s)}
            className="text-[11px] px-2.5 py-1 rounded-md border transition-colors"
            style={{
              borderColor: goal.status === s ? STATUS_META[s].color : 'rgba(255,255,255,0.08)',
              color: goal.status === s ? STATUS_META[s].color : '#64748b',
              background: goal.status === s ? STATUS_META[s].bg : 'transparent',
            }}>
            {STATUS_META[s].label.replace(' ✅', '')}
          </button>
        ))}
      </div>
    </div>
  )
}

function FeedGoalCard({ goal, isMe }: { goal: Goal; isMe: boolean }) {
  const date = new Date(goal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
            {firstName(goal.member_name)[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-slate-200">
            {firstName(goal.member_name)}{isMe && <span className="text-cyan-400 text-xs font-normal"> (you)</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600">{date}</span>
          <StatusPill status={goal.status} />
        </div>
      </div>
      <GoalRow label="Building / exploring" value={goal.what_building} />
      <GoalRow label="7-day goal" value={goal.goal} />
      <GoalRow label="Ask from the group" value={goal.community_ask} />
    </div>
  )
}
