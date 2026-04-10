'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { GlassCard } from '@/components/ui/glass-card'
import { PortfolioSummary } from '@/components/app/portfolio-summary'
import { VaultCard } from '@/components/app/vault-card'
import { YieldChart } from '@/components/app/yield-chart'
import { DecisionFeedItem } from '@/components/app/decision-feed-item'
import { useUserPosition, useRiskVault, useUsdcBalance } from '@/hooks/use-allocator'
import { useVaultData, useAllDecisions } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  mockDecisions,
  normalizeApy,
  type Vault,
  type RiskLevel,
} from '@/lib/mock-data'

const ACTIVE_RISK_LEVELS: RiskLevel[] = ['moderate', 'aggressive']

interface VaultWithMeta {
  vault: Vault
  isMockData: boolean
}

function useVaultWithFallback(riskLevel: RiskLevel): VaultWithMeta {
  const live = useVaultData(riskLevel)
  const mock = mockVaults.find(v => v.riskLevel === riskLevel)
  const isMockData = !live.loading && !live.data

  return {
    vault: {
      riskLevel,
      tvl: live.data?.tvl ?? mock?.tvl ?? 0,
      apy: normalizeApy(live.data?.apy ?? mock?.apy ?? 0),
      drawdown: live.data?.drawdown ?? mock?.drawdown ?? 0,
      weights: live.data?.weights ?? mock?.weights ?? {},
      guardrails: mock?.guardrails ?? {
        maxDrawdown: 5,
        currentDrawdown: 0,
        maxPerp: 0,
        currentPerp: 0,
      },
    },
    isMockData,
  }
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const isConnected = !!publicKey

  // User position + vault data (single source for both PortfolioSummary and VaultCards)
  const modPosition = useUserPosition(1)
  const aggPosition = useUserPosition(2)
  const modOnChain = useRiskVault(1)
  const aggOnChain = useRiskVault(2)
  const usdcBalance = useUsdcBalance()

  const positionsLoading = isConnected && (modPosition.loading || aggPosition.loading)

  // Current value (shares * sharePrice), not cost basis (depositedUsdc)
  const userModValue = modPosition.data && modOnChain.data
    ? Number(modPosition.data.shares) * modOnChain.data.sharePrice / 1e6
    : 0
  const userAggValue = aggPosition.data && aggOnChain.data
    ? Number(aggPosition.data.shares) * aggOnChain.data.sharePrice / 1e6
    : 0

  const walletBalance = isConnected && usdcBalance.data !== null
    ? Number(usdcBalance.data) / 1e6
    : undefined

  const { vault: moderateVault, isMockData: modIsMock } = useVaultWithFallback('moderate')
  const { vault: aggressiveVault, isMockData: aggIsMock } = useVaultWithFallback('aggressive')

  const vaults: Record<string, Vault> = {
    moderate: moderateVault,
    aggressive: aggressiveVault,
  }

  const mockFlags: Record<string, boolean> = {
    moderate: modIsMock,
    aggressive: aggIsMock,
  }

  const decisionsHook = useAllDecisions()
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
      <PortfolioSummary
        isConnected={isConnected}
        positionsLoading={positionsLoading}
        userModValue={userModValue}
        userAggValue={userAggValue}
        walletBalance={walletBalance}
      />

      {/* Yield Chart */}
      <YieldChart subtitle="Simulated yield growth across all vaults" />

      {/* Vault Cards */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Active Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ACTIVE_RISK_LEVELS.map(level => (
            <VaultCard
              key={level}
              vault={vaults[level]!}
              deposited={isConnected ? (level === 'moderate' ? userModValue : userAggValue) : undefined}
              isConnected={isConnected}
              isMockData={mockFlags[level]}
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
