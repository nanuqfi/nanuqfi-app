import { ShieldCheck, Scale, Zap } from 'lucide-react'
import type { RiskLevel } from '@/lib/mock-data'

const tierConfig: Record<RiskLevel, {
  label: string
  color: string
  icon: typeof ShieldCheck
}> = {
  conservative: {
    label: 'Conservative',
    color: 'emerald',
    icon: ShieldCheck,
  },
  moderate: {
    label: 'Moderate',
    color: 'sky',
    icon: Scale,
  },
  aggressive: {
    label: 'Aggressive',
    color: 'amber',
    icon: Zap,
  },
}

interface BadgeProps {
  tier: RiskLevel
  className?: string
}

export function Badge({ tier, className }: BadgeProps) {
  const { label, color, icon: Icon } = tierConfig[tier]

  return (
    <span
      className={[
        `bg-${color}-500/10 text-${color}-400 border-${color}-500/20`,
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-full',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}
