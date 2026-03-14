"use client"

import { useEffect, useRef, useCallback } from "react"

// ─── Wave oscillator ────────────────────────────────────────────────
class Oscillator {
  phase: number
  offset: number
  frequency: number
  amplitude: number

  constructor(opts: { phase?: number; offset?: number; frequency?: number; amplitude?: number } = {}) {
    this.phase = opts.phase || 0
    this.offset = opts.offset || 0
    this.frequency = opts.frequency || 0.001
    this.amplitude = opts.amplitude || 1
  }

  update(): number {
    this.phase += this.frequency
    return this.offset + Math.sin(this.phase) * this.amplitude
  }
}

// ─── Trail node (position + velocity) ───────────────────────────────
class TrailNode {
  x = 0
  y = 0
  vx = 0
  vy = 0
}

// ─── Trail config ───────────────────────────────────────────────────
const CONFIG = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
}

// ─── Single trail line ──────────────────────────────────────────────
class TrailLine {
  spring: number
  friction: number
  nodes: TrailNode[]

  constructor(opts: { spring: number }, pos: { x: number; y: number }) {
    this.spring = opts.spring + 0.1 * Math.random() - 0.05
    this.friction = CONFIG.friction + 0.01 * Math.random() - 0.005
    this.nodes = []
    for (let i = 0; i < CONFIG.size; i++) {
      const node = new TrailNode()
      node.x = pos.x
      node.y = pos.y
      this.nodes.push(node)
    }
  }

  update(pos: { x: number; y: number }) {
    let spring = this.spring
    let node = this.nodes[0]

    node.vx += (pos.x - node.x) * spring
    node.vy += (pos.y - node.y) * spring

    for (let i = 0; i < this.nodes.length; i++) {
      node = this.nodes[i]
      if (i > 0) {
        const prev = this.nodes[i - 1]
        node.vx += (prev.x - node.x) * spring
        node.vy += (prev.y - node.y) * spring
        node.vx += prev.vx * CONFIG.dampening
        node.vy += prev.vy * CONFIG.dampening
      }
      node.vx *= this.friction
      node.vy *= this.friction
      node.x += node.vx
      node.y += node.vy
      spring *= CONFIG.tension
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    let x = this.nodes[0].x
    let y = this.nodes[0].y
    ctx.beginPath()
    ctx.moveTo(x, y)

    const len = this.nodes.length
    for (let i = 1; i < len - 2; i++) {
      const curr = this.nodes[i]
      const next = this.nodes[i + 1]
      x = 0.5 * (curr.x + next.x)
      y = 0.5 * (curr.y + next.y)
      ctx.quadraticCurveTo(curr.x, curr.y, x, y)
    }

    const secondLast = this.nodes[len - 2]
    const last = this.nodes[len - 1]
    ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y)
    ctx.stroke()
    ctx.closePath()
  }
}

// ─── React component ────────────────────────────────────────────────
export function CanvasCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(true)
  const linesRef = useRef<TrailLine[]>([])
  const posRef = useRef({ x: 0, y: 0 })
  const oscillatorRef = useRef<Oscillator | null>(null)
  const initializedRef = useRef(false)

  const initLines = useCallback(() => {
    const lines: TrailLine[] = []
    for (let i = 0; i < CONFIG.trails; i++) {
      lines.push(new TrailLine({ spring: 0.45 + (i / CONFIG.trails) * 0.025 }, posRef.current))
    }
    linesRef.current = lines
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Skip on mobile — this effect is mouse-driven
    if (window.innerWidth < 768) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    runningRef.current = true

    oscillatorRef.current = new Oscillator({
      phase: Math.random() * 2 * Math.PI,
      amplitude: 85,
      frequency: 0.0015,
      offset: 285,
    })

    // ── Resize handler ──────────────────────────────────────────────
    const resizeCanvas = () => {
      canvas.width = window.innerWidth - 20
      canvas.height = window.innerHeight
    }
    resizeCanvas()

    // ── Mouse / touch handlers ──────────────────────────────────────
    const onMove = (e: MouseEvent | TouchEvent) => {
      if ("touches" in e && e.touches.length) {
        posRef.current = { x: e.touches[0].pageX, y: e.touches[0].pageY }
      } else if ("clientX" in e) {
        posRef.current = { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
      }
    }

    const onFirstInteraction = (e: MouseEvent | TouchEvent) => {
      if (!initializedRef.current) {
        initializedRef.current = true
        document.removeEventListener("mousemove", onFirstInteraction as EventListener)
        document.removeEventListener("touchstart", onFirstInteraction as EventListener)
        document.addEventListener("mousemove", onMove as EventListener)
        document.addEventListener("touchmove", onMove as EventListener)
        document.addEventListener("touchstart", (ev: TouchEvent) => {
          if (ev.touches.length === 1) {
            posRef.current = { x: ev.touches[0].pageX, y: ev.touches[0].pageY }
          }
        })
        onMove(e)
        initLines()
        render()
      }
    }

    // ── Render loop ─────────────────────────────────────────────────
    const render = () => {
      if (!runningRef.current) return

      ctx.globalCompositeOperation = "source-over"
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = "lighter"
      ctx.strokeStyle = `hsla(${Math.round(oscillatorRef.current!.update())},100%,50%,0.025)`
      ctx.lineWidth = 10

      for (let i = 0; i < CONFIG.trails; i++) {
        const line = linesRef.current[i]
        if (line) {
          line.update(posRef.current)
          line.draw(ctx)
        }
      }

      window.requestAnimationFrame(render)
    }

    document.addEventListener("mousemove", onFirstInteraction as EventListener)
    document.addEventListener("touchstart", onFirstInteraction as EventListener)
    window.addEventListener("resize", resizeCanvas)
    document.body.addEventListener("orientationchange", resizeCanvas)

    const handleFocus = () => {
      if (!runningRef.current) {
        runningRef.current = true
        render()
      }
    }
    const handleBlur = () => {
      runningRef.current = true
    }
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    return () => {
      runningRef.current = false
      document.removeEventListener("mousemove", onFirstInteraction as EventListener)
      document.removeEventListener("touchstart", onFirstInteraction as EventListener)
      document.removeEventListener("mousemove", onMove as EventListener)
      document.removeEventListener("touchmove", onMove as EventListener)
      window.removeEventListener("resize", resizeCanvas)
      document.body.removeEventListener("orientationchange", resizeCanvas)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)
    }
  }, [initLines])

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 1 }}
    />
  )
}
