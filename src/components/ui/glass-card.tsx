import type { ReactNode } from 'react'
import type { RiskLevel } from '@/lib/mock-data'

const tierBorder: Record<RiskLevel, string> = {
  conservative: 'border-l-emerald-500/40',
  moderate: 'border-l-sky-500/40',
  aggressive: 'border-l-amber-500/40',
}

interface GlassCardProps {
  children: ReactNode
  tier?: RiskLevel
  elevated?: boolean
  className?: string
}

export function GlassCard({ children, tier, elevated, className }: GlassCardProps) {
  return (
    <div
      className={[
        'glass rounded-2xl relative overflow-hidden',
        elevated && 'glass-elevated',
        tier && `border-l-2 ${tierBorder[tier]}`,
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
