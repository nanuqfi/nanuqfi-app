interface ProgressBarProps {
  value: number
  max: number
  label: string
  color?: 'emerald' | 'sky' | 'amber' | 'red'
}

const colorStyles = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
}

function getAutoColor(percentage: number): 'emerald' | 'amber' | 'red' {
  if (percentage < 60) return 'emerald'
  if (percentage <= 80) return 'amber'
  return 'red'
}

export function ProgressBar({ value, max, label, color }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const resolvedColor = color ?? getAutoColor(percentage)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200">
          {value.toFixed(1)} / {max.toFixed(1)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorStyles[resolvedColor]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
