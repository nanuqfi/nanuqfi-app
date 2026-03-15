'use client'

import { useMemo } from 'react'
import { Bot, Cpu, Clock, AlertTriangle } from 'lucide-react'
import { Card, Badge } from '@/components'
import { useKeeperDecisions } from '@/hooks/use-keeper-api'
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

export default function ActivityPage() {
  const moderateDecisions = useKeeperDecisions('moderate')
  const aggressiveDecisions = useKeeperDecisions('aggressive')

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
    </div>
  )
}
