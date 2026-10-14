'use client'

import { useEffect, type ReactNode } from 'react'

/* ───────────────────────── types (mirror /api/team/*) ───────────────────────── */
export type Role = 'admin' | 'team'
export type Targets = { lead_calls: number; member_calls: number; whatsapp_posts: number; session_attendance: number; working_days: number[] }
export type DayRow = {
  day: string; working: boolean; lead_calls: number; lead_reached: number; lead_converted: number
  member_calls: number; member_reached: number; member_messages: number; whatsapp_posts: number; checkin: boolean
}
export type Activity = { kind: 'lead' | 'member'; id: string; ts: string; ref: number | string; name: string; outcome: string; note: string | null; tags: string[]; will_attend_next?: boolean | null }
export type Checkin = { day: string; learned: string | null; blockers: string | null; plan_tomorrow: string | null; updated_at: string }
export type SessionLite = { id: string; title: string; call_date: string; topic: string | null; target_attendance: number | null; recap_posted: boolean; attended: number }
export type Overview = {
  date: string; today: boolean; targets: Targets; actor: 'team' | 'admin'; today_row: DayRow; checkin: Checkin | null; activity: Activity[]; posts_today: WaPost[]
  days: DayRow[]
  week: { lead_calls: number; lead_reached: number; lead_converted: number; member_calls: number; member_reached: number; whatsapp_posts: number; checkins: number }
  streaks: { checkin: number; whatsapp: number; lead_target: number }
  followups_due: { id: number; full_name: string; whatsapp: string | null; follow_up_at: string; call_status: string; heard_from: string }[]
  next_session_day: string
  upcoming_session: (SessionLite & { rsvp: number }) | null
  past_sessions: SessionLite[]
  members: { total: number; contacted_since_last_session: number; last_session_day: string }
}
export type Lead = {
  id: number; created_at: string; full_name: string; email: string | null; whatsapp?: string | null; what_building?: string | null
  join_reason?: string | null; heard_from?: string | null; call_status?: string | null; notes?: string | null; last_called_at?: string | null
  call_attempts?: number | null; follow_up_at?: string | null; worked_by?: string | null; twitter_handle?: string | null; product?: string | null
}
export type LeadEvent = { id: number; lead_id: number; actor: string; call_status: string; note: string | null; tags: string[]; created_at: string }
export type Touchpoint = {
  id: string; member_email: string; member_name: string | null; actor: string; channel: 'call' | 'whatsapp'; outcome: string
  reasons: string[]; wants: string[]; note: string | null; will_attend_next: boolean | null; follow_up_at: string | null; session_id: string | null; created_at: string
}
export type Member = {
  member_no: number; full_name: string; email: string; whatsapp: string | null; plan: string; joined_at: string
  attended_count: number; attended_session_ids: string[]; attended_last: boolean | null; recent_attendance: boolean[]
  last_touch_at: string | null; last_outcome: string | null; contacted_this_week: boolean; rsvp_next: boolean | null; touchpoints: Touchpoint[]
}
export type Session = SessionLite & { notes: string | null; attendance: { member_email: string; member_name: string | null; marked_by: string }[]; rsvp: number; members_contacted: number }
export type WaPost = { id: string; posted_on: string; category: string; content: string | null; replies: number; reactions: number; actor: string; created_at: string }
export type Idea = { id: string; title: string; detail: string | null; category: string; raised_by: string; status: string; created_at: string; updated_at: string; done_at: string | null }
export type Insights = {
  days: number
  leads: { calls: number; reached: number; outcomes: { key: string; n: number }[]; tags: { key: string; n: number }[]; notes: { name: string; outcome: string; note: string; tags: string[]; ts: string; actor: string }[] }
  members: { touches: number; answered: number; will_attend: number; wont_attend: number; reasons: { key: string; n: number }[]; wants: { key: string; n: number }[]; notes: { name: string; outcome: string; note: string; tags: string[]; ts: string; actor: string }[] }
  whatsapp: { category: string; posts: number; replies: number; reactions: number; avg_replies: number }[]
  sessions: (SessionLite & { attended: number })[]
}

/* ───────────────────────── vocab + labels ───────────────────────── */
export const LEAD_STATUSES = [
  { value: 'no_answer',      label: 'No answer',       dot: '#f97316', bg: '#fff7ed', fg: '#c2410c' },
  { value: 'callback',       label: 'Callback',        dot: '#eab308', bg: '#fefce8', fg: '#a16207' },
  { value: 'less_convinced', label: 'Not sure',        dot: '#f59e0b', bg: '#fffbeb', fg: '#b45309' },
  { value: 'interested',     label: 'Interested',      dot: '#22c55e', bg: '#f0fdf4', fg: '#15803d' },
  { value: 'very_convinced', label: 'Very interested', dot: '#10b981', bg: '#ecfdf5', fg: '#047857' },
  { value: 'converted',      label: 'Joined',          dot: '#0284c7', bg: '#f0f9ff', fg: '#0369a1' },
  { value: 'not_interested', label: 'Not interested',  dot: '#ef4444', bg: '#fef2f2', fg: '#b91c1c' },
]
export const NOT_CALLED = { value: 'not_called', label: 'Not called', dot: '#94a3b8', bg: '#f1f5f9', fg: '#475569' }
export const statusMeta = (v?: string | null) => LEAD_STATUSES.find(s => s.value === v) ?? NOT_CALLED

export const LEAD_TAG_LABELS: Record<string, string> = {
  price: 'Price too high', needs_time: 'Needs time to decide', wants_to_think: 'Will think about it', not_right_now: 'Not right now',
  student_exams: 'Student / exams', no_idea_yet: 'No idea yet', wants_mentorship: 'Wants mentorship', wants_networking: 'Wants networking',
  wants_cofounder: 'Looking for cofounder', wants_accountability: 'Wants accountability', wants_ai_learning: 'Wants to learn AI',
  asked_for_details: 'Asked for details', already_in_community: 'In another community', wrong_number: 'Wrong number', language_barrier: 'Language barrier',
}
export const MEMBER_REASON_LABELS: Record<string, string> = {
  timing_clash: 'Timing clash', forgot: 'Forgot', didnt_know: "Didn't know about it", topic_not_relevant: 'Topic not relevant',
  too_long: 'Too long', prefers_recording: 'Prefers recording', busy_this_week: 'Busy this week', lost_interest: 'Lost interest',
  network_issue: 'Network issues', will_attend: 'Will attend',
}
export const MEMBER_WANT_LABELS: Record<string, string> = {
  more_qna: 'More Q&A', guest_speakers: 'Guest speakers', hands_on_demos: 'Hands-on demos', member_showcases: 'Member showcases',
  shorter_sessions: 'Shorter sessions', different_time: 'Different time', ai_tools_walkthrough: 'AI tool walkthroughs',
  accountability: 'Accountability', one_on_one: '1:1 time', networking_breakouts: 'Networking breakouts',
}
export const WA_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'poll', label: 'Poll', icon: '📊' }, { value: 'learning', label: 'Learning / recap', icon: '💡' }, { value: 'question', label: 'Question', icon: '❓' },
  { value: 'win', label: 'Member win', icon: '🏆' }, { value: 'resource', label: 'Resource', icon: '🔗' }, { value: 'announcement', label: 'Announcement', icon: '📣' },
  { value: 'reminder', label: 'Session reminder', icon: '⏰' }, { value: 'other', label: 'Other', icon: '💬' },
]
export const waCat = (v: string) => WA_CATEGORIES.find(c => c.value === v) ?? WA_CATEGORIES[WA_CATEGORIES.length - 1]
export const IDEA_CATEGORIES = ['sales', 'engagement', 'sessions', 'content', 'product', 'ops', 'general']
export const IDEA_STATUSES: { value: string; label: string; fg: string; bg: string }[] = [
  { value: 'inbox', label: 'Inbox', fg: '#475569', bg: '#f1f5f9' }, { value: 'planned', label: 'Planned', fg: '#a16207', bg: '#fefce8' },
  { value: 'doing', label: 'Doing', fg: '#0369a1', bg: '#f0f9ff' }, { value: 'done', label: 'Done', fg: '#15803d', bg: '#f0fdf4' },
  { value: 'parked', label: 'Parked', fg: '#64748b', bg: '#f8fafc' },
]
export const SOURCE_LABELS: Record<string, string> = { youtube: 'YouTube', twitter: 'Twitter', 'twitter-linkedin': 'Twitter / LinkedIn', whatsapp: 'WhatsApp', 'friend-referral': 'Referral', other: 'Other' }
export const OUTCOME_LABELS: Record<string, string> = { answered: 'Answered', no_answer: 'No answer', callback: 'Callback', messaged: 'Messaged' }
export const label = (map: Record<string, string>, k: string) => map[k] || k.replace(/_/g, ' ')
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ───────────────────────── small utils ───────────────────────── */
const IST = 5.5 * 60 * 60 * 1000
export const todayISO = () => new Date(Date.now() + IST).toISOString().slice(0, 10)
export const addDays = (d: string, n: number) => new Date(new Date(d + 'T00:00:00Z').getTime() + n * 86400000).toISOString().slice(0, 10)
export const weekday = (d: string) => new Date(d + 'T00:00:00Z').getUTCDay()
export const fmtDay = (d: string, withDow = true) => {
  const dt = new Date(d + 'T00:00:00Z')
  const s = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  return withDow ? `${DOW[dt.getUTCDay()]} ${s}` : s
}
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
export const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
export function timeAgo(iso?: string | null): string {
  if (!iso) return 'never'
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })
}
export function phoneDigits(raw?: string | null): string {
  if (!raw) return ''
  const d = raw.replace(/\D/g, '')
  if (d.length === 10) return `91${d}`
  if (d.length === 11 && d.startsWith('0')) return `91${d.slice(1)}`
  return d
}
export const daysUntil = (d: string) => Math.round((new Date(d + 'T00:00:00Z').getTime() - new Date(todayISO() + 'T00:00:00Z').getTime()) / 86400000)

export class ApiError extends Error { status: number; constructor(msg: string, status: number) { super(msg); this.status = status } }
export async function api<T = unknown>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json: body, ...rest } = init || {}
  const r = await fetch(path, { ...rest, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(rest.headers || {}) }, body: body !== undefined ? JSON.stringify(body) : rest.body })
  if (r.status === 401) { window.dispatchEvent(new Event('fw-unauth')); throw new ApiError('Signed out', 401) }
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new ApiError((data as { error?: string }).error || `Request failed (${r.status})`, r.status)
  return data as T
}
export function toast(msg: string, kind: 'ok' | 'err' = 'ok') {
  const el = document.createElement('div')
  el.className = `t-toast ${kind}`; el.textContent = msg
  document.body.appendChild(el)
  setTimeout(() => el.classList.add('show'), 10)
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300) }, 2600)
}

/* ───────────────────────── primitives ───────────────────────── */
export function Card({ title, right, children, className = '', pad = true }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`card ${pad ? '' : 'card-nopad'} ${className}`}>
      {(title || right) && <div className="card-hd"><h3 className="card-t">{title}</h3>{right}</div>}
      {children}
    </section>
  )
}
export function Stat({ n, label, tone, sub }: { n: ReactNode; label: string; tone?: 'ok' | 'warn' | 'bad'; sub?: string }) {
  return <div className={`stat ${tone || ''}`}><div className="stat-n">{n}</div><div className="stat-l">{label}</div>{sub && <div className="stat-s">{sub}</div>}</div>
}
export function Pill({ children, bg = '#f1f5f9', fg = '#475569', dot }: { children: ReactNode; bg?: string; fg?: string; dot?: string }) {
  return <span className="pill" style={{ background: bg, color: fg }}>{dot && <i className="pill-dot" style={{ background: dot }} />}{children}</span>
}
export function Chips({ options, value, onChange, single }: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; single?: boolean }) {
  return (
    <div className="chips">
      {options.map(o => {
        const on = value.includes(o.value)
        return <button type="button" key={o.value} className={`chip${on ? ' on' : ''}`}
          onClick={() => onChange(single ? (on ? [] : [o.value]) : on ? value.filter(v => v !== o.value) : [...value, o.value])}>{o.label}</button>
      })}
    </div>
  )
}
export function TargetBar({ label, value, target, hint, tone }: { label: string; value: number; target: number; hint?: string; tone?: string }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 100
  const done = target > 0 ? value >= target : value > 0
  return (
    <div className="tbar">
      <div className="tbar-hd"><span className="tbar-l">{label}</span><span className={`tbar-n ${done ? 'ok' : ''}`}>{value}<span className="muted">/{target}</span></span></div>
      <div className="bar"><i style={{ width: `${pct}%`, background: tone || (done ? '#10b981' : pct >= 50 ? '#0284c7' : '#f59e0b') }} /></div>
      {hint && <div className="tbar-h">{hint}</div>}
    </div>
  )
}
export function Modal({ open, title, onClose, children, wide }: { open: boolean; title: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-bg" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-hd"><h3>{title}</h3><button className="btn btn-g btn-s" onClick={onClose} aria-label="Close">✕</button></div>
        <div className="modal-bd">{children}</div>
      </div>
    </div>
  )
}
export function Empty({ children }: { children: ReactNode }) { return <div className="empty">{children}</div> }
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span className="lbl">{label}</span>{children}{hint && <span className="hint">{hint}</span>}</label>
}
export function Bars({ rows, labels, max }: { rows: { key: string; n: number }[]; labels?: Record<string, string>; max?: number }) {
  if (!rows.length) return <Empty>Nothing logged yet.</Empty>
  const top = max || Math.max(1, ...rows.map(r => r.n))
  return (
    <div className="bars">
      {rows.map(r => (
        <div key={r.key} className="bars-row">
          <span className="bars-l">{labels ? label(labels, r.key) : r.key}</span>
          <div className="bar"><i style={{ width: `${Math.max(4, (r.n / top) * 100)}%` }} /></div>
          <span className="bars-n">{r.n}</span>
        </div>
      ))}
    </div>
  )
}
export function CallLinks({ phone, email, compact }: { phone?: string | null; email?: string | null; compact?: boolean }) {
  const d = phoneDigits(phone)
  return (
    <div className={`actions${compact ? ' compact' : ''}`}>
      {d && <a className="btn btn-call" href={`tel:+${d}`}>📞 Call</a>}
      {d && <a className="btn btn-wa" href={`https://wa.me/${d}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
      {email && !compact && <a className="btn btn-g" href={`mailto:${email}`}>Email</a>}
    </div>
  )
}

/* ───────────────────────── styles ───────────────────────── */
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
.tw,.tw *{box-sizing:border-box;margin:0;padding:0}
.tw{font-family:'Inter',-apple-system,system-ui,sans-serif;background:#f5f7fb;color:#0f172a;min-height:100vh;padding-bottom:88px;-webkit-font-smoothing:antialiased}
.tw button,.tw input,.tw select,.tw textarea{font-family:inherit;font-size:14px;color:#0f172a}
.tw a{color:#0284c7}
.muted{color:#64748b}.faint{color:#94a3b8}.small{font-size:12px}.b{font-weight:600}
.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.row-sb{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.col{display:flex;flex-direction:column;gap:10px}
.mt{margin-top:12px}.mb{margin-bottom:12px}

/* login */
.lg-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.lg-card{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:20px;padding:40px 32px;width:100%;max-width:400px;text-align:center;box-shadow:0 12px 40px rgba(15,23,42,.08)}
.lg-logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;font-family:'Space Grotesk';font-weight:700;font-size:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px}
.lg-title{font-family:'Space Grotesk';font-size:21px;font-weight:700;letter-spacing:-.3px}
.lg-sub{font-size:13.5px;color:#64748b;margin:4px 0 26px}
.lg-input{width:100%;padding:12px 14px;background:#f8fafc;border:1px solid rgba(15,23,42,.1);border-radius:10px;font-size:16px;margin-bottom:10px;outline:none}
.lg-input:focus{border-color:#0284c7;background:#fff;box-shadow:0 0 0 3px rgba(2,132,199,.1)}
.lg-err{color:#dc2626;font-size:12.5px;margin-top:12px}

/* header + tabs */
/* No backdrop-filter here: it would become the containing block for the
   fixed bottom tab bar on phones and pin it to the top instead. */
.t-hd{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.97);border-bottom:1px solid rgba(15,23,42,.07)}
.t-hd-in{max-width:1100px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.t-brand{display:flex;align-items:center;gap:11px;min-width:0}
.t-logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff;font-family:'Space Grotesk';font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.t-title{font-family:'Space Grotesk';font-weight:700;font-size:15.5px;letter-spacing:-.2px}
.t-sub{font-size:11.5px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}
.t-tabs{max-width:1100px;margin:0 auto;padding:0 20px;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
.t-tabs::-webkit-scrollbar{display:none}
.t-tab{flex:0 0 auto;padding:10px 14px;border:none;background:none;color:#64748b;font-weight:500;font-size:13.5px;cursor:pointer;border-bottom:2px solid transparent;display:flex;align-items:center;gap:6px}
.t-tab.on{color:#0284c7;border-bottom-color:#0284c7;font-weight:600}
.t-tab .ic{font-size:15px}
.t-tab .lb{white-space:nowrap}
.t-main{max-width:1100px;margin:0 auto;padding:18px 20px}
.t-grid{display:grid;gap:14px}.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:repeat(3,1fr)}.g4{grid-template-columns:repeat(4,1fr)}

/* cards */
.card{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:14px;padding:16px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.card-nopad{padding:0}
.card-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap}
.card-t{font-family:'Space Grotesk';font-weight:700;font-size:14.5px;letter-spacing:-.1px}
.stat{background:#fff;border:1px solid rgba(15,23,42,.07);border-radius:12px;padding:13px 15px}
.stat-n{font-family:'Space Grotesk';font-size:24px;font-weight:700;line-height:1.1}
.stat-l{font-size:11.5px;color:#64748b;margin-top:3px;font-weight:500}.stat-s{font-size:11px;color:#94a3b8;margin-top:2px}
.stat.ok .stat-n{color:#047857}.stat.warn .stat-n{color:#b45309}.stat.bad .stat-n{color:#b91c1c}
.lbl{display:block;font-size:10.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#94a3b8;margin-bottom:5px}
.hint{display:block;font-size:11.5px;color:#94a3b8;margin-top:4px}
.field{display:block;margin-bottom:12px}
.empty{text-align:center;color:#64748b;padding:36px 16px;font-size:13.5px;background:#fff;border:1px dashed rgba(15,23,42,.14);border-radius:12px}

/* controls */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;border:1px solid transparent;text-decoration:none;white-space:nowrap;background:#f1f5f9;color:#0f172a;line-height:1.2}
.btn:disabled{opacity:.6;cursor:default}
.btn-p{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff}
.btn-g{background:#fff;border-color:rgba(15,23,42,.12);color:#475569}.btn-g:hover{background:#f8fafc}
.btn-d{background:#fef2f2;color:#b91c1c;border-color:rgba(185,28,28,.15)}
.btn-s{padding:6px 10px;font-size:12.5px;border-radius:8px}
.btn-call{background:linear-gradient(135deg,#0284c7,#0ea5e9);color:#fff}
.btn-wa{background:#f0fdf4;color:#15803d;border-color:rgba(21,128,61,.22)}
.btn-block{width:100%}
.input,.select,.textarea{width:100%;padding:10px 12px;background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:9px;font-size:14px;outline:none}
.input:focus,.select:focus,.textarea:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.1)}
.textarea{min-height:80px;resize:vertical;line-height:1.5}
.input-s{padding:6px 9px;font-size:13px;border-radius:7px;width:auto}
.search{flex:1;min-width:180px;padding:10px 13px;background:#fff;border:1px solid rgba(15,23,42,.1);border-radius:10px;font-size:14px;outline:none}
.search:focus{border-color:#0284c7;box-shadow:0 0 0 3px rgba(2,132,199,.1)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{padding:6px 11px;border-radius:999px;border:1px solid rgba(15,23,42,.12);background:#fff;color:#475569;font-size:12.5px;font-weight:500;cursor:pointer}
.chip:hover{border-color:rgba(15,23,42,.25)}.chip.on{background:#0284c7;border-color:#0284c7;color:#fff}
.chip.on.warn{background:#b45309;border-color:#b45309}.chip.on.bad{background:#b91c1c;border-color:#b91c1c}.chip.on.ok{background:#047857;border-color:#047857}
.chip .c{font-size:11px;font-weight:700;opacity:.7;margin-left:5px}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;white-space:nowrap}
.pill-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.tag{display:inline-block;font-size:11px;font-weight:500;color:#475569;background:#f1f5f9;padding:3px 8px;border-radius:6px}
.tag-red{background:#fef2f2;color:#b91c1c}.tag-amber{background:#fffbeb;color:#b45309}.tag-green{background:#f0fdf4;color:#15803d}.tag-blue{background:#f0f9ff;color:#0369a1}
.actions{display:flex;gap:8px;margin-top:12px}.actions .btn{flex:1}.actions.compact{margin-top:0}.actions.compact .btn{flex:0 0 auto;padding:6px 10px;font-size:12.5px}

/* progress */
.bar{height:10px;background:#eef2f7;border-radius:6px;overflow:hidden}.bar>i{display:block;height:100%;background:#0284c7;border-radius:6px;transition:width .4s}
.tbar{padding:12px 0;border-top:1px solid rgba(15,23,42,.06)}.tbar:first-child{border-top:none;padding-top:0}
.tbar-hd{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px}
.tbar-l{font-weight:600;font-size:13.5px}.tbar-n{font-family:'Space Grotesk';font-weight:700;font-size:18px}.tbar-n.ok{color:#047857}
.tbar-h{font-size:12px;color:#64748b;margin-top:5px}
.bars{display:flex;flex-direction:column;gap:8px}.bars-row{display:flex;align-items:center;gap:10px}
.bars-l{width:150px;font-size:12.5px;color:#475569;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bars-row .bar{flex:1;height:16px}
.bars-n{width:28px;text-align:right;font-size:13px;font-weight:600}

/* lists */
.list{display:flex;flex-direction:column;gap:9px}
.item{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:13px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.item.open{border-color:rgba(2,132,199,.35);box-shadow:0 4px 18px rgba(2,132,199,.09)}
.item-hd{width:100%;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:13px 15px;background:none;border:none;text-align:left;cursor:pointer}
.item-main{min-width:0;flex:1}.item-name{font-weight:600;font-size:15px}.item-meta{font-size:12.5px;color:#64748b;margin-top:3px;overflow-wrap:anywhere}
.item-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
.item-bd{padding:0 15px 15px;border-top:1px solid rgba(15,23,42,.06)}
.kv{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.kv .val{font-size:13.5px;color:#334155;line-height:1.5}
.hist{margin-top:12px;display:flex;flex-direction:column;gap:6px}
.hist-row{font-size:12.5px;background:#f8fafc;border:1px solid rgba(15,23,42,.06);border-radius:8px;padding:8px 10px;line-height:1.5}
.hist-row .when{color:#94a3b8;font-size:11.5px}
.feed{display:flex;flex-direction:column;gap:6px}
.feed-row{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-top:1px solid rgba(15,23,42,.06)}.feed-row:first-child{border-top:none;padding-top:0}
.feed-t{font-size:11.5px;color:#94a3b8;width:62px;flex-shrink:0;padding-top:2px}
.feed-b{flex:1;min-width:0;font-size:13.5px;line-height:1.45}.feed-b .note{color:#475569;font-size:12.5px;margin-top:2px}
.dots{display:flex;gap:4px}.dot{width:10px;height:10px;border-radius:50%;background:#e2e8f0}.dot.y{background:#10b981}.dot.n{background:#fca5a5}
.tbl{width:100%;border-collapse:collapse;font-size:13px}.tbl th{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;text-align:left;padding:8px 8px;border-bottom:1px solid rgba(15,23,42,.08);font-weight:700}
.tbl td{padding:9px 8px;border-bottom:1px solid rgba(15,23,42,.05);vertical-align:middle}.tbl tr.off td{color:#94a3b8;background:#fafbfd}
.cell{display:inline-block;min-width:34px;text-align:center;padding:3px 7px;border-radius:6px;font-weight:600;font-size:12.5px}
.cell.ok{background:#ecfdf5;color:#047857}.cell.mid{background:#fffbeb;color:#b45309}.cell.bad{background:#fef2f2;color:#b91c1c}.cell.zero{background:#f1f5f9;color:#94a3b8}
.strip{display:grid;grid-template-columns:repeat(14,1fr);gap:4px}
.strip-d{text-align:center;font-size:10px;color:#94a3b8}.strip-b{height:34px;border-radius:6px;background:#eef2f7;position:relative;overflow:hidden;margin:3px 0}
.strip-b>i{position:absolute;left:0;right:0;bottom:0;background:#0284c7;border-radius:6px}.strip-b.ok>i{background:#10b981}.strip-b.off{background:#f8fafc}

/* modal */
.modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
.modal{background:#fff;border-radius:16px;width:100%;max-width:560px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 24px 80px rgba(15,23,42,.25)}
.modal.wide{max-width:760px}
.modal-hd{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(15,23,42,.08)}
.modal-hd h3{font-family:'Space Grotesk';font-size:16px;font-weight:700}
.modal-bd{padding:16px 18px;overflow-y:auto}
.t-toast{position:fixed;left:50%;bottom:96px;transform:translate(-50%,16px);background:#0f172a;color:#fff;padding:10px 16px;border-radius:10px;font-size:13.5px;font-weight:500;z-index:200;opacity:0;transition:all .25s;box-shadow:0 8px 30px rgba(15,23,42,.3);max-width:90vw}
.t-toast.show{opacity:1;transform:translate(-50%,0)}.t-toast.err{background:#b91c1c}

/* mobile */
@media (max-width:760px){
  .g2,.g3,.g4{grid-template-columns:1fr 1fr}.g3.stack,.g2.stack{grid-template-columns:1fr}
  .t-main{padding:14px 14px 96px}.t-hd-in{padding:10px 14px}
  .t-tabs{position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,.97);border-top:1px solid rgba(15,23,42,.08);padding:4px 4px calc(4px + env(safe-area-inset-bottom));z-index:40;max-width:none;gap:0;justify-content:space-around;overflow:hidden}
  .tw .t-tab{flex:1 1 0;flex-direction:column;gap:2px;padding:6px 2px;font-size:9.5px;letter-spacing:-.1px;border-bottom:none;min-width:0;position:relative}
  .tw .t-tab .ic{font-size:18px}.tw .t-tab .lb{max-width:100%;overflow:hidden;text-overflow:ellipsis}
  .tw .t-tab .tag{position:absolute;top:2px;right:4px;padding:0 5px;font-size:9.5px}
  .tw .t-tab.on{background:#f0f9ff;border-radius:10px}
  .kv{grid-template-columns:1fr}.bars-l{width:110px}
  .modal-bg{align-items:flex-end;padding:0}.modal{border-radius:18px 18px 0 0;max-height:94vh}
  .strip{grid-template-columns:repeat(7,1fr)}
}
@media (max-width:420px){.g2,.g3{grid-template-columns:1fr}.g4{grid-template-columns:1fr 1fr;gap:8px}}
`
