'use client'
import { useState } from 'react'
import { FadeIn } from '@/components/pitch/FadeIn'
import backtestData from '@/data/backtest-results.json'

type RiskLevel = 'moderate' | 'aggressive'

const DISPLAY_NAMES: Record<string, string> = {
  'drift-lending': 'Drift Lending',
  'drift-basis': 'Drift Basis Trade',
  'drift-funding': 'Drift Funding Rate',
  'drift-jito-dn': 'Drift JitoSOL DN',
}

const BAR_COLORS: Record<string, string> = {
  'drift-lending': 'bg-sky-400',
  'drift-basis': 'bg-amber-400',
  'drift-funding': 'bg-violet-400',
  'drift-jito-dn': 'bg-cyan-400',
}

const ALL_STRATEGIES = [
  'drift-lending',
  'drift-basis',
  'drift-funding',
  'drift-jito-dn',
] as const

const moderateWeights =
  backtestData.moderate.dailyReturns[
    backtestData.moderate.dailyReturns.length - 1
  ].weights as Record<string, number>

const aggressiveWeights =
  backtestData.aggressive.dailyReturns[
    backtestData.aggressive.dailyReturns.length - 1
  ].weights as Record<string, number>

const WEIGHTS: Record<RiskLevel, Record<string, number>> = {
  moderate: moderateWeights,
  aggressive: aggressiveWeights,
}

function WeightBar({
  strategy,
  bps,
}: {
  strategy: string
  bps: number
}) {
  const pct = (bps / 100).toFixed(1)
  const widthPct = (bps / 10000) * 100

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-300 w-40 shrink-0 text-right">
        {DISPLAY_NAMES[strategy] ?? strategy}
      </span>
      <div className="flex-1 h-7 bg-slate-800 rounded-md overflow-hidden">
        <div
          className={`h-full rounded-md transition-all duration-500 ease-out ${BAR_COLORS[strategy] ?? 'bg-slate-500'}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="text-sm font-mono text-slate-300 w-16 shrink-0">
        {bps > 0 ? `${pct}%` : '—'}
      </span>
    </div>
  )
}

const AUTO_EXIT_CARDS = [
  {
    title: 'Basis Trade',
    trigger: 'Auto-exit if spread < 4bps for 4 consecutive hours',
  },
  {
    title: 'Funding Rate',
    triggerByRisk: {
      moderate: 'Auto-exit if PnL < -2% (moderate)',
      aggressive: 'Auto-exit if PnL < -5% (aggressive)',
    },
  },
  {
    title: 'JitoSOL DN',
    trigger: 'Auto-exit if borrow rate exceeds staking yield',
  },
] as const

export function StrategyEngine() {
  const [risk, setRisk] = useState<RiskLevel>('moderate')
  const weights = WEIGHTS[risk]

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      {/* Heading */}
      <FadeIn delay={0} className="text-center mb-4">
        <h2 className="text-3xl font-bold text-slate-50">Strategy Engine</h2>
      </FadeIn>

      <FadeIn delay={100} className="text-center mb-12">
        <p className="text-lg text-slate-400">
          AI-powered allocation across four Drift strategies. Toggle risk
          profiles to see how capital is routed.
        </p>
      </FadeIn>

      {/* Risk toggle */}
      <FadeIn delay={200} className="flex justify-center mb-10">
        <div className="inline-flex gap-2">
          {(['moderate', 'aggressive'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setRisk(level)}
              className={`px-5 py-2 rounded-lg border text-sm font-medium capitalize transition-colors cursor-pointer ${
                risk === level
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Weight bars */}
      <FadeIn delay={300}>
        <div className="space-y-3 mb-16">
          {ALL_STRATEGIES.map((s) => (
            <WeightBar key={s} strategy={s} bps={weights[s] ?? 0} />
          ))}
        </div>
      </FadeIn>

      {/* Auto-exit trigger cards */}
      <FadeIn delay={400} className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AUTO_EXIT_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
            >
              <p className="text-sm font-semibold text-amber-400 mb-1">
                {card.title}
              </p>
              <p className="text-sm text-slate-400">
                {'triggerByRisk' in card
                  ? card.triggerByRisk[risk]
                  : card.trigger}
              </p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Risk Management callout */}
      <FadeIn delay={500}>
        <div className="bg-slate-900/30 border border-sky-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-50 mb-3">
            On-Chain Guardrails
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              Max drawdown: {risk === 'moderate' ? '5%' : '10%'}{' '}
              <span className="text-slate-500">({risk})</span>
            </li>
            <li>Perp exposure cap: 60%</li>
            <li>
              Two-phase withdrawal with 10-slot redemption period
            </li>
          </ul>
        </div>
      </FadeIn>
    </section>
  )
}
