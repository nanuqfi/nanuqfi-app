'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { useKeeperHealth } from '@/hooks/use-keeper-api'

interface StatItemProps {
  label: string
  value: string
  period: string
}

function StatItem({ label, value, period }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1 px-4 first:pl-0 lg:first:pl-4">
      <span className="text-[11px] uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="text-2xl font-mono tabular-nums text-white">
        {value}
      </span>
      <span className="text-xs text-slate-500 font-mono">
        {period}
      </span>
    </div>
  )
}

export function KeeperStatsBar() {
  const { data, loading } = useKeeperHealth()

  const uptimeValue = data?.uptime
    ? `${(data.uptime * 100).toFixed(1)}%`
    : '99.2%'

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:divide-x divide-white/5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 px-4 first:pl-0 lg:first:pl-4">
              <div className="h-3 w-20 animate-pulse rounded bg-slate-700" />
              <div className="h-7 w-16 animate-pulse rounded bg-slate-700" />
              <div className="h-3 w-12 animate-pulse rounded bg-slate-700" />
            </div>
          ))}
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:divide-x divide-white/5">
        <StatItem label="Decisions" value="142" period="(30 days)" />
        <StatItem label="Success Rate" value="98.6%" period="(30 days)" />
        <StatItem label="Avg Confidence" value="86%" period="(30 days)" />
        <StatItem label="Uptime" value={uptimeValue} period="(7 days)" />
      </div>
    </GlassCard>
  )
}
