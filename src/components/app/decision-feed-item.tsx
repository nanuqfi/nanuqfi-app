import { Bot, Pause } from 'lucide-react'
import { formatRelativeTime, type KeeperDecision } from '@/lib/mock-data'

interface DecisionFeedItemProps {
  decision: KeeperDecision
  compact?: boolean
}

export function DecisionFeedItem({ decision, compact }: DecisionFeedItemProps) {
  const isRebalance = decision.action !== 'Risk Check'
  const Icon = isRebalance ? Bot : Pause

  return (
    <div className="flex gap-3 relative">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div
          className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
            isRebalance
              ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
              : 'bg-slate-700/50 border-slate-600 text-slate-400',
          ].join(' ')}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="w-px flex-1 bg-white/5 mt-1" />
      </div>

      {/* Content */}
      <div className="pb-5 min-w-0 flex-1">
        <p className="text-sm text-slate-200 leading-snug">
          {decision.summary}
        </p>

        {!compact && decision.reason && (
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            {decision.reason}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-[11px] text-slate-500 font-mono">
            {formatRelativeTime(decision.timestamp)}
          </span>
          {decision.aiInvolved && (
            <span className="text-[11px] text-sky-400/60 flex items-center gap-1">
              <Bot className="h-3 w-3" />
              AI-assisted
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
