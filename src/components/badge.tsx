type RiskLevel = 'conservative' | 'moderate' | 'aggressive'

interface BadgeProps {
  level: RiskLevel
  className?: string
}

const levelStyles: Record<RiskLevel, string> = {
  conservative: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  moderate: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
  aggressive: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
}

const levelLabels: Record<RiskLevel, string> = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
}

export function Badge({ level, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-3 py-1 text-xs font-medium
        ${levelStyles[level]}
        ${className}
      `}
    >
      {levelLabels[level]}
    </span>
  )
}
