'use client'

import { useEffect, useState, useCallback } from 'react'

type Kpis = {
  leadsWorked: number; reached: number; interested: number; converted: number
  callAttempts: number; conversionRate: number; reachRate: number
}
type Funnel = { stage: string; count: number }[]
type Outcome = { value: string; label: string; color: string; count: number }
type TrendPoint = { label: string; calls: number; conversions: number }
type Scope = { kpis: Kpis; funnel: Funnel; outcomes: Outcome[]; trends: { daily: TrendPoint[]; weekly: TrendPoint[]; monthly: TrendPoint[] } }
type Data = { generatedAt: string; eventsLogged: number; team: Scope; all: Scope }

const C = {
  bg: '#f5f7fb', card: '#ffffff', ink: '#0f172a', mute: '#64748b', faint: '#94a3b8',
  border: '#e6ebf2', accent: '#0284c7', accentSoft: '#e0f2fe', good: '#10b981', line: '#0f172a',
}

export default function PerformancePage() {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState<'team' | 'all'>('team')
  const [tf, setTf] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    fetch('/api/leads/verify')
      .then(r => r.json())
      .then(d => { if (d.authenticated && d.role === 'admin') setAuthed(true) })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/performance')
      .then(r => { if (r.status === 401) { setAuthed(false); return null } return r.json() })
      .then(d => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (authed) load() }, [authed, load])

  async function doLogin(e: React.FormEvent) {
    e.preventDefault(); setLoggingIn(true); setLoginErr('')
    try {
      const r = await fetch('/api/leads/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
      })
      if (r.ok) setAuthed(true)
      else setLoginErr((await r.json()).error || 'Invalid credentials')
    } catch { setLoginErr('Something went wrong') }
    finally { setLoggingIn(false) }
  }

  if (checking) return <Shell><p style={{ color: C.mute }}>Loading…</p></Shell>

  if (!authed) return (
    <Shell center>
      <form onSubmit={doLogin} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 340, boxShadow: '0 10px 40px rgba(15,23,42,0.06)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: C.ink, margin: '0 0 4px' }}>Performance</h1>
        <p style={{ fontSize: 13, color: C.mute, margin: '0 0 20px' }}>Admin access only</p>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={inp} />
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Password" required style={{ ...inp, letterSpacing: 2 }} />
        <button type="submit" disabled={loggingIn} style={{ width: '100%', padding: 13, background: C.accent, border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loggingIn ? 0.7 : 1 }}>
          {loggingIn ? 'Signing in…' : 'Sign in'}
        </button>
        {loginErr && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 12 }}>{loginErr}</p>}
      </form>
    </Shell>
  )

  const d = data?.[scope]
  const trend = d?.trends[tf] || []

  return (
    <Shell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: -0.3 }}>Sales Performance</h1>
          <p style={{ fontSize: 13, color: C.mute, margin: '4px 0 0' }}>
            {scope === 'team' ? 'Shreyas' : 'Everyone'} · leads &amp; conversions
            {data && <> · <span style={{ color: C.faint }}>{data.eventsLogged} calls logged</span></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Toggle options={[['team', 'Shreyas'], ['all', 'Everyone']]} value={scope} onChange={v => setScope(v as 'team' | 'all')} />
          <button onClick={load} style={ghostBtn} title="Refresh">↻</button>
        </div>
      </div>

      {loading || !d ? <p style={{ color: C.mute }}>Loading…</p> : (
        <>
          {/* KPI tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 22 }}>
            <Tile label="Leads worked" value={d.kpis.leadsWorked} />
            <Tile label="Reached" value={d.kpis.reached} sub={`${d.kpis.reachRate}% of worked`} />
            <Tile label="Interested" value={d.kpis.interested} accent />
            <Tile label="Converted" value={d.kpis.converted} accent />
            <Tile label="Conversion rate" value={`${d.kpis.conversionRate}%`} accent />
            <Tile label="Total call attempts" value={d.kpis.callAttempts} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
            {/* Funnel */}
            <Card title="Conversion funnel">
              <Funnel funnel={d.funnel} />
            </Card>
            {/* Outcomes */}
            <Card title="Call outcomes">
              <Outcomes outcomes={d.outcomes} />
            </Card>
          </div>

          {/* Trend */}
          <Card
            title="Activity over time"
            right={<Toggle options={[['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']]} value={tf} onChange={v => setTf(v as 'daily' | 'weekly' | 'monthly')} small />}
          >
            <TrendChart data={trend} />
            <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 12, color: C.mute }}>
              <Legend color={C.accentSoft} label="Calls" border={C.accent} />
              <Legend color={C.accent} label="Conversions" />
              <span style={{ marginLeft: 'auto', color: C.faint }}>Trends build up from the day this shipped</span>
            </div>
          </Card>
        </>
      )}
    </Shell>
  )
}

/* ---------- layout ---------- */
function Shell({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: center ? 0 : '28px 20px', display: center ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%' }}>{children}</div>
    </div>
  )
}

const inp: React.CSSProperties = { width: '100%', padding: '13px 15px', background: '#f8fafc', border: `1px solid ${C.border}`, borderRadius: 10, color: C.ink, fontSize: 15, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }
const ghostBtn: React.CSSProperties = { padding: '8px 12px', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.mute, fontSize: 15, cursor: 'pointer' }

function Tile({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 18px', boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
      <div style={{ fontSize: 12, color: C.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: accent ? C.accent : C.ink, marginTop: 6, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{title}</h2>
        {right}
      </div>
      {children}
    </div>
  )
}

function Toggle({ options, value, onChange, small }: { options: [string, string][]; value: string; onChange: (v: string) => void; small?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', background: '#eef2f7', borderRadius: 10, padding: 3 }}>
      {options.map(([v, label]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          padding: small ? '5px 11px' : '7px 14px', fontSize: small ? 12 : 13, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer',
          background: value === v ? C.card : 'transparent', color: value === v ? C.accent : C.mute,
          boxShadow: value === v ? '0 1px 3px rgba(15,23,42,0.1)' : 'none',
        }}>{label}</button>
      ))}
    </div>
  )
}

function Legend({ color, label, border }: { color: string; label: string; border?: string }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: border ? `1px solid ${border}` : 'none', display: 'inline-block' }} />{label}</span>
}

/* ---------- charts (dependency-free SVG) ---------- */
function Funnel({ funnel }: { funnel: Funnel }) {
  const max = Math.max(1, funnel[0]?.count || 1)
  const colors = ['#94a3b8', '#38bdf8', '#22c55e', C.accent]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {funnel.map((f, i) => {
        const pct = Math.round((f.count / max) * 100)
        const ofWorked = funnel[0].count > 0 ? Math.round((f.count / funnel[0].count) * 100) : 0
        return (
          <div key={f.stage}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
              <span style={{ color: C.ink, fontWeight: 600 }}>{f.stage}</span>
              <span style={{ color: C.mute }}>{f.count}{i > 0 && <span style={{ color: C.faint }}> · {ofWorked}%</span>}</span>
            </div>
            <div style={{ height: 26, background: '#f1f5f9', borderRadius: 7, overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(pct, f.count > 0 ? 4 : 0)}%`, height: '100%', background: colors[i] || C.accent, borderRadius: 7, transition: 'width .4s' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Outcomes({ outcomes }: { outcomes: Outcome[] }) {
  const max = Math.max(1, ...outcomes.map(o => o.count))
  const total = outcomes.reduce((s, o) => s + o.count, 0)
  if (total === 0) return <p style={{ color: C.faint, fontSize: 13, margin: '8px 0' }}>No calls logged yet.</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {outcomes.map(o => (
        <div key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 108, fontSize: 12.5, color: C.mute, flexShrink: 0 }}>{o.label}</span>
          <div style={{ flex: 1, height: 18, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${o.count > 0 ? Math.max((o.count / max) * 100, 4) : 0}%`, height: '100%', background: o.color, borderRadius: 5 }} />
          </div>
          <span style={{ width: 26, textAlign: 'right', fontSize: 13, fontWeight: 600, color: C.ink }}>{o.count}</span>
        </div>
      ))}
    </div>
  )
}

function TrendChart({ data }: { data: TrendPoint[] }) {
  const W = 720, H = 220, padL = 28, padB = 26, padT = 10
  const max = Math.max(1, ...data.map(p => p.calls))
  const n = data.length || 1
  const bw = (W - padL) / n
  const barW = Math.min(bw * 0.6, 26)
  const scaleY = (v: number) => (H - padB - padT) * (v / max)
  const ticks = niceTicks(max, 4)

  if (data.every(p => p.calls === 0)) {
    return <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.faint, fontSize: 13 }}>No activity logged in this window yet — it fills in as calls are made.</div>
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {ticks.map((t, i) => {
        const y = padT + (H - padB - padT) - scaleY(t)
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W} y2={y} stroke="#eef2f7" strokeWidth={1} />
            <text x={0} y={y + 3} fontSize={10} fill={C.faint}>{t}</text>
          </g>
        )
      })}
      {data.map((p, i) => {
        const x = padL + i * bw + (bw - barW) / 2
        const callsH = scaleY(p.calls)
        const convH = scaleY(p.conversions)
        const baseY = padT + (H - padB - padT)
        const showLabel = data.length <= 14
        return (
          <g key={i}>
            {/* total calls (light) */}
            <rect x={x} y={baseY - callsH} width={barW} height={callsH} rx={3} fill={C.accentSoft} stroke={C.accent} strokeWidth={0.75} />
            {/* conversions portion (solid accent, drawn at base) */}
            {p.conversions > 0 && <rect x={x} y={baseY - convH} width={barW} height={convH} rx={3} fill={C.accent} />}
            {showLabel && p.calls > 0 && <text x={x + barW / 2} y={baseY - callsH - 4} fontSize={10} fill={C.mute} textAnchor="middle">{p.calls}</text>}
            {(data.length <= 14 || i % Math.ceil(data.length / 12) === 0) && (
              <text x={x + barW / 2} y={H - 8} fontSize={9.5} fill={C.faint} textAnchor="middle">{p.label}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function niceTicks(max: number, count: number): number[] {
  const step = Math.max(1, Math.ceil(max / count))
  const out: number[] = []
  for (let v = 0; v <= max; v += step) out.push(v)
  if (out[out.length - 1] !== max && max > 0) out.push(max)
  return out
}
