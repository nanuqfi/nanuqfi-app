'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { PortfolioSummary } from '@/components/app/portfolio-summary'
import { VaultCard } from '@/components/app/vault-card'
import { YieldChart } from '@/components/app/yield-chart'
import { DecisionFeedItem } from '@/components/app/decision-feed-item'
import { useVaultData, useKeeperDecisions } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  mockDecisions,
  type Vault,
  type RiskLevel,
} from '@/lib/mock-data'

const VAULT_DEPOSITS: Record<RiskLevel, number> = {
  conservative: 0,
  moderate: 210,
  aggressive: 50,
}

const VAULT_CONFIDENCE: Record<RiskLevel, number> = {
  conservative: 92,
  moderate: 87,
  aggressive: 74,
}

const ALL_RISK_LEVELS: RiskLevel[] = ['conservative', 'moderate', 'aggressive']

function useVaultWithFallback(riskLevel: RiskLevel): Vault {
  const live = useVaultData(riskLevel)
  const mock = mockVaults.find(v => v.riskLevel === riskLevel)

  return {
    riskLevel,
    tvl: live.data?.tvl ?? mock?.tvl ?? 0,
    apy: live.data?.apy ?? mock?.apy ?? 0,
    drawdown: live.data?.drawdown ?? mock?.drawdown ?? 0,
    weights: live.data?.weights ?? mock?.weights ?? {},
    guardrails: mock?.guardrails ?? {
      maxDrawdown: 5,
      currentDrawdown: 0,
      maxPerp: 0,
      currentPerp: 0,
    },
  }
}

export default function DashboardPage() {
  const conservativeVault = useVaultWithFallback('conservative')
  const moderateVault = useVaultWithFallback('moderate')
  const aggressiveVault = useVaultWithFallback('aggressive')

  const vaults = [conservativeVault, moderateVault, aggressiveVault]

  const decisionsHook = useKeeperDecisions('all')
  const decisions = decisionsHook.data
    ? decisionsHook.data.slice(0, 3).map(d => ({
        id: d.id,
        timestamp: d.timestamp,
        vault: 'moderate' as RiskLevel,
        action: d.action,
        summary: d.summary,
        weightChanges: d.weightChanges,
        aiInvolved: d.aiInvolved,
        reason: d.reason,
      }))
    : mockDecisions.slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      {/* Portfolio Summary */}
      <PortfolioSummary />

      {/* Yield Chart */}
      <YieldChart subtitle="Simulated yield growth across all vaults" />

      {/* Vault Cards */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Active Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ALL_RISK_LEVELS.map((level, i) => (
            <VaultCard
              key={level}
              vault={vaults[i]}
              deposited={VAULT_DEPOSITS[level]}
              confidence={VAULT_CONFIDENCE[level]}
            />
          ))}
        </div>
      </section>

      {/* Recent AI Decisions */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Recent AI Decisions</h3>
          <Link
            href="/app/activity"
            className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            View all decisions <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div>
          {decisions.map(decision => (
            <DecisionFeedItem key={decision.id} decision={decision} />
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
