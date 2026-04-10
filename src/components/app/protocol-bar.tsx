'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// ─── Static color map ─────────────────────────────────────────────────────────
// The `color` prop carries Tailwind text-color classes (e.g. "text-sky-400").
// Converting text-* → bg-* via string replace produces dynamic class names
// that Tailwind purges in production. Use an explicit lookup instead so all
// class strings are statically visible to the compiler.

const TEXT_TO_BG: Record<string, string> = {
  'text-sky-400':    'bg-sky-400',
  'text-emerald-400': 'bg-emerald-400',
  'text-amber-400':  'bg-amber-400',
  'text-violet-400': 'bg-violet-400',
  'text-rose-400':   'bg-rose-400',
  'text-blue-400':   'bg-blue-400',
  'text-teal-400':   'bg-teal-400',
  'text-orange-400': 'bg-orange-400',
  'text-cyan-400':   'bg-cyan-400',
  'text-pink-400':   'bg-pink-400',
  'text-indigo-400': 'bg-indigo-400',
  'text-slate-400':  'bg-slate-400',
}

interface ProtocolBarProps {
  name: string
  percentage: number
  apy: number
  color: string
  reasoning?: string
}

export function ProtocolBar({ name, percentage, apy, color, reasoning }: ProtocolBarProps) {
  const [expanded, setExpanded] = useState(false)

  const fillColor = TEXT_TO_BG[color] ?? 'bg-slate-400'

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
              aria-label={`${expanded ? 'Hide' : 'Show'} allocation reasoning for ${name}`}
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-0.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              why {percentage.toFixed(1)}%?
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                aria-hidden="true"
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
