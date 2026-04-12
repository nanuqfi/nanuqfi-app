'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge, MockDataBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProtocolBar } from '@/components/app/protocol-bar'
import { GuardrailCard } from '@/components/app/guardrail-card'
import { useVaultData } from '@/hooks/use-keeper-api'
import { useRiskVault } from '@/hooks/use-allocator'
import { aggregateProtocolAllocations } from '@/lib/protocol-aggregation'
import {
  mockVaults,
  mockYields,
  formatUsd,
  formatApy,
  formatDailyEarnings,
  normalizeApy,
  sourceDisplayName,
  type RiskLevel,
  type Vault,
} from '@/lib/mock-data'

// ─── Config ─────────────────────────────────────────────────────────────────

const VAULT_ORDER: RiskLevel[] = ['conservative', 'moderate', 'aggressive']

const tierConfig: Record<RiskLevel, {
  gradient: string
  barColor: string
  confidenceColor: string
}> = {
  conservative: {
    gradient: 'from-emerald-500/10 to-transparent',
    barColor: 'text-emerald-400',
    confidenceColor: 'bg-emerald-500',
  },
  moderate: {
    gradient: 'from-sky-500/10 to-transparent',
    barColor: 'text-sky-400',
    confidenceColor: 'bg-sky-500',
  },
  aggressive: {
    gradient: 'from-amber-500/10 to-transparent',
    barColor: 'text-amber-400',
    confidenceColor: 'bg-amber-500',
  },
}

const RISK_LEVEL_INDEX: Record<RiskLevel, number> = {
  conservative: 0,
  moderate: 1,
  aggressive: 2,
}

const protocolColors: Record<string, string> = {
  'kamino-lending': 'text-sky-400',
  'marginfi-lending': 'text-violet-400',
  'lulo-lending': 'text-amber-400',
}

function getProtocolApy(slug: string): number {
  return mockYields.find(y => y.slug === slug)?.currentApy ?? 0
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700 ${className}`} />
}

// ─── Vault Column ───────────────────────────────────────────────────────────

function VaultColumn({ vault }: { vault: Vault }) {
  const keeper = useVaultData(vault.riskLevel)
  const onChain = useRiskVault(RISK_LEVEL_INDEX[vault.riskLevel])
  const config = tierConfig[vault.riskLevel]

  // Data cascade: on-chain > keeper > mock
  const tvl = onChain.data
    ? Number(onChain.data.totalAssets) / 1e6
    : keeper.data?.tvl ?? vault.tvl
  const apy = normalizeApy(keeper.data?.apy ?? vault.apy)
  const weights = keeper.data?.weights ?? vault.weights
  const dailyEarnings = tvl * apy / 365
  const drawdown = vault.guardrails.maxDrawdown

  // Mock-tier fallback: neither live source returned data
  const isMockData = !onChain.loading && !keeper.loading && !onChain.data && !keeper.data

  return (
    <GlassCard
      tier={vault.riskLevel}
      className="relative flex flex-col p-0 overflow-hidden"
    >
      {/* Tier badge header */}
      <div className={`bg-gradient-to-b ${config.gradient} px-6 pt-5 pb-4 flex items-center justify-between`}>
        <Badge tier={vault.riskLevel} />
        {isMockData && <MockDataBadge />}
      </div>

      {/* Stats rows */}
      <div className="px-6 py-4 flex-1 space-y-0">
        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-xs text-slate-400">APY</span>
          {keeper.loading ? (
            <Skeleton className="h-5 w-14" />
          ) : (
            <span className="font-mono text-lg tabular-nums text-emerald-400">
              {formatApy(apy)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-xs text-slate-400">Daily Earnings</span>
          {keeper.loading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <span className="font-mono text-sm text-slate-200">
              {formatDailyEarnings(dailyEarnings)}/day
            </span>
          )}
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-xs text-slate-400">TVL</span>
          {keeper.loading ? (
            <Skeleton className="h-5 w-20" />
          ) : (
            <span className="font-mono text-sm text-slate-200">
              {formatUsd(tvl)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between py-3 border-b border-white/5">
          <span className="text-xs text-slate-400">Max Drawdown</span>
          <span className="font-mono text-sm text-red-400">-{drawdown}%</span>
        </div>

        {/* Protocol allocation */}
        <div className="pt-4 space-y-3">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">Allocation</p>
          {Object.entries(weights).map(([slug, weight]) => (
            <ProtocolBar
              key={slug}
              name={sourceDisplayName(slug)}
              percentage={Number(weight)}
              apy={getProtocolApy(slug)}
              color={protocolColors[slug] ?? 'text-slate-400'}
              reasoning={`Weight assigned based on risk-adjusted yield scoring. ${sourceDisplayName(slug)} currently offers ${(getProtocolApy(slug) * 100).toFixed(1)}% APY with ${vault.riskLevel} risk profile.`}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6 pt-2">
        <Link href={`/app/vaults/${vault.riskLevel}`} className="block">
          <Button variant="primary" size="md" className="w-full">
            Deposit
          </Button>
        </Link>
      </div>

    </GlassCard>
  )
}


// ─── Protocol Allocation Map ────────────────────────────────────────────────

function ProtocolAllocationMap() {
  // Live data: call hooks per vault. Data cascade mirrors VaultColumn:
  // on-chain TVL > keeper TVL > mock TVL, keeper weights > mock weights.
  const conservativeKeeper = useVaultData('conservative')
  const moderateKeeper = useVaultData('moderate')
  const aggressiveKeeper = useVaultData('aggressive')
  const conservativeOnChain = useRiskVault(0)
  const moderateOnChain = useRiskVault(1)
  const aggressiveOnChain = useRiskVault(2)

  const snapshots = [
    { keeper: conservativeKeeper, onChain: conservativeOnChain, mock: mockVaults[0]! },
    { keeper: moderateKeeper, onChain: moderateOnChain, mock: mockVaults[1]! },
    { keeper: aggressiveKeeper, onChain: aggressiveOnChain, mock: mockVaults[2]! },
  ]

  const vaultSnapshots = snapshots.map(({ keeper, onChain, mock }) => ({
    tvl: onChain.data
      ? Number(onChain.data.totalAssets) / 1e6
      : keeper.data?.tvl ?? mock.tvl,
    weights: keeper.data?.weights ?? mock.weights,
  }))

  const protocols = aggregateProtocolAllocations(vaultSnapshots).map(p => ({
    ...p,
    name: sourceDisplayName(p.slug),
    apy: getProtocolApy(p.slug),
  }))

  const isLoading =
    conservativeKeeper.loading ||
    moderateKeeper.loading ||
    aggressiveKeeper.loading ||
    conservativeOnChain.loading ||
    moderateOnChain.loading ||
    aggressiveOnChain.loading

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Protocol Allocation Map</h2>
        <p className="mt-1 text-sm text-slate-400">
          Where your capital lives across all vaults
        </p>
      </div>

      <GlassCard className="p-6 space-y-5">
        {isLoading && protocols.length === 0 ? (
          <>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </>
        ) : protocols.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">
            No capital deployed yet — be the first depositor.
          </p>
        ) : (
          protocols.map(p => (
            <div key={p.slug} className="space-y-1">
              <ProtocolBar
                name={p.name}
                percentage={p.percentage}
                apy={p.apy}
                color={protocolColors[p.slug] ?? 'text-slate-400'}
              />
              <p className="text-right font-mono text-xs text-slate-500">
                {formatUsd(p.dollars)} deployed
              </p>
            </div>
          ))
        )}
      </GlassCard>
    </section>
  )
}

// ─── Guardrails Summary ─────────────────────────────────────────────────────

function GuardrailsSummary() {
  const guardrails = [
    {
      label: 'Max Drawdown',
      value: '2% / 5% / 10%',
      color: 'text-red-400',
    },
    {
      label: 'Rebalance Cycle',
      value: '4h',
    },
    {
      label: 'Deposit Cap',
      value: '$10,000',
    },
  ]

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Guardrails</h2>
        <p className="mt-1 text-sm text-slate-400">
          Every limit is on-chain. Not promises -- code.
        </p>
      </div>

      <GuardrailCard guardrails={guardrails} />

      <p className="text-center text-xs text-slate-500">
        On-chain enforced. Not promises -- code.
      </p>
    </section>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function VaultsPage() {
  const vaults = VAULT_ORDER.map(level => mockVaults.find(v => v.riskLevel === level)!)

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <Link href="/app" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      {/* Section 1 — Comparison Table */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Vaults</h2>
          <p className="mt-1 text-sm text-slate-400">
            Compare risk tiers, pick your route
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vaults.map(vault => (
            <VaultColumn key={vault.riskLevel} vault={vault} />
          ))}
        </div>
      </section>

      {/* Section 2 — Protocol Allocation Map */}
      <ProtocolAllocationMap />

      {/* Section 3 — Guardrails Summary */}
      <GuardrailsSummary />

      {/* Section 4 — Cross-links */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/app/activity"
          className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.04] bg-white/[0.015] hover:border-sky-500/20 hover:bg-sky-500/[0.03] transition-all duration-300 cursor-pointer"
        >
          <div>
            <p className="text-sm font-semibold text-white">View AI Decisions</p>
            <p className="text-xs text-slate-500 mt-0.5">See the reasoning behind every allocation</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
        </Link>
        <Link
          href="/strategy"
          className="group flex items-center justify-between p-5 rounded-2xl border border-white/[0.04] bg-white/[0.015] hover:border-white/[0.08] transition-all duration-300 cursor-pointer"
        >
          <div>
            <p className="text-sm font-semibold text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              Strategy Docs
            </p>
            <p className="text-xs text-slate-500 mt-0.5">How the protocol works under the hood</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>
      </section>
    </div>
  )
}
