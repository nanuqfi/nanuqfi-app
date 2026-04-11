'use client'
import { useEffect, useState } from 'react'
import { useInView } from './use-in-view'

interface UseCountUpOptions {
  end: number
  duration?: number
  decimals?: number
  suffix?: string
  prefix?: string
}

export function useCountUp({
  end,
  duration = 1500,
  decimals = 0,
  suffix = '',
  prefix = '',
}: UseCountUpOptions) {
  const { ref, inView } = useInView({ threshold: 0.3 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(eased * end)

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setValue(end)
      }
    }

    requestAnimationFrame(tick)
  }, [inView, end, duration])

  const display = `${prefix}${value.toFixed(decimals)}${suffix}`
  return { ref, display, inView }
}
