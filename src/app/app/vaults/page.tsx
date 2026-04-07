'use client'

import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfidenceBar } from '@/components/ui/confidence-bar'
import { ProtocolBar } from '@/components/app/protocol-bar'
import { GuardrailCard } from '@/components/app/guardrail-card'
import { useVaultData } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  mockYields,
  formatUsd,
  formatApy,
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
  aiConfidence: number
}> = {
  conservative: {
    gradient: 'from-emerald-500/10 to-transparent',
    barColor: 'text-emerald-400',
    confidenceColor: 'bg-emerald-500',
    aiConfidence: 92,
  },
  moderate: {
    gradient: 'from-sky-500/10 to-transparent',
    barColor: 'text-sky-400',
    confidenceColor: 'bg-sky-500',
    aiConfidence: 87,
  },
  aggressive: {
    gradient: 'from-amber-500/10 to-transparent',
    barColor: 'text-amber-400',
    confidenceColor: 'bg-amber-500',
    aiConfidence: 74,
  },
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
  const config = tierConfig[vault.riskLevel]

  const tvl = keeper.data?.tvl ?? vault.tvl
  const apy = keeper.data?.apy ?? vault.apy
  const weights = keeper.data?.weights ?? vault.weights
  const dailyEarnings = tvl * (apy / 365)
  const drawdown = vault.guardrails.maxDrawdown

  return (
    <GlassCard
      tier={vault.riskLevel}
      className="relative flex flex-col p-0 overflow-hidden"
    >
      {/* Tier badge header */}
      <div className={`bg-gradient-to-b ${config.gradient} px-6 pt-5 pb-4`}>
        <Badge tier={vault.riskLevel} />
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
              {formatUsd(dailyEarnings)}/day
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

        {/* AI Confidence */}
        <div className="py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">AI Confidence</span>
          </div>
          <ConfidenceBar
            value={config.aiConfidence}
            color={config.confidenceColor}
          />
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
  // Aggregate weights and TVL across all vaults
  const protocolTotals: Record<string, { totalWeight: number; totalDollars: number; count: number }> = {}

  for (const vault of mockVaults) {
    const entries = Object.entries(vault.weights)
    for (const [slug, weight] of entries) {
      if (!protocolTotals[slug]) {
        protocolTotals[slug] = { totalWeight: 0, totalDollars: 0, count: 0 }
      }
      protocolTotals[slug].totalWeight += Number(weight)
      protocolTotals[slug].totalDollars += vault.tvl * (Number(weight) / 100)
      protocolTotals[slug].count += 1
    }
  }

  // Normalize weights to sum to 100
  const totalWeight = Object.values(protocolTotals).reduce((s, p) => s + p.totalWeight, 0)
  const protocols = Object.entries(protocolTotals)
    .map(([slug, data]) => ({
      slug,
      name: sourceDisplayName(slug),
      percentage: totalWeight > 0 ? (data.totalWeight / totalWeight) * 100 : 0,
      dollars: data.totalDollars,
      apy: getProtocolApy(slug),
    }))
    .sort((a, b) => b.percentage - a.percentage)

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Protocol Allocation Map</h2>
        <p className="mt-1 text-sm text-slate-400">
          Where your capital lives across all vaults
        </p>
      </div>

      <GlassCard className="p-6 space-y-5">
        {protocols.map(p => (
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
        ))}
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

// Build the full vault set: mock data for active tiers, placeholder for conservative
function getVaultSet(): Vault[] {
  return VAULT_ORDER.map(level => {
    const existing = mockVaults.find(v => v.riskLevel === level)
    if (existing) return existing

    // Conservative vault placeholder (not yet active in mock data)
    return {
      riskLevel: level,
      tvl: 0,
      apy: 0.021,
      drawdown: 0.002,
      weights: { 'kamino-lending': 60, 'marginfi-lending': 30, 'lulo-lending': 10 },
      guardrails: { maxDrawdown: 2, currentDrawdown: 0.2, maxPerp: 0, currentPerp: 0 },
    }
  })
}

export default function VaultsPage() {
  const vaults = getVaultSet()

  return (
    <div className="space-y-12">
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
    </div>
  )
}
