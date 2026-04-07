'use client'

import { ExternalLink, Bot, Cpu } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { ConfidenceBar } from '@/components/ui/confidence-bar'
import {
  formatRelativeTime,
  sourceDisplayName,
  type KeeperDecision,
} from '@/lib/mock-data'

interface DecisionDetailProps {
  decision: KeeperDecision | null
}

function formatFullDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

function WeightChangeRow({ source, from, to }: { source: string; from: number; to: number }) {
  const fromPct = (from / 100).toFixed(1)
  const toPct = (to / 100).toFixed(1)

  let arrowColor = 'text-slate-500'
  let toColor = 'text-slate-300'
  if (to > from) {
    arrowColor = 'text-emerald-500'
    toColor = 'text-emerald-400'
  } else if (to < from) {
    arrowColor = 'text-red-500'
    toColor = 'text-red-400'
  }

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-300">{sourceDisplayName(source)}</span>
      <div className="flex items-center gap-2 font-mono text-sm">
        <span className="text-slate-400">{fromPct}%</span>
        <span className={arrowColor}>&rarr;</span>
        <span className={toColor}>{toPct}%</span>
      </div>
    </div>
  )
}

export function DecisionDetail({ decision }: DecisionDetailProps) {
  if (!decision) {
    return (
      <GlassCard className="p-6">
        <p className="text-slate-500 italic text-center py-12">
          Select a decision to view details
        </p>
      </GlassCard>
    )
  }

  const fakeTxHash = '4xKmR8vNqJ3pTfW9bLcD2hYs6eAoUg5mXnZ7rQ2'
  const truncatedHash = '4xKm...7rQ2'
  const isRebalance = decision.action !== 'Risk Check'

  return (
    <GlassCard className="p-6">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
              isRebalance
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                : 'bg-slate-700 text-slate-300 border border-slate-600',
            ].join(' ')}
          >
            {isRebalance ? <Bot className="h-3 w-3" /> : <Cpu className="h-3 w-3" />}
            {decision.action}
          </span>
          <Badge tier={decision.vault} />
          <span className="text-xs text-slate-500 font-mono ml-auto">
            {formatRelativeTime(decision.timestamp)}
          </span>
        </div>

        {/* Action summary */}
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">
            Action
          </span>
          <p className="text-sm text-slate-200 leading-relaxed">
            {decision.summary}
          </p>
        </div>

        {/* Weight changes */}
        {decision.weightChanges.length > 0 && (
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Weight Changes
            </span>
            <div className="divide-y divide-white/5">
              {decision.weightChanges.map((change, i) => (
                <WeightChangeRow
                  key={i}
                  source={change.source}
                  from={change.from}
                  to={change.to}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">
            AI Reasoning
          </span>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-white/5">
            <p className="text-sm text-slate-300 italic leading-relaxed">
              {decision.reason}
            </p>
          </div>
        </div>

        {/* Confidence */}
        {decision.aiInvolved && (
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Confidence
            </span>
            <ConfidenceBar value={87} />
          </div>
        )}

        {/* On-chain TX */}
        <div className="space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">
            On-chain TX
          </span>
          <a
            href={`https://solscan.io/tx/${fakeTxHash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors font-mono"
          >
            {truncatedHash}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t border-white/5">
          <span className="text-xs text-slate-500 font-mono">
            {formatFullDate(decision.timestamp)}
          </span>
        </div>
      </div>
    </GlassCard>
  )
}
