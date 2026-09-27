'use client'

import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Info, Minus, TrendingDown } from 'lucide-react'
import type { Kpi, Takeaway } from '@/lib/analytics'
import { Sparkline } from './charts'

/* Small building blocks for the analytics dashboard. Colours follow the dataviz
   palette: series blue #2a78d6, previous-period grey, status good/critical. */

export const C = {
  series: '#2a78d6',
  series2: '#eb6834',
  prev: '#a3a3a3',
  good: '#0ca30c',
  bad: '#d03b3b',
  grid: '#ececec',
  text: '#0a0a0a',
  muted: '#737373',
}

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-IN')
export const fmtInr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`
export const fmtPct1 = (n: number) => `${n.toFixed(1)}%`
export const fmtSecs = (s: number) => {
  const m = Math.floor(s / 60)
  const r = Math.round(s % 60)
  return m > 0 ? `${m}m ${r}s` : `${r}s`
}
export function fmtValue(v: number, format: Kpi['format']) {
  if (format === 'pct') return `${Math.round(v)}%`
  if (format === 'secs') return fmtSecs(v)
  if (format === 'inr') return fmtInr(v)
  return fmtInt(v)
}
export const pctChange = (cur: number, prev: number): number | null => (prev > 0 ? ((cur - prev) / prev) * 100 : cur > 0 ? null : 0)

export function Delta({ cur, prev, invert = false, size = 'sm' }: { cur: number; prev: number; invert?: boolean; size?: 'sm' | 'md' }) {
  const p = pctChange(cur, prev)
  const cls = size === 'md' ? 'text-sm px-2 py-0.5' : 'text-xs px-1.5 py-0.5'
  if (p === null) return <span className={`inline-flex items-center gap-1 rounded-full bg-sky-50 text-sky-700 font-medium ${cls}`}>new</span>
  if (Math.abs(p) < 0.5) return <span className={`inline-flex items-center gap-1 rounded-full bg-neutral-100 text-neutral-600 font-medium ${cls}`}><Minus className="w-3 h-3" /> same</span>
  const up = p > 0
  const good = invert ? !up : up
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full font-medium ${cls}`} style={{ background: good ? '#e9f7e9' : '#fbeaea', color: good ? '#0a7a0a' : '#b12f2f' }}>
      {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(p) >= 1000 ? '>999' : Math.round(Math.abs(p))}%
    </span>
  )
}

export function Card({ title, sub, children, className = '', right }: { title?: string; sub?: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <section className={`rounded-[20px] bg-white border border-neutral-200 p-5 md:p-6 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>}
            {sub && <p className="text-[13px] text-neutral-500 mt-0.5">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

export function KpiCard({ k, spark }: { k: Kpi; spark?: number[] }) {
  const invert = false
  return (
    <div className="rounded-[20px] bg-white border border-neutral-200 p-4 md:p-5 flex flex-col min-h-[128px]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] text-neutral-500 font-medium">{k.label}</p>
        <Delta cur={k.value} prev={k.previous} invert={invert} />
      </div>
      <p className="mt-2 text-[26px] md:text-[28px] font-semibold tracking-[-0.03em] leading-none tabular-nums">{fmtValue(k.value, k.format)}</p>
      <p className="mt-1.5 text-xs text-neutral-500">
        was <span className="text-neutral-700 tabular-nums">{fmtValue(k.previous, k.format)}</span>
      </p>
      {spark && spark.length > 1 && (
        <div className="mt-auto pt-3 -mb-1">
          <Sparkline data={spark} />
        </div>
      )}
      {!spark && k.hint && <p className="mt-auto pt-3 text-[11px] text-neutral-400 leading-snug">{k.hint}</p>}
    </div>
  )
}

export function TakeawayList({ items }: { items: Takeaway[] }) {
  if (!items.length) return <p className="text-sm text-neutral-500">Nothing to report yet.</p>
  return (
    <ul className="space-y-3">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 shrink-0">
            {t.kind === 'good' && <CheckCircle2 className="w-4.5 h-4.5" style={{ color: C.good }} />}
            {t.kind === 'bad' && <TrendingDown className="w-4.5 h-4.5" style={{ color: C.bad }} />}
            {t.kind === 'info' && <Info className="w-4.5 h-4.5 text-sky-600" />}
          </span>
          <div>
            <p className="text-[14px] font-medium leading-snug">{t.title}</p>
            {t.body && <p className="text-[13px] text-neutral-600 leading-relaxed mt-0.5">{t.body}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}

/* Renders the model's short markdown-ish text: two headings and bullets. */
export function AiText({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  return (
    <div className="space-y-1.5">
      {lines.map((l, i) => {
        const clean = l.replace(/^#+\s*/, '').replace(/^\*\*(.+)\*\*:?$/, '$1').replace(/\*\*/g, '')
        if (/^(1\.|2\.)?\s*"?(what happened|what to do next)"?:?$/i.test(clean) || /^(what happened|what to do next)/i.test(clean) && clean.length < 24) {
          return <p key={i} className="text-[11px] uppercase tracking-[0.16em] font-semibold text-neutral-500 pt-2 first:pt-0">{clean.replace(/^\d\.\s*/, '').replace(/"/g, '')}</p>
        }
        const bullet = /^([-•*]|\d+[.)])\s+/.test(clean)
        return (
          <p key={i} className={`text-[13.5px] leading-relaxed text-neutral-800 ${bullet ? 'pl-4 relative before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-sky-500' : ''}`}>
            {clean.replace(/^([-•*]|\d+[.)])\s+/, '')}
          </p>
        )
      })}
    </div>
  )
}

export function Table({ head, rows, note }: { head: string[]; rows: ReactNode[][]; note?: string }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-neutral-500">
            {head.map((h, i) => (
              <th key={h} className={`font-medium pb-2 px-1 ${i > 0 ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-neutral-100">
              {r.map((c, j) => (
                <td key={j} className={`py-2 px-1 ${j > 0 ? 'text-right tabular-nums whitespace-nowrap' : 'max-w-[260px] truncate'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="mt-2 text-[11px] text-neutral-400">{note}</p>}
    </div>
  )
}

export function Legend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
      {items.map(i => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-0.5 rounded" style={i.dashed ? { borderTop: `2px dashed ${i.color}`, height: 0 } : { background: i.color, height: 8, width: 8, borderRadius: 2 }} />
          {i.label}
        </span>
      ))}
    </div>
  )
}
