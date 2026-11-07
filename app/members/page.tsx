'use client'

import { useEffect, useState, useCallback, useId } from 'react'
import { COHORT_1_SIZE } from '@/lib/cohort'
import { Check, ChevronDown, Hammer, IndianRupee, Lightbulb, Lock, Rocket, Sparkles, Target, Timer, TrendingUp, Users } from 'lucide-react'
import { STAGES, STAGE_PATH, STAGE_TARGET_DAYS } from '@/lib/crm'

type Member = {
  id: string
  full_name: string
  email: string
  plan: string
  created_at: string
  member_no: number | null
}

type JourneyWho = { member_no: number; name: string; isMe: boolean }
type JourneyMember = JourneyWho & {
  isFounding: boolean
  stage: string
  project: string | null
  summary: string | null
  stage_since: string | null
  goal: { goal: string; next_action: string | null; set_on: string | null; due_on: string | null } | null
  goals_achieved: number
}
type JourneyWin = JourneyWho & { kind: 'moved' | 'goal'; from?: string; to?: string; goal?: string; at: string }
type JourneyData = { members: JourneyMember[]; unplaced: JourneyWho[]; wins: JourneyWin[] }

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

/* The members' area is only the Journey board: where everyone is on the path and
   what they're aiming for. Members can't edit anything here; the team updates
   stages and goals from /team/members. */
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
    <div className="min-h-screen bg-[#f6f6f8] text-black" style={{ fontFamily: APPLE_FONT }}>
      <header className="sticky top-0 z-40 bg-[#f6f6f8]/90 backdrop-blur">
        <div className="max-w-xl mx-auto px-4 sm:px-0 py-4 flex items-center justify-between">
          <p className="text-[22px] font-bold tracking-[-0.03em]">Founders Wing</p>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#8e8e93] hidden sm:inline">{firstName(member.full_name)} · {isFounding ? 'Founding member' : 'Member'}{member.member_no ? ` #${member.member_no}` : ''}</span>
            <button onClick={onLogout} className="text-[13px] font-semibold text-[#8e8e93] hover:text-black transition-colors">Sign out</button>
          </div>
        </div>
      </header>
      <main className="px-4 sm:px-6 pt-2 pb-12">
        {journey ? <JourneyBoard data={journey} /> : failed ? (
          <div className="max-w-xl mx-auto bg-white rounded-[24px] p-6 text-center">
            <p className="text-[17px] font-semibold">Couldn&apos;t load the board</p>
            <button onClick={() => { setFailed(false); loadJourney() }} className="mt-3 rounded-full bg-black text-white px-5 py-2 text-[14px] font-semibold">Try again</button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto space-y-3"><Skeleton className="h-11" /><Skeleton className="h-24" /><Skeleton className="h-44" /><Skeleton className="h-36" /></div>
        )}
      </main>
    </div>
  )
}

/* ── Journey board ─────────────────────────────────────────────────────────
   Each member's place on Decide → Build → Launch → Sell (plus the Grow with AI
   lane), styled after Cal AI / Apple Fitness. The page stays black and white;
   only the stage medals change material as members move up (flat grey for
   Decide, then copper, silver, gold, holographic). "You" shows your own day
   count, goal and next step; "Board" shows everyone, best stage first.
   Read-only: the team updates stages and goals after each call. */

const BEST_FIRST = ['grow', 'sell', 'launch', 'build', 'decide']
const STAGE_SHORT: Record<string, string> = { decide: 'Decide', build: 'Build', launch: 'Launch', sell: 'Sell', grow: 'Grow' }
const STAGE_ICON: Record<string, typeof Lightbulb> = { decide: Lightbulb, build: Hammer, launch: Rocket, sell: IndianRupee, grow: Sparkles }
const METAL: Record<string, { bg: string; icon: string; glow: string }> = {
  build: { bg: 'radial-gradient(circle at 34% 28%, #f7d6b4 0%, #c9854a 46%, #874a1c 100%)', icon: '#ffffff', glow: '#a8622a' },
  launch: { bg: 'radial-gradient(circle at 34% 28%, #ffffff 0%, #c8d0d9 46%, #75808d 100%)', icon: '#3b4552', glow: '#7b8794' },
  sell: { bg: 'radial-gradient(circle at 34% 28%, #fff7cf 0%, #eabf2e 46%, #976600 100%)', icon: '#ffffff', glow: '#b8860b' },
  grow: { bg: 'conic-gradient(from 210deg, #c4b5fd, #93c5fd, #99f6e4, #fbcfe8, #fde68a, #c4b5fd)', icon: '#3b0764', glow: '#8b5cf6' },
}
const RING_COLOR: Record<string, string> = { decide: '#c7c7cc', build: '#b06a30', launch: '#6b7785', sell: '#c9971c', grow: 'holo' }
const CARD = 'bg-white rounded-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)]'
const APPLE_FONT = "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, Inter, sans-serif"

const stageMeta = (v?: string | null) => STAGES.find((s) => s.value === v)
const stageLabel = (v?: string | null) => stageMeta(v)?.label ?? v ?? ''
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
const daysSince = (iso: string | null) => (iso ? Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) + 1) : null)
const goalDaysLeft = (g: JourneyMember['goal']) => (g?.due_on ? Math.ceil((new Date(g.due_on + 'T23:59:59').getTime() - Date.now()) / 86400000) : null)
const goalUsed = (g: JourneyMember['goal']) => {
  if (!g?.set_on || !g?.due_on) return 0
  const a = new Date(g.set_on).getTime(), b = new Date(g.due_on).getTime()
  return b > a ? Math.min(1, Math.max(0, (Date.now() - a) / (b - a))) : 1
}
const paceColor = (stage: string, d: number | null) => {
  const t = STAGE_TARGET_DAYS[stage] ?? 30
  if (d == null) return '#aeaeb2'
  return d > t * 2 ? '#ff3b30' : d > t ? '#ff9500' : stage === 'decide' ? '#8e8e93' : '#000000'
}
// What it takes to reach a stage: the milestone of the stage before it.
const unlockFor = (stage: string) => stageMeta(STAGE_PATH[STAGE_PATH.indexOf(stage as typeof STAGE_PATH[number]) - 1])?.milestone ?? ''

function Medal({ stage, size, locked = false }: { stage: string; size: number; locked?: boolean }) {
  const Icon = locked ? Lock : STAGE_ICON[stage] ?? Lightbulb
  const icon = <Icon style={{ width: size * 0.44, height: size * 0.44 }} strokeWidth={2} />
  const base = 'inline-flex items-center justify-center rounded-full shrink-0'
  if (locked) return <span className={base} style={{ width: size, height: size, border: '2px dashed #d1d1d6', color: '#c7c7cc' }}>{icon}</span>
  const m = METAL[stage]
  if (!m) return <span className={base} style={{ width: size, height: size, background: '#f2f2f5', border: '1.5px solid #e5e5ea', color: '#aeaeb2' }}>{icon}</span>
  return (
    <span className={base} style={{
      width: size, height: size, background: m.bg, color: m.icon,
      boxShadow: `inset 0 0 0 ${Math.max(2, size * 0.06)}px rgba(255,255,255,0.55), inset 0 -${size * 0.08}px ${size * 0.16}px rgba(0,0,0,0.18), 0 ${size * 0.12}px ${size * 0.3}px -${size * 0.12}px ${m.glow}`,
    }}>{icon}</span>
  )
}

function Ring({ size, stroke, frac, color, children }: { size: number; stroke: number; frac: number; color: string; children?: React.ReactNode }) {
  const id = useId().replace(/:/g, '')
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <span className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" aria-hidden>
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a78bfa" /><stop offset=".5" stopColor="#60a5fa" /><stop offset="1" stopColor="#f472b6" /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#efeff4" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color === 'holo' ? `url(#${id})` : color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${c * Math.min(1, Math.max(0.02, frac))} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      {children}
    </span>
  )
}

function JourneyBoard({ data }: { data: JourneyData }) {
  const me = data.members.find((m) => m.isMe) || null
  const [view, setView] = useState<'you' | 'board'>(me ? 'you' : 'board')
  return (
    <div className="max-w-xl mx-auto text-black" style={{ fontFamily: APPLE_FONT, letterSpacing: '-0.01em' }}>
      <div className="flex p-1 rounded-full bg-[#ebebef] mb-5">
        {(['you', 'board'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className="flex-1 py-2 rounded-full text-[15px] font-semibold transition-colors"
            style={view === v ? { background: '#ffffff', color: '#000', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : { color: '#8e8e93' }}>
            {v === 'you' ? 'You' : 'Board'}
          </button>
        ))}
      </div>
      {view === 'you' ? <YouView me={me} data={data} /> : <BoardView data={data} />}
      <p className="text-[12px] text-[#aeaeb2] text-center mt-8">The Founders Wing team updates stages and goals after each call.</p>
    </div>
  )
}

function YouView({ me, data }: { me: JourneyMember | null; data: JourneyData }) {
  if (!me) {
    return (
      <div className={`${CARD} p-6 flex items-center gap-4`}>
        <Medal stage="decide" size={56} locked />
        <div>
          <p className="text-[17px] font-semibold">You&apos;re not on the path yet</p>
          <p className="text-[14px] text-[#8e8e93] mt-0.5">Your community manager places you after a short onboarding call, then sets your first 30-day goal with you.</p>
        </div>
      </div>
    )
  }
  const st = me.stage
  const d = daysSince(me.stage_since)
  const target = STAGE_TARGET_DAYS[st] ?? 30
  const at = STAGE_PATH.indexOf(st as typeof STAGE_PATH[number])
  const next = st === 'grow' || at < 0 || at === STAGE_PATH.length - 1 ? null : STAGE_PATH[at + 1]
  const rank = (s: string) => BEST_FIRST.indexOf(s)
  const ahead = data.members.filter((m) => rank(m.stage) < rank(st)).length
  const behind = data.members.filter((m) => rank(m.stage) > rank(st)).length
  const total = data.members.length || 1
  const left = goalDaysLeft(me.goal)
  const moves = data.wins.filter((w) => w.kind === 'moved')

  return (
    <div>
      {/* Stage strip */}
      <div className="flex justify-between">
        {['decide', 'build', 'launch', 'sell', 'grow'].map((s) => {
          const cur = s === st
          const done = st === 'grow' ? s !== 'grow' : s !== 'grow' && STAGE_PATH.indexOf(s as typeof STAGE_PATH[number]) < at
          return (
            <div key={s} className="text-center px-1.5 pt-2 pb-2.5 rounded-[18px]" style={cur ? { background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' } : undefined}>
              <p className="text-[12px] mb-1.5" style={{ color: cur ? '#000' : '#8e8e93', fontWeight: cur ? 600 : 500 }}>{STAGE_SHORT[s]}</p>
              {cur ? <Medal stage={s} size={42} /> : done
                ? <span className="inline-flex items-center justify-center rounded-full" style={{ width: 42, height: 42, border: '2px solid #000' }}><Check className="w-[18px] h-[18px]" strokeWidth={2.5} /></span>
                : <Medal stage={s} size={42} locked />}
            </div>
          )
        })}
      </div>

      {/* Days in stage */}
      <div className={`${CARD} mt-4 p-5 sm:p-6 flex items-center justify-between gap-4`}>
        <div>
          <p className="text-[56px] font-bold leading-none tracking-[-0.04em] tabular-nums" style={{ color: d != null && d > target ? paceColor(st, d) : '#000' }}>{d ?? '—'}</p>
          <p className="text-[13px] text-[#8e8e93] mt-1.5">Days in {stageLabel(st)}</p>
          <span className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-[#f2f2f5] px-2.5 py-1 text-[13px] font-semibold"><Timer className="w-3.5 h-3.5" /> Target {target} days</span>
        </div>
        <Ring size={132} stroke={12} frac={(d ?? 0) / target} color={RING_COLOR[st]}><Medal stage={st} size={66} /></Ring>
      </div>

      {/* Three small cards */}
      <div className="grid grid-cols-3 gap-2.5 mt-3">
        {[
          { v: left == null ? '—' : left < 0 ? `${-left}d late` : `${left}d`, l: 'Goal left', frac: me.goal ? goalUsed(me.goal) : 0, color: '#ff3b30', Icon: Target },
          { v: String(ahead), l: 'Ahead of you', frac: ahead / total, color: '#ff9500', Icon: TrendingUp },
          { v: String(behind), l: 'Behind you', frac: behind / total, color: '#007aff', Icon: Users },
        ].map(({ v, l, frac, color, Icon }) => (
          <div key={l} className={`${CARD} px-3.5 pt-3.5 pb-4`}>
            <p className="text-[22px] font-bold tracking-[-0.03em] tabular-nums">{v}</p>
            <p className="text-[12px] text-[#8e8e93]">{l}</p>
            <div className="flex justify-center mt-3"><Ring size={60} stroke={6} frac={frac} color={color}><Icon className="w-5 h-5" style={{ color }} /></Ring></div>
          </div>
        ))}
      </div>

      {/* Goal */}
      <p className="text-[22px] font-bold tracking-[-0.02em] mt-7 mb-3">Your 30-day goal</p>
      {me.goal ? (
        <div className={`${CARD} px-5 py-[18px]`}>
          <p className="text-[17px] font-semibold leading-snug">{me.goal.goal.charAt(0).toUpperCase() + me.goal.goal.slice(1)}</p>
          {me.goal.next_action && <p className="text-[14px] text-[#8e8e93] mt-1">Next: {me.goal.next_action}</p>}
          <div className="h-2 rounded-full bg-[#efeff4] mt-4 overflow-hidden"><div className="h-full rounded-full bg-black" style={{ width: `${Math.round(goalUsed(me.goal) * 100)}%` }} /></div>
          <div className="flex justify-between text-[13px] text-[#8e8e93] mt-2">
            <span>{me.goal.set_on ? `Set ${shortDate(me.goal.set_on)}` : ''}</span>
            <span>{me.goal.due_on ? `Due ${shortDate(me.goal.due_on)}` : ''}</span>
          </div>
        </div>
      ) : (
        <div className={`${CARD} px-5 py-[18px] text-[15px] text-[#8e8e93]`}>Your community manager sets this with you at your next call.</div>
      )}

      {/* Up next */}
      <p className="text-[22px] font-bold tracking-[-0.02em] mt-7 mb-3">Up next</p>
      <div className={`${CARD} px-5 py-[18px] flex items-center gap-4`}>
        {next ? <Medal stage={next} size={56} locked /> : <Medal stage={st} size={56} />}
        <div className="min-w-0">
          <p className="text-[17px] font-semibold">{next ? stageLabel(next) : st === 'grow' ? 'Keep growing with AI' : 'Top of the path'}</p>
          <p className="text-[14px] text-[#8e8e93] mt-0.5">{next ? unlockFor(next) : `You're ahead of ${behind} members. ${stageMeta(st)?.milestone ?? ''}`}</p>
        </div>
      </div>

      {moves.length > 0 && (
        <>
          <p className="text-[22px] font-bold tracking-[-0.02em] mt-7 mb-3">Moved up this month</p>
          <div className={`${CARD} py-1`}>
            {moves.map((w, i) => (
              <div key={i} className="flex items-center gap-3.5 px-4 py-3" style={i ? { borderTop: '1px solid #f2f2f5' } : undefined}>
                <Medal stage={w.to || 'decide'} size={36} />
                <p className="text-[15px] flex-1 min-w-0"><span className="font-semibold">{w.isMe ? 'You' : w.name}</span> moved up to {stageLabel(w.to)}</p>
                <span className="text-[13px] text-[#8e8e93] shrink-0">{shortDate(w.at)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BoardView({ data }: { data: JourneyData }) {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const by = (s: string) => data.members.filter((m) => m.stage === s)
  return (
    <div>
      {/* Summary */}
      <div className={`${CARD} p-5`}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[44px] font-bold leading-none tracking-[-0.04em] tabular-nums">{data.members.length}</p>
            <p className="text-[13px] text-[#8e8e93] mt-1">Members on the path</p>
          </div>
          <div className="flex">{BEST_FIRST.slice(0, 4).map((s, i) => <span key={s} style={{ marginLeft: i ? -10 : 0 }}><Medal stage={s} size={34} /></span>)}</div>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mt-4">
          {BEST_FIRST.map((s) => by(s).length > 0 && (
            <span key={s} className="h-full" style={{ flex: by(s).length, background: s === 'decide' ? '#e5e5ea' : s === 'grow' ? 'linear-gradient(90deg,#a78bfa,#60a5fa,#f472b6)' : RING_COLOR[s] }} />
          ))}
        </div>
        <div className="flex justify-between mt-2.5">
          {BEST_FIRST.map((s) => <span key={s} className="text-[12px] text-[#8e8e93]"><b className="text-black font-semibold">{by(s).length}</b> {STAGE_SHORT[s]}</span>)}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1 -mx-1 px-1">
        {['all', ...BEST_FIRST].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3.5 py-1.5 rounded-full text-[14px] font-semibold whitespace-nowrap shrink-0"
            style={filter === s ? { background: '#000', color: '#fff' } : { background: '#fff', color: '#3a3a3c', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            {s === 'all' ? 'All' : STAGE_SHORT[s]}
          </button>
        ))}
      </div>

      {/* Stages, best first */}
      {BEST_FIRST.filter((s) => filter === 'all' || filter === s).map((s) => {
        const list = by(s)
        const dim = s === 'decide'
        const top = s === 'sell' || s === 'grow'
        const limit = filter === s || open[s] ? list.length : dim ? 5 : 6
        return (
          <section key={s}>
            <div className="flex items-center justify-between mt-7 mb-2.5">
              <div className="flex items-center gap-2.5"><Medal stage={s} size={26} /><h2 className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: dim ? '#8e8e93' : '#000' }}>{stageLabel(s)}</h2></div>
              <span className="text-[15px] text-[#8e8e93]">{list.length}</span>
            </div>
            {list.length === 0 ? (
              <div className="rounded-[24px] border-2 border-dashed border-[#e5e5ea] px-5 py-4 flex items-center gap-3.5">
                <Medal stage={s} size={40} locked />
                <p className="text-[14px] text-[#8e8e93]">{s === 'grow' ? 'For members already running a business with AI.' : `No one is here yet. ${unlockFor(s)}`}</p>
              </div>
            ) : (
              <div className={dim ? 'rounded-[24px] py-1 bg-[#fbfbfc] border border-[#ececf0]' : `${CARD} py-1`}
                style={top ? { boxShadow: s === 'sell' ? '0 0 0 1.5px #ecd27a, 0 10px 30px -12px rgba(201,151,28,0.35)' : '0 0 0 1.5px #d8ccfb, 0 10px 30px -12px rgba(139,92,246,0.35)' } : undefined}>
                {list.slice(0, limit).map((m, i) => {
                  const d = daysSince(m.stage_since)
                  const left = goalDaysLeft(m.goal)
                  return (
                    <div key={m.member_no} className="flex items-center gap-3.5 px-4 py-3" style={{ borderTop: i ? '1px solid #f2f2f5' : undefined, background: m.isMe ? '#f0f7ff' : undefined }}>
                      <Medal stage={s} size={dim ? 36 : 42} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[16px]" style={{ fontWeight: dim ? 500 : 600, color: dim ? '#8e8e93' : '#000' }}>{m.isMe ? 'You' : m.name}</p>
                        <p className="truncate text-[13px] text-[#8e8e93]">{m.project || m.summary || 'Goal to be set at the next call'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[15px] font-semibold tabular-nums" style={{ color: paceColor(s, d) }}>{d != null ? `Day ${d}` : ''}</p>
                        <p className="text-[12px] text-[#8e8e93]">{left == null ? 'No goal yet' : left < 0 ? `Goal ${-left}d late` : `Goal ${left}d left`}</p>
                      </div>
                    </div>
                  )
                })}
                {list.length > limit && (
                  <button onClick={() => setOpen((o) => ({ ...o, [s]: true }))} className="w-full flex items-center justify-center gap-1 py-3 text-[14px] font-semibold border-t border-[#f2f2f5]">
                    See all {list.length} <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </section>
        )
      })}

      {filter === 'all' && data.unplaced.length > 0 && (
        <div className="mt-7 rounded-[24px] border-2 border-dashed border-[#e5e5ea] px-5 py-4">
          <p className="text-[15px] font-semibold text-[#3a3a3c]">Joining after their onboarding call <span className="font-normal text-[#8e8e93]">· {data.unplaced.length}</span></p>
          <p className="text-[14px] text-[#8e8e93] mt-1">{data.unplaced.map((u) => (u.isMe ? 'You' : u.name)).join(', ')}</p>
        </div>
      )}
    </div>
  )
}
