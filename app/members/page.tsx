'use client'

import { useEffect, useState, useCallback } from 'react'
import { COHORT_1_SIZE } from '@/lib/cohort'
import { ChevronDown, Hammer, IndianRupee, Lightbulb, Lock, Rocket, Sparkles } from 'lucide-react'
import { STAGES, STAGE_PATH, STAGE_USUAL_DAYS } from '@/lib/crm'

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
}
type JourneyWin = JourneyWho & { kind: 'moved'; from: string; to: string; at: string }
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
   stages from /team/members. */
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
   Everyone's place on Decide → Build → Launch → Sell (plus the Grow with AI lane)
   and how many days they've been there, against how long each stage usually
   takes. Styled after Cal AI / Apple Fitness: the page stays black and white and
   only the stage medals change material as members move up (flat grey for
   Decide, then copper, silver, gold, holographic). Read-only: the team updates
   stages after each call. */

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
const paceColor = (stage: string, d: number | null) => {
  const usual = STAGE_USUAL_DAYS[stage]
  if (d == null) return '#aeaeb2'
  if (usual && d > usual * 2) return '#ff3b30'
  if (usual && d > usual) return '#ff9500'
  return stage === 'decide' ? '#8e8e93' : '#000000'
}
const dayCount = (d: number) => `${d} day${d === 1 ? '' : 's'}`

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

function JourneyBoard({ data }: { data: JourneyData }) {
  return (
    <div className="max-w-xl mx-auto text-black" style={{ fontFamily: APPLE_FONT, letterSpacing: '-0.01em' }}>
      <BoardIntro />
      <UsualTimeline />
      <BoardView data={data} />
      <p className="text-[12px] text-[#aeaeb2] text-center mt-8">You do the work. We move your medal after each call.</p>
    </div>
  )
}

const STAGE_PLAIN: Record<string, { now: string; done: string }> = {
  decide: { now: "You're choosing what to build.", done: 'Done when 3–5 real people confirm the problem is worth solving.' },
  build: { now: "You've picked the idea. Now make it real.", done: 'Done when one core workflow works from start to finish.' },
  launch: { now: "It works, but people can't fully use it yet.", done: 'Done when real users can sign up and get through it.' },
  sell: { now: "It's live. Now it has to earn.", done: 'Done when someone you don\'t know pays you.' },
  grow: { now: 'You already run a business.', done: 'No finish line. Keep using AI to earn more or work less.' },
}

/* Why the board exists, in the community's own voice. */
function BoardIntro() {
  return (
    <div className="pt-1 pb-5">
      <h1 className="text-[34px] font-bold leading-[1.08] tracking-[-0.03em]">Idea to paying customers. Out in the open.</h1>
      <p className="text-[16px] leading-relaxed text-[#6e6e73] mt-3">Building alone, it&apos;s easy to stay busy and go nowhere. So everyone here is on this board, at their real stage. Find yourself, see who&apos;s one step ahead, and go ask them how they got there.</p>
    </div>
  )
}

/* What each stage means, and the benchmark members compare their day count against. */
function UsualTimeline() {
  return (
    <div className={`${CARD} p-5`}>
      <p className="text-[20px] font-bold tracking-[-0.02em]">The path</p>
      <p className="text-[14px] text-[#8e8e93] mt-0.5">What each stage means and how long it usually takes. Compare it with the days beside your name.</p>
      <div className="flex gap-1 mt-4">
        {STAGE_PATH.map((s) => <span key={s} className="h-2.5 rounded-full" style={{ flex: STAGE_USUAL_DAYS[s], background: s === 'decide' ? '#c7c7cc' : RING_COLOR[s] }} />)}
      </div>
      <div className="mt-2">
        {[...STAGE_PATH, 'grow'].map((s, i) => (
          <div key={s} className="flex items-start gap-3.5 py-3" style={i ? { borderTop: '1px solid #f2f2f5' } : undefined}>
            <Medal stage={s} size={36} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[16px] font-semibold">{stageLabel(s)}</p>
                <p className="text-[14px] font-semibold tabular-nums shrink-0">{STAGE_USUAL_DAYS[s] ? `About ${STAGE_USUAL_DAYS[s]} days` : 'Ongoing'}</p>
              </div>
              <p className="text-[14px] text-[#3a3a3c] mt-0.5">{STAGE_PLAIN[s].now}</p>
              <p className="text-[13px] text-[#8e8e93]">{STAGE_PLAIN[s].done}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BoardView({ data }: { data: JourneyData }) {
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<Record<string, boolean>>({})
  // Your own row comes first in your stage, so it's never hidden behind "See all".
  const by = (s: string) => data.members.filter((m) => m.stage === s).sort((a, b) => Number(b.isMe) - Number(a.isMe))
  const moves = data.wins.filter((w) => w.kind === 'moved')
  return (
    <div>
      {/* Summary */}
      <div className={`${CARD} p-5 mt-3`}>
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

      {moves.length > 0 && (
        <>
          <p className="text-[20px] font-bold tracking-[-0.02em] mt-7 mb-2.5">Moved up this month</p>
          <div className={`${CARD} py-1`}>
            {moves.map((w, i) => (
              <div key={i} className="flex items-center gap-3.5 px-4 py-3" style={i ? { borderTop: '1px solid #f2f2f5' } : undefined}>
                <Medal stage={w.to} size={36} />
                <p className="text-[15px] flex-1 min-w-0"><span className="font-semibold">{w.isMe ? 'You' : w.name}</span> moved up to {stageLabel(w.to)}</p>
                <span className="text-[13px] text-[#8e8e93] shrink-0">{shortDate(w.at)}</span>
              </div>
            ))}
          </div>
        </>
      )}

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
              <div className="flex items-center gap-2.5"><Medal stage={s} size={26} /><div><h2 className="text-[20px] font-bold tracking-[-0.02em] leading-tight" style={{ color: dim ? '#8e8e93' : '#000' }}>{stageLabel(s)}</h2>{STAGE_USUAL_DAYS[s] && <p className="text-[12px] text-[#8e8e93]">Usually about {STAGE_USUAL_DAYS[s]} days</p>}</div></div>
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
                  return (
                    <div key={m.member_no} className="flex items-center gap-3.5 px-4 py-3" style={{ borderTop: i ? '1px solid #f2f2f5' : undefined, background: m.isMe ? '#f0f7ff' : undefined }}>
                      <Medal stage={s} size={dim ? 36 : 42} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[16px]" style={{ fontWeight: dim ? 500 : 600, color: dim ? '#8e8e93' : '#000' }}>{m.isMe ? 'You' : m.name}</p>
                        {(m.project || m.summary) && <p className="truncate text-[13px] text-[#8e8e93]">{m.project || m.summary}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[15px] font-semibold tabular-nums" style={{ color: paceColor(s, d) }}>{d != null ? dayCount(d) : ''}</p>
                        {d != null && STAGE_USUAL_DAYS[s] && (
                          <div className="w-16 h-1 rounded-full bg-[#efeff4] mt-1.5 ml-auto overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (d / STAGE_USUAL_DAYS[s]) * 100)}%`, background: paceColor(s, d) }} /></div>
                        )}
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
