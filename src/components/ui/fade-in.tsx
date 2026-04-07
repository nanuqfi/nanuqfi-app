'use client'

import type { ReactNode } from 'react'
import { useInView } from '@/hooks/use-in-view'

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const { ref, inView } = useInView()

  return (
    <div
      ref={ref}
      className={['transition-all duration-700 ease-out', className].filter(Boolean).join(' ')}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
