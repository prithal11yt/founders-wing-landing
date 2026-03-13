"use client"

import { useEffect, useRef } from "react"

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Detect mobile
    const isMobile = window.innerWidth < 768

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const particles: Particle[] = []
    // Drastically reduce particles on mobile
    const particleCount = isMobile ? 15 : 60
    const connectionDistance = isMobile ? 100 : 150

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      baseAlpha: number
      hue: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4)
        this.vy = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4)
        this.size = Math.random() * (isMobile ? 2 : 2.5)
        this.baseAlpha = Math.random() * 0.3 + 0.08
        this.alpha = this.baseAlpha
        this.hue = 200 + Math.random() * 30
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0

        // Skip mouse reactivity on mobile (no mouse)
        if (!isMobile) {
          const dx = this.x - mouseRef.current.x
          const dy = this.y - mouseRef.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            this.alpha = Math.min(this.baseAlpha + (1 - dist / 200) * 0.6, 1)
          } else {
            this.alpha += (this.baseAlpha - this.alpha) * 0.05
          }
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = `hsla(${this.hue}, 40%, 45%, ${this.alpha})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    let animationId: number
    let isPageVisible = true

    const animate = () => {
      if (!isPageVisible) return

      ctx.clearRect(0, 0, width, height)

      particles.forEach((p) => {
        p.update()
        p.draw()
      })

      // Draw connections — skip on mobile to save GPU
      if (!isMobile) {
        particles.forEach((p1, i) => {
          particles.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < connectionDistance) {
              const opacity = 0.12 * (1 - distance / connectionDistance)
              ctx.beginPath()
              const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
              gradient.addColorStop(0, `hsla(${p1.hue}, 30%, 50%, ${opacity})`)
              gradient.addColorStop(1, `hsla(${p2.hue}, 30%, 50%, ${opacity})`)
              ctx.strokeStyle = gradient
              ctx.lineWidth = 0.6
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          })
        })
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Pause when tab is hidden
    const handleVisibility = () => {
      isPageVisible = document.visibilityState === 'visible'
      if (isPageVisible) {
        animationId = requestAnimationFrame(animate)
      }
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener("resize", handleResize)
    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      cancelAnimationFrame(animationId)
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-20" />
}
