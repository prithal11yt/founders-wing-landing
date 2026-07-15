'use client'

import { useEffect, useState, useCallback } from 'react'

type Event = { type: string; icon: string; text: string; detail?: string | null; ts: string }
type Summary = { total_members: number; activated: number; active_this_week: number; goals_this_week: number; wings_this_month: number; need_nudge: number }
type Engage = { name: string; member_no: number; whatsapp: string | null; logged_in: boolean; last_active: string | null; goal_this_week: boolean; status: 'not_activated' | 'quiet' | 'active' }

// Build a wa.me link — assume +91 (India) when the number has no country code.
function waLink(num?: string | null): string | null {
  if (!num) return null
  let d = num.replace(/\D/g, '')
  if (d.length === 10) d = '91' + d
  return d ? `https://wa.me/${d}` : null
}

function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function AdminActivity() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [engagement, setEngagement] = useState<Engage[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [view, setView] = useState<'feed' | 'nudge'>('feed')

  useEffect(() => {
    fetch('/api/leads/verify').then((r) => r.json()).then((d) => setAuthed(!!d.authenticated)).catch(() => setAuthed(false))
  }, [])

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/activity')
      if (r.ok) { const d = await r.json(); setSummary(d.summary); setEvents(d.events || []); setEngagement(d.engagement || []) }
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (authed) load() }, [authed, load])

  function logout() {
    document.cookie = 'fw_leads_token=; path=/; max-age=0'
    window.location.href = '/admin'
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'wings', label: '🪽 Wings' },
    { key: 'goal', label: '🎯 Goals' },
    { key: 'attendance', label: '📋 Attendance' },
    { key: 'help', label: '🙋 Help' },
    { key: 'join', label: '🎉 Joins' },
    { key: 'login', label: '🔑 Logins' },
  ]
  const shown = filter === 'all' ? events : events.filter((e) => e.type === filter || (filter === 'goal' && e.type === 'goal_status'))

  const styles = `
    * { margin:0; padding:0; box-sizing:border-box; }
    .a-app { font-family:'Inter',-apple-system,sans-serif; background:#06090f; color:#f1f5f9; min-height:100vh; }
    .a-wrap { max-width:760px; margin:0 auto; padding:28px 20px 90px; }
    .a-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
    .a-title { font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; }
    .a-link { font-size:12px; color:#64748b; text-decoration:none; }
    .a-link:hover { color:#94a3b8; }
    .a-stats { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; margin-bottom:24px; }
    .a-stat { background:#111827; border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:14px; }
    .a-stat-v { font-family:'Space Grotesk',sans-serif; font-size:24px; font-weight:700; line-height:1; }
    .a-stat-l { font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:0.04em; font-weight:600; margin-top:6px; }
    .a-filters { display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; margin-bottom:16px; scrollbar-width:none; }
    .a-filters::-webkit-scrollbar { display:none; }
    .a-chip { flex-shrink:0; padding:7px 12px; border-radius:999px; font-size:12px; font-weight:600; background:#111827; border:1px solid rgba(255,255,255,0.08); color:#94a3b8; cursor:pointer; font-family:inherit; }
    .a-chip.on { background:rgba(6,182,212,0.15); border-color:rgba(6,182,212,0.4); color:#06b6d4; }
    .a-feed { display:flex; flex-direction:column; }
    .a-row { display:flex; gap:14px; padding:14px 4px; border-bottom:1px solid rgba(255,255,255,0.05); }
    .a-icon { font-size:20px; line-height:1.2; flex-shrink:0; width:26px; text-align:center; }
    .a-body { flex:1; min-width:0; }
    .a-text { font-size:14px; color:#e2e8f0; line-height:1.5; }
    .a-detail { font-size:13px; color:#64748b; margin-top:2px; line-height:1.5; word-break:break-word; }
    .a-time { font-size:11px; color:#475569; white-space:nowrap; flex-shrink:0; }
    .a-empty { text-align:center; padding:70px 20px; color:#475569; }
    .a-toggle { display:inline-flex; background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:3px; margin-bottom:18px; }
    .a-toggle button { background:none; border:none; color:#94a3b8; font-family:inherit; font-size:13px; font-weight:600; padding:8px 16px; border-radius:9px; cursor:pointer; }
    .a-toggle button.on { background:rgba(6,182,212,0.15); color:#06b6d4; }
    .a-nudge-badge { margin-left:6px; font-size:11px; background:#f59e0b; color:#000; font-weight:700; padding:1px 7px; border-radius:999px; }
    .e-row { display:flex; align-items:center; gap:12px; padding:14px 4px; border-bottom:1px solid rgba(255,255,255,0.05); }
    .e-av { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; font-size:14px; flex-shrink:0; background:linear-gradient(135deg,#0891b2,#06b6d4); }
    .e-body { flex:1; min-width:0; }
    .e-name { font-size:14px; font-weight:600; color:#e2e8f0; }
    .e-sub { font-size:12px; color:#64748b; margin-top:1px; }
    .e-tag { font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; text-transform:uppercase; letter-spacing:0.03em; flex-shrink:0; }
    .e-wa { flex-shrink:0; background:#25d366; color:#04310f; font-weight:700; font-size:12px; padding:8px 12px; border-radius:9px; text-decoration:none; white-space:nowrap; }
    .e-wa:hover { filter:brightness(1.08); }
    .a-nav { position:fixed; bottom:0; left:0; right:0; z-index:150; display:flex; justify-content:space-around; background:rgba(8,12,20,0.97); border-top:1px solid rgba(255,255,255,0.08); padding:8px 4px calc(8px + env(safe-area-inset-bottom)); backdrop-filter:blur(8px); }
    .a-nav a,.a-nav button { display:flex; flex-direction:column; align-items:center; gap:3px; background:none; border:none; color:#94a3b8; font-size:10px; font-weight:600; text-decoration:none; font-family:inherit; cursor:pointer; padding:2px 8px; }
    .a-nav .on { color:#06b6d4; }
    .a-nav .ic { font-size:18px; line-height:1; }
    @media (max-width:640px){ .a-stats{ grid-template-columns:repeat(3,1fr); } }
  `

  if (authed === null) return <Shell styles={styles}><p style={{ color: '#64748b', fontSize: 13 }}>Checking…</p></Shell>
  if (!authed) return <Shell styles={styles}><p style={{ color: '#94a3b8', fontSize: 14 }}>Please <a href="/admin" style={{ color: '#06b6d4' }}>sign in to admin</a> first.</p></Shell>

  return (
    <Shell styles={styles}>
      <div className="a-top">
        <h1 className="a-title">📡 Community Activity</h1>
        <a href="/admin" className="a-link">← Admin</a>
      </div>

      {summary && (
        <div className="a-stats">
          <div className="a-stat"><div className="a-stat-v">{summary.total_members}</div><div className="a-stat-l">Members</div></div>
          <div className="a-stat"><div className="a-stat-v" style={{ color: '#06b6d4' }}>{summary.activated}<span style={{ fontSize: 15, color: '#475569' }}>/{summary.total_members}</span></div><div className="a-stat-l">Logged in</div></div>
          <div className="a-stat"><div className="a-stat-v" style={{ color: '#10b981' }}>{summary.active_this_week}</div><div className="a-stat-l">Active / week</div></div>
          <div className="a-stat"><div className="a-stat-v">{summary.goals_this_week}</div><div className="a-stat-l">Goals / week</div></div>
          <div className="a-stat"><div className="a-stat-v" style={{ color: '#f59e0b' }}>{summary.wings_this_month}</div><div className="a-stat-l">Wings / month</div></div>
        </div>
      )}

      <div className="a-toggle">
        <button className={view === 'feed' ? 'on' : ''} onClick={() => setView('feed')}>📡 Activity feed</button>
        <button className={view === 'nudge' ? 'on' : ''} onClick={() => setView('nudge')}>
          🔔 Who to nudge
          {summary && summary.need_nudge > 0 && <span className="a-nudge-badge">{summary.need_nudge}</span>}
        </button>
      </div>

      {view === 'feed' ? (
        <>
          <div className="a-filters">
            {FILTERS.map((f) => (
              <button key={f.key} className={`a-chip ${filter === f.key ? 'on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
            ))}
          </div>
          {loading ? (
            <p className="a-empty">Loading activity…</p>
          ) : shown.length === 0 ? (
            <p className="a-empty">No activity yet in this category. As members use the dashboard, it shows up here live.</p>
          ) : (
            <div className="a-feed">
              {shown.map((e, i) => (
                <div key={i} className="a-row">
                  <div className="a-icon">{e.icon}</div>
                  <div className="a-body">
                    <div className="a-text">{e.text}</div>
                    {e.detail && <div className="a-detail">{e.detail}</div>}
                  </div>
                  <div className="a-time">{timeAgo(e.ts)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <NudgeList rows={engagement} loading={loading} />
      )}

      <nav className="a-nav">
        <a href="/admin"><span className="ic">📋</span> Leads</a>
        <a href="/admin/members"><span className="ic">💰</span> Members</a>
        <a href="/admin/community"><span className="ic">🎯</span> Community</a>
        <button className="on"><span className="ic">📡</span> Activity</button>
        <button onClick={logout}><span className="ic">🚪</span> Sign out</button>
      </nav>
    </Shell>
  )
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  not_activated: { label: 'Never logged in', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  quiet: { label: 'Gone quiet', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  active: { label: 'Active', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
}

function NudgeList({ rows, loading }: { rows: Engage[]; loading: boolean }) {
  if (loading) return <p className="a-empty">Loading…</p>
  const needNudge = rows.filter((r) => r.status !== 'active')
  const active = rows.filter((r) => r.status === 'active')

  const sub = (r: Engage) => {
    if (!r.logged_in) return 'Hasn’t logged in or set a password yet'
    if (r.status === 'quiet') return r.last_active ? `Last active ${timeAgo(r.last_active)}` : 'No activity yet'
    return r.goal_this_week ? 'Set a goal this week ✓' : `Active${r.last_active ? ' · ' + timeAgo(r.last_active) : ''}`
  }

  const Row = (r: Engage) => {
    const m = STATUS_META[r.status]
    const wa = waLink(r.whatsapp)
    return (
      <div className="e-row" key={r.member_no}>
        <div className="e-av">{(r.name || '?')[0]?.toUpperCase()}</div>
        <div className="e-body">
          <div className="e-name">{r.name} <span style={{ color: '#475569', fontWeight: 400, fontSize: 12 }}>#{r.member_no}</span></div>
          <div className="e-sub">{sub(r)}</div>
        </div>
        <span className="e-tag" style={{ color: m.color, background: m.bg }}>{m.label}</span>
        {wa && <a className="e-wa" href={wa} target="_blank" rel="noopener noreferrer">💬 Nudge</a>}
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16 }}>
        Members who need a personal nudge are at the top. Tap <strong style={{ color: '#25d366' }}>Nudge</strong> to message them on WhatsApp.
      </p>
      {needNudge.length === 0 ? (
        <p className="a-empty">🎉 Everyone’s active — no one needs a nudge right now.</p>
      ) : (
        <div>{needNudge.map(Row)}</div>
      )}
      {active.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, margin: '24px 0 8px' }}>
            Active members ({active.length})
          </p>
          <div>{active.map(Row)}</div>
        </>
      )}
    </div>
  )
}

function Shell({ children, styles }: { children: React.ReactNode; styles: string }) {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');${styles}`}</style>
      <div className="a-app"><div className="a-wrap">{children}</div></div>
    </>
  )
}
