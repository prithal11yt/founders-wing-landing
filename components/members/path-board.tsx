'use client'

import { useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import { STAGES, STAGE_USUAL_DAYS } from '@/lib/crm'
import { PATH_ORDER, PATH_COLOR, STAGE_PLAIN, daysSince, paceColor } from '@/lib/members-path'
import { renderBoardSnapshot } from '@/lib/journey-snapshot'

export type JourneyWho = { member_no: number; name: string; isMe: boolean }
export type JourneyMember = JourneyWho & {
  isFounding: boolean
  stage: string
  project: string | null
  summary: string | null
  stage_since: string | null
}
export type JourneyWin = JourneyWho & { kind: 'moved'; from: string; to: string; at: string }
export type JourneyData = { members: JourneyMember[]; unplaced: JourneyWho[]; wins: JourneyWin[] }

/* ── The path ──────────────────────────────────────────────────────────────
   Five numbered stops joined by a dashed line, climbing from Decide at the bottom
   left to Grow with AI at the top right, so moving on means moving up. Each stop has its own
   colour; everything else stays quiet. Read-only: the team moves markers. */

const ORDER = PATH_ORDER
const COLOR = PATH_COLOR
const DISPLAY = { fontFamily: 'var(--font-path-display), Inter, sans-serif' }

const stageMeta = (v?: string | null) => STAGES.find((s) => s.value === v)
const stageLabel = (v?: string | null) => stageMeta(v)?.label ?? v ?? ''
const stopNo = (v: string) => ORDER.indexOf(v) + 1
const dayCount = (d: number) => `${d} day${d === 1 ? '' : 's'}`
const agoLabel = (iso: string) => {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`
}

export function PathShell({ who, onLogout, children }: { who: string; onLogout: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f6fa] text-[#0b1220] [--path-step:12px] md:[--path-step:36px]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="bg-white border-b border-[#eceef4]">
        <div className="max-w-[1140px] mx-auto px-5 h-14 flex items-center justify-between">
          <p className="text-[16px] font-extrabold tracking-[-0.02em]" style={DISPLAY}>Founders Wing</p>
          <nav className="flex items-center gap-5 text-[13px]">
            <span className="relative font-semibold py-4">The path<span className="absolute left-0 right-0 bottom-2.5 h-[2px] rounded-full bg-[#1d3fbf]" /></span>
            <span className="text-[#8b93a7] hidden sm:inline">{who}</span>
            <button onClick={onLogout} className="text-[#5b6478] hover:text-[#0b1220]">Sign out</button>
          </nav>
        </div>
      </header>
      <main className="max-w-[1140px] mx-auto px-5 pt-10 pb-16">{children}</main>
    </div>
  )
}

export function PathBoard({ data }: { data: JourneyData }) {
  const me = data.members.find((m) => m.isMe)
  const by = (s: string) => data.members.filter((m) => m.stage === s).sort((a, b) => Number(b.isMe) - Number(a.isMe))
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-[640px]">
          <p className="text-[11px] font-bold tracking-[0.14em] text-[#1d3fbf]">THE FOUNDERS WING PATH</p>
          <h1 className="mt-3 text-[40px] md:text-[48px] leading-[0.98] font-extrabold tracking-[-0.035em]" style={DISPLAY}>Every business here is somewhere on this path.</h1>
          <p className="mt-4 text-[14px] leading-relaxed text-[#3d4659]">
            The path climbs from a first idea at the bottom to a business that grows with AI at the top.{me ? <> Your marker is on stop {stopNo(me.stage)}.</> : null}
          </p>
        </div>
        <SnapshotButton data={data} />
      </div>

      <div className="mt-10">
        <div className="relative rounded-[18px] bg-[#16803c] text-white px-6 py-6 md:px-7 mb-8" style={{ marginLeft: `calc(${ORDER.length - 1} * var(--path-step))` }}>
          <p className="text-[11px] font-bold tracking-[0.14em] text-white/80">THE PATH KEEPS GOING</p>
          <p className="mt-1.5 text-[24px] md:text-[26px] font-extrabold tracking-[-0.02em]" style={DISPLAY}>No finish line. Just more growth.</p>
          <a href="#stop-grow" className="mt-4 inline-flex rounded-lg bg-white text-[#15803d] px-4 py-2.5 text-[13px] font-bold">See who got here</a>
          <span aria-hidden className="absolute left-[20px] top-full h-8 border-l-[2.5px] border-dashed" style={{ borderColor: COLOR.grow.rail }} />
        </div>
        {[...ORDER].reverse().map((s) => {
          const i = ORDER.indexOf(s)
          return <Stop key={s} stage={s} index={i} members={by(s)} isBottom={i === 0} />
        })}
      </div>

      {data.unplaced.length > 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[#d5d9e3] px-5 py-4">
          <p className="text-[14px] font-semibold text-[#3d4659]">Joining the path after their onboarding call <span className="font-normal text-[#8b93a7]">· {data.unplaced.length}</span></p>
          <p className="text-[13px] text-[#8b93a7] mt-1">{data.unplaced.map((u) => (u.isMe ? 'You' : u.name)).join(', ')}</p>
        </div>
      )}

      <Moves data={data} />

      <p className="text-[12px] text-[#8b93a7] text-center mt-12">You do the work. We move your marker after each call.</p>
    </div>
  )
}

/* One stop. The dashed rail runs down from the number, turns left at the bottom,
   and runs to the stop below, whose number sits one step further left. */
function Stop({ stage, index, members, isBottom }: { stage: string; index: number; members: JourneyMember[]; isBottom: boolean }) {
  const c = COLOR[stage]
  const [all, setAll] = useState(false)
  const shown = all ? members : members.slice(0, 8)
  const usual = STAGE_USUAL_DAYS[stage]
  const hasMe = members.some((m) => m.isMe)
  return (
    <section id={`stop-${stage}`} className="relative pb-12" style={{ marginLeft: `calc(${index} * var(--path-step))` }}>
      {!isBottom && (
        // Ends level with the top of the next stop's number, so it runs above that heading, not through it.
        <span aria-hidden className="absolute top-[44px] bottom-0 right-[calc(100%-22.5px)] border-r-[2.5px] border-b-[2.5px] border-dashed rounded-br-[22px]"
          style={{ borderColor: c.rail, left: 'calc(21px - var(--path-step))' }} />
      )}
      <div className="relative flex items-center gap-3 flex-wrap">
        <span className="grid place-items-center w-[42px] h-[42px] rounded-full text-white text-[17px] font-extrabold shrink-0 ring-4 ring-[#f5f6fa]" style={{ background: c.solid, ...DISPLAY }}>{index + 1}</span>
        <h2 className="text-[28px] md:text-[30px] font-extrabold tracking-[-0.03em]" style={DISPLAY}>{stageLabel(stage)}</h2>
        <span className="text-[12px] font-semibold text-[#5b6478]">{members.length} {members.length === 1 ? 'founder' : 'founders'} here{usual ? ` · usually about ${usual} days` : ''}</span>
        {hasMe && <span className="rounded-md bg-[#0b1220] text-white text-[11px] font-bold px-2 py-1">You are here</span>}
      </div>
      <div className="pl-[54px] md:pl-[62px]">
        <p className="mt-1.5 text-[14px] leading-relaxed text-[#3d4659]">{STAGE_PLAIN[stage].now} <b style={{ color: c.solid }}>{STAGE_PLAIN[stage].done}</b></p>
        {members.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-[#d5d9e3] bg-white/60 px-4 py-3 text-[13px] text-[#8b93a7]">
            {stage === 'grow' ? 'For members who already run a business and use AI to grow it.' : 'Nobody here yet. Be the first.'}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {shown.map((m) => <MemberCard key={m.member_no} m={m} stage={stage} />)}
          </div>
        )}
        {members.length > shown.length && (
          <button onClick={() => setAll(true)} className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: c.solid }}>
            See all {members.length} <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  )
}

function Avatar({ stage }: { stage: string }) {
  const c = COLOR[stage]
  return (
    <span className="grid place-items-center w-9 h-9 rounded-full shrink-0" style={{ background: c.soft }}>
      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden>
        <circle cx="12" cy="8.5" r="4" fill={c.solid} />
        <path d="M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5z" fill={c.solid} />
      </svg>
    </span>
  )
}

function MemberCard({ m, stage }: { m: JourneyMember; stage: string }) {
  const d = daysSince(m.stage_since)
  const what = m.project || m.summary
  return (
    <div className={`flex gap-3 rounded-xl bg-white p-3.5 ${m.isMe ? 'border-2 border-[#0b1220]' : 'border border-[#e6e8ef]'}`}>
      <Avatar stage={stage} />
      <div className="min-w-0">
        <p className="text-[13.5px] font-bold leading-tight">{m.name}{m.isMe && ' (you)'}</p>
        {what && <p className="mt-0.5 text-[12.5px] leading-snug text-[#3d4659] line-clamp-2">{what}</p>}
        {d != null && <p className="mt-1.5 text-[11.5px]" style={{ color: paceColor(stage, d) }}>{dayCount(d)} at this stop</p>}
      </div>
    </div>
  )
}

/* Forward moves. This week if anyone moved this week, otherwise this month. */
function Moves({ data }: { data: JourneyData }) {
  const week = data.wins.filter((w) => Date.now() - new Date(w.at).getTime() < 7 * 86400000)
  const list = (week.length ? week : data.wins).slice(0, 6)
  if (!list.length) return null
  const building = (no: number) => {
    const m = data.members.find((x) => x.member_no === no)
    return m?.project || m?.summary || null
  }
  return (
    <section className="mt-14">
      <h2 className="text-[24px] md:text-[26px] font-extrabold tracking-[-0.03em]" style={DISPLAY}>Moved along the path this {week.length ? 'week' : 'month'}</h2>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((w, i) => (
          <div key={i} className="rounded-xl bg-white border border-[#e6e8ef] p-4">
            <p className="text-[12px] font-bold" style={{ color: COLOR[w.to]?.solid }}>Stop {stopNo(w.from)} to stop {stopNo(w.to)} · {agoLabel(w.at)}</p>
            <p className="mt-1 text-[15px] font-bold">{w.isMe ? 'You' : w.name} reached {stageLabel(w.to)}</p>
            {building(w.member_no) && <p className="mt-1 text-[13px] leading-snug text-[#3d4659] line-clamp-2">{building(w.member_no)}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

/* Saves the board as an image. Phones get the share sheet, so it can go straight
   to the WhatsApp group; everything else downloads the file. */
function SnapshotButton({ data }: { data: JourneyData }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function snapshot() {
    setBusy(true)
    setError('')
    try {
      const members = data.members.map((m) => {
        const days = daysSince(m.stage_since)
        return { name: m.name, stage: m.stage, days, color: paceColor(m.stage, days) }
      })
      // Draw with the same heading font as the page.
      const h1 = document.querySelector('h1')
      const display = h1 ? getComputedStyle(h1).fontFamily : ''
      await document.fonts?.ready
      const blob = await renderBoardSnapshot(members, data.unplaced.length, display)
      const filename = `founders-wing-board-${new Date().toISOString().slice(0, 10)}.png`
      const file = new File([blob], filename, { type: 'image/png' })
      if (window.matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file] })
          return
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') return
        }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch {
      setError("Couldn't create the snapshot. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="shrink-0">
      <button onClick={snapshot} disabled={busy}
        className="h-11 rounded-xl bg-[#1d3fbf] text-white px-5 text-[14px] font-bold inline-flex items-center gap-2 shadow-[0_6px_16px_-6px_rgba(29,63,191,0.6)] disabled:opacity-60">
        <Download className="w-4 h-4" /> {busy ? 'Creating snapshot…' : 'Download snapshot'}
      </button>
      {error && <p className="text-[12px] text-[#dc2626] mt-2">{error}</p>}
    </div>
  )
}
