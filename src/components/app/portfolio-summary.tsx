'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { useKeeperHealth, useVaultData } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  formatUsd,
  formatApy,
  getTotalTvl,
  getWeightedApy,
} from '@/lib/mock-data'

function useMinutesAgo(isoTimestamp: string | undefined): number | null {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!isoTimestamp) return () => {}
    const interval = setInterval(onStoreChange, 60_000)
    return () => clearInterval(interval)
  }, [isoTimestamp])

  const getSnapshot = useCallback(() => {
    if (!isoTimestamp) return null
    return Math.round((Date.now() - new Date(isoTimestamp).getTime()) / 60000)
  }, [isoTimestamp])

  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

export function PortfolioSummary() {
  const health = useKeeperHealth()
  const moderate = useVaultData('moderate')
  const aggressive = useVaultData('aggressive')

  const moderateTvl = moderate.data?.tvl ?? mockVaults.find(v => v.riskLevel === 'moderate')?.tvl ?? 0
  const aggressiveTvl = aggressive.data?.tvl ?? mockVaults.find(v => v.riskLevel === 'aggressive')?.tvl ?? 0
  const moderateApy = moderate.data?.apy ?? mockVaults.find(v => v.riskLevel === 'moderate')?.apy ?? 0
  const aggressiveApy = aggressive.data?.apy ?? mockVaults.find(v => v.riskLevel === 'aggressive')?.apy ?? 0

  const tvlSum = moderateTvl + aggressiveTvl
  const tvl = tvlSum > 0 ? tvlSum : getTotalTvl()
  const apy = tvlSum > 0
    ? (moderateApy * moderateTvl + aggressiveApy * aggressiveTvl) / tvlSum
    : getWeightedApy()

  const dailyEarnings = tvl * (apy / 365)

  const minutesAgo = useMinutesAgo(health.data?.lastCycle)

  return (
    <GlassCard className="p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:divide-x divide-white/5">
        {/* Total Value */}
        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-mono tabular-nums text-white">
            {formatUsd(tvl)}
          </p>
        </div>

        {/* Daily Earnings — hero metric */}
        <div className="relative space-y-1 sm:pl-6">
          <div className="absolute -left-2 top-0 h-full w-[2px] bg-sky-500 blur-[2px] hidden sm:block" />
          <p className="text-xs text-sky-400/80 uppercase tracking-wider">Daily Earnings</p>
          <p className="text-3xl font-mono tabular-nums text-sky-400">
            {formatUsd(dailyEarnings)}
            <span className="text-sm text-sky-400/60 ml-1">/day</span>
          </p>
        </div>

        {/* Weighted APY */}
        <div className="space-y-1 sm:pl-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Weighted APY</p>
          <p className="text-2xl font-mono tabular-nums text-white">
            {formatApy(apy)}
          </p>
        </div>

        {/* AI Pulse */}
        <div className="space-y-1 sm:pl-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider">AI Pulse</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-2xl font-mono tabular-nums text-white">
              {health.loading
                ? '...'
                : minutesAgo !== null
                  ? `Active ${minutesAgo}m ago`
                  : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
