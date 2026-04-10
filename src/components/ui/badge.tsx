import { ShieldCheck, Scale, Zap, FlaskConical } from 'lucide-react'
import type { RiskLevel } from '@/lib/mock-data'

// ─── Static class maps ────────────────────────────────────────────────────────
// Dynamic template literals (e.g. `bg-${color}-500/10`) are purged by Tailwind
// at build time because they never appear as full strings in source. Use a
// record lookup so every class string is statically present in this file.

const tierClasses: Record<RiskLevel, string> = {
  conservative: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  moderate:     'bg-sky-500/10 text-sky-400 border-sky-500/20',
  aggressive:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

const tierConfig: Record<RiskLevel, {
  label: string
  icon: typeof ShieldCheck
}> = {
  conservative: { label: 'Conservative', icon: ShieldCheck },
  moderate:     { label: 'Moderate',     icon: Scale },
  aggressive:   { label: 'Aggressive',   icon: Zap },
}

interface BadgeProps {
  tier: RiskLevel
  className?: string
}

// ─── MockDataBadge ────────────────────────────────────────────────────────────
// Shown when live on-chain and keeper data are unavailable — alerts users
// they're seeing demo/fallback values, not real-time protocol data.

interface MockDataBadgeProps {
  className?: string
}

export function MockDataBadge({ className }: MockDataBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium',
        'bg-slate-700/50 text-slate-500 border border-slate-700 rounded-full',
        className,
      ].filter(Boolean).join(' ')}
      title="Live on-chain and keeper data unavailable — showing demo values"
    >
      <FlaskConical className="w-2.5 h-2.5" />
      Demo data
    </span>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ tier, className }: BadgeProps) {
  const { label, icon: Icon } = tierConfig[tier]

  return (
    <span
      className={[
        tierClasses[tier],
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-full',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}
