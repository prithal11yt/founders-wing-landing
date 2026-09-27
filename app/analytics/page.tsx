'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, LogOut, RefreshCw, Sparkles } from 'lucide-react'
import type { Dashboard, RangeKey } from '@/lib/analytics'
import { Wordmark } from '@/components/site/brand'
import { AiText, C, Card, Delta, KpiCard, Legend, Table, TakeawayList, fmtInr, fmtInt, pctChange } from '@/components/analytics/ui'
import { CompareBars, Funnel, MonthlyBars, PeakBars, SimpleBars, TrendChart } from '@/components/analytics/charts'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '28d', label: '28 days' },
  { key: '90d', label: '90 days' },
  { key: 'mtd', label: 'This month' },
  { key: 'last-month', label: 'Last month' },
]

const fmtDate = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export default function AnalyticsPage() {
  const [auth, setAuth] = useState<'checking' | 'login' | 'ok'>('checking')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)

  const [range, setRange] = useState<RangeKey>('28d')
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metric, setMetric] = useState<'sessions' | 'users' | 'newUsers'>('users')

  useEffect(() => {
    fetch('/api/leads/verify').then(r => setAuth(r.ok ? 'ok' : 'login')).catch(() => setAuth('login'))
  }, [])

  const load = useCallback(async (r: RangeKey) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/analytics/data?range=${r}`)
      if (res.status === 401) { setAuth('login'); return }
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Failed to load')
      setData(j)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (auth === 'ok') load(range) }, [auth, range, load])

  async function login(e: React.FormEvent) {
    e.preventDefault(); setLoginBusy(true); setLoginError('')
    try {
      const r = await fetch('/api/leads/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Login failed')
      if (j.role !== 'admin') throw new Error('This dashboard is for the admin account only.')
      setAuth('ok')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoginBusy(false)
    }
  }

  async function logout() {
    await fetch('/api/leads/auth', { method: 'DELETE' })
    setAuth('login'); setData(null)
  }

  if (auth === 'checking') return <Shell><div className="py-32 flex justify-center text-neutral-400"><Loader2 className="w-6 h-6 animate-spin" /></div></Shell>

  if (auth === 'login') {
    return (
      <Shell>
        <div className="max-w-sm mx-auto pt-16 md:pt-24">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">Analytics</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in with your admin account.</p>
          <form onSubmit={login} className="mt-6 space-y-3">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoComplete="username" className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-[15px] outline-none focus:border-neutral-900" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-[15px] outline-none focus:border-neutral-900" />
            {loginError && <p className="text-sm text-red-600">{loginError}</p>}
            <button type="submit" disabled={loginBusy} className="w-full rounded-full h-12 text-[15px] font-medium text-white disabled:opacity-60" style={{ background: '#0284c7' }}>
              {loginBusy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </Shell>
    )
  }

  const k = (key: string) => data?.kpis.find(x => x.key === key)
  const spark = (key: 'sessions' | 'users' | 'newUsers') => data?.daily.map(d => d[key]) ?? []
  const monthly = data?.monthly ?? []
  const monthsWithData = monthly.filter(m => m.sessions > 0 || m.applications > 0 || m.members > 0)
  const ytSources = data?.sources.filter(s => /youtube|jev|midroll|aitools/i.test(s.name)) ?? []

  return (
    <Shell
      right={
        <div className="flex items-center gap-2">
          <button onClick={() => load(range)} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 h-9 text-[13px] hover:bg-neutral-50" title="Reload">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">Refresh</span>
          </button>
          <Link href="/admin" className="hidden sm:inline-flex rounded-full border border-neutral-200 px-3 h-9 items-center text-[13px] hover:bg-neutral-50">Admin</Link>
          <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 h-9 text-[13px] hover:bg-neutral-50"><LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Log out</span></button>
        </div>
      }
    >
      {/* Range row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex rounded-full bg-white border border-neutral-200 p-1">
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)} className={`rounded-full px-3.5 h-8 text-[13px] font-medium transition-colors ${range === r.key ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:text-neutral-900'}`}>{r.label}</button>
          ))}
        </div>
        {data && (
          <p className="text-[13px] text-neutral-500">
            <span className="text-neutral-800 font-medium">{fmtDate(data.current.start)} – {fmtDate(data.current.end)}</span> compared with {data.previous.label.toLowerCase()} ({fmtDate(data.previous.start)} – {fmtDate(data.previous.end)})
          </p>
        )}
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {data?.error && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Google Analytics returned an error: {data.error}</div>}
      {data && !data.gaConfigured && (
        <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Google Analytics is not connected on this deployment yet. Add <code className="font-mono">GA_SERVICE_ACCOUNT_JSON</code> in Vercel and this page fills in with traffic, sources, pages and the full funnel. Applications and members below come from your database and are live.
        </div>
      )}

      {!data && loading && <div className="py-24 flex justify-center text-neutral-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}

      {data && (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {data.kpis.map(kp => (
              <KpiCard key={kp.key} k={kp} spark={kp.key === 'users' ? spark('users') : kp.key === 'sessions' ? spark('sessions') : kp.key === 'newUsers' ? spark('newUsers') : undefined} />
            ))}
          </div>

          {/* Takeaways */}
          <div className="grid lg:grid-cols-2 gap-4">
            <Card title="Takeaways" sub="Worked out from the numbers on this page">
              <TakeawayList items={data.takeaways} />
            </Card>
            <Card title="AI summary" sub={data.aiSummary ? `Written by ${data.aiSummary.provider} from this period’s numbers` : 'A written summary of what happened and what to do next'} right={<Sparkles className="w-4 h-4 text-sky-600" />}>
              {data.aiSummary ? <AiText text={data.aiSummary.text} /> : (
                <p className="text-sm text-neutral-500">Not available on this deployment. Add an <code className="font-mono">ANTHROPIC_API_KEY</code> or <code className="font-mono">OPENAI_API_KEY</code> in Vercel and the summary appears here.</p>
              )}
            </Card>
          </div>

          {data.gaConfigured && !data.error && (
            <>
              {/* Trend */}
              <Card
                title="Traffic over time"
                sub="Solid line is this period, dashed grey is the previous period on the same day"
                right={
                  <div className="inline-flex rounded-full bg-neutral-100 p-0.5">
                    {([['users', 'Visitors'], ['sessions', 'Visits'], ['newUsers', 'New']] as const).map(([key, label]) => (
                      <button key={key} onClick={() => setMetric(key)} className={`rounded-full px-3 h-7 text-xs font-medium ${metric === key ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>{label}</button>
                    ))}
                  </div>
                }
              >
                <TrendChart data={data.daily} metric={metric} />
                <div className="mt-2"><Legend items={[{ color: C.series, label: 'This period' }, { color: C.prev, label: 'Previous period', dashed: true }]} /></div>
              </Card>

              {/* Funnel + where checkout visitors come from */}
              <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
                <Card title="From visitor to paying member" sub="Each step as a share of the one above it. Applications and payments come from your database; visitors from Google Analytics.">
                  <Funnel steps={data.funnel} />
                </Card>
                <Card title="Which sources send people to checkout" sub="People who opened the payment page, by where they came from">
                  {data.checkoutBySource.length ? <CompareBars data={data.checkoutBySource} labelWidth={170} /> : <p className="text-sm text-neutral-500">No checkout visits in this period.</p>}
                  <div className="mt-2"><Legend items={[{ color: C.series, label: 'This period' }, { color: C.prev, label: 'Previous period' }]} /></div>
                </Card>
              </div>
            </>
          )}

          {/* Month over month */}
          <Card title="Month over month" sub="The last 12 months. Use this to see whether the site is growing.">
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {data.gaConfigured && (
                <>
                  <div>
                    <p className="text-[13px] font-medium mb-1">Visitors per month</p>
                    <MonthlyBars data={monthly} keys={[{ key: 'users', name: 'Visitors' }]} height={200} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium mb-1">Checkout visits vs applications</p>
                    <MonthlyBars data={monthly} keys={[{ key: 'checkout', name: 'Opened checkout' }, { key: 'applications', name: 'Applications' }]} height={200} />
                    <div className="mt-1"><Legend items={[{ color: C.series, label: 'Opened checkout' }, { color: C.series2, label: 'Applications' }]} /></div>
                  </div>
                </>
              )}
              <div>
                <p className="text-[13px] font-medium mb-1">New paying members per month</p>
                <MonthlyBars data={monthly} keys={[{ key: 'members', name: 'Members' }]} height={200} />
              </div>
              <div>
                <p className="text-[13px] font-medium mb-1">Revenue per month</p>
                <MonthlyBars data={monthly} keys={[{ key: 'revenue', name: 'Revenue' }]} money height={200} />
              </div>
            </div>
            <div className="mt-6">
              <Table
                head={data.gaConfigured ? ['Month', 'Visitors', 'Change', 'Visits', 'Checkout', 'Applications', 'Members', 'Revenue'] : ['Month', 'Applications', 'Members', 'Revenue']}
                rows={[...monthsWithData].reverse().map((m, i, arr) => {
                  const prev = arr[i + 1]
                  return data.gaConfigured
                    ? [m.label, fmtInt(m.users), prev ? <Delta key="d" cur={m.users} prev={prev.users} /> : '—', fmtInt(m.sessions), fmtInt(m.checkout), fmtInt(m.applications), fmtInt(m.members), fmtInr(m.revenue)]
                    : [m.label, fmtInt(m.applications), fmtInt(m.members), fmtInr(m.revenue)]
                })}
                note="The current month is partial. Lead events in Analytics only exist since 25 Sep 2026; applications here come from the database and are complete."
              />
            </div>
          </Card>

          {data.gaConfigured && !data.error && (
            <>
              {/* Sources */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card title="Where visitors come from" sub="Grouped the way Google groups them">
                  <CompareBars data={data.channels} />
                  <div className="mt-2"><Legend items={[{ color: C.series, label: 'This period' }, { color: C.prev, label: 'Previous period' }]} /></div>
                  <p className="mt-3 text-[12px] text-neutral-500">Referral is mostly YouTube description links. Direct means they typed the address or came from WhatsApp.</p>
                </Card>
                <Card title="Top sources" sub="Exact source and medium, including your tagged YouTube links">
                  <Table
                    head={['Source', 'Visits', 'Was', 'Change']}
                    rows={data.sources.map(s => [s.name, fmtInt(s.value), fmtInt(s.previous), <Delta key="d" cur={s.value} prev={s.previous} />])}
                  />
                  {ytSources.length > 0 && (
                    <p className="mt-3 text-[12px] text-neutral-500">
                      YouTube in total: <span className="font-medium text-neutral-800">{fmtInt(ytSources.reduce((a, s) => a + s.value, 0))}</span> visits this period, {fmtInt(ytSources.reduce((a, s) => a + s.previous, 0))} before.
                    </p>
                  )}
                </Card>
              </div>

              {/* Pages */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card title="Most viewed pages" sub="Pageviews this period vs the previous one">
                  <Table head={['Page', 'Views', 'Was', 'Change']} rows={data.pages.map(p => [p.name, fmtInt(p.value), fmtInt(p.previous), <Delta key="d" cur={p.value} prev={p.previous} />])} />
                </Card>
                <Card title="Where people land first" sub="The first page of each visit">
                  <Table head={['Landing page', 'Visits', 'Was', 'Change']} rows={data.landing.map(p => [p.name, fmtInt(p.value), fmtInt(p.previous), <Delta key="d" cur={p.value} prev={p.previous} />])} />
                </Card>
              </div>

              {/* Audience */}
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card title="Devices">
                  <CompareBars data={data.devices} labelWidth={70} height={130} />
                  <div className="mt-2"><Legend items={[{ color: C.series, label: 'This period' }, { color: C.prev, label: 'Previous' }]} /></div>
                </Card>
                <Card title="New vs returning" sub="Visits">
                  <SimpleBars data={data.newVsReturning} labelWidth={80} height={100} />
                  {data.newVsReturning.length > 1 && (() => {
                    const total = data.newVsReturning.reduce((a, x) => a + x.value, 0)
                    const ret = data.newVsReturning.find(x => x.name === 'Returning')?.value ?? 0
                    return <p className="mt-2 text-[12px] text-neutral-500">{total ? Math.round((ret / total) * 100) : 0}% of visits are people coming back.</p>
                  })()}
                </Card>
                <Card title="Cities" sub="Visits">
                  <SimpleBars data={data.cities.slice(0, 8)} labelWidth={90} />
                </Card>
                <Card title="Countries" sub="Visits">
                  <SimpleBars data={data.countries.slice(0, 6)} labelWidth={90} />
                </Card>
              </div>

              {/* When */}
              <div className="grid lg:grid-cols-2 gap-4">
                <Card title="Busiest days of the week" sub="Visits by weekday in this period. The busiest day is highlighted.">
                  <PeakBars data={data.weekday} xKey="name" />
                </Card>
                <Card title="Busiest hours" sub="Visits by hour of the day (India time). Post when the site is busiest.">
                  <PeakBars data={data.hours.map(h => ({ ...h, label: `${h.hour}h` }))} xKey="label" tickEvery={3} />
                </Card>
              </div>
            </>
          )}

          {/* Applications */}
          <Card title="How applicants say they found you" sub="From the apply form. Only people who submitted the form are counted.">
            {data.heardFrom.length ? <CompareBars data={data.heardFrom} labelWidth={140} /> : <p className="text-sm text-neutral-500">No applications yet in this period.</p>}
            <div className="mt-2"><Legend items={[{ color: C.series, label: 'This period' }, { color: C.prev, label: 'Previous period' }]} /></div>
            {k('applications') && k('members') && (k('applications')!.value > 0) && (
              <p className="mt-3 text-[12px] text-neutral-500">
                {fmtInt(k('members')!.value)} of {fmtInt(k('applications')!.value)} applicants paid this period ({Math.round((k('members')!.value / k('applications')!.value) * 100)}%).
                {pctChange(k('members')!.value, k('members')!.previous) !== null && ` Members ${k('members')!.value >= k('members')!.previous ? 'up' : 'down'} from ${fmtInt(k('members')!.previous)}.`}
              </p>
            )}
          </Card>

          <p className="text-[11px] text-neutral-400 pb-6">
            Traffic data from Google Analytics (property 529375537), refreshed every 30 minutes. Applications, members and revenue from the Founders Wing database. Times in India Standard Time. Generated {new Date(data.generatedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.
          </p>
        </div>
      )}
    </Shell>
  )
}

function Shell({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center"><Wordmark className="text-[15px]" /></Link>
            <span className="text-neutral-300">/</span>
            <span className="text-[15px] font-medium">Analytics</span>
          </div>
          {right}
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">{children}</main>
    </div>
  )
}
