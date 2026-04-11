'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass-card'
import { TimeRangeSelector, type TimeRange } from '@/components/ui/time-range-selector'

interface YieldChartProps {
  title?: string
  subtitle?: string
  className?: string
}

// Simulated cumulative growth curves per time range
// Each path represents a different window of historical performance
const CURVE_PATHS: Record<TimeRange, string> = {
  '1W': 'M 0 240 C 100 238, 200 235, 300 230 C 400 225, 500 218, 600 210 C 650 206, 720 198, 800 190',
  '1M': 'M 0 280 C 100 270, 150 250, 200 240 C 250 230, 300 220, 350 200 C 400 180, 420 175, 450 160 C 500 140, 530 135, 560 120 C 600 100, 650 90, 700 75 C 730 65, 770 55, 800 50',
  '3M': 'M 0 280 C 80 275, 120 268, 180 255 C 240 240, 280 225, 340 200 C 380 182, 420 160, 460 140 C 520 115, 560 100, 620 80 C 680 62, 720 52, 800 40',
  '1Y': 'M 0 285 C 60 282, 100 278, 160 270 C 220 258, 260 245, 320 225 C 380 200, 420 178, 480 155 C 540 130, 580 110, 640 88 C 700 68, 740 50, 800 30',
  'All': 'M 0 290 C 50 288, 80 285, 120 280 C 180 270, 220 258, 280 240 C 340 218, 380 195, 440 168 C 500 140, 540 118, 600 92 C 660 68, 720 45, 800 20',
}

// Return labels per time range
const RETURN_LABELS: Record<TimeRange, string> = {
  '1W': '+0.12%',
  '1M': '+1.34%',
  '3M': '+4.08%',
  '1Y': '+16.1%',
  'All': '+22.7%',
}

export function YieldChart({
  title = 'Cumulative Earnings',
  subtitle,
  className,
}: YieldChartProps) {
  const [range, setRange] = useState<TimeRange>('1M')

  const curvePath = CURVE_PATHS[range]
  const fillPath = `${curvePath} L 800 300 L 0 300 Z`

  // Extract end Y position for the dot
  const endMatch = curvePath.match(/(\d+)\s*$/)
  const endY = endMatch ? Number(endMatch[1]) : 50

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
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-emerald-400">{RETURN_LABELS[range]}</span>
          <TimeRangeSelector defaultRange="1M" onChange={setRange} />
        </div>
      </div>

      {/* Chart */}
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
            d={fillPath}
            fill="url(#chartGradient)"
            className="transition-all duration-500 ease-out"
          />

          {/* Main curve line */}
          <path
            d={curvePath}
            stroke="rgb(14, 165, 233)"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Glow effect */}
          <path
            d={curvePath}
            stroke="rgb(14, 165, 233)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.3"
            filter="blur(4px)"
            className="transition-all duration-500 ease-out"
          />

          {/* End dot */}
          <circle cx="800" cy={endY} r="4" fill="rgb(14, 165, 233)" className="transition-all duration-500 ease-out" />
          <circle cx="800" cy={endY} r="8" fill="rgb(14, 165, 233)" opacity="0.2" className="transition-all duration-500 ease-out" />
        </svg>

        {/* Period label */}
        <div className="absolute bottom-4 left-4 text-[11px] text-slate-500 font-mono">
          Simulated growth &middot; based on backtested data
        </div>
      </div>
    </GlassCard>
  )
}
