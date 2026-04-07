'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { YieldChart } from '@/components/app/yield-chart'
import { ProtocolBar } from '@/components/app/protocol-bar'
import { GuardrailCard } from '@/components/app/guardrail-card'
import { DecisionFeedItem } from '@/components/app/decision-feed-item'
import { DepositForm } from '@/components/app/deposit-form'
import { useRiskVault, useUsdcBalance } from '@/hooks/use-allocator'
import { useVaultData, useKeeperDecisions } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  mockDecisions,
  mockYields,
  formatUsd,
  formatApy,
  sourceDisplayName,
  type RiskLevel,
  type KeeperDecision,
} from '@/lib/mock-data'

// ─── Constants ──────────────────────────────────────────────────────────────

const RISK_LEVEL_MAP: Record<string, number> = {
  conservative: 0,
  moderate: 1,
  aggressive: 2,
}

const validRiskLevels: RiskLevel[] = ['moderate', 'aggressive']

const PROTOCOL_COLORS: Record<string, string> = {
  'kamino-lending': 'text-sky-400',
  'marginfi-lending': 'text-amber-400',
  'lulo-lending': 'text-emerald-400',
}

// ─── Vault Detail Page ──────────────────────────────────────────────────────

export default function VaultDetailPage() {
  const params = useParams<{ riskLevel: string }>()
  const riskLevel = params.riskLevel as RiskLevel

  if (!validRiskLevels.includes(riskLevel)) {
    return (
      <div className="space-y-4 text-center py-20">
        <h1 className="text-2xl font-bold text-slate-200">Vault Not Found</h1>
        <p className="text-slate-400">
          {riskLevel === 'conservative'
            ? 'Conservative vault is not available during hackathon.'
            : 'Invalid risk level.'}
        </p>
        <Link
          href="/vaults"
          className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vaults
        </Link>
      </div>
    )
  }

  const riskLevelNum = RISK_LEVEL_MAP[riskLevel]!

  return <VaultDetailContent riskLevel={riskLevel} riskLevelNum={riskLevelNum} />
}

// ─── Content ────────────────────────────────────────────────────────────────

function VaultDetailContent({
  riskLevel,
  riskLevelNum,
}: {
  riskLevel: RiskLevel
  riskLevelNum: number
}) {
  // On-chain data
  const onChain = useRiskVault(riskLevelNum)
  const usdcBalance = useUsdcBalance()

  // Keeper API data
  const keeper = useVaultData(riskLevel)
  const keeperDecisions = useKeeperDecisions(riskLevel)

  // Mock fallback
  const mockVault = mockVaults.find(v => v.riskLevel === riskLevel)

  // Derived values — on-chain > keeper API > mock
  const tvl = onChain.data
    ? Number(onChain.data.totalAssets) / 1e6
    : keeper.data?.tvl ?? mockVault?.tvl ?? 0
  const apy = keeper.data?.apy ?? mockVault?.apy ?? 0
  const weights = keeper.data?.weights ?? mockVault?.weights ?? {}
  const dailyEarnings = (tvl * apy) / 365

  // Wallet balance in USDC (human-readable)
  const walletBalance = usdcBalance.data !== null
    ? Number(usdcBalance.data) / 1e6
    : undefined

  // Guardrails from on-chain data
  const maxDrawdownBps = onChain.data?.maxDrawdownBps ?? (mockVault?.guardrails.maxDrawdown ?? 5) * 100
  const maxDrawdown = maxDrawdownBps / 100
  const maxSingleAssetBps = onChain.data?.maxSingleAssetBps ?? 6000
  const maxSingleAsset = maxSingleAssetBps / 100
  const redemptionSlots = onChain.data?.redemptionPeriodSlots ?? 0n

  // Decisions: keeper API > mock fallback
  const decisions: KeeperDecision[] = useMemo(() => {
    if (keeperDecisions.data && keeperDecisions.data.length > 0) {
      return keeperDecisions.data.slice(0, 8).map(d => ({
        ...d,
        vault: riskLevel,
      }))
    }
    return mockDecisions
      .filter(d => d.vault === riskLevel)
      .slice(0, 8)
  }, [keeperDecisions.data, riskLevel])

  // Guardrails for GuardrailCard
  const guardrails = [
    { label: 'Max Drawdown', value: `${maxDrawdown.toFixed(0)}%`, color: 'text-emerald-400' },
    { label: 'Max Single Asset', value: `${maxSingleAsset.toFixed(0)}%`, color: 'text-slate-200' },
    { label: 'Perp Exposure', value: 'None (lending only)', color: 'text-emerald-400' },
    { label: 'Redemption Period', value: redemptionSlots > 0n ? `${Number(redemptionSlots)} slots` : 'Instant', color: 'text-slate-200' },
  ]

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/vaults"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vaults
      </Link>

      {/* Vault Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-6 mb-8">
        {/* Left: badge + title */}
        <div className="flex items-center gap-3">
          <Badge tier={riskLevel} />
          <h1 className="text-4xl font-bold text-white tracking-tight">
            USDC Optimal Yield
          </h1>
        </div>

        {/* Right: stats pill */}
        <div className="flex items-center gap-0 glass rounded-2xl px-6 py-3 border border-white/5">
          <div className="text-center px-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-0.5">APY</p>
            <p className="text-lg font-bold font-mono text-sky-400">{formatApy(apy)}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center px-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-0.5">Daily</p>
            <p className="text-lg font-bold font-mono text-slate-200">${dailyEarnings.toFixed(2)}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center px-4">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-0.5">TVL</p>
            <p className="text-lg font-bold font-mono text-slate-200">{formatUsd(tvl)}</p>
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="col-span-7 space-y-6">
          {/* Yield Chart */}
          <YieldChart
            title="Protocol APY Comparison"
            subtitle="Historical yield across all active protocols"
          />

          {/* Protocol Split / Current Allocation */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-5">Current Allocation</h3>
            <div className="space-y-5">
              {Object.entries(weights).map(([source, weight]) => {
                const yieldSource = mockYields.find(y => y.slug === source)
                const protocolApy = yieldSource?.currentApy ?? apy

                return (
                  <ProtocolBar
                    key={source}
                    name={sourceDisplayName(source)}
                    percentage={weight}
                    apy={protocolApy}
                    color={PROTOCOL_COLORS[source] ?? 'text-slate-400'}
                    reasoning={
                      source === 'kamino-lending'
                        ? 'Largest allocation — stable TVL ($1.2B), battle-tested lending pool, lowest risk.'
                        : source === 'marginfi-lending'
                          ? 'Strong yield at 6.5% APY with acceptable risk. Diversifies protocol exposure.'
                          : source === 'lulo-lending'
                            ? 'Highest APY via aggregation across multiple protocols. Capped for concentration risk.'
                            : undefined
                    }
                  />
                )
              })}
            </div>
          </GlassCard>

          {/* Decision History */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Recent Decisions</h3>
              <Link
                href="/activity"
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-sky-400 transition-colors"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {decisions.length > 0 ? (
              <div className="space-y-0">
                {decisions.map((decision) => (
                  <DecisionFeedItem key={decision.id} decision={decision} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                No recent activity for this vault.
              </p>
            )}
          </GlassCard>
        </div>

        {/* Right Column (sticky) */}
        <div className="col-span-5 space-y-6 mt-8 lg:mt-0 sticky top-28">
          {/* Deposit Form */}
          <DepositForm
            riskLevel={riskLevel}
            apy={apy}
            dailyEarnings={dailyEarnings}
            walletBalance={walletBalance}
          />

          {/* Guardrail Card */}
          <GuardrailCard guardrails={guardrails} />
        </div>
      </div>
    </div>
  )
}
