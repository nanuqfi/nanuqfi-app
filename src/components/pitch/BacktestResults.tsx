'use client'

import { useState } from 'react'
import backtestData from '@/data/backtest-results.json'
import { AnimatedCounter } from './AnimatedCounter'
import { SvgLineChart } from './SvgLineChart'
import { FadeIn } from './FadeIn'

const metrics = [
  {
    label: 'Moderate APY',
    value: backtestData.moderate.apy * 100,
    suffix: '%',
    prefix: '',
    color: 'text-sky-400',
  },
  {
    label: 'Aggressive APY',
    value: backtestData.aggressive.apy * 100,
    suffix: '%',
    prefix: '',
    color: 'text-amber-400',
  },
  {
    label: 'Max Drawdown',
    value: backtestData.aggressive.maxDrawdown * 100,
    suffix: '%',
    prefix: '',
    color: 'text-red-400',
  },
  {
    label: 'Alpha vs Baseline',
    value: backtestData.moderate.alphaOverBaseline * 100,
    suffix: '%',
    prefix: '+',
    color: 'text-emerald-400',
  },
]

const chartLines = [
  {
    data: backtestData.moderate.dailyReturns.map((d) => d.cumulative * 100),
    color: '#38bdf8',
    label: 'Moderate',
  },
  {
    data: backtestData.aggressive.dailyReturns.map((d) => d.cumulative * 100),
    color: '#fbbf24',
    label: 'Aggressive',
  },
  {
    data: backtestData.baseline.dailyReturns.map((d) => d.cumulative * 100),
    color: '#64748b',
    dashed: true,
    label: 'USDC Lending',
  },
]

const chartLabels = backtestData.moderate.dailyReturns.map((d) => d.date)

export function BacktestResults() {
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <FadeIn>
        <h2 className="text-3xl font-bold text-white text-center">
          Backtest Performance
        </h2>
        <p className="text-slate-400 text-center mt-3">
          90-day simulation using historical Drift protocol rates
        </p>
      </FadeIn>

      {/* Metric cards */}
      <FadeIn delay={200}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center"
            >
              <div className="text-xs text-slate-500 uppercase tracking-wide">
                {m.label}
              </div>
              <div className={`text-2xl font-bold mt-1 ${m.color}`}>
                <AnimatedCounter
                  value={m.value}
                  suffix={m.suffix}
                  prefix={m.prefix}
                />
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Chart */}
      <FadeIn delay={400}>
        <div className="mt-12">
          <SvgLineChart
            lines={chartLines}
            labels={chartLabels}
            height={320}
          />
        </div>
      </FadeIn>

      {/* Expandable disclaimer */}
      <FadeIn delay={500}>
        <div className="mt-8">
          <button
            onClick={() => setShowDisclaimer(!showDisclaimer)}
            className="text-sm text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
          >
            View methodology & disclaimers {showDisclaimer ? '\u25BE' : '\u25B8'}
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              showDisclaimer ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-xs text-slate-600 leading-relaxed">
              {backtestData.disclaimer}
            </p>
            <p className="text-xs text-slate-700 mt-2">
              Data source: {backtestData.dataSource}
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  )
}
