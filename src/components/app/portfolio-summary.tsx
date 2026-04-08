'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { useAllocatorState, useRiskVault } from '@/hooks/use-allocator'
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
  // Layer 1: On-chain data (primary)
  const allocator = useAllocatorState()
  const modOnChain = useRiskVault(1)
  const aggOnChain = useRiskVault(2)

  // Layer 2: Keeper API (secondary)
  const modKeeper = useVaultData('moderate')
  const aggKeeper = useVaultData('aggressive')
  const health = useKeeperHealth()

  // Data cascade: on-chain > keeper API > mock
  const modMock = mockVaults.find(v => v.riskLevel === 'moderate')
  const aggMock = mockVaults.find(v => v.riskLevel === 'aggressive')

  // TVL: on-chain totalAssets (in USDC smallest unit) > keeper > mock
  const modTvl = modOnChain.data
    ? Number(modOnChain.data.totalAssets) / 1e6
    : modKeeper.data?.tvl ?? modMock?.tvl ?? 0
  const aggTvl = aggOnChain.data
    ? Number(aggOnChain.data.totalAssets) / 1e6
    : aggKeeper.data?.tvl ?? aggMock?.tvl ?? 0

  // Total TVL: prefer allocator.totalTvl if available
  const tvl = allocator.data
    ? Number(allocator.data.totalTvl) / 1e6
    : (modTvl + aggTvl) > 0
      ? modTvl + aggTvl
      : getTotalTvl()

  // APY: keeper API > mock (on-chain doesn't store APY)
  const modApy = modKeeper.data?.apy ?? modMock?.apy ?? 0
  const aggApy = aggKeeper.data?.apy ?? aggMock?.apy ?? 0

  // Weighted APY by TVL
  const totalTvlForWeight = modTvl + aggTvl
  const apy = totalTvlForWeight > 0
    ? (modApy * modTvl + aggApy * aggTvl) / totalTvlForWeight
    : getWeightedApy()

  // Daily earnings: TVL * APY / 365
  const dailyEarnings = tvl * apy / 365

  // AI Pulse: keeper health determines status
  const minutesAgo = useMinutesAgo(health.data?.lastCycle)
  const isKeeperOnline = !!health.data && !health.loading
  const pulseColor = isKeeperOnline ? 'bg-emerald-400' : 'bg-amber-400'
  const pulseText = health.loading
    ? '...'
    : minutesAgo !== null
      ? `Active ${minutesAgo}m ago`
      : 'Offline'
  const pulseTextColor = isKeeperOnline ? 'text-emerald-400' : 'text-amber-400'

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
            {dailyEarnings < 0.01 && dailyEarnings > 0
              ? `$${dailyEarnings.toFixed(4)}`
              : formatUsd(dailyEarnings)}
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
              {isKeeperOnline && (
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pulseColor} opacity-75`} />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${pulseColor}`} />
            </span>
            <span className={`text-lg font-mono tabular-nums ${pulseTextColor}`}>
              {pulseText}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
