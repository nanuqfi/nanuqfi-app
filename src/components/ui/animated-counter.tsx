'use client'

import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  end,
  duration = 1500,
  prefix,
  suffix,
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (end === 0) return

    const steps = Math.max(1, Math.ceil(duration / 16))
    const increment = end / steps
    let step = 0

    const interval = setInterval(() => {
      step++
      if (step >= steps) {
        setCurrent(end)
        clearInterval(interval)
      } else {
        setCurrent(increment * step)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [end, duration])

  return (
    <span className={['font-mono tabular-nums', className].filter(Boolean).join(' ')}>
      {prefix}{current.toFixed(decimals)}{suffix}
    </span>
  )
}
