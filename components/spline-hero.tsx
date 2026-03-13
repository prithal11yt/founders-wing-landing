'use client'

import { Suspense, lazy, useEffect, useState } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

function SplineLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full neu-pressed animate-pulse" />
    </div>
  )
}

export function SplineHero() {
  const [isMobile, setIsMobile] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    if (!mobile) {
      setShouldRender(true)
    }
  }, [])

  if (isMobile || !shouldRender) return null

  return (
    <div
      className="absolute inset-0 z-[1] overflow-hidden"
      style={{ opacity: 0.45 }}
    >
      <Suspense fallback={<SplineLoader />}>
        <Spline
          scene="https://prod.spline.design/uvmdRl0qPxliKIHb/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </div>
  )
}
