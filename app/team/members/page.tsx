'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, Loader2, LogOut, Phone, Search, X } from 'lucide-react'
import {
  BLOCKERS, CHECKIN_STATUS, GOAL_STATUS, MEMBERSHIP_STATUS, MEMBER_TYPES, OUTCOMES, PARTICIPATION, RENEWAL_SIGNAL, STAGES, SUPPORT_TYPES, TIME_AVAILABLE,
  label, type Checkin, type CrmProfile, type Goal, type Member,
} from '@/lib/crm'

/* Member Progress Dashboard — the team's view of every member: who they are, what
   they're building, their stage, 30-day goal, weekly check-ins and follow-ups. */

type Tab = 'directory' | 'followups' | 'board' | 'overview' | 'showcase'
const TABS: { key: Tab; label: string }[] = [
  { key: 'directory', label: 'Members' },
  { key: 'followups', label: 'Follow-ups' },
  { key: 'board', label: 'Stage board' },
  { key: 'overview', label: 'Overview' },
  { key: 'showcase', label: 'Showcase' },
]

const today = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10)
const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
const fmt = (d?: string | null) => (d ? new Date(d.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '')
const ago = (d?: string | null) => { if (!d) return 'never'; const n = daysBetween(d.slice(0, 10), today()); return n <= 0 ? 'today' : n === 1 ? 'yesterday' : `${n}d ago` }
const digits = (raw?: string | null) => { if (!raw) return ''; const d = raw.replace(/\D/g, ''); return d.length === 10 ? `91${d}` : d.length === 11 && d.startsWith('0') ? `91${d.slice(1)}` : d }
const activeGoal = (m: Member) => m.goals.find(g => g.status === 'active') ?? null
const lastCheckin = (m: Member) => m.checkins[0] ?? null

const inp = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-neutral-900'
const lbl = 'block text-[12px] font-medium text-neutral-600 mb-1'
const btn = 'inline-flex items-center justify-center gap-1.5 rounded-full px-4 h-9 text-[13px] font-medium transition-colors'
const btnPrimary = `${btn} text-white hover:brightness-110`
const btnGhost = `${btn} border border-neutral-200 hover:bg-neutral-50`

function Field({ name, children, hint }: { name: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className={lbl}>{name}{hint && <span className="ml-1 font-normal text-neutral-400">{hint}</span>}</label>
      {children}
    </div>
  )
}
function Select({ value, onChange, options, allowEmpty = true }: { value?: string | null; onChange: (v: string) => void; options: readonly { value: string; label: string }[]; allowEmpty?: boolean }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value)} className={inp}>
      {allowEmpty && <option value="">—</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' }) {
  const c = { neutral: 'bg-neutral-100 text-neutral-700', good: 'bg-emerald-50 text-emerald-700', warn: 'bg-amber-50 text-amber-700', bad: 'bg-red-50 text-red-700', info: 'bg-sky-50 text-sky-700' }[tone]
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${c}`}>{children}</span>
}
const stageTone = (s?: string | null) => (s === 'decide' ? 'neutral' : s === 'build' ? 'info' : s === 'launch' ? 'warn' : s === 'sell' ? 'good' : s === 'grow' ? 'good' : 'neutral') as 'neutral' | 'info' | 'warn' | 'good'
const checkTone = (s?: string | null) => (s === 'on_track' ? 'good' : s === 'at_risk' ? 'warn' : s === 'needs_support' ? 'bad' : 'neutral') as 'good' | 'warn' | 'bad' | 'neutral'

export default function TeamMembersPage() {
  const [auth, setAuth] = useState<'checking' | 'login' | 'ok'>('checking')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loginError, setLoginError] = useState(''); const [busy, setBusy] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [me, setMe] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('directory')
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({ stage: '', type: '', status: '', blocker: '', goal: '', renewal: '', contact: '' })
  const [sort, setSort] = useState<'member_no' | 'name' | 'last_contacted' | 'next_follow_up' | 'stage'>('member_no')
  const [openEmail, setOpenEmail] = useState<string | null>(null)

  useEffect(() => { fetch('/api/leads/verify').then(r => setAuth(r.ok ? 'ok' : 'login')).catch(() => setAuth('login')) }, [])
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/team/crm'); if (r.status === 401) { setAuth('login'); return }
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Failed to load')
      setMembers(j.members); setMe(j.me)
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load') } finally { setLoading(false) }
  }, [])
  useEffect(() => { if (auth === 'ok') load() }, [auth, load])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setLoginError('')
    try {
      const r = await fetch('/api/leads/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Login failed'); setAuth('ok')
    } catch (err) { setLoginError(err instanceof Error ? err.message : 'Login failed') } finally { setBusy(false) }
  }
  async function logout() { await fetch('/api/leads/auth', { method: 'DELETE' }); setAuth('login'); setMembers([]) }

  const post = useCallback(async (body: Record<string, unknown>) => {
    const r = await fetch('/api/team/crm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Save failed')
    await load()
  }, [load])

  const t = today()
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = members.filter(m => {
      const c = m.crm
      if (needle && !`${m.full_name} ${m.email} ${m.whatsapp ?? ''} ${c?.project_name ?? ''} ${c?.preferred_name ?? ''}`.toLowerCase().includes(needle)) return false
      if (filters.stage && (c?.stage ?? 'none') !== filters.stage) return false
      if (filters.type && (c?.member_type ?? 'none') !== filters.type) return false
      if (filters.status && (c?.membership_status ?? 'active') !== filters.status) return false
      if (filters.blocker && (c?.blocker ?? 'none') !== filters.blocker) return false
      if (filters.renewal && (c?.renewal_signal ?? 'not_discussed') !== filters.renewal) return false
      if (filters.goal) { const g = activeGoal(m); if (filters.goal === 'none' ? !!g : !g) return false }
      if (filters.contact) {
        const lc = c?.last_contacted ?? null
        if (filters.contact === 'never' && lc) return false
        if (filters.contact === '14' && lc && daysBetween(lc, t) <= 14) return false
        if (filters.contact === 'overdue' && !(c?.next_follow_up && c.next_follow_up < t)) return false
      }
      return true
    })
    const key = (m: Member) => sort === 'name' ? m.full_name.toLowerCase() : sort === 'last_contacted' ? (m.crm?.last_contacted ?? '0000') : sort === 'next_follow_up' ? (m.crm?.next_follow_up ?? '9999') : sort === 'stage' ? (m.crm?.stage ?? 'zz') : String(m.member_no).padStart(4, '0')
    list = [...list].sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)
    return list
  }, [members, q, filters, sort, t])

  const open = members.find(m => m.email.toLowerCase() === openEmail?.toLowerCase()) ?? null

  if (auth === 'checking') return <Shell><div className="py-32 flex justify-center text-neutral-400"><Loader2 className="w-6 h-6 animate-spin" /></div></Shell>
  if (auth === 'login') return (
    <Shell>
      <div className="max-w-sm mx-auto pt-16 md:pt-24">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Members</h1>
        <p className="mt-1 text-sm text-neutral-500">Sign in with your team or admin account.</p>
        <form onSubmit={login} className="mt-6 space-y-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="username" className={inp + ' py-3'} />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className={inp + ' py-3'} />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full h-12 text-[15px]`} style={{ background: '#0284c7' }}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </Shell>
  )

  return (
    <Shell
      right={
        <div className="flex items-center gap-2">
          <a href="/team" className={btnGhost + ' hidden sm:inline-flex'}>Leads</a>
          <a href="/api/team/crm?export=csv" className={btnGhost}><Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">CSV</span></a>
          <button onClick={logout} className={btnGhost}><LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Log out</span></button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="inline-flex rounded-full bg-white border border-neutral-200 p-1">
          {TABS.map(x => (
            <button key={x.key} onClick={() => setTab(x.key)} className={`rounded-full px-3.5 h-8 text-[13px] font-medium ${tab === x.key ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}>{x.label}</button>
          ))}
        </div>
        <span className="text-[13px] text-neutral-500">{members.length} members{loading ? ' · refreshing…' : ''}</span>
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {tab === 'directory' && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, phone, project" className={inp + ' pl-9 w-72'} />
            </div>
            {([
              ['stage', 'Stage', [{ value: 'none', label: 'Not set' }, ...STAGES]],
              ['type', 'Type', [{ value: 'none', label: 'Not set' }, ...MEMBER_TYPES]],
              ['status', 'Status', MEMBERSHIP_STATUS],
              ['blocker', 'Blocker', [{ value: 'none', label: 'Not set' }, ...BLOCKERS]],
              ['goal', 'Goal', [{ value: 'has', label: 'Has a goal' }, { value: 'none', label: 'No goal yet' }]],
              ['renewal', 'Renewal', RENEWAL_SIGNAL],
              ['contact', 'Contact', [{ value: 'never', label: 'Never contacted' }, { value: '14', label: 'No contact in 14 days' }, { value: 'overdue', label: 'Follow-up overdue' }]],
            ] as const).map(([k, name, opts]) => (
              <select key={k} value={filters[k]} onChange={e => setFilters({ ...filters, [k]: e.target.value })} className="rounded-lg border border-neutral-200 bg-white px-2.5 h-9 text-[13px]">
                <option value="">{name}: all</option>
                {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="rounded-lg border border-neutral-200 bg-white px-2.5 h-9 text-[13px]">
              <option value="member_no">Sort: member #</option><option value="name">Sort: name</option><option value="stage">Sort: stage</option><option value="last_contacted">Sort: last contact</option><option value="next_follow_up">Sort: next follow-up</option>
            </select>
            {(q || Object.values(filters).some(Boolean)) && <button onClick={() => { setQ(''); setFilters({ stage: '', type: '', status: '', blocker: '', goal: '', renewal: '', contact: '' }) }} className="text-[13px] text-neutral-500 hover:text-neutral-900">Clear</button>}
          </div>
          <div className="rounded-[18px] bg-white border border-neutral-200 overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-neutral-500 border-b border-neutral-200">
                {['#', 'Member', 'Type', 'Stage', '30-day goal', 'Last check-in', 'Last contact', 'Next follow-up', 'Status'].map(h => <th key={h} className="font-medium px-3 py-2.5 whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(m => {
                  const c = m.crm; const g = activeGoal(m); const ci = lastCheckin(m)
                  const overdue = c?.next_follow_up && c.next_follow_up < t
                  return (
                    <tr key={m.email} onClick={() => setOpenEmail(m.email)} className="border-b border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                      <td className="px-3 py-2.5 text-neutral-400 tabular-nums">{m.member_no}</td>
                      <td className="px-3 py-2.5"><div className="font-medium">{c?.preferred_name || m.full_name}</div><div className="text-[12px] text-neutral-500">{c?.project_name || m.self?.what_building?.slice(0, 50) || m.email}</div></td>
                      <td className="px-3 py-2.5 text-neutral-600 whitespace-nowrap">{label(MEMBER_TYPES, c?.member_type) || <span className="text-neutral-300">—</span>}</td>
                      <td className="px-3 py-2.5">{c?.stage ? <Pill tone={stageTone(c.stage)}>{label(STAGES, c.stage)}</Pill> : <span className="text-neutral-300">—</span>}</td>
                      <td className="px-3 py-2.5 max-w-[260px]">{g ? <><div className="truncate">{g.goal}</div><div className="text-[11px] text-neutral-500">due {fmt(g.due_on)}{g.due_on && g.due_on < t ? ' · overdue' : ''}</div></> : <span className="text-neutral-300">no goal</span>}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{ci ? <><Pill tone={checkTone(ci.status)}>{label(CHECKIN_STATUS, ci.status)}</Pill><span className="ml-1.5 text-[11px] text-neutral-500">{ago(ci.week_of)}</span></> : <span className="text-neutral-300">—</span>}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-neutral-600">{ago(c?.last_contacted)}</td>
                      <td className={`px-3 py-2.5 whitespace-nowrap ${overdue ? 'text-red-600 font-medium' : 'text-neutral-600'}`}>{c?.next_follow_up ? fmt(c.next_follow_up) : '—'}</td>
                      <td className="px-3 py-2.5"><Pill tone={(c?.membership_status ?? 'active') === 'active' ? 'good' : c?.membership_status === 'left' ? 'bad' : 'warn'}>{label(MEMBERSHIP_STATUS, c?.membership_status ?? 'active')}</Pill></td>
                    </tr>
                  )
                })}
                {!filtered.length && <tr><td colSpan={9} className="px-3 py-10 text-center text-neutral-500">No members match.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'followups' && <Followups members={members} onOpen={setOpenEmail} post={post} />}
      {tab === 'board' && <Board members={members} onOpen={setOpenEmail} />}
      {tab === 'overview' && <Overview members={members} />}
      {tab === 'showcase' && <Showcase members={members} onOpen={setOpenEmail} />}

      {open && <Profile key={open.email + open.crm?.updated_at} m={open} me={me} onClose={() => setOpenEmail(null)} post={post} />}
    </Shell>
  )
}

/* ─── Profile slide-over ─── */
function Profile({ m, me, onClose, post }: { m: Member; me: string; onClose: () => void; post: (b: Record<string, unknown>) => Promise<void> }) {
  const blank: CrmProfile = { email: m.email, preferred_name: null, membership_status: 'active', member_type: null, project_name: null, building: null, target_user: null, stage: null, stage_evidence: null, main_outcome: null, blocker: null, time_available: null, preferred_support: [], preferred_participation: null, skills: null, can_offer: null, call_notes: null, last_contacted: null, next_follow_up: null, renewal_signal: null, showcase_permission: false, demo_url: null, board_summary: null, board_hidden: false, updated_at: null, updated_by: null }
  const [f, setF] = useState<CrmProfile>({ ...blank, ...(m.crm ?? {}) })
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const set = (k: keyof CrmProfile, v: unknown) => setF(p => ({ ...p, [k]: v }))
  const stageChanged = (m.crm?.stage ?? null) !== (f.stage || null)
  const t = today()
  const g = activeGoal(m)
  const [newGoal, setNewGoal] = useState({ goal: '', next_action: '', due_on: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10) })
  const [review, setReview] = useState({ status: '', result: '', proof: '', learning: '', reason: '' })
  const [ci, setCi] = useState<Partial<Checkin>>({ week_of: t, status: 'on_track' })
  const section = 'rounded-[18px] border border-neutral-200 bg-white p-4 md:p-5'

  async function run(name: string, body: Record<string, unknown>) {
    setSaving(name); setMsg('')
    try { await post(body); setMsg('Saved') } catch (e) { setMsg(e instanceof Error ? e.message : 'Save failed') } finally { setSaving(null); setTimeout(() => setMsg(''), 2500) }
  }
  const saveProfile = () => {
    if (stageChanged && !reason.trim()) { setMsg('Add a short reason for the stage change'); return }
    const { email: _e, updated_at: _u, updated_by: _b, ...fields } = f; void _e; void _u; void _b
    run('profile', { action: 'profile', email: m.email, fields, reason: reason.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-[720px] bg-neutral-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-5 py-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.01em]">{m.full_name}{f.preferred_name && f.preferred_name !== m.full_name ? <span className="text-neutral-500 font-normal"> · “{f.preferred_name}”</span> : null}</h2>
            <p className="text-[12px] text-neutral-500">Member #{m.member_no} · Cohort {m.cohort} · {m.plan === 'annual' ? '12-month' : '6-month'} plan · joined {fmt(m.joined_at)}{m.crm?.updated_at ? ` · last edited ${ago(m.crm.updated_at)} by ${m.crm.updated_by?.split('@')[0]}` : ''}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {m.whatsapp && <a href={`https://wa.me/${digits(m.whatsapp)}`} target="_blank" rel="noopener noreferrer" className={btnGhost + ' h-8 px-3 text-[12px]'}>WhatsApp {m.whatsapp}</a>}
              {m.whatsapp && <a href={`tel:+${digits(m.whatsapp)}`} className={btnGhost + ' h-8 px-3 text-[12px]'}><Phone className="w-3 h-3" /> Call</a>}
              <a href={`mailto:${m.email}`} className={btnGhost + ' h-8 px-3 text-[12px]'}>{m.email}</a>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {m.self && (m.self.what_building || m.self.problem || m.self.need_help_with) && (
            <div className="rounded-[18px] border border-sky-200 bg-sky-50 p-4 text-[13px]">
              <p className="font-medium text-sky-900 mb-1">What they wrote in their own portal profile</p>
              {m.self.what_building && <p><span className="text-sky-700">Building:</span> {m.self.what_building}</p>}
              {m.self.who_its_for && <p><span className="text-sky-700">For:</span> {m.self.who_its_for}</p>}
              {m.self.problem && <p><span className="text-sky-700">Problem:</span> {m.self.problem}</p>}
              {m.self.need_help_with && <p><span className="text-sky-700">Needs help with:</span> {m.self.need_help_with}</p>}
              {m.self.link && <p><a href={m.self.link} target="_blank" rel="noopener noreferrer" className="underline text-sky-800">{m.self.link}</a></p>}
            </div>
          )}

          {/* Call profile */}
          <section className={section}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">Member profile</h3><span className="text-[12px] text-neutral-500">Fill what you can; the call should take 8–12 minutes</span></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field name="Preferred name"><input value={f.preferred_name ?? ''} onChange={e => set('preferred_name', e.target.value)} className={inp} /></Field>
              <Field name="Membership status" hint="required"><Select value={f.membership_status} onChange={v => set('membership_status', v)} options={MEMBERSHIP_STATUS} allowEmpty={false} /></Field>
              <Field name="Member type" hint="required"><Select value={f.member_type} onChange={v => set('member_type', v)} options={MEMBER_TYPES} /></Field>
              <Field name="Project or business name"><input value={f.project_name ?? ''} onChange={e => set('project_name', e.target.value)} className={inp} /></Field>
              <div className="sm:col-span-2"><Field name="What are they trying to build or improve?" hint="required, plain language"><textarea value={f.building ?? ''} onChange={e => set('building', e.target.value)} className={inp + ' min-h-[70px]'} /></Field></div>
              <Field name="Target user / customer" hint="who is this for?"><input value={f.target_user ?? ''} onChange={e => set('target_user', e.target.value)} className={inp} /></Field>
              <Field name="Current stage" hint="required"><Select value={f.stage} onChange={v => set('stage', v)} options={STAGES} />{f.stage && <p className="mt-1 text-[11px] text-neutral-500">{STAGES.find(s => s.value === f.stage)?.hint}</p>}</Field>
              {stageChanged && <div className="sm:col-span-2"><Field name="Reason for the stage change" hint="required, goes in the history"><input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. MVP deployed, first users onboarded" className={inp} /></Field></div>}
              <div className="sm:col-span-2"><Field name="Stage evidence" hint="what exists today?"><input value={f.stage_evidence ?? ''} onChange={e => set('stage_evidence', e.target.value)} placeholder="idea, prototype, live product, first users, paying customers, workflow in use" className={inp} /></Field></div>
              <Field name="Main outcome wanted" hint="required"><Select value={f.main_outcome} onChange={v => set('main_outcome', v)} options={OUTCOMES} /></Field>
              <Field name="Biggest current blocker" hint="required"><Select value={f.blocker} onChange={v => set('blocker', v)} options={BLOCKERS} /></Field>
              <Field name="Time available" hint="required"><Select value={f.time_available} onChange={v => set('time_available', v)} options={TIME_AVAILABLE} /></Field>
              <Field name="Preferred participation"><Select value={f.preferred_participation} onChange={v => set('preferred_participation', v)} options={PARTICIPATION} /></Field>
              <div className="sm:col-span-2">
                <label className={lbl}>Preferred support</label>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORT_TYPES.map(s => { const on = f.preferred_support?.includes(s.value); return <button type="button" key={s.value} onClick={() => set('preferred_support', on ? f.preferred_support.filter(x => x !== s.value) : [...(f.preferred_support ?? []), s.value])} className={`rounded-full px-3 h-8 text-[12px] font-medium border ${on ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 bg-white hover:border-neutral-400'}`}>{s.label}</button> })}
                </div>
              </div>
              <Field name="Relevant skills or experience"><input value={f.skills ?? ''} onChange={e => set('skills', e.target.value)} className={inp} /></Field>
              <Field name="Help they can offer others"><input value={f.can_offer ?? ''} onChange={e => set('can_offer', e.target.value)} className={inp} /></Field>
              <div className="sm:col-span-2"><Field name="Call notes" hint="internal, factual and respectful"><textarea value={f.call_notes ?? ''} onChange={e => set('call_notes', e.target.value)} className={inp + ' min-h-[90px]'} /></Field></div>
              <Field name="Last contacted"><input type="date" value={f.last_contacted ?? ''} onChange={e => set('last_contacted', e.target.value)} className={inp} /></Field>
              <Field name="Next follow-up"><input type="date" value={f.next_follow_up ?? ''} onChange={e => set('next_follow_up', e.target.value)} className={inp} /></Field>
              <Field name="Renewal signal" hint="only after a respectful conversation"><Select value={f.renewal_signal} onChange={v => set('renewal_signal', v)} options={RENEWAL_SIGNAL} /></Field>
              <Field name="Demo / project URL"><input value={f.demo_url ?? ''} onChange={e => set('demo_url', e.target.value)} placeholder="https://" className={inp} /></Field>
              <label className="sm:col-span-2 flex items-center gap-2 text-[13px]"><input type="checkbox" checked={!!f.showcase_permission} onChange={e => set('showcase_permission', e.target.checked)} /> Member has given permission to feature their project publicly</label>
              <div className="sm:col-span-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2">
                <p className="text-[12px] font-medium text-neutral-700">Members&apos; Journey board <span className="font-normal text-neutral-500">· every member sees the stage, this line, and the 30-day goal and next action</span></p>
                <Field name="One line about what they’re building" hint="shown to members"><input value={f.board_summary ?? ''} onChange={e => set('board_summary', e.target.value)} placeholder={m.self?.what_building || 'e.g. HR and payroll app for small Indian companies'} className={inp} /></Field>
                <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={!!f.board_hidden} onChange={e => set('board_hidden', e.target.checked)} /> Hide this member from the Journey board</label>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={saveProfile} disabled={saving === 'profile'} className={btnPrimary} style={{ background: '#0284c7' }}>{saving === 'profile' ? 'Saving…' : 'Save profile'}</button>
              <button onClick={() => set('last_contacted', t)} className={btnGhost}>Contacted today</button>
              {msg && <span className="text-[13px] text-neutral-600">{msg}</span>}
            </div>
          </section>

          {/* 30-day goal */}
          <section className={section}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold">30-day goal</h3><span className="text-[12px] text-neutral-500">Goal and next action are shown on the members&apos; Journey board</span></div>
            {g ? (
              <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
                <p className="text-[14px] font-medium">{g.goal}</p>
                {g.next_action && <p className="mt-1 text-[13px] text-neutral-600">Next action: {g.next_action}</p>}
                <p className="mt-1 text-[12px] text-neutral-500">Set {fmt(g.set_on)} · due {fmt(g.due_on)}{g.due_on ? ` (${daysBetween(t, g.due_on)} days ${g.due_on < t ? 'overdue' : 'left'})` : ''} · by {g.created_by?.split('@')[0]}</p>
                <details className="mt-3">
                  <summary className="text-[13px] font-medium cursor-pointer">Monthly review: mark the result</summary>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <Field name="Goal status"><Select value={review.status} onChange={v => setReview({ ...review, status: v })} options={GOAL_STATUS.filter(s => s.value !== 'active')} /></Field>
                    <Field name="Reason / note"><input value={review.reason} onChange={e => setReview({ ...review, reason: e.target.value })} className={inp} /></Field>
                    <div className="sm:col-span-2"><Field name="Result" hint="what changed? an outcome, not activity"><textarea value={review.result} onChange={e => setReview({ ...review, result: e.target.value })} className={inp + ' min-h-[60px]'} /></Field></div>
                    <Field name="Proof" hint="demo, link, payment, metric"><input value={review.proof} onChange={e => setReview({ ...review, proof: e.target.value })} className={inp} /></Field>
                    <Field name="Learning" hint="what did they learn, what blocked them"><input value={review.learning} onChange={e => setReview({ ...review, learning: e.target.value })} className={inp} /></Field>
                  </div>
                  <button onClick={() => review.status && run('review', { action: 'goal_review', id: g.id, ...review })} disabled={!review.status || saving === 'review'} className={btnPrimary + ' mt-3 disabled:opacity-50'} style={{ background: '#0284c7' }}>{saving === 'review' ? 'Saving…' : 'Save review'}</button>
                </details>
              </div>
            ) : <p className="text-[13px] text-neutral-500">No goal agreed yet.</p>}
            <details className="mt-3" open={!g}>
              <summary className="text-[13px] font-medium cursor-pointer">{g ? 'Set the next goal' : 'Agree a goal'}</summary>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div className="sm:col-span-2"><Field name="One specific, observable outcome" hint="agreed with the member, not assigned"><input value={newGoal.goal} onChange={e => setNewGoal({ ...newGoal, goal: e.target.value })} placeholder="e.g. 5 customer calls done and one pays for a pilot" className={inp} /></Field></div>
                <Field name="Next action" hint="one thing they commit to doing next"><input value={newGoal.next_action} onChange={e => setNewGoal({ ...newGoal, next_action: e.target.value })} className={inp} /></Field>
                <Field name="Due"><input type="date" value={newGoal.due_on} onChange={e => setNewGoal({ ...newGoal, due_on: e.target.value })} className={inp} /></Field>
              </div>
              <button onClick={() => newGoal.goal.trim() && run('goal', { action: 'goal', email: m.email, ...newGoal }).then(() => setNewGoal({ ...newGoal, goal: '', next_action: '' }))} disabled={!newGoal.goal.trim() || saving === 'goal'} className={btnPrimary + ' mt-3 disabled:opacity-50'} style={{ background: '#0284c7' }}>{saving === 'goal' ? 'Saving…' : 'Save goal'}</button>
            </details>
            {m.goals.filter(x => x.status !== 'active').length > 0 && (
              <div className="mt-4">
                <p className="text-[12px] font-medium text-neutral-500 mb-2">Previous goals</p>
                <ul className="space-y-2">
                  {m.goals.filter(x => x.status !== 'active').map(x => (
                    <li key={x.id} className="text-[13px] rounded-lg border border-neutral-200 p-3">
                      <div className="flex items-center justify-between gap-3"><span className="font-medium">{x.goal}</span><Pill tone={x.status === 'achieved' ? 'good' : x.status === 'partly' ? 'warn' : x.status === 'not_achieved' ? 'bad' : 'neutral'}>{label(GOAL_STATUS, x.status)}</Pill></div>
                      <p className="text-[12px] text-neutral-500 mt-0.5">{fmt(x.set_on)} → {fmt(x.reviewed_on ?? x.due_on)}</p>
                      {x.result && <p className="mt-1 text-neutral-700">Result: {x.result}</p>}
                      {x.proof && <p className="text-neutral-600">Proof: {x.proof}</p>}
                      {x.learning && <p className="text-neutral-600">Learning: {x.learning}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Weekly check-ins */}
          <section className={section}>
            <h3 className="font-semibold mb-3">Weekly check-ins</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field name="Week of"><input type="date" value={ci.week_of ?? t} onChange={e => setCi({ ...ci, week_of: e.target.value })} className={inp} /></Field>
              <Field name="Status"><Select value={ci.status} onChange={v => setCi({ ...ci, status: v })} options={CHECKIN_STATUS} allowEmpty={false} /></Field>
              <div className="sm:col-span-2"><Field name="Progress since last check-in" hint="‘none this week’ is fine"><textarea value={ci.progress ?? ''} onChange={e => setCi({ ...ci, progress: e.target.value })} className={inp + ' min-h-[60px]'} /></Field></div>
              <Field name="Evidence / link"><input value={ci.evidence ?? ''} onChange={e => setCi({ ...ci, evidence: e.target.value })} className={inp} /></Field>
              <Field name="Current blocker"><input value={ci.blocker ?? ''} onChange={e => setCi({ ...ci, blocker: e.target.value })} className={inp} /></Field>
              <Field name="Help requested" hint="what, and from whom"><input value={ci.help_requested ?? ''} onChange={e => setCi({ ...ci, help_requested: e.target.value })} className={inp} /></Field>
              <Field name="Next action"><input value={ci.next_action ?? ''} onChange={e => setCi({ ...ci, next_action: e.target.value })} className={inp} /></Field>
              <Field name="Follow-up owner"><input value={ci.followup_owner ?? ''} onChange={e => setCi({ ...ci, followup_owner: e.target.value })} placeholder={me.split('@')[0]} className={inp} /></Field>
              <Field name="Follow-up due"><input type="date" value={ci.followup_due ?? ''} onChange={e => setCi({ ...ci, followup_due: e.target.value })} className={inp} /></Field>
            </div>
            <button onClick={() => run('checkin', { action: 'checkin', email: m.email, fields: ci }).then(() => setCi({ week_of: t, status: 'on_track' }))} disabled={saving === 'checkin'} className={btnPrimary + ' mt-3'} style={{ background: '#0284c7' }}>{saving === 'checkin' ? 'Saving…' : 'Save check-in'}</button>
            {m.checkins.length > 0 && (
              <ul className="mt-4 space-y-2">
                {m.checkins.map(x => (
                  <li key={x.id} className="text-[13px] rounded-lg border border-neutral-200 p-3">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{fmt(x.week_of)}</span><Pill tone={checkTone(x.status)}>{label(CHECKIN_STATUS, x.status)}</Pill><span className="text-[11px] text-neutral-400">by {x.created_by?.split('@')[0]}</span></div>
                    {x.progress && <p className="mt-1">{x.progress}</p>}
                    {x.evidence && <p className="text-neutral-600">Evidence: <a href={x.evidence.startsWith('http') ? x.evidence : undefined} className="underline" target="_blank" rel="noopener noreferrer">{x.evidence}</a></p>}
                    {x.blocker && <p className="text-neutral-600">Blocker: {x.blocker}</p>}
                    {x.help_requested && <p className="text-neutral-600">Help: {x.help_requested}</p>}
                    {x.next_action && <p className="text-neutral-600">Next: {x.next_action}</p>}
                    {(x.followup_owner || x.followup_due || x.help_requested) && (
                      <label className="mt-2 inline-flex items-center gap-2 text-[12px] text-neutral-600"><input type="checkbox" checked={x.followup_done} onChange={e => run('ci' + x.id, { action: 'checkin_update', id: x.id, fields: { followup_done: e.target.checked } })} /> Follow-up done{x.followup_owner ? ` (${x.followup_owner}` : ''}{x.followup_due ? `${x.followup_owner ? ', ' : '('}due ${fmt(x.followup_due)})` : x.followup_owner ? ')' : ''}</label>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {m.history.length > 0 && (
            <section className={section}>
              <h3 className="font-semibold mb-2">History</h3>
              <ul className="space-y-1.5 text-[12px] text-neutral-600">
                {m.history.map(h => <li key={h.id}><span className="text-neutral-400">{fmt(h.changed_at)}</span> · <span className="font-medium text-neutral-800">{h.field}</span>: {h.old_value ? `${h.old_value} → ` : ''}{h.new_value}{h.reason ? ` · ${h.reason}` : ''} · {h.changed_by?.split('@')[0]}</li>)}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}

/* ─── Follow-ups queue ─── */
function Followups({ members, onOpen, post }: { members: Member[]; onOpen: (e: string) => void; post: (b: Record<string, unknown>) => Promise<void> }) {
  const t = today(); const week = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const active = members.filter(m => (m.crm?.membership_status ?? 'active') !== 'left')
  const overdue = active.filter(m => m.crm?.next_follow_up && m.crm.next_follow_up < t)
  const dueSoon = active.filter(m => m.crm?.next_follow_up && m.crm.next_follow_up >= t && m.crm.next_follow_up <= week)
  const help = active.flatMap(m => m.checkins.filter(c => c.help_requested && !c.followup_done).map(c => ({ m, c })))
  const atRisk = active.filter(m => { const c = lastCheckin(m); return c && (c.status === 'at_risk' || c.status === 'needs_support') })
  const never = active.filter(m => !m.crm?.last_contacted)
  const stale = active.filter(m => m.crm?.last_contacted && daysBetween(m.crm.last_contacted, t) > 14)
  const goalsDue = active.filter(m => { const g = activeGoal(m); return g?.due_on && g.due_on <= week })
  const Group = ({ title, items, render }: { title: string; items: Member[]; render?: (m: Member) => React.ReactNode }) => (
    <section className="rounded-[18px] bg-white border border-neutral-200 p-4">
      <h3 className="font-semibold text-[14px] mb-2">{title} <span className="text-neutral-400 font-normal">{items.length}</span></h3>
      {items.length ? <ul className="divide-y divide-neutral-100">{items.map(m => <li key={m.email} onClick={() => onOpen(m.email)} className="py-2 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50 -mx-2 px-2 rounded-lg"><span className="text-[13px] font-medium">{m.crm?.preferred_name || m.full_name}</span><span className="text-[12px] text-neutral-500">{render ? render(m) : ''}</span></li>)}</ul> : <p className="text-[13px] text-neutral-400">Nothing here.</p>}
    </section>
  )
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Group title="Follow-ups overdue" items={overdue} render={m => `was due ${fmt(m.crm?.next_follow_up)}`} />
      <Group title="Due in the next 7 days" items={dueSoon} render={m => fmt(m.crm?.next_follow_up)} />
      <section className="rounded-[18px] bg-white border border-neutral-200 p-4">
        <h3 className="font-semibold text-[14px] mb-2">Open help requests <span className="text-neutral-400 font-normal">{help.length}</span></h3>
        {help.length ? <ul className="divide-y divide-neutral-100">{help.map(({ m, c }) => (
          <li key={c.id} className="py-2 text-[13px]">
            <div className="flex items-center justify-between gap-3"><button onClick={() => onOpen(m.email)} className="font-medium hover:underline text-left">{m.crm?.preferred_name || m.full_name}</button><span className="text-[12px] text-neutral-500">{fmt(c.week_of)}{c.followup_owner ? ` · ${c.followup_owner}` : ''}{c.followup_due ? ` · due ${fmt(c.followup_due)}` : ''}</span></div>
            <p className="text-neutral-700">{c.help_requested}</p>
            <button onClick={() => post({ action: 'checkin_update', id: c.id, fields: { followup_done: true } })} className="mt-1 text-[12px] text-sky-700 hover:underline">Mark resolved</button>
          </li>
        ))}</ul> : <p className="text-[13px] text-neutral-400">Nothing open.</p>}
      </section>
      <Group title="At risk or needs support" items={atRisk} render={m => label(CHECKIN_STATUS, lastCheckin(m)?.status)} />
      <Group title="Goals due this week or overdue" items={goalsDue} render={m => `due ${fmt(activeGoal(m)?.due_on)}`} />
      <Group title="Never contacted" items={never} render={m => `joined ${fmt(m.joined_at)}`} />
      <Group title="No contact in 14+ days" items={stale} render={m => ago(m.crm?.last_contacted)} />
    </div>
  )
}

/* ─── Stage board ─── */
function Board({ members, onOpen }: { members: Member[]; onOpen: (e: string) => void }) {
  const active = members.filter(m => (m.crm?.membership_status ?? 'active') !== 'left')
  const cols = [...STAGES.map(s => ({ key: s.value, label: s.label })), { key: 'none', label: 'Stage not set' }]
  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cols.map(col => {
        const items = active.filter(m => (m.crm?.stage ?? 'none') === col.key)
        return (
          <section key={col.key} className={`rounded-[18px] border p-3 ${col.key === 'grow' ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-neutral-200'}`}>
            <h3 className="text-[13px] font-semibold mb-2 flex items-center justify-between">{col.label}<span className="text-neutral-400 font-normal">{items.length}</span></h3>
            <div className="space-y-2">
              {items.map(m => { const g = activeGoal(m); const ci = lastCheckin(m); return (
                <button key={m.email} onClick={() => onOpen(m.email)} className="w-full text-left rounded-xl border border-neutral-200 bg-white p-3 hover:border-neutral-400">
                  <p className="text-[13px] font-medium">{m.crm?.preferred_name || m.full_name}</p>
                  {m.crm?.project_name && <p className="text-[11px] text-neutral-500">{m.crm.project_name}</p>}
                  {g ? <p className="mt-1 text-[12px] text-neutral-700 line-clamp-2">🎯 {g.goal}</p> : <p className="mt-1 text-[12px] text-neutral-400">No goal yet</p>}
                  {g?.next_action && <p className="text-[12px] text-neutral-500 line-clamp-1">→ {g.next_action}</p>}
                  {ci && <div className="mt-1.5"><Pill tone={checkTone(ci.status)}>{label(CHECKIN_STATUS, ci.status)}</Pill></div>}
                </button>
              ) })}
              {!items.length && <p className="text-[12px] text-neutral-400">—</p>}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* ─── Overview ─── */
function Overview({ members }: { members: Member[] }) {
  const t = today(); const d30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10); const d14 = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10); const d7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const active = members.filter(m => (m.crm?.membership_status ?? 'active') !== 'left')
  const profiled = active.filter(m => m.crm?.stage)
  const withGoal = active.filter(m => activeGoal(m))
  const withNext = active.filter(m => activeGoal(m)?.next_action)
  const checked14 = active.filter(m => m.checkins.some(c => c.week_of >= d14))
  const checked7 = active.flatMap(m => m.checkins.filter(c => c.week_of >= d7)).length
  const reviewed30 = active.flatMap(m => m.goals.filter(g => g.reviewed_on && g.reviewed_on >= d30 && g.status !== 'changed'))
  const achieved = reviewed30.filter(g => g.status === 'achieved').length; const partly = reviewed30.filter(g => g.status === 'partly').length
  const moves30 = active.flatMap(m => m.history.filter(h => h.field === 'Stage' && h.changed_at.slice(0, 10) >= d30)).length
  const helpAll = active.flatMap(m => m.checkins.filter(c => c.help_requested)); const helpDone = helpAll.filter(c => c.followup_done).length
  const needSupport = active.filter(m => { const c = lastCheckin(m); return c && (c.status === 'at_risk' || c.status === 'needs_support') }).length
  const count = (list: readonly { value: string; label: string }[], pick: (m: Member) => string | null | undefined) => list.map(o => ({ name: o.label, n: active.filter(m => pick(m) === o.value).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n)
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
  const tiles = [
    { l: 'Active members', v: String(active.length) },
    { l: 'Profile filled (stage set)', v: `${profiled.length} · ${pct(profiled.length, active.length)}%` },
    { l: 'Have a current goal', v: `${withGoal.length} · ${pct(withGoal.length, active.length)}%` },
    { l: 'Goal with a next action', v: `${withNext.length} · ${pct(withNext.length, active.length)}%` },
    { l: 'Checked in, last 14 days', v: `${checked14.length} · ${pct(checked14.length, active.length)}%` },
    { l: 'Check-ins logged, last 7 days', v: String(checked7) },
    { l: 'Goals reviewed, last 30 days', v: `${reviewed30.length} (${achieved} achieved, ${partly} partly)` },
    { l: 'Stage moves, last 30 days', v: String(moves30) },
    { l: 'Help requests resolved', v: `${helpDone} of ${helpAll.length}` },
    { l: 'Members needing support', v: String(needSupport) },
  ]
  const Bars = ({ title, rows }: { title: string; rows: { name: string; n: number }[] }) => (
    <section className="rounded-[18px] bg-white border border-neutral-200 p-4">
      <h3 className="font-semibold text-[14px] mb-3">{title}</h3>
      {rows.length ? rows.map(r => <div key={r.name} className="flex items-center gap-2 text-[13px] mb-1.5"><span className="w-40 shrink-0 truncate text-neutral-700">{r.name}</span><div className="flex-1 h-2 rounded bg-neutral-100 overflow-hidden"><div className="h-full rounded" style={{ width: `${pct(r.n, active.length)}%`, background: '#2a78d6' }} /></div><span className="w-8 text-right tabular-nums text-neutral-600">{r.n}</span></div>) : <p className="text-[13px] text-neutral-400">No data yet.</p>}
    </section>
  )
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {tiles.map(x => <div key={x.l} className="rounded-[18px] bg-white border border-neutral-200 p-4"><p className="text-[12px] text-neutral-500">{x.l}</p><p className="mt-1 text-xl font-semibold tracking-[-0.02em]">{x.v}</p></div>)}
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Bars title="By stage" rows={count(STAGES, m => m.crm?.stage)} />
        <Bars title="By member type" rows={count(MEMBER_TYPES, m => m.crm?.member_type)} />
        <Bars title="By blocker" rows={count(BLOCKERS, m => m.crm?.blocker)} />
        <Bars title="Outcome wanted" rows={count(OUTCOMES, m => m.crm?.main_outcome)} />
      </div>
      <p className="text-[12px] text-neutral-400">Progress is what counts here, not attendance. Numbers come from what the team records on calls, goals and check-ins; today is {fmt(t)}.</p>
    </div>
  )
}

/* ─── Showcase ─── */
function Showcase({ members, onOpen }: { members: Member[]; onOpen: (e: string) => void }) {
  const ok = members.filter(m => m.crm?.showcase_permission)
  const maybe = members.filter(m => !m.crm?.showcase_permission && (m.crm?.demo_url || m.goals.some(g => g.status === 'achieved')))
  const Card = ({ m }: { m: Member }) => { const done = m.goals.find(g => g.status === 'achieved' || g.status === 'partly'); return (
    <button onClick={() => onOpen(m.email)} className="text-left rounded-[18px] bg-white border border-neutral-200 p-4 hover:border-neutral-400">
      <p className="font-medium">{m.crm?.preferred_name || m.full_name}</p>
      <p className="text-[12px] text-neutral-500">{m.crm?.project_name || '—'}{m.crm?.stage ? ` · ${label(STAGES, m.crm.stage)}` : ''}</p>
      {done?.result && <p className="mt-2 text-[13px] text-neutral-700">{done.result}</p>}
      {m.crm?.demo_url && <p className="mt-1 text-[12px] text-sky-700 truncate">{m.crm.demo_url}</p>}
    </button>
  ) }
  return (
    <div className="space-y-6">
      <div><h3 className="font-semibold mb-2">Cleared to feature <span className="text-neutral-400 font-normal">{ok.length}</span></h3><p className="text-[12px] text-neutral-500 mb-3">Members who gave explicit permission. Anything public still needs Prithal’s approval.</p>
        {ok.length ? <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{ok.map(m => <Card key={m.email} m={m} />)}</div> : <p className="text-[13px] text-neutral-400">Nobody yet. Tick “permission to feature” on a profile after asking the member.</p>}</div>
      {maybe.length > 0 && <div><h3 className="font-semibold mb-2">Worth asking <span className="text-neutral-400 font-normal">{maybe.length}</span></h3><p className="text-[12px] text-neutral-500 mb-3">Have a demo link or an achieved goal, but haven’t been asked for permission.</p><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">{maybe.map(m => <Card key={m.email} m={m} />)}</div></div>}
    </div>
  )
}

function Shell({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="text-[15px] font-semibold">Founders Wing</span><span className="text-neutral-300">/</span><span className="text-[15px] font-medium">Members</span></div>
          {right}
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 md:px-6 py-6">{children}</main>
    </div>
  )
}
