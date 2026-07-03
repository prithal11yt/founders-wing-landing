'use client'

import { useEffect, useState, useCallback } from 'react'

type Call = {
  id: string
  title: string
  call_date: string
  attendance_count: number
}

export default function AdminCommunity() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [callDate, setCallDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/leads/verify')
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authenticated))
      .catch(() => setAuthed(false))
  }, [])

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/calls')
      if (r.ok) { const d = await r.json(); setCalls(d.calls || []) }
    } finally {
      setLoading(false)
    }
  }, [])

  const [wings, setWings] = useState<{ pool: number; used: number; remaining: number; members: { email: string; name: string }[] } | null>(null)
  const loadWings = useCallback(async () => {
    const r = await fetch('/api/admin/wings')
    if (r.ok) setWings(await r.json())
  }, [])

  useEffect(() => { if (authed) { load(); loadWings() } }, [authed, load, loadWings])

  async function createCall(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    try {
      const r = await fetch('/api/admin/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, call_date: callDate }),
      })
      const d = await r.json()
      if (r.ok && d.success) { setTitle(''); load() }
      else setErr(d.error || 'Could not create')
    } catch {
      setErr('Connection failed')
    } finally {
      setSaving(false)
    }
  }

  async function removeCall(id: string) {
    if (!confirm('Delete this call and its attendance records?')) return
    await fetch(`/api/admin/calls?id=${id}`, { method: 'DELETE' })
    load()
  }

  if (authed === null) return <Shell><p className="text-slate-500 text-sm">Checking…</p></Shell>
  if (!authed) return (
    <Shell>
      <p className="text-slate-400 text-sm">
        Please <a href="/admin" className="text-cyan-400 underline">sign in to the admin dashboard</a> first.
      </p>
    </Shell>
  )

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Community</h1>
        <a href="/admin" className="text-xs text-slate-500 hover:text-slate-300">← Admin</a>
      </div>

      {wings && <AwardWings wings={wings} onAwarded={loadWings} />}

      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 mt-8">Weekly Calls</h2>

      <form onSubmit={createCall} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 mb-6 flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Call topic</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. AI Tool Deep Dive: n8n automations"
            className="w-full px-3.5 py-2.5 bg-[#06090f] border border-white/[0.06] rounded-xl text-slate-100 text-sm outline-none focus:border-cyan-500/40" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
          <input type="date" value={callDate} onChange={(e) => setCallDate(e.target.value)} required
            className="px-3.5 py-2.5 bg-[#06090f] border border-white/[0.06] rounded-xl text-slate-100 text-sm outline-none focus:border-cyan-500/40" />
        </div>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
          {saving ? 'Creating…' : 'Create call'}
        </button>
      </form>
      {err && <p className="text-red-400 text-xs mb-4">{err}</p>}

      {loading ? (
        <p className="text-slate-500 text-sm">Loading…</p>
      ) : calls.length === 0 ? (
        <p className="text-slate-500 text-sm">No calls yet. Create your first weekly call above.</p>
      ) : (
        <div className="space-y-2">
          {calls.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">{c.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(c.call_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-cyan-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{c.attendance_count}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">attended</p>
                </div>
                <button onClick={() => removeCall(c.id)} className="text-xs text-slate-600 hover:text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  )
}

function AwardWings({ wings, onAwarded }: {
  wings: { pool: number; used: number; remaining: number; members: { email: string; name: string }[] }
  onAwarded: () => void
}) {
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function award(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const r = await fetch('/api/admin/wings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_email: to, amount: Number(amount), reason }),
      })
      const d = await r.json()
      if (r.ok && d.success) {
        setMsg({ type: 'ok', text: 'Wings awarded 🪽' })
        setTo(''); setAmount(''); setReason('')
        onAwarded()
      } else setMsg({ type: 'err', text: d.error || 'Could not award' })
    } catch {
      setMsg({ type: 'err', text: 'Connection failed' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 mb-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider">Award Wings 🪽</h2>
        <p className="text-xs text-slate-400">
          <span className="text-amber-400 font-semibold">{wings.remaining}</span> / {wings.pool} left this month
        </p>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">For hot-seat participation, showing up, helping others — your call.</p>
      <form onSubmit={award} className="flex flex-col md:flex-row gap-2 md:items-center">
        <select value={to} onChange={(e) => setTo(e.target.value)} required
          className="flex-1 px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-amber-500/40">
          <option value="">Choose a member…</option>
          {wings.members.map((m) => <option key={m.email} value={m.email}>{m.name}</option>)}
        </select>
        <input type="number" min={1} max={wings.remaining} value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="Amount"
          className="w-full md:w-24 px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-amber-500/40" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)"
          className="flex-1 px-3 py-2 bg-[#06090f] border border-white/[0.06] rounded-lg text-slate-100 text-sm outline-none focus:border-amber-500/40" />
        <button type="submit" disabled={saving || wings.remaining <= 0}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-60 whitespace-nowrap"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#f5a524)' }}>
          {saving ? 'Awarding…' : 'Award'}
        </button>
      </form>
      {msg && <p className={`text-xs mt-2 ${msg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>}
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-6 py-10">{children}</div>
    </div>
  )
}
