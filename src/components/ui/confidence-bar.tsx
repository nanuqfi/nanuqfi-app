interface ConfidenceBarProps {
  value: number
  color?: string
  className?: string
}

export function ConfidenceBar({
  value,
  color = 'bg-sky-500',
  className,
}: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={['flex items-center gap-2', className].filter(Boolean).join(' ')}>
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="font-mono text-xs text-slate-400">{clamped}%</span>
    </div>
  )
}
