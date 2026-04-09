'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { YieldEstimator } from '@/components/app/yield-estimator'
import { useAllocatorState, useRiskVault } from '@/hooks/use-allocator'
import { useKeeperHealth, useVaultData } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  formatUsd,
  formatApy,
  formatDailyEarnings,
  normalizeApy,
  getTotalTvl,
  getWeightedApy,
} from '@/lib/mock-data'

function useMinutesAgo(timestampMs: number | undefined): number | null {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!timestampMs) return () => {}
    const interval = setInterval(onStoreChange, 60_000)
    return () => clearInterval(interval)
  }, [timestampMs])

  const getSnapshot = useCallback(() => {
    if (!timestampMs) return null
    return Math.round((Date.now() - timestampMs) / 60000)
  }, [timestampMs])

  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

interface PortfolioSummaryProps {
  isConnected: boolean
  positionsLoading: boolean
  userModValue: number  // current value (shares * sharePrice), not cost basis
  userAggValue: number
  walletBalance?: number
}

export function PortfolioSummary({
  isConnected,
  positionsLoading,
  userModValue,
  userAggValue,
  walletBalance,
}: PortfolioSummaryProps) {
  const { setVisible } = useWalletModal()
  const router = useRouter()

  // Protocol data (always fetched)
  const allocator = useAllocatorState()
  const modOnChain = useRiskVault(1)
  const aggOnChain = useRiskVault(2)
  const modKeeper = useVaultData('moderate')
  const aggKeeper = useVaultData('aggressive')
  const health = useKeeperHealth()

  const hasPosition = isConnected && !positionsLoading
    && (userModValue + userAggValue) > 0

  // Protocol TVL
  const modMock = mockVaults.find(v => v.riskLevel === 'moderate')
  const aggMock = mockVaults.find(v => v.riskLevel === 'aggressive')

  const modTvl = modOnChain.data
    ? Number(modOnChain.data.totalAssets) / 1e6
    : modKeeper.data?.tvl ?? modMock?.tvl ?? 0
  const aggTvl = aggOnChain.data
    ? Number(aggOnChain.data.totalAssets) / 1e6
    : aggKeeper.data?.tvl ?? aggMock?.tvl ?? 0

  const protocolTvl = allocator.data
    ? Number(allocator.data.totalTvl) / 1e6
    : (modTvl + aggTvl) > 0
      ? modTvl + aggTvl
      : getTotalTvl()

  // Weighted APY
  const modApy = normalizeApy(modKeeper.data?.apy ?? modMock?.apy ?? 0)
  const aggApy = normalizeApy(aggKeeper.data?.apy ?? aggMock?.apy ?? 0)
  const totalTvlForWeight = modTvl + aggTvl
  const apy = totalTvlForWeight > 0
    ? (modApy * modTvl + aggApy * aggTvl) / totalTvlForWeight
    : getWeightedApy()

  // User TVL and earnings (values passed as props from parent)
  const userTvl = userModValue + userAggValue
  const userDailyEarnings = userTvl * apy / 365

  // AI Pulse
  const minutesAgo = useMinutesAgo(health.data?.lastCycleTimestamp)
  const isKeeperOnline = !!health.data && !health.loading
  const pulseColor = isKeeperOnline ? 'bg-emerald-400' : 'bg-amber-400'
  const pulseText = health.loading
    ? '...'
    : minutesAgo !== null
      ? `Active ${minutesAgo}m ago`
      : 'Offline'
  const pulseTextColor = isKeeperOnline ? 'text-emerald-400' : 'text-amber-400'

  // ─── AI Pulse element (reused across states) ──────────────────────────────

  const aiPulse = (
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
  )

  // ─── Loading: wallet connected but positions still fetching ────────────────

  if (positionsLoading) {
    return (
      <GlassCard className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:divide-x divide-white/5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`space-y-2 ${i > 0 ? 'sm:pl-6' : ''}`}>
              <div className="h-3 w-20 animate-pulse rounded bg-slate-700" />
              <div className="h-7 w-24 animate-pulse rounded bg-slate-700" />
            </div>
          ))}
        </div>
      </GlassCard>
    )
  }

  // ─── State 3: Connected with position ─────────────────────────────────────

  if (hasPosition) {
    return (
      <GlassCard className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:divide-x divide-white/5">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Your Value</p>
            <p className="text-2xl font-mono tabular-nums text-white">
              {formatUsd(userTvl)}
            </p>
          </div>
          <div className="relative space-y-1 sm:pl-6">
            <div className="absolute -left-2 top-0 h-full w-[2px] bg-sky-500 blur-[2px] hidden sm:block" />
            <p className="text-xs text-sky-400/80 uppercase tracking-wider">Daily Earnings</p>
            <p className="text-3xl font-mono tabular-nums text-sky-400">
              {formatDailyEarnings(userDailyEarnings)}
              <span className="text-sm text-sky-400/60 ml-1">/day</span>
            </p>
          </div>
          <div className="space-y-1 sm:pl-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Weighted APY</p>
            <p className="text-2xl font-mono tabular-nums text-white">
              {formatApy(apy)}
            </p>
          </div>
          {aiPulse}
        </div>
      </GlassCard>
    )
  }

  // ─── State 1 & 2: Disconnected / Connected without position ───────────────

  return (
    <GlassCard className="p-6 space-y-5">
      <div className="grid grid-cols-3 gap-6 sm:divide-x divide-white/5">
        <div className="space-y-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Protocol TVL</p>
          <p className="text-2xl font-mono tabular-nums text-white">
            {formatUsd(protocolTvl)}
          </p>
        </div>
        <div className="space-y-1 sm:pl-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Weighted APY</p>
          <p className="text-2xl font-mono tabular-nums text-white">
            {formatApy(apy)}
          </p>
        </div>
        {aiPulse}
      </div>
      <div className="border-t border-white/5 pt-5">
        <YieldEstimator
          apy={apy}
          walletBalance={walletBalance}
          ctaMode={isConnected ? 'deposit' : 'connect'}
          onConnect={() => {
            if (isConnected) {
              router.push('/app/vaults/moderate')
            } else {
              setVisible(true)
            }
          }}
        />
      </div>
    </GlassCard>
  )
}
