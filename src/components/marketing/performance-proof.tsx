'use client'

import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'
import backtestData from '@/data/backtest-results.json'

/* ------------------------------------------------------------------ */
/*  Extract metrics from backtest JSON (moderate strategy — primary)   */
/* ------------------------------------------------------------------ */
const moderate = backtestData.moderate as {
  apy: number
  sharpeRatio: number
  sortinoRatio: number
  maxDrawdown: number
}

const metrics = [
  {
    label: 'CAGR',
    value: `${(moderate.apy * 100).toFixed(1)}%`,
    sub: 'vs 5.5% baseline',
  },
  {
    label: 'Sharpe Ratio',
    value: moderate.sharpeRatio.toFixed(2),
    sub: '> 1.0 is good',
  },
  {
    label: 'Sortino Ratio',
    value: moderate.sortinoRatio.toFixed(2),
    sub: 'downside-adjusted',
  },
  {
    label: 'Max Drawdown',
    value: `${(moderate.maxDrawdown * 100).toFixed(2)}%`,
    sub: 'worst peak-to-trough',
  },
]

/* ------------------------------------------------------------------ */
/*  Simple SVG sparkline from daily cumulative returns                 */
/* ------------------------------------------------------------------ */
const routerReturns = (
  backtestData.moderate as { dailyReturns: { cumulative: number }[] }
).dailyReturns.map((d) => d.cumulative)

const baselineReturns = (
  backtestData.baseline as { dailyReturns: { cumulative: number }[] }
).dailyReturns.map((d) => d.cumulative)

function buildPath(data: number[], w: number, h: number, padY: number): string {
  if (data.length === 0) return ''
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = padY + (1 - (v - min) / range) * (h - padY * 2)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

const SVG_W = 600
const SVG_H = 200
const PAD = 20

export function PerformanceProof() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <FadeIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Proven Performance
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Backtested over {backtestData.period.days} days of simulated market data.
            Router outperforms single-protocol strategies.
          </p>
        </div>
      </FadeIn>

      {/* Chart */}
      <FadeIn delay={100}>
        <GlassCard className="p-6 mb-10">
          <div className="flex items-center gap-6 mb-4 text-xs">
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-sky-500 rounded-full" />
              <span className="text-slate-400">NanuqFi Router</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-slate-600 rounded-full" />
              <span className="text-slate-500">USDC Lending Baseline</span>
            </span>
          </div>

          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            {/* Baseline */}
            <path
              d={buildPath(baselineReturns, SVG_W, SVG_H, PAD)}
              fill="none"
              stroke="rgb(71,85,105)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Router */}
            <path
              d={buildPath(routerReturns, SVG_W, SVG_H, PAD)}
              fill="none"
              stroke="rgb(14,165,233)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Glow on router line */}
            <path
              d={buildPath(routerReturns, SVG_W, SVG_H, PAD)}
              fill="none"
              stroke="rgb(14,165,233)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.15"
            />
          </svg>
        </GlassCard>
      </FadeIn>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <FadeIn key={m.label} delay={200 + i * 80}>
            <GlassCard className="p-5 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                {m.label}
              </p>
              <p className="font-mono text-2xl font-bold text-white mb-1">
                {m.value}
              </p>
              <p className="text-xs text-slate-500">{m.sub}</p>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
