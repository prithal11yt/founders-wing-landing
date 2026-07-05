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

type Bio = {
  occupation: string | null
  location: string | null
  link: string | null
  how_i_help: string | null
  need_help_with: string | null
  stage: string | null
  industry: string | null
  tools: string | null
  skills: string[] | null
  open_to: string[] | null
}

type Profile = (Bio & {
  what_building: string
  who_its_for: string | null
  problem: string | null
}) | null

type DirectoryMember = Bio & {
  name: string
  member_no: number
  isFounding: boolean
  isMe: boolean
  hasProfile: boolean
}

const STAGE_OPTIONS = ['Idea', 'Building MVP', 'Launched', 'Making revenue', 'Scaling']
const SKILL_OPTIONS = ['Marketing', 'Sales', 'Dev', 'Design', 'AI / Automation', 'Fundraising', 'Content', 'Product', 'Ops', 'Finance']
const OPEN_TO_OPTIONS = ['Advising', 'Partnerships', 'Collaborations', 'Hiring', 'Just here to learn']

type Goal = {
  id: string
  member_email: string
  member_name: string | null
  goal: string
  community_ask: string | null
  status: string
  created_at: string
  profile: Profile
}

type WingsData = {
  me: { monthly: number; lifetime: number; givenThisMonth: number; remainingToGive: number; allowance: number }
  leaderboard: { name: string; member_no: number | null; isMe: boolean; monthly: number; lifetime: number }[]
  giveTargets: { email: string; name: string }[]
}

type GoalStats = { total: number; achieved: number; in_progress: number; missed: number }
type DashboardData = {
  personal: { wings_month: number; wings_lifetime: number; goals: GoalStats; attended: number; total_calls: number }
  community: {
    total_members: number; participated_this_week: number; profiles_shared: number
    goals: GoalStats; wings_given_month: number; total_calls: number
  }
}

type HelpAsk = {
  id: string
  type: 'weekly' | 'ongoing'
  owner_name: string
  owner_no: number
  text: string
  created_at: string
  isMine: boolean
  iOffered: boolean
  helpers: string[]
}

const planLabel = (p: string) => (p === 'annual' ? 'Annual · 12 months' : p === 'starter' ? 'Starter · 6 months' : p)

// "2h ago" style timestamps for feed-like surfaces
function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-white/[0.04] ${className || ''}`} />
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
    </div>
  )
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  in_progress: { label: 'In progress', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  achieved: { label: 'Achieved ✅', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  missed: { label: 'Missed', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

const firstName = (name?: string | null) => (name || 'Founder').split(' ')[0]

// Turn a user-entered link into a safe absolute URL (handles bare domains and @handles).
function normalizeUrl(raw: string): string {
  const s = raw.trim()
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('@')) return `https://x.com/${s.slice(1)}`
  return `https://${s}`
}

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

  const [profile, setProfile] = useState<Profile>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [mine, setMine] = useState<Goal[]>([])
  const [feed, setFeed] = useState<Goal[]>([])
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [view, setView] = useState<'dashboard' | 'feed' | 'help' | 'members' | 'community'>('dashboard')
  const [helpAsks, setHelpAsks] = useState<HelpAsk[] | null>(null)
  const [directory, setDirectory] = useState<DirectoryMember[] | null>(null)
  const [attendance, setAttendance] = useState<{
    latestCall: { id: string; title: string; call_date: string } | null
    attendedLatest: boolean
    canMark: boolean
    isUpcoming: boolean
    attendedCount: number
    totalCalls: number
  } | null>(null)
  const [wings, setWings] = useState<WingsData | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      const r = await fetch('/api/members/profile')
      if (r.ok) { const d = await r.json(); setProfile(d.profile) }
    } finally {
      setLoadingProfile(false)
    }
  }, [])

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

  const loadAttendance = useCallback(async () => {
    try {
      const r = await fetch('/api/members/attendance')
      if (r.ok) setAttendance(await r.json())
    } catch { /* ignore */ }
  }, [])

  const loadWings = useCallback(async () => {
    try {
      const r = await fetch('/api/members/wings')
      if (r.ok) setWings(await r.json())
    } catch { /* ignore */ }
  }, [])

  const loadDirectory = useCallback(async () => {
    try {
      const r = await fetch('/api/members/directory')
      if (r.ok) { const d = await r.json(); setDirectory(d.directory || []) }
    } catch { /* ignore */ }
  }, [])

  const loadDashboard = useCallback(async () => {
    try {
      const r = await fetch('/api/members/dashboard')
      if (r.ok) setDashboard(await r.json())
    } catch { /* ignore */ }
  }, [])

  const loadHelpBoard = useCallback(async () => {
    try {
      const r = await fetch('/api/members/helpboard')
      if (r.ok) { const d = await r.json(); setHelpAsks(d.asks || []) }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadProfile(); loadGoals(); loadAttendance(); loadWings(); loadDirectory(); loadDashboard(); loadHelpBoard() }, [loadProfile, loadGoals, loadAttendance, loadWings, loadDirectory, loadDashboard, loadHelpBoard])

  async function offerHelp(askId: string) {
    // optimistic: mark offered immediately
    setHelpAsks((asks) => (asks || []).map((a) => (a.id === askId ? { ...a, iOffered: true, helpers: [...a.helpers, 'You'] } : a)))
    const r = await fetch('/api/members/helpboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ask_id: askId }),
    })
    if (!r.ok) loadHelpBoard() // roll back to server truth
    else loadHelpBoard()
  }

  async function markAttendance() {
    if (!attendance?.latestCall) return
    const r = await fetch('/api/members/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call_id: attendance.latestCall.id }),
    })
    if (r.ok) loadAttendance()
    else alert('Could not mark attendance. Try again.')
  }

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

  const latestGoal = mine[0] || null
  const checkedInThisWeek = !!latestGoal && Date.now() - new Date(latestGoal.created_at).getTime() < 7 * 86400000
  const openAsksCount = (helpAsks || []).filter((a) => !a.isMine).length

  const NAV = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'feed', icon: '📰', label: 'Feed' },
    { key: 'help', icon: '🙋', label: 'Help Board' },
    { key: 'members', icon: '👥', label: 'Members' },
    { key: 'community', icon: '🌐', label: 'Community' },
  ] as const

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100 lg:flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-white/[0.06] bg-[#080c14] px-4 py-6">
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)', fontFamily: 'Space Grotesk, sans-serif' }}>
            FW
          </div>
          <span className="font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Founders Wing</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setView(n.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] font-medium transition-colors text-left"
              style={{
                color: view === n.key ? '#06b6d4' : '#94a3b8',
                background: view === n.key ? 'rgba(6,182,212,0.10)' : 'transparent',
              }}>
              <span>{n.icon}</span> {n.label}
              {n.key === 'help' && openAsksCount > 0 && (
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{openAsksCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] pt-4 px-2">
          <p className="text-sm font-semibold text-slate-200 truncate">{firstName(member.full_name)}</p>
          <p className="text-[11px] text-slate-500 mb-2">{isFounding ? 'Founding Member' : 'Member'}{member.member_no ? ` #${member.member_no}` : ''}</p>
          <button onClick={onLogout} className="text-xs text-slate-500 hover:text-red-400 transition-colors">Sign out</button>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-white/[0.06] bg-[#080c14] sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)', fontFamily: 'Space Grotesk, sans-serif' }}>
              FW
            </div>
            <span className="font-bold text-[15px]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Founders Wing</span>
          </div>
          <button onClick={onLogout} className="text-xs text-slate-500">Sign out</button>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 pb-28 lg:pb-10">

          {view === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome hero */}
              <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-cyan-500/[0.07] to-transparent p-6 md:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      {isFounding ? 'Founding Member' : 'Member'}{member.member_no ? ` · #${member.member_no}` : ''}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                      Welcome back, {firstName(member.full_name)}
                    </h1>
                  </div>
                  <p className="text-[13px] text-slate-500">{planLabel(member.plan)} · since {joined}</p>
                </div>
              </div>

              {/* This week — status-aware action */}
              {!checkedInThisWeek ? (
                <GoalForm onSubmitted={loadGoals} hasProfile={!!profile} />
              ) : latestGoal && latestGoal.status === 'in_progress' ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">This week&apos;s goal · checked in ✅</p>
                  <p className="text-[15px] text-slate-200 leading-relaxed mb-3">{latestGoal.goal}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] text-slate-500">Done with it? Mark it:</span>
                    {(['achieved', 'missed'] as const).map((s) => (
                      <button key={s} onClick={() => setGoalStatus(latestGoal.id, s)}
                        className="text-[13px] px-3 py-1.5 rounded-md border border-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors">
                        {STATUS_META[s].label.replace(' ✅', '')}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5 text-[15px] text-emerald-300">
                  This week&apos;s goal is wrapped up. New check-in opens with the new week 💪
                </div>
              )}

              {dashboard ? <PersonalStats data={dashboard.personal} /> : <CardsSkeleton />}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {wings ? <WingsCard wings={wings} onGiven={() => { loadWings() }} /> : <Skeleton className="h-64" />}
                {attendance ? <AttendanceCard data={attendance} onMark={markAttendance} /> : <Skeleton className="h-64" />}
              </div>

              {!loadingProfile ? (
                <ProfileCard profile={profile} onSaved={(p) => { setProfile(p); loadDirectory(); loadHelpBoard() }} />
              ) : <Skeleton className="h-40" />}

              {mine.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">My check-ins</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mine.map((g) => <MyGoalCard key={g.id} goal={g} onStatus={setGoalStatus} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'feed' && (
            <div className="space-y-6">
              <GoalForm onSubmitted={loadGoals} hasProfile={!!profile} />
              {loadingGoals ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-44" />)}</div>
              ) : feed.length === 0 ? (
                <p className="text-slate-500 text-sm py-8 text-center">No check-ins shared yet. Be the first!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feed.map((g) => (
                    <FeedGoalCard key={g.id} goal={g} isMe={g.member_email.toLowerCase() === member.email.toLowerCase()} />
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'help' && (
            helpAsks ? <HelpBoard asks={helpAsks} onOffer={offerHelp} /> :
            <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
          )}

          {view === 'members' && (
            directory ? <MemberDirectory members={directory} /> :
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}</div>
          )}

          {view === 'community' && (
            <div className="space-y-6">
              {dashboard ? <CommunityDashboard data={dashboard.community} /> : <CardsSkeleton />}
              {wings ? <Leaderboard rows={wings.leaderboard} /> : <Skeleton className="h-72" />}
            </div>
          )}
        </main>

        {/* ── Mobile bottom nav ── */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#080c14]/95 backdrop-blur border-t border-white/[0.06] flex justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => { setView(n.key); window.scrollTo({ top: 0 }) }}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg"
              style={{ color: view === n.key ? '#06b6d4' : '#64748b' }}>
              <span className="text-lg leading-none">{n.icon}</span>
              <span className="text-[10px] font-medium">{n.label}</span>
              {n.key === 'help' && openAsksCount > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-black flex items-center justify-center">{openAsksCount}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

function HelpBoard({ asks, onOffer }: { asks: HelpAsk[]; onOffer: (id: string) => void }) {
  const weekly = asks.filter((a) => a.type === 'weekly')
  const ongoing = asks.filter((a) => a.type === 'ongoing')

  if (asks.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <p className="text-3xl mb-3">🙋</p>
        <p className="text-slate-300 font-medium mb-1">No open asks yet</p>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Asks come from weekly check-ins and profiles. Add &quot;what I need help with&quot; to your profile and it shows up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.05] px-5 py-4">
        <p className="text-sm text-cyan-200 leading-relaxed">
          See something you can help with? Hit <strong>🙋 I can help</strong> — then ping them on WhatsApp to actually connect. That&apos;s the whole point of this community.
        </p>
      </div>

      {([['This week\'s asks', weekly], ['Ongoing asks', ongoing]] as const).map(([title, list]) =>
        list.length > 0 && (
          <div key={title}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</p>
            <div className="space-y-3">
              {list.map((a) => <HelpAskCard key={a.id} ask={a} onOffer={onOffer} />)}
            </div>
          </div>
        )
      )}
    </div>
  )
}

function HelpAskCard({ ask, onOffer }: { ask: HelpAsk; onOffer: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
      style={ask.isMine ? { borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.04)' } : undefined}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
            {ask.owner_name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-slate-200 truncate">
              {ask.owner_name}{ask.isMine && <span className="text-cyan-400 text-[13px] font-normal"> (you)</span>}
            </p>
            <p className="text-[11px] text-slate-600">{timeAgo(ask.created_at)}</p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-md"
          style={ask.type === 'weekly'
            ? { color: '#facc15', background: 'rgba(250,204,21,0.10)' }
            : { color: '#a78bfa', background: 'rgba(167,139,250,0.10)' }}>
          {ask.type === 'weekly' ? 'This week' : 'Ongoing'}
        </span>
      </div>

      <p className="text-[15px] text-slate-200 leading-relaxed mb-4">{ask.text}</p>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[13px] text-slate-500">
          {ask.helpers.length === 0
            ? 'No one has raised a hand yet'
            : <>🙋 <span className="text-slate-300 font-medium">{ask.helpers.join(', ')}</span> can help</>}
        </p>
        {ask.isMine ? (
          ask.helpers.length > 0
            ? <span className="text-[13px] text-cyan-300">Ping them on WhatsApp 💬</span>
            : <span className="text-[13px] text-slate-600">Your ask</span>
        ) : ask.iOffered ? (
          <span className="text-[13px] text-emerald-400 font-medium">✅ You offered to help — ping them on WhatsApp</span>
        ) : (
          <button onClick={() => onOffer(ask.id)}
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
            🙋 I can help
          </button>
        )}
      </div>
    </div>
  )
}

function WingsCard({ wings, onGiven }: { wings: WingsData; onGiven: () => void }) {
  const { me, giveTargets } = wings
  const [giving, setGiving] = useState(false)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function give(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const r = await fetch('/api/members/wings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_email: to, amount: Number(amount), reason: note }),
      })
      const d = await r.json()
      if (r.ok && d.success) {
        setMsg({ type: 'ok', text: d.bonusAwarded ? 'Sent! 🎉 You gave all 100 — earned a +20 bonus!' : 'Wings sent! 🪽' })
        setTo(''); setAmount(''); setNote('')
        setGiving(false)
        onGiven()
      } else setMsg({ type: 'err', text: d.error || 'Could not send' })
    } catch {
      setMsg({ type: 'err', text: 'Connection failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-amber-500/[0.06] to-transparent p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-amber-300/90 uppercase tracking-wider">Your Wings 🪽</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-3xl font-bold text-amber-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{me.monthly}</p>
          <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">This month</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-200" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{me.lifetime}</p>
          <p className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">Lifetime</p>
        </div>
      </div>

      <div className="rounded-lg bg-white/[0.03] px-3.5 py-2.5 mb-4">
        <p className="text-[13px] text-slate-400">
          <span className="text-amber-400 font-semibold">{me.remainingToGive}</span> of {me.allowance} Wings left to give this month
        </p>
      </div>

      {msg && (
        <p className={`text-sm mb-2 ${msg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>
      )}

      {!giving ? (
        <button onClick={() => setGiving(true)} disabled={me.remainingToGive <= 0}
          className="w-full py-3 rounded-xl text-[15px] font-semibold border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {me.remainingToGive <= 0 ? 'All Wings given this month 🎉' : 'Give Wings to a member'}
        </button>
      ) : (
        <form onSubmit={give} className="space-y-2.5">
          <select value={to} onChange={(e) => setTo(e.target.value)} required
            className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-amber-500/40">
            <option value="">Choose a member…</option>
            {giveTargets.map((t) => <option key={t.email} value={t.email}>{t.name}</option>)}
          </select>
          <input type="number" min={1} max={me.remainingToGive} value={amount} onChange={(e) => setAmount(e.target.value)} required
            placeholder={`Amount (max ${me.remainingToGive})`}
            className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-amber-500/40" />
          <input value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Why? (optional — e.g. helped me debug)"
            className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-amber-500/40" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-70"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#f5a524)' }}>
              {saving ? 'Sending…' : 'Send Wings'}
            </button>
            <button type="button" onClick={() => { setGiving(false); setMsg(null) }} className="px-3 py-2 rounded-lg text-sm text-slate-400 border border-white/[0.06]">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function MemberDirectory({ members }: { members: DirectoryMember[] }) {
  const filled = members.filter((m) => m.hasProfile).length
  return (
    <div>
      <p className="text-[13px] text-slate-500 mb-4 px-1">
        {members.length} members · {filled} have shared their bio. This is who&apos;s in the room 👋
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((m) => (
          <div key={m.member_no}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3"
            style={{ background: m.isMe ? 'rgba(6,182,212,0.05)' : undefined }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
                {firstName(m.name)[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-slate-100 truncate">
                  {firstName(m.name)}{m.isMe && <span className="text-cyan-400 text-[13px] font-normal"> (you)</span>}
                </p>
                <p className="text-[12px] text-slate-500">
                  {m.isFounding ? 'Founding Member' : 'Member'} #{m.member_no}
                </p>
              </div>
            </div>

            {m.hasProfile ? (
              <>
                <GoalRow label="What they do" value={m.occupation} />
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {m.location && <p className="text-[13px] text-slate-400">📍 {m.location}</p>}
                  {m.stage && <p className="text-[13px] text-slate-400">🚀 {m.stage}</p>}
                  {m.industry && <p className="text-[13px] text-slate-400">🏷️ {m.industry}</p>}
                </div>
                <ChipList label="Skills" items={m.skills} />
                <GoalRow label="Can help with" value={m.how_i_help} />
                <GoalRow label="Needs help with" value={m.need_help_with} />
                <ChipList label="Open to" items={m.open_to} />
                <GoalRow label="Tools" value={m.tools} />
                {m.link && (
                  <a href={normalizeUrl(m.link)} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] text-cyan-400 hover:text-cyan-300 font-medium">
                    🔗 Connect
                  </a>
                )}
              </>
            ) : (
              <p className="text-[13px] text-slate-600 italic">Profile coming soon</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <p className="text-3xl font-bold leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif', color: accent || '#f1f5f9' }}>{value}</p>
      <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mt-2">{label}</p>
      {sub && <p className="text-[12px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function GoalStatusBar({ stats }: { stats: GoalStats }) {
  const total = stats.total || 1
  const seg = [
    { label: 'Achieved', n: stats.achieved, color: '#10b981' },
    { label: 'In progress', n: stats.in_progress, color: '#facc15' },
    { label: 'Missed', n: stats.missed, color: '#ef4444' },
  ]
  return (
    <div>
      <div className="flex h-3.5 rounded-full overflow-hidden bg-white/[0.04]">
        {seg.map((s) => s.n > 0 && <div key={s.label} style={{ width: `${(s.n / total) * 100}%`, background: s.color }} />)}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
        {seg.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-[13px] text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /> {s.label}
            <span className="text-slate-500 font-semibold">{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PersonalStats({ data }: { data: DashboardData['personal'] }) {
  const g = data.goals
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Wings this month" value={data.wings_month} accent="#f59e0b" sub={`${data.wings_lifetime} lifetime`} />
        <StatCard label="Goals set" value={g.total} />
        <StatCard label="Goals achieved" value={g.achieved} accent="#10b981" />
        <StatCard label="Calls attended" value={`${data.attended}/${data.total_calls}`} accent="#06b6d4" />
      </div>
      {g.total > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Your goal progress</p>
          <GoalStatusBar stats={g} />
        </div>
      )}
    </div>
  )
}

function CommunityDashboard({ data }: { data: DashboardData['community'] }) {
  const pct = data.total_members ? Math.round((data.participated_this_week / data.total_members) * 100) : 0
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Members" value={data.total_members} />
        <StatCard label="Active this week" value={data.participated_this_week} accent="#06b6d4" sub={`${pct}% of members`} />
        <StatCard label="Profiles shared" value={data.profiles_shared} />
        <StatCard label="Wings given · month" value={data.wings_given_month} accent="#f59e0b" />
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Participation this week</p>
          <p className="text-[13px] text-slate-500">{data.participated_this_week} of {data.total_members}</p>
        </div>
        <div className="h-3.5 rounded-full bg-white/[0.04] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#0891b2,#06b6d4)' }} />
        </div>
      </div>

      {data.goals.total > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Community goals</p>
          <GoalStatusBar stats={data.goals} />
        </div>
      )}
    </div>
  )
}

function Leaderboard({ rows }: { rows: WingsData['leaderboard'] }) {
  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`)
  const allZero = rows.every((r) => r.monthly === 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1 gap-2">
        <p className="text-[13px] text-slate-500">Ranked by Wings this month · resets monthly</p>
        <p className="text-[13px] text-slate-500 whitespace-nowrap">🏆 #1 wins FW merch</p>
      </div>
      {allZero && (
        <p className="text-[13px] text-slate-500 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3.5 py-2.5 mb-3">
          No Wings given yet this month — be the first to recognise someone who helped you.
        </p>
      )}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        {rows.map((r, i) => (
          <div key={`${r.name}-${i}`}
            className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-0"
            style={{ background: r.isMe ? 'rgba(6,182,212,0.06)' : 'transparent' }}>
            <span className="w-8 text-center text-base font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: i < 3 ? '#f59e0b' : '#64748b' }}>
              {medal(i)}
            </span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
              {firstName(r.name)[0]?.toUpperCase()}
            </div>
            <span className="flex-1 text-[15px] text-slate-200 font-medium truncate">
              {firstName(r.name)}{r.isMe && <span className="text-cyan-400 text-[13px] font-normal"> (you)</span>}
            </span>
            <div className="text-right shrink-0">
              <span className="text-base font-bold text-amber-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{r.monthly}</span>
              <span className="hidden sm:inline text-[13px] text-slate-600 ml-2">({r.lifetime} lifetime)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AttendanceCard({ data, onMark }: {
  data: {
    latestCall: { id: string; title: string; call_date: string } | null
    attendedLatest: boolean; canMark: boolean; isUpcoming: boolean; attendedCount: number; totalCalls: number
  }
  onMark: () => void
}) {
  const { latestCall, attendedLatest, canMark, isUpcoming, attendedCount, totalCalls } = data
  const callDate = latestCall
    ? new Date(latestCall.call_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Calls</p>
        <p className="text-sm text-slate-400">
          <span className="text-cyan-400 font-semibold">{attendedCount}</span>/{totalCalls} attended
        </p>
      </div>

      {!latestCall ? (
        <p className="text-[15px] text-slate-500">No calls scheduled yet. Your first session is coming soon.</p>
      ) : (
        <div>
          {isUpcoming && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-300 bg-amber-500/12 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Upcoming
            </span>
          )}
          <p className="text-lg font-semibold text-slate-100 leading-snug">{latestCall.title}</p>
          <p className="text-sm text-slate-500 mt-1 mb-4">{callDate}</p>
          {attendedLatest ? (
            <div className="flex items-center gap-2 text-[15px] text-emerald-400 font-medium">
              <span className="text-lg">✅</span> You marked attendance
            </div>
          ) : isUpcoming ? (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-[13px] text-slate-400 leading-relaxed">
              Mark yourself present once the call happens — the button unlocks on the day.
            </div>
          ) : canMark ? (
            <button onClick={onMark}
              className="w-full py-3.5 rounded-xl text-white text-base font-semibold active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
              I attended this call
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}

function ProfileCard({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const [editing, setEditing] = useState(!profile)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState({
    what_building: profile?.what_building || '',
    who_its_for: profile?.who_its_for || '',
    problem: profile?.problem || '',
    occupation: profile?.occupation || '',
    location: profile?.location || '',
    link: profile?.link || '',
    how_i_help: profile?.how_i_help || '',
    need_help_with: profile?.need_help_with || '',
    stage: profile?.stage || '',
    industry: profile?.industry || '',
    tools: profile?.tools || '',
  })
  const [skills, setSkills] = useState<string[]>(profile?.skills || [])
  const [openTo, setOpenTo] = useState<string[]>(profile?.open_to || [])

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })
  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const r = await fetch('/api/members/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, skills, open_to: openTo }),
      })
      const d = await r.json()
      if (r.ok && d.success) { onSaved(d.profile); setEditing(false) }
      else setErr(d.error || 'Could not save')
    } catch {
      setErr('Connection failed')
    } finally {
      setSaving(false)
    }
  }

  if (!editing && profile) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Your Profile</p>
          <button onClick={() => setEditing(true)} className="text-[13px] text-cyan-400 hover:text-cyan-300">Edit</button>
        </div>
        <GoalRow label="What you do" value={profile.occupation} />
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {profile.location && <p className="text-[15px] text-slate-300">📍 {profile.location}</p>}
          {profile.stage && <p className="text-[15px] text-slate-300">🚀 {profile.stage}</p>}
          {profile.industry && <p className="text-[15px] text-slate-300">🏷️ {profile.industry}</p>}
        </div>
        <ChipList label="Skills" items={profile.skills} />
        <div className="h-px bg-white/[0.06]" />
        <GoalRow label="Building / exploring" value={profile.what_building} />
        <GoalRow label="Who it's for" value={profile.who_its_for} />
        <GoalRow label="Problem" value={profile.problem} />
        <div className="h-px bg-white/[0.06]" />
        <GoalRow label="How I can help" value={profile.how_i_help} />
        <GoalRow label="I need help with" value={profile.need_help_with} />
        <ChipList label="Open to" items={profile.open_to} />
        <GoalRow label="Tools I swear by" value={profile.tools} />
        {profile.link && (
          <a href={normalizeUrl(profile.link)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] text-cyan-400 hover:text-cyan-300 font-medium">
            🔗 My link
          </a>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-5 space-y-3">
      <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
        {profile ? 'Edit your profile' : 'Set up your profile'}
      </p>
      <p className="text-[11px] text-slate-500 mb-2">
        Set this once and edit anytime. Your bio shows in the Members directory; your project shows in What Everyone&apos;s Building.
      </p>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pt-1">About you</p>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">What you do currently</label>
        <input value={f.occupation} onChange={set('occupation')} type="text"
          placeholder="e.g. Run a D2C skincare brand · SWE at Razorpay · Freelance designer"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Where you&apos;re from</label>
        <input value={f.location} onChange={set('location')} type="text"
          placeholder="e.g. Bangalore"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Your link (optional)</label>
        <input value={f.link} onChange={set('link')} type="text"
          placeholder="Twitter, LinkedIn, website, or business link"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Stage</label>
          <select value={f.stage} onChange={set('stage')}
            className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40">
            <option value="">Select…</option>
            {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Industry / niche</label>
          <input value={f.industry} onChange={set('industry')} type="text"
            placeholder="e.g. SaaS, D2C"
            className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40" />
        </div>
      </div>
      <ChipSelect label="Your skills" options={SKILL_OPTIONS} selected={skills} onToggle={(v) => toggle(skills, setSkills, v)} />
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pt-2">Your project</p>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">What I&apos;m building or exploring *</label>
        <textarea value={f.what_building} onChange={set('what_building')} required rows={2}
          placeholder="e.g. A B2B SaaS tool for automating invoicing…"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Who it is for</label>
        <textarea value={f.who_its_for} onChange={set('who_its_for')} rows={2}
          placeholder="e.g. SaaS founders and product teams…"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">The problem I think they have</label>
        <textarea value={f.problem} onChange={set('problem')} rows={2}
          placeholder="e.g. Balancing AI capability with reliability…"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none" />
      </div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pt-2">Helping each other</p>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">How I can help others</label>
        <textarea value={f.how_i_help} onChange={set('how_i_help')} rows={2}
          placeholder="e.g. I can help with paid ads, cold email, and hiring…"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">What I need help with right now</label>
        <textarea value={f.need_help_with} onChange={set('need_help_with')} rows={2}
          placeholder="e.g. Looking for beta testers and intros to D2C founders…"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none" />
      </div>
      <ChipSelect label="Open to" options={OPEN_TO_OPTIONS} selected={openTo} onToggle={(v) => toggle(openTo, setOpenTo, v)} />
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">Tools I swear by (optional)</label>
        <input value={f.tools} onChange={set('tools')} type="text"
          placeholder="e.g. Claude, n8n, Framer, Notion"
          className="w-full px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-cyan-500/40" />
      </div>
      {err && <p className="text-red-400 text-xs">{err}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-70"
          style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {profile && (
          <button type="button" onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 border border-white/[0.06]">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function GoalForm({ onSubmitted, hasProfile }: { onSubmitted: () => void; hasProfile: boolean }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [f, setF] = useState({ goal: '', community_ask: '' })

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
        setF({ goal: '', community_ask: '' })
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
        className="w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.08] hover:bg-cyan-500/[0.14] transition-colors p-6 text-left flex items-center justify-between group">
        <div>
          <p className="text-lg font-semibold text-cyan-300">Set this week&apos;s goal 🎯</p>
          <p className="text-sm text-slate-500 mt-1">Just your 7-day target and a question for the group — takes 20 seconds.</p>
        </div>
        <span className="text-cyan-400 text-2xl group-hover:translate-x-0.5 transition-transform">+</span>
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-100">Set this week&apos;s goal</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
      </div>
      {!hasProfile && (
        <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          Tip: add your project in the &quot;Your Project&quot; card on the left first, so the group has context for this goal.
        </p>
      )}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">My goal for the next 7 days <span className="text-cyan-400">*</span></label>
        <textarea value={f.goal} onChange={set('goal')} required rows={2}
          placeholder="e.g. Validate backend feasibility of 2 core ideas…"
          className="w-full px-3.5 py-2.5 bg-[#06090f] border border-white/[0.06] rounded-xl text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">One specific ask from the community</label>
        <textarea value={f.community_ask} onChange={set('community_ask')} rows={2}
          placeholder="e.g. What's your biggest bottleneck adopting AI?"
          className="w-full px-3.5 py-2.5 bg-[#06090f] border border-white/[0.06] rounded-xl text-slate-100 text-sm outline-none focus:border-cyan-500/40 resize-none" />
      </div>
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
    <span className="inline-flex px-3 py-1.5 rounded-md text-xs font-semibold" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
  )
}

function GoalRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-1">{label}</p>
      <p className="text-[15px] text-slate-200 leading-relaxed">{value}</p>
    </div>
  )
}

// Read-only tag list (skills, open-to) — renders nothing when empty.
function ChipList({ label, items }: { label: string; items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="px-2.5 py-1 rounded-md text-[12px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}

// Multi-select tag picker used in the profile form.
function ChipSelect({ label, options, selected, onToggle }: {
  label: string; options: string[]; selected: string[]; onToggle: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o)
          return (
            <button key={o} type="button" onClick={() => onToggle(o)}
              className="px-2.5 py-1 rounded-md text-[12px] font-medium border transition-colors"
              style={{
                background: on ? 'rgba(6,182,212,0.15)' : 'transparent',
                color: on ? '#67e8f9' : '#64748b',
                borderColor: on ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.08)',
              }}>
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MyGoalCard({ goal, onStatus }: { goal: Goal; onStatus: (id: string, status: string) => void }) {
  const date = new Date(goal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-slate-400 font-medium">Week of {date}</span>
        <StatusPill status={goal.status} />
      </div>
      <GoalRow label="7-day goal" value={goal.goal} />
      <GoalRow label="Ask from the group" value={goal.community_ask} />
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <span className="text-[13px] text-slate-500">Mark as:</span>
        {(['in_progress', 'achieved', 'missed'] as const).map((s) => (
          <button key={s} onClick={() => onStatus(goal.id, s)}
            className="text-[13px] px-3 py-1.5 rounded-md border transition-colors"
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
  const date = timeAgo(goal.created_at)
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
            {firstName(goal.member_name)[0]?.toUpperCase()}
          </div>
          <span className="text-[15px] font-semibold text-slate-200 truncate">
            {firstName(goal.member_name)}{isMe && <span className="text-cyan-400 text-[13px] font-normal"> (you)</span>}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] text-slate-600">{date}</span>
          <StatusPill status={goal.status} />
        </div>
      </div>
      {goal.profile?.what_building && (
        <p className="text-sm text-slate-400 italic leading-relaxed">
          Building: {goal.profile.what_building}
        </p>
      )}
      <GoalRow label="7-day goal" value={goal.goal} />
      <GoalRow label="Ask from the group" value={goal.community_ask} />
    </div>
  )
}
