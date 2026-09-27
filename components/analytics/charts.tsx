'use client'

import { Area, Bar, BarChart, CartesianGrid, Cell, ComposedChart, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Compare, DayPoint, MonthPoint } from '@/lib/analytics'

const BLUE = '#2a78d6'
const BLUE_SOFT = '#b7d3f6'
const ORANGE = '#eb6834'
const PREV = '#a3a3a3'
const GRID = '#ececec'
const MUTED = '#737373'
const REST = '#d4d4d4'
const fmtInt = (n: number) => Math.round(n).toLocaleString('en-IN')
const fmtInr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
const compact = (n: number) => (Math.abs(n) >= 100000 ? `${(n / 100000).toFixed(1).replace(/\.0$/, '')}L` : Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(Math.round(n)))
const compactInr = (n: number) => `₹${compact(n)}`
const axis = { fontSize: 11, fill: MUTED }

type TipPayload = { name?: string; value?: number | string; color?: string; dataKey?: string; payload?: Record<string, unknown> }
function Tip({ active, payload, label, money = false }: { active?: boolean; payload?: TipPayload[]; label?: string | number; money?: boolean }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg text-xs">
      {label !== undefined && <p className="font-medium text-neutral-800 mb-1">{String(label)}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-neutral-600">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-neutral-900 tabular-nums">{money ? fmtInr(Number(p.value)) : fmtInt(Number(p.value))}</span>
        </p>
      ))}
    </div>
  )
}

export function Sparkline({ data }: { data: number[] }) {
  const d = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={34}>
      <ComposedChart data={d} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area type="monotone" dataKey="v" stroke={BLUE} strokeWidth={1.5} fill={BLUE} fillOpacity={0.12} isAnimationActive={false} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function TrendChart({ data, metric }: { data: DayPoint[]; metric: 'sessions' | 'users' | 'newUsers' }) {
  const prevKey = metric === 'sessions' ? 'prevSessions' : metric === 'users' ? 'prevUsers' : null
  const name = metric === 'sessions' ? 'Visits' : metric === 'users' ? 'Visitors' : 'New visitors'
  const every = data.length > 40 ? 10 : data.length > 14 ? 4 : 1
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} interval={every - 1} minTickGap={12} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={40} tickFormatter={v => compact(Number(v))} />
        <Tooltip content={<Tip />} cursor={{ stroke: '#d4d4d4' }} />
        {prevKey && <Line type="monotone" dataKey={prevKey} name="Previous period" stroke={PREV} strokeWidth={1.5} strokeDasharray="4 4" dot={false} isAnimationActive={false} connectNulls />}
        <Area type="monotone" dataKey={metric} name={name} stroke={BLUE} strokeWidth={2} fill={BLUE} fillOpacity={0.1} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function MonthlyBars({ data, keys, money = false, height = 220 }: { data: MonthPoint[]; keys: { key: keyof MonthPoint; name: string; color?: string }[]; money?: boolean; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 18, right: 4, bottom: 0, left: -4 }} barCategoryGap="28%" barGap={2}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={44} tickFormatter={v => (money ? compactInr(Number(v)) : compact(Number(v)))} />
        <Tooltip content={<Tip money={money} />} cursor={{ fill: '#f5f5f5' }} />
        {keys.map((k, i) => (
          <Bar key={String(k.key)} dataKey={k.key} name={k.name} fill={k.color ?? (i === 0 ? BLUE : ORANGE)} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {keys.length === 1 && <LabelList dataKey={k.key} position="top" style={{ fontSize: 10, fill: MUTED }} formatter={(v: unknown) => (Number(v) > 0 ? (money ? compactInr(Number(v)) : fmtInt(Number(v))) : '')} />}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/* Horizontal bars, current vs previous period. */
export function CompareBars({ data, height, labelWidth = 130 }: { data: Compare[]; height?: number; labelWidth?: number }) {
  const h = height ?? Math.max(120, data.length * 36 + 16)
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap="30%" barGap={2}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={labelWidth} tick={{ fontSize: 12, fill: '#404040' }} tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} cursor={{ fill: '#f5f5f5' }} />
        <Bar dataKey="value" name="This period" fill={BLUE} radius={[0, 4, 4, 0]} isAnimationActive={false}>
          <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: '#404040' }} formatter={(v: unknown) => fmtInt(Number(v))} />
        </Bar>
        <Bar dataKey="previous" name="Previous period" fill={PREV} fillOpacity={0.55} radius={[0, 4, 4, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* Horizontal bars, one series. */
export function SimpleBars({ data, height, labelWidth = 130, color = BLUE }: { data: { name: string; value: number }[]; height?: number; labelWidth?: number; color?: string }) {
  const h = height ?? Math.max(100, data.length * 30 + 12)
  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap="30%">
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={labelWidth} tick={{ fontSize: 12, fill: '#404040' }} tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} cursor={{ fill: '#f5f5f5' }} />
        <Bar dataKey="value" name="Visits" fill={color} radius={[0, 4, 4, 0]} isAnimationActive={false}>
          <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: '#404040' }} formatter={(v: unknown) => fmtInt(Number(v))} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* Vertical bars with the biggest one highlighted (weekday / hour). */
export function PeakBars({ data, xKey, name = 'Visits', height = 160, tickEvery = 1 }: { data: Record<string, number | string>[]; xKey: string; name?: string; height?: number; tickEvery?: number }) {
  const max = Math.max(...data.map(d => Number(d.sessions)))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 14, right: 4, bottom: 0, left: -8 }} barCategoryGap="22%">
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} interval={tickEvery - 1} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={36} tickFormatter={v => compact(Number(v))} />
        <Tooltip content={<Tip />} cursor={{ fill: '#f5f5f5' }} />
        <Bar dataKey="sessions" name={name} radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={Number(d.sessions) === max && max > 0 ? BLUE : REST} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* Funnel as an ordinal ramp of horizontal bars, with step-to-step conversion. */
export function Funnel({ steps }: { steps: { step: string; value: number; previous: number }[] }) {
  const ramp = ['#1c5cab', '#2a78d6', '#5598e7', '#86b6ef']
  const max = Math.max(1, ...steps.map(s => s.value))
  return (
    <div className="space-y-3">
      {steps.map((s, i) => {
        const w = Math.max(2, (s.value / max) * 100)
        const rate = i > 0 && steps[i - 1].value > 0 ? (s.value / steps[i - 1].value) * 100 : null
        const prevRate = i > 0 && steps[i - 1].previous > 0 ? (s.previous / steps[i - 1].previous) * 100 : null
        return (
          <div key={s.step}>
            <div className="flex items-baseline justify-between text-[13px] mb-1">
              <span className="font-medium text-neutral-800">{s.step}</span>
              <span className="tabular-nums text-neutral-900 font-semibold">{fmtInt(s.value)} <span className="text-neutral-400 font-normal text-xs">was {fmtInt(s.previous)}</span></span>
            </div>
            <div className="h-7 rounded-md bg-neutral-100 overflow-hidden">
              <div className="h-full rounded-md transition-all" style={{ width: `${w}%`, background: ramp[i] ?? ramp[3] }} />
            </div>
            {rate !== null && (
              <p className="mt-1 text-[11px] text-neutral-500">
                {rate.toFixed(1)}% of the step above{prevRate !== null ? ` · was ${prevRate.toFixed(1)}%` : ''}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { BLUE, BLUE_SOFT, ORANGE, PREV }
