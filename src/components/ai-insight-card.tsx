'use client'

import { useState, useEffect } from 'react'
import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { ConfidenceBar } from './confidence-bar'

const STRATEGY_NAMES: Record<string, string> = {
  'drift-lending': 'USDC Lending',
  'drift-basis': 'Basis Trade',
  'drift-funding': 'Funding Rate',
  'drift-jito-dn': 'JitoSOL DN',
}

interface AIInsightCardProps {
  insight: {
    strategies: Record<string, number>
    riskElevated: boolean
    reasoning: string
    timestamp: number
  } | null
  available: boolean
  filterStrategies?: string[]
}

export function AIInsightCard({ insight, available, filterStrategies }: AIInsightCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!available || !insight) {
    return (
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Brain className="h-4 w-4" />
          <span>AI assessment unavailable</span>
        </div>
      </div>
    )
  }

  const strategies = filterStrategies
    ? Object.entries(insight.strategies).filter(([k]) => filterStrategies.includes(k))
    : Object.entries(insight.strategies)

  const ageMinutes = Math.floor((now - insight.timestamp) / 60_000)
  const ageLabel = ageMinutes < 60
    ? `${ageMinutes}m ago`
    : `${Math.floor(ageMinutes / 60)}h ${ageMinutes % 60}m ago`

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-sky-400" />
          <span className="text-sm font-medium text-white">AI Assessment</span>
          <span
            className={`h-2 w-2 rounded-full ${insight.riskElevated ? 'bg-red-500' : 'bg-emerald-500'}`}
          />
          <span className="text-xs text-slate-500">
            {insight.riskElevated ? 'Risk Elevated' : 'Normal'}
          </span>
        </div>
        <span className="text-xs text-slate-500">{ageLabel}</span>
      </div>

      <div className="space-y-2">
        {strategies.map(([key, value]) => (
          <ConfidenceBar
            key={key}
            strategy={STRATEGY_NAMES[key] ?? key}
            value={value}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Hide reasoning' : 'Show reasoning'}
      </button>

      {expanded && (
        <p className="text-sm text-slate-400 leading-relaxed">
          {insight.reasoning}
        </p>
      )}
    </div>
  )
}
