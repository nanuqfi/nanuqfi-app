import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatProps {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
}

const trendConfig = {
  up: { icon: TrendingUp, color: 'text-emerald-400' },
  down: { icon: TrendingDown, color: 'text-red-400' },
  neutral: { icon: Minus, color: 'text-slate-400' },
}

export function Stat({ label, value, subValue, trend }: StatProps) {
  const TrendIcon = trend ? trendConfig[trend].icon : null
  const trendColor = trend ? trendConfig[trend].color : ''

  return (
    <div className="space-y-1">
      <p className="text-slate-400 text-sm">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-mono text-2xl font-bold text-slate-50">{value}</p>
        {TrendIcon && (
          <TrendIcon className={`h-5 w-5 ${trendColor}`} />
        )}
      </div>
      {subValue && (
        <p className="font-mono text-sm text-slate-400">{subValue}</p>
      )}
    </div>
  )
}
