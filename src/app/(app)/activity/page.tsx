'use client'

import { useMemo } from 'react'
import { Bot, Cpu, Clock, AlertTriangle, Globe } from 'lucide-react'
import { Card, Badge } from '@/components'
import { useKeeperDecisions, useMarketScan, useAIInsight } from '@/hooks/use-keeper-api'
import type { MarketScanOpportunity } from '@/hooks/use-keeper-api'
import { AIInsightCard } from '@/components/ai-insight-card'
import {
  mockDecisions,
  formatRelativeTime,
  sourceDisplayName,
  type RiskLevel,
} from '@/lib/mock-data'

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700 ${className}`} />
}

function DecisionSkeleton() {
  return (
    <div className="flex gap-4 py-6 first:pt-0 last:pb-0">
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface DecisionDisplay {
  id: string
  timestamp: string
  vault: RiskLevel
  action: string
  summary: string
  weightChanges: { source: string; from: number; to: number }[]
  aiInvolved: boolean
  reason: string
}

// ─── Activity Page ──────────────────────────────────────────────────────────

// ─── Market Scan Section ───────────────────────────────────────────────────

function MarketScanSection() {
  const scan = useMarketScan()

  if (scan.loading) {
    return (
      <Card>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    )
  }

  // Handle the "no scan yet" response shape
  const data = scan.data && 'opportunities' in scan.data ? scan.data : null

  if (!data) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-slate-400">
          <Globe className="h-5 w-5" />
          <span>Market scan not yet available. Waiting for keeper cycle.</span>
        </div>
      </Card>
    )
  }

  const top5 = data.opportunities.slice(0, 5)
  const { driftComparison } = data

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">DeFi Yield Scanner</h2>
        <span className="text-xs text-slate-500">
          {data.timestamp ? new Date(data.timestamp).toLocaleString() : ''}
        </span>
      </div>

      {/* Drift vs Market */}
      <Card>
        <div className="flex flex-wrap gap-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Protocols Scanned</span>
            <p className="font-mono text-2xl font-bold">{driftComparison.totalScanned}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Market Best APY</span>
            <p className="font-mono text-2xl font-bold text-emerald-400">
              {(driftComparison.marketBestApy * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Drift Best APY</span>
            <p className="font-mono text-2xl font-bold">
              {(driftComparison.driftBestApy * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Drift Rank</span>
            <p className="font-mono text-2xl font-bold text-sky-400">
              #{driftComparison.driftRank} / {driftComparison.totalScanned}
            </p>
          </div>
        </div>
      </Card>

      {/* Top Opportunities */}
      {top5.length > 0 && (
        <Card>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Top Opportunities
          </h3>
          <div className="divide-y divide-slate-700">
            {top5.map((opp: MarketScanOpportunity, i: number) => (
              <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-slate-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{opp.asset}</p>
                    <p className="text-xs text-slate-500">{opp.protocol} / {opp.strategy}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="font-mono text-sm font-bold text-emerald-400">
                      {(opp.apy * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-slate-500">APY</p>
                  </div>
                  <div>
                    <p className="font-mono text-sm text-slate-300">
                      ${(opp.tvl / 1e6).toFixed(1)}M
                    </p>
                    <p className="text-xs text-slate-500">TVL</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    opp.risk === 'low' ? 'bg-emerald-500/10 text-emerald-400' :
                    opp.risk === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {opp.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── Activity Page ──────────────────────────────────────────────────────────

export default function ActivityPage() {
  const moderateDecisions = useKeeperDecisions('moderate')
  const aggressiveDecisions = useKeeperDecisions('aggressive')
  const aiInsight = useAIInsight()

  const loading = moderateDecisions.loading && aggressiveDecisions.loading
  const hasError = moderateDecisions.error && aggressiveDecisions.error
  const isStale = moderateDecisions.isStale || aggressiveDecisions.isStale

  // Merge and sort decisions from both vaults
  const decisions: DecisionDisplay[] = useMemo(() => {
    const hasKeeperData =
      (moderateDecisions.data && moderateDecisions.data.length > 0) ||
      (aggressiveDecisions.data && aggressiveDecisions.data.length > 0)

    if (hasKeeperData) {
      const moderate = (moderateDecisions.data ?? []).map(d => ({
        ...d,
        vault: 'moderate' as RiskLevel,
      }))
      const aggressive = (aggressiveDecisions.data ?? []).map(d => ({
        ...d,
        vault: 'aggressive' as RiskLevel,
      }))
      return [...moderate, ...aggressive]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20)
    }

    // Fallback to mock data (filtered to moderate + aggressive only)
    return mockDecisions
      .filter(d => d.vault === 'moderate' || d.vault === 'aggressive')
      .slice(0, 10)
  }, [moderateDecisions.data, aggressiveDecisions.data])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-1 text-slate-400">
          Every decision the keeper makes is logged and transparent.
        </p>
      </div>

      {isStale && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Keeper API connection lost. Showing last known data.
        </div>
      )}

      {hasError && !isStale && !loading && decisions.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Keeper data unavailable. Showing sample activity.
        </div>
      )}

      {/* AI Assessment */}
      <AIInsightCard
        insight={aiInsight.data?.insight ?? null}
        available={aiInsight.data?.available ?? false}
      />

      <Card>
        {loading ? (
          <div className="divide-y divide-slate-700">
            <DecisionSkeleton />
            <DecisionSkeleton />
            <DecisionSkeleton />
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {decisions.map((decision) => (
              <div key={decision.id} className="flex gap-4 py-6 first:pt-0 last:pb-0">
                <div className="flex flex-col items-center gap-2">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    decision.aiInvolved ? 'bg-sky-500/10' : 'bg-slate-700'
                  }`}>
                    {decision.aiInvolved
                      ? <Bot className="h-5 w-5 text-sky-400" />
                      : <Cpu className="h-5 w-5 text-slate-400" />
                    }
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge level={decision.vault} />
                    <span className="rounded-lg bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200">
                      {decision.action}
                    </span>
                    {decision.aiInvolved && (
                      <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400 border border-sky-500/20">
                        <Bot className="h-3 w-3" />
                        AI
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(decision.timestamp)}
                    </span>
                  </div>

                  <p className="text-slate-200">{decision.summary}</p>
                  <p className="text-sm text-slate-400">{decision.reason}</p>
                  {decision.aiInvolved && (
                    <p className="mt-1 text-xs text-sky-400/70 italic">AI-assisted decision</p>
                  )}

                  {decision.weightChanges.length > 0 && (
                    <div className="flex flex-wrap gap-4 rounded-lg bg-slate-900/50 px-4 py-3">
                      {decision.weightChanges.map((change, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400">{sourceDisplayName(change.source)}</span>
                          <span className="font-mono text-red-400">{change.from}%</span>
                          <span className="text-slate-600">&rarr;</span>
                          <span className="font-mono text-emerald-400">{change.to}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {decisions.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                No keeper decisions recorded yet.
              </p>
            )}
          </div>
        )}
      </Card>

      <MarketScanSection />
    </div>
  )
}
