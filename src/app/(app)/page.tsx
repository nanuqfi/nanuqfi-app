'use client'

import Link from 'next/link'
import { ArrowRight, ShieldAlert } from 'lucide-react'
import { Card, Stat, Badge } from '@/components'
import { useAllocatorState, useRiskVault } from '@/hooks/use-allocator'
import { useVaultData, useKeeperHealth } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  formatUsd,
  formatApy,
  getTotalTvl,
  getWeightedApy,
  type RiskLevel,
} from '@/lib/mock-data'

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700 ${className}`} />
}

// ─── Risk level mapping ─────────────────────────────────────────────────────

const VAULT_CONFIG: { riskLevel: RiskLevel; index: number }[] = [
  { riskLevel: 'moderate', index: 1 },
  { riskLevel: 'aggressive', index: 2 },
]

// ─── Vault Card ─────────────────────────────────────────────────────────────

function VaultCard({ riskLevel, index }: { riskLevel: RiskLevel; index: number }) {
  const onChain = useRiskVault(index)
  const keeper = useVaultData(riskLevel)
  const mockVault = mockVaults.find(v => v.riskLevel === riskLevel)

  const loading = onChain.loading && keeper.loading
  const tvl = onChain.data
    ? Number(onChain.data.totalAssets) / 1e6
    : keeper.data?.tvl ?? mockVault?.tvl ?? 0
  const apy = keeper.data?.apy ?? mockVault?.apy ?? 0
  const weights = keeper.data?.weights ?? mockVault?.weights ?? {}

  return (
    <Link href={`/vaults/${riskLevel}`}>
      <Card className="transition-colors duration-150 hover:border-slate-600">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge level={riskLevel} />
            {loading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="font-mono text-xs text-slate-400">
                {formatApy(apy)} APY
              </span>
            )}
          </div>

          <div>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="font-mono text-2xl font-bold">
                {formatUsd(tvl)}
              </p>
            )}
            <p className="text-sm text-slate-400">Total Value Locked</p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {Object.keys(weights).length} sources
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              Details <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

// ─── Dashboard Page ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const allocator = useAllocatorState()
  const keeperHealth = useKeeperHealth()
  const moderateKeeper = useVaultData('moderate')
  const aggressiveKeeper = useVaultData('aggressive')

  const loading = allocator.loading && moderateKeeper.loading

  // TVL: prefer on-chain, fallback to keeper sum, then mock
  const totalTvl = allocator.data
    ? Number(allocator.data.totalTvl) / 1e6
    : (moderateKeeper.data?.tvl ?? 0) + (aggressiveKeeper.data?.tvl ?? 0) || getTotalTvl()

  // APY: weighted average from keeper data, fallback to mock
  const moderateTvl = moderateKeeper.data?.tvl ?? mockVaults.find(v => v.riskLevel === 'moderate')?.tvl ?? 0
  const aggressiveTvl = aggressiveKeeper.data?.tvl ?? mockVaults.find(v => v.riskLevel === 'aggressive')?.tvl ?? 0
  const moderateApy = moderateKeeper.data?.apy ?? mockVaults.find(v => v.riskLevel === 'moderate')?.apy ?? 0
  const aggressiveApy = aggressiveKeeper.data?.apy ?? mockVaults.find(v => v.riskLevel === 'aggressive')?.apy ?? 0
  const tvlSum = moderateTvl + aggressiveTvl
  const avgApy = tvlSum > 0
    ? (moderateApy * moderateTvl + aggressiveApy * aggressiveTvl) / tvlSum
    : getWeightedApy()

  const keeperStatus = keeperHealth.data
    ? keeperHealth.data.rpcStatus === 'healthy' ? 'Online' : 'Degraded'
    : keeperHealth.loading ? '...' : 'Offline'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Yield, Routed. Real-time protocol overview.
        </p>
      </div>

      {allocator.data?.halted && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Protocol Halted</p>
            <p className="text-sm text-red-400/80">
              Emergency halt is active. Deposits are paused while the team investigates.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          {loading ? (
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Total Value Locked</p>
              <Skeleton className="h-8 w-32" />
            </div>
          ) : (
            <Stat
              label="Total Value Locked"
              value={formatUsd(totalTvl)}
              trend="up"
            />
          )}
        </Card>
        <Card>
          {loading ? (
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Weighted Avg APY</p>
              <Skeleton className="h-8 w-24" />
            </div>
          ) : (
            <Stat
              label="Weighted Avg APY"
              value={formatApy(avgApy)}
              subValue="across all vaults"
              trend="up"
            />
          )}
        </Card>
        <Card>
          <Stat
            label="Keeper Status"
            value={keeperStatus}
            subValue={keeperHealth.data?.version ?? 'v1.0'}
            trend={keeperHealth.data ? 'up' : 'neutral'}
          />
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vaults</h2>
          <Link
            href="/vaults"
            className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {VAULT_CONFIG.map(({ riskLevel, index }) => (
            <VaultCard key={riskLevel} riskLevel={riskLevel} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
