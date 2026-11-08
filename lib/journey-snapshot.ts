import { STAGES, STAGE_BEST_FIRST, STAGE_USUAL_DAYS } from '@/lib/crm'

/* Draws the members' Journey board as a shareable PNG. It's drawn on a canvas
   rather than captured from the page: the page is too long to stay readable
   once WhatsApp compresses it, and page capture is unreliable on iPhones. */

export type SnapshotMember = { name: string; stage: string; days: number | null; color: string }

const W = 1080
const PAD = 48
const COLS = 3
const ROW = 62
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const METAL: Record<string, string[]> = {
  build: ['#f7d6b4', '#c9854a', '#874a1c'],
  launch: ['#ffffff', '#c8d0d9', '#75808d'],
  sell: ['#fff7cf', '#eabf2e', '#976600'],
  grow: ['#c4b5fd', '#93c5fd', '#99f6e4', '#fbcfe8'],
}
const BAR: Record<string, string> = { decide: '#e5e5ea', build: '#b06a30', launch: '#6b7785', sell: '#c9971c', grow: '#8b7cf6' }
const EDGE: Record<string, string> = { sell: '#ecd27a', grow: '#d8ccfb' }

const label = (stage: string) => STAGES.find((s) => s.value === stage)?.label ?? stage

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath()
  c.moveTo(x + r, y)
  c.arcTo(x + w, y, x + w, y + h, r)
  c.arcTo(x + w, y + h, x, y + h, r)
  c.arcTo(x, y + h, x, y, r)
  c.arcTo(x, y, x + w, y, r)
  c.closePath()
}

function medal(c: CanvasRenderingContext2D, x: number, y: number, r: number, stage: string) {
  const m = METAL[stage]
  c.beginPath()
  c.arc(x, y, r, 0, Math.PI * 2)
  if (!m) {
    c.fillStyle = '#f2f2f5'
    c.fill()
    c.strokeStyle = '#d9d9de'
    c.lineWidth = 2
    c.stroke()
    return
  }
  const g = stage === 'grow'
    ? c.createLinearGradient(x - r, y - r, x + r, y + r)
    : c.createRadialGradient(x - r * 0.32, y - r * 0.44, r * 0.1, x, y, r * 1.15)
  m.forEach((col, i) => g.addColorStop(i / (m.length - 1), col))
  c.fillStyle = g
  c.fill()
  c.beginPath()
  c.arc(x, y, r - 2, 0, Math.PI * 2)
  c.strokeStyle = 'rgba(255,255,255,0.6)'
  c.lineWidth = 3
  c.stroke()
}

function fit(c: CanvasRenderingContext2D, text: string, max: number) {
  if (c.measureText(text).width <= max) return text
  let t = text
  while (t.length > 1 && c.measureText(t + '…').width > max) t = t.slice(0, -1)
  return t + '…'
}

export function renderBoardSnapshot(members: SnapshotMember[], waiting: number): Promise<Blob> {
  const groups = STAGE_BEST_FIRST.map((stage) => ({ stage, list: members.filter((m) => m.stage === stage) })).filter((g) => g.list.length > 0)
  const cardH = (n: number) => Math.ceil(n / COLS) * ROW + 28
  const height = 330 + groups.reduce((h, g) => h + 94 + cardH(g.list.length) + 26, 0) + (waiting > 0 ? 50 : 0) + 90

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = height
  const c = canvas.getContext('2d')
  if (!c) return Promise.reject(new Error('Canvas unavailable'))
  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    c.font = `${font} ${FONT}`
    c.fillStyle = color
    c.textAlign = align
    c.fillText(s, x, y)
  }

  c.fillStyle = '#f6f6f8'
  c.fillRect(0, 0, W, height)

  text('Founders Wing', PAD, 92, '700 46px', '#000000')
  text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), W - PAD, 90, '500 28px', '#8e8e93', 'right')
  text(`${members.length} members on the path`, PAD, 158, '700 58px', '#000000')
  text('Idea to paying customers. Out in the open.', PAD, 208, '400 30px', '#6e6e73')

  // Share of members at each stage.
  const barW = W - PAD * 2
  const gap = 4
  const usable = barW - gap * (groups.length - 1)
  let bx = PAD
  for (const g of groups) {
    const w = (g.list.length / Math.max(members.length, 1)) * usable
    roundRect(c, bx, 244, Math.max(w, 8), 18, 8)
    c.fillStyle = BAR[g.stage]
    c.fill()
    bx += w + gap
  }

  let y = 330
  for (const { stage, list } of groups) {
    medal(c, PAD + 21, y + 21, 21, stage)
    text(label(stage), PAD + 58, y + 34, '700 36px', stage === 'decide' ? '#8e8e93' : '#000000')
    const usual = STAGE_USUAL_DAYS[stage]
    text(`${list.length} ${list.length === 1 ? 'member' : 'members'}${usual ? ` · usually about ${usual} days` : ''}`, W - PAD, y + 32, '500 25px', '#8e8e93', 'right')
    y += 62

    const h = cardH(list.length)
    roundRect(c, PAD, y, barW, h, 26)
    c.fillStyle = stage === 'decide' ? '#fbfbfc' : '#ffffff'
    c.fill()
    c.strokeStyle = EDGE[stage] ?? '#ececf0'
    c.lineWidth = EDGE[stage] ? 3 : 1.5
    c.stroke()

    const colW = (barW - 24) / COLS
    list.forEach((m, i) => {
      const cx = PAD + 12 + (i % COLS) * colW
      const ry = y + 14 + Math.floor(i / COLS) * ROW + ROW / 2
      medal(c, cx + 26, ry, 15, stage)
      const daysText = m.days != null ? `${m.days}d` : ''
      c.font = `600 25px ${FONT}`
      const dw = c.measureText(daysText).width
      text(fit(c, m.name, colW - 62 - dw - 18), cx + 50, ry + 9, '600 25px', stage === 'decide' ? '#6e6e73' : '#000000')
      text(daysText, cx + colW - 12, ry + 9, '600 25px', m.color, 'right')
    })
    y += h + 26 + 6
  }

  if (waiting > 0) {
    text(`${waiting} more joining after their onboarding call`, PAD, y + 18, '500 26px', '#8e8e93')
    y += 50
  }
  text('d = days in current stage', PAD, height - 44, '500 25px', '#8e8e93')
  text('founderswing.com', W - PAD, height - 44, '600 25px', '#000000', 'right')

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'))
}
