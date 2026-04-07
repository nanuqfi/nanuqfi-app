'use client'

import { GlassCard } from '@/components/ui/glass-card'
import { TimeRangeSelector } from '@/components/ui/time-range-selector'

interface YieldChartProps {
  title?: string
  subtitle?: string
  className?: string
}

export function YieldChart({
  title = 'Cumulative Earnings',
  subtitle,
  className,
}: YieldChartProps) {
  return (
    <GlassCard className={['p-6', className].filter(Boolean).join(' ')}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        <TimeRangeSelector defaultRange="1M" />
      </div>

      {/* Chart placeholder — static SVG curve */}
      <div className="h-[300px] w-full relative">
        <svg
          viewBox="0 0 800 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={60 + i * 60}
              x2="800"
              y2={60 + i * 60}
              stroke="rgba(148, 163, 184, 0.06)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Gradient fill under curve */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Fill area */}
          <path
            d="M 0 280 C 100 270, 150 250, 200 240 C 250 230, 300 220, 350 200 C 400 180, 420 175, 450 160 C 500 140, 530 135, 560 120 C 600 100, 650 90, 700 75 C 730 65, 770 55, 800 50 L 800 300 L 0 300 Z"
            fill="url(#chartGradient)"
          />

          {/* Main curve line */}
          <path
            d="M 0 280 C 100 270, 150 250, 200 240 C 250 230, 300 220, 350 200 C 400 180, 420 175, 450 160 C 500 140, 530 135, 560 120 C 600 100, 650 90, 700 75 C 730 65, 770 55, 800 50"
            stroke="rgb(14, 165, 233)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Glow effect on curve */}
          <path
            d="M 0 280 C 100 270, 150 250, 200 240 C 250 230, 300 220, 350 200 C 400 180, 420 175, 450 160 C 500 140, 530 135, 560 120 C 600 100, 650 90, 700 75 C 730 65, 770 55, 800 50"
            stroke="rgb(14, 165, 233)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.3"
            filter="blur(4px)"
          />

          {/* End dot */}
          <circle cx="800" cy="50" r="4" fill="rgb(14, 165, 233)" />
          <circle cx="800" cy="50" r="8" fill="rgb(14, 165, 233)" opacity="0.2" />
        </svg>

        {/* "Live chart coming soon" label */}
        <div className="absolute bottom-4 left-4 text-[11px] text-slate-500 font-mono">
          Historical data &middot; live charting soon
        </div>
      </div>
    </GlassCard>
  )
}
