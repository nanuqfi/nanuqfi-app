'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ProtocolBarProps {
  name: string
  percentage: number
  apy: number
  color: string
  reasoning?: string
}

export function ProtocolBar({ name, percentage, apy, color, reasoning }: ProtocolBarProps) {
  const [expanded, setExpanded] = useState(false)

  // Derive bg color from the text color class for the fill bar
  // e.g. "text-sky-400" -> "bg-sky-400"
  const fillColor = color.replace('text-', 'bg-')

  return (
    <div className="space-y-1.5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${fillColor}`} />
          <span className="text-sm text-slate-200">{name}</span>
          {reasoning && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              why {percentage}%?
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
        <span className="font-mono text-xs text-emerald-400">{(apy * 100).toFixed(1)}% APY</span>
      </div>

      {/* Bar */}
      <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillColor}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>

      {/* Percentage label */}
      <div className="text-right">
        <span className="font-mono text-xs text-slate-400">{percentage.toFixed(1)}%</span>
      </div>

      {/* Expandable reasoning */}
      {reasoning && expanded && (
        <div className="bg-slate-900/50 rounded-lg border border-white/5 p-3 mt-1">
          <p className="text-xs text-slate-400 leading-relaxed">{reasoning}</p>
        </div>
      )}
    </div>
  )
}
