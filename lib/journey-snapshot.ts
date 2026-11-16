import { STAGES, STAGE_USUAL_DAYS } from '@/lib/crm'
import { PATH_ORDER, PATH_COLOR, STAGE_PLAIN } from '@/lib/members-path'

/* Draws the members' path board as a shareable PNG, in the same style as the
   page: five numbered stops joined by a dashed line, Grow with AI at the top.
   It's drawn on a canvas rather than captured from the page: the page is too
   long to stay readable once WhatsApp compresses it, and page capture is
   unreliable on iPhones. */

export type SnapshotMember = { name: string; stage: string; days: number | null; color: string }

const W = 1080
const PAD = 56
const STEP = 40 // each stop sits this much further right than the one below
const R = 26 // stop number radius
const COLS = 3
const CHIP_H = 82
const GAP = 12
const BODY = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const INK = '#0b1220'
const MUTED = '#5b6478'
const FAINT = '#8b93a7'

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

function fit(c: CanvasRenderingContext2D, text: string, max: number) {
  if (c.measureText(text).width <= max) return text
  let t = text
  while (t.length > 1 && c.measureText(t + '…').width > max) t = t.slice(0, -1)
  return t + '…'
}

export function renderBoardSnapshot(members: SnapshotMember[], waiting: number, displayFont = ''): Promise<Blob> {
  const DISPLAY = displayFont ? `${displayFont}, ${BODY}` : BODY
  const stops = [...PATH_ORDER].reverse().map((stage) => ({ stage, index: PATH_ORDER.indexOf(stage), list: members.filter((m) => m.stage === stage) }))

  // Height of one stop: heading, the "done when" line, then its chips (or an empty note).
  const chipsH = (n: number) => (n === 0 ? 70 : Math.ceil(n / COLS) * (CHIP_H + GAP) - GAP)
  const stopH = (n: number) => 2 * R + 46 + 18 + chipsH(n)
  const STOP_GAP = 56
  const BANNER_TOP = 330
  const BANNER_H = 128
  const firstStop = BANNER_TOP + BANNER_H + 44
  const stopsH = stops.reduce((h, s) => h + stopH(s.list.length) + STOP_GAP, 0)
  const height = firstStop + stopsH + (waiting > 0 ? 50 : 0) + 80

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = height
  const c = canvas.getContext('2d')
  if (!c) return Promise.reject(new Error('Canvas unavailable'))
  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left', family = BODY) => {
    c.font = `${font} ${family}`
    c.fillStyle = color
    c.textAlign = align
    c.fillText(s, x, y)
    return c.measureText(s).width
  }
  const spaced = (on: boolean) => {
    if ('letterSpacing' in c) (c as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = on ? '3px' : '0px'
  }

  c.fillStyle = '#f5f6fa'
  c.fillRect(0, 0, W, height)

  // Header
  text('Founders Wing', PAD, 84, '800 34px', INK, 'left', DISPLAY)
  text(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), W - PAD, 82, '500 24px', FAINT, 'right')
  c.fillStyle = '#e6e8ef'
  c.fillRect(0, 122, W, 2)

  spaced(true)
  text('THE FOUNDERS WING PATH', PAD, 186, '700 20px', '#1d3fbf')
  spaced(false)
  text(`${members.length} founders on the path`, PAD, 252, '800 62px', INK, 'left', DISPLAY)
  text('From a first idea at the bottom to a growing business at the top.', PAD, 298, '400 26px', '#3d4659')

  // "The path keeps going" banner above the top stop.
  const topX = PAD + (PATH_ORDER.length - 1) * STEP
  roundRect(c, topX, BANNER_TOP, W - PAD - topX, BANNER_H, 24)
  c.fillStyle = '#16803c'
  c.fill()
  spaced(true)
  text('THE PATH KEEPS GOING', topX + 32, BANNER_TOP + 48, '700 18px', 'rgba(255,255,255,0.8)')
  spaced(false)
  text('No finish line. Just more growth.', topX + 32, BANNER_TOP + 96, '800 36px', '#ffffff', 'left', DISPLAY)

  const dashed = (color: string, draw: () => void) => {
    c.save()
    c.setLineDash([9, 8])
    c.lineWidth = 3
    c.strokeStyle = color
    c.beginPath()
    draw()
    c.stroke()
    c.restore()
  }
  dashed(PATH_COLOR.grow.rail, () => {
    c.moveTo(topX + R, BANNER_TOP + BANNER_H)
    c.lineTo(topX + R, firstStop)
  })

  let y = firstStop
  stops.forEach(({ stage, index, list }, k) => {
    const col = PATH_COLOR[stage]
    const x0 = PAD + index * STEP
    const cx = x0 + R
    const h = stopH(list.length)

    // Rail down to the next stop, which sits one step further left.
    const next = stops[k + 1]
    if (next) {
      const nextTop = y + h + STOP_GAP
      const turn = Math.min(22, STEP)
      dashed(col.rail, () => {
        c.moveTo(cx, y + 2 * R + 6)
        c.lineTo(cx, nextTop - turn)
        c.arcTo(cx, nextTop, cx - turn, nextTop, turn)
        c.lineTo(cx - STEP, nextTop)
      })
    }

    // Number and heading
    c.beginPath()
    c.arc(cx, y + R, R + 5, 0, Math.PI * 2)
    c.fillStyle = '#f5f6fa'
    c.fill()
    c.beginPath()
    c.arc(cx, y + R, R, 0, Math.PI * 2)
    c.fillStyle = col.solid
    c.fill()
    text(String(index + 1), cx, y + R + 9, '800 26px', '#ffffff', 'center', DISPLAY)

    const tx = x0 + 2 * R + 18
    const lw = text(label(stage), tx, y + R + 14, '800 40px', INK, 'left', DISPLAY)
    const usual = STAGE_USUAL_DAYS[stage]
    text(`${list.length} ${list.length === 1 ? 'founder' : 'founders'} here${usual ? ` · usually about ${usual} days` : ''}`, tx + lw + 16, y + R + 10, '600 21px', MUTED)

    const right = W - PAD
    c.font = `600 22px ${BODY}`
    text(fit(c, STAGE_PLAIN[stage].done, right - tx), tx, y + 2 * R + 34, '600 22px', col.solid)

    // Founders at this stop
    const top = y + 2 * R + 46 + 18
    if (list.length === 0) {
      roundRect(c, tx, top, right - tx, 70, 16)
      c.fillStyle = 'rgba(255,255,255,0.6)'
      c.fill()
      c.save()
      c.setLineDash([7, 6])
      c.strokeStyle = '#d5d9e3'
      c.lineWidth = 2
      c.stroke()
      c.restore()
      text(stage === 'grow' ? 'For members who already run a business and use AI to grow it.' : 'Nobody here yet.', tx + 22, top + 43, '500 22px', FAINT)
    } else {
      const cw = (right - tx - GAP * (COLS - 1)) / COLS
      list.forEach((m, i) => {
        const x = tx + (i % COLS) * (cw + GAP)
        const cy = top + Math.floor(i / COLS) * (CHIP_H + GAP)
        roundRect(c, x, cy, cw, CHIP_H, 16)
        c.fillStyle = '#ffffff'
        c.fill()
        c.strokeStyle = '#e6e8ef'
        c.lineWidth = 1.5
        c.stroke()

        // Avatar: a person on the stop's soft colour.
        const ax = x + 32
        const ay = cy + CHIP_H / 2
        c.beginPath()
        c.arc(ax, ay, 20, 0, Math.PI * 2)
        c.fillStyle = col.soft
        c.fill()
        c.fillStyle = col.solid
        c.beginPath()
        c.arc(ax, ay - 5, 7, 0, Math.PI * 2)
        c.fill()
        c.beginPath()
        c.ellipse(ax, ay + 13, 12, 8, 0, Math.PI, 0)
        c.fill()

        const nx = ax + 30
        c.font = `700 22px ${BODY}`
        text(fit(c, m.name, x + cw - 12 - nx), nx, cy + (m.days != null ? 37 : 49), '700 22px', INK)
        if (m.days != null) text(`${m.days} day${m.days === 1 ? '' : 's'} here`, nx, cy + 64, '500 19px', m.color)
      })
    }
    y += h + STOP_GAP
  })

  if (waiting > 0) {
    text(`${waiting} more joining the path after their onboarding call`, PAD, y + 10, '500 24px', FAINT)
    y += 50
  }
  text('You do the work. We move your marker after each call.', PAD, height - 40, '500 22px', FAINT)
  text('founderswing.com', W - PAD, height - 40, '700 23px', INK, 'right')

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'))
}
