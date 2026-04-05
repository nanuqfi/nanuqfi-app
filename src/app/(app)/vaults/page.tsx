'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, Badge, Button } from '@/components'
import { RebalanceHistory } from '@/components/rebalance-history'
import { useRiskVault } from '@/hooks/use-allocator'
import { useVaultData } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  formatUsd,
  formatApy,
  sourceDisplayName,
  type RiskLevel,
} from '@/lib/mock-data'

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700 ${className}`} />
}

// ─── Config ─────────────────────────────────────────────────────────────────

const riskColors = {
  conservative: 'bg-emerald-500',
  moderate: 'bg-sky-500',
  aggressive: 'bg-amber-500',
} as const

const VAULT_CONFIG: { riskLevel: RiskLevel; index: number }[] = [
  { riskLevel: 'moderate', index: 1 },
  { riskLevel: 'aggressive', index: 2 },
]

// ─── Vault Row ──────────────────────────────────────────────────────────────

function VaultRow({ riskLevel, index }: { riskLevel: RiskLevel; index: number }) {
  const onChain = useRiskVault(index)
  const keeper = useVaultData(riskLevel)
  const mockVault = mockVaults.find(v => v.riskLevel === riskLevel)

  const loading = onChain.loading && keeper.loading
  const tvl = onChain.data
    ? Number(onChain.data.totalAssets) / 1e6
    : keeper.data?.tvl ?? mockVault?.tvl ?? 0
  const apy = keeper.data?.apy ?? mockVault?.apy ?? 0
  const weights = keeper.data?.weights ?? mockVault?.weights ?? {}
  const weightEntries = Object.entries(weights)

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge level={riskLevel} />
            <span className="text-lg font-semibold capitalize">
              {riskLevel} Vault
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-slate-400">TVL</p>
              {loading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <p className="font-mono text-lg font-bold">{formatUsd(tvl)}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">APY</p>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <>
                  <p className="font-mono text-lg font-bold text-emerald-400">
                    {formatApy(apy)}
                  </p>
                  <p className="text-xs text-slate-500">90d backtest</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-300">Allocation Breakdown</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {weightEntries.map(([source, weight]) => (
              <div
                key={source}
                className={`${riskColors[riskLevel]} first:rounded-l-full last:rounded-r-full`}
                style={{
                  width: `${weight}%`,
                  opacity: 0.4 + (weight / 100) * 0.6,
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {weightEntries.map(([source, weight]) => (
              <div key={source} className="flex items-center gap-2 text-sm">
                <div className={`h-2 w-2 rounded-full ${riskColors[riskLevel]}`} />
                <span className="text-slate-400">{sourceDisplayName(source)}</span>
                <span className="font-mono text-slate-200">{Number(weight).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/vaults/${riskLevel}`}>
            <Button variant="primary" size="sm" className="gap-2">
              View Details <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/vaults/${riskLevel}`}>
            <Button variant="secondary" size="sm">
              Deposit
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

// ─── Vaults Page ────────────────────────────────────────────────────────────

export default function VaultsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vaults</h1>
        <p className="mt-1 text-slate-400">
          Choose your risk tier. Every allocation is transparent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {VAULT_CONFIG.map(({ riskLevel, index }) => (
          <VaultRow key={riskLevel} riskLevel={riskLevel} index={index} />
        ))}
      </div>

      {/* On-Chain Rebalance Audit Trail */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">On-Chain Audit Trail</h2>
        {VAULT_CONFIG.map(({ riskLevel, index }) => (
          <RebalanceHistory key={riskLevel} riskLevel={index} />
        ))}
      </div>
    </div>
  )
}
