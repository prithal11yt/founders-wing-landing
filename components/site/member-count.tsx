'use client'

import { useEffect, useState } from 'react'

/* Live member count from /api/public/member-count, with a fallback until it loads. */
export function MemberCount({ fallback = '45+' }: { fallback?: string }) {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/public/member-count')
      .then(r => r.json())
      .then(d => setCount(typeof d.count === 'number' ? d.count : null))
      .catch(() => {})
  }, [])
  return <>{count !== null ? String(count) : fallback}</>
}
