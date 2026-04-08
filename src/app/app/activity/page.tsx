'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { KeeperStatsBar } from '@/components/app/keeper-stats-bar'
import { DecisionFeedItem } from '@/components/app/decision-feed-item'
import { DecisionDetail } from '@/components/app/decision-detail'
import { useKeeperDecisions } from '@/hooks/use-keeper-api'
import {
  mockDecisions,
  type KeeperDecision,
  type RiskLevel,
} from '@/lib/mock-data'

// ─── Types ──────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'rebalance' | 'hold' | 'alert'

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'rebalance', label: 'Rebalance' },
  { key: 'hold', label: 'Hold' },
  { key: 'alert', label: 'Alert' },
]

// ─── Skeleton ───────────────────────────────────────────────────────────────

function DecisionSkeleton() {
  return (
    <div className="flex gap-3 py-4">
      <div className="flex flex-col items-center">
        <div className="h-7 w-7 animate-pulse rounded-full bg-slate-700" />
        <div className="w-px flex-1 bg-white/5 mt-1" />
      </div>
      <div className="flex-1 space-y-2 pb-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-700" />
        <div className="h-3 w-20 animate-pulse rounded bg-slate-700" />
      </div>
    </div>
  )
}

// ─── Filter helpers ─────────────────────────────────────────────────────────

function matchesFilter(decision: KeeperDecision, filter: FilterType): boolean {
  if (filter === 'all') return true

  const action = decision.action.toLowerCase()

  if (filter === 'rebalance') {
    return action.includes('rebalance') || action.includes('pivot') || action.includes('optimization')
  }
  if (filter === 'hold') {
    return action.includes('risk check') || action.includes('hold') || action.includes('no action')
  }
  if (filter === 'alert') {
    return action.includes('emergency') || action.includes('alert') || action.includes('halt')
  }

  return true
}

// ─── Activity Page ──────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null)

  const moderateDecisions = useKeeperDecisions('moderate')
  const aggressiveDecisions = useKeeperDecisions('aggressive')

  const loading = moderateDecisions.loading && aggressiveDecisions.loading
  const isStale = moderateDecisions.isStale || aggressiveDecisions.isStale

  // Merge keeper decisions or fall back to mock data
  const decisions: KeeperDecision[] = useMemo(() => {
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
      const merged = [...moderate, ...aggressive]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      // Deduplicate: same vault + same timestamp = true duplicate
      const seen = new Set<string>()
      return merged.filter(d => {
        const key = `${d.timestamp}-${d.vault}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    return mockDecisions
  }, [moderateDecisions.data, aggressiveDecisions.data])

  // Filtered decisions
  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => matchesFilter(d, activeFilter))
  }, [decisions, activeFilter])

  // Selected decision — default to first if none selected
  const selectedDecision = useMemo(() => {
    if (selectedDecisionId) {
      return filteredDecisions.find(d => d.id === selectedDecisionId) ?? filteredDecisions[0] ?? null
    }
    return filteredDecisions[0] ?? null
  }, [filteredDecisions, selectedDecisionId])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Activity</h1>
        <p className="mt-1 text-slate-400">
          Every decision, explained.
        </p>
      </div>

      {/* Stale data warning */}
      {isStale && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Keeper API connection lost. Showing last known data.
        </div>
      )}

      {/* Keeper stats bar */}
      <KeeperStatsBar />

      {/* 2-column layout */}
      <div className="lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Left column — decision feed */}
        <div className="col-span-7 space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-2">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveFilter(key)
                  setSelectedDecisionId(null)
                }}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  activeFilter === key
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Decision feed */}
          <GlassCard className="p-4">
            {loading ? (
              <div>
                <DecisionSkeleton />
                <DecisionSkeleton />
                <DecisionSkeleton />
                <DecisionSkeleton />
              </div>
            ) : filteredDecisions.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No decisions match this filter.
              </p>
            ) : (
              <div>
                {filteredDecisions.map((decision) => {
                  const isSelected = selectedDecision?.id === decision.id
                  return (
                    <button
                      key={decision.id}
                      onClick={() => setSelectedDecisionId(decision.id)}
                      className={[
                        'w-full text-left rounded-lg transition-colors -mx-1 px-1',
                        isSelected
                          ? 'bg-white/5 border-l-2 border-l-sky-500/60 pl-3'
                          : 'hover:bg-white/[0.02] border-l-2 border-l-transparent pl-3',
                      ].join(' ')}
                    >
                      <DecisionFeedItem decision={decision} />
                    </button>
                  )
                })}

                {/* Load more (static) */}
                <div className="pt-3 border-t border-white/5 mt-2">
                  <button className="w-full py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    Load more decisions
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right column — detail panel */}
        <div className="col-span-5 mt-8 lg:mt-0 lg:sticky lg:top-28">
          <DecisionDetail decision={selectedDecision} />
        </div>
      </div>
    </div>
  )
}
