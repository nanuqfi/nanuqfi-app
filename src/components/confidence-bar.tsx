interface ConfidenceBarProps {
  strategy: string
  value: number
}

function getBarColor(value: number): string {
  if (value > 0.7) return 'bg-emerald-500'
  if (value >= 0.4) return 'bg-amber-500'
  return 'bg-red-500'
}

export function ConfidenceBar({ strategy, value }: ConfidenceBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-slate-400 truncate">
        {strategy}
      </span>
      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getBarColor(value)}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-xs text-slate-400">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}
