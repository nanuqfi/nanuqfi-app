'use client'
import backtestData from '@/data/backtest-results.json'
import { FadeIn } from '@/components/pitch/FadeIn'
import { AnimatedCounter } from '@/components/pitch/AnimatedCounter'

export function Hero() {
  const moderateApy = (backtestData.moderate.apy * 100)
  const aggressiveApy = (backtestData.aggressive.apy * 100)

  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 min-h-screen"
    >
      {/* Radial gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(56,189,248,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Content stack */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl mx-auto">
        {/* Headline */}
        <FadeIn>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-slate-50">
            Yield, Routed.
          </h1>
        </FadeIn>

        {/* Subline */}
        <FadeIn delay={100}>
          <p className="text-lg text-slate-400 max-w-2xl">
            AI-powered yield routing across Drift Protocol. Transparent
            allocations, on-chain guardrails, autonomous rebalancing.{' '}
            by{' '}
            <a
              href="https://github.com/rz1989s"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-slate-300 hover:text-slate-100 transition-colors duration-200"
            >
              RECTOR
            </a>
          </p>
        </FadeIn>

        {/* Metrics counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-4 w-full">
          <FadeIn delay={0} className="flex flex-col items-center gap-2">
            <AnimatedCounter
              value={moderateApy}
              suffix="%"
              decimals={1}
              duration={1400}
              className="text-4xl font-bold text-sky-400"
            />
            <span className="text-sm text-slate-400 uppercase tracking-wide">
              Moderate APY
            </span>
          </FadeIn>

          <FadeIn delay={100} className="flex flex-col items-center gap-2">
            <AnimatedCounter
              value={aggressiveApy}
              suffix="%"
              decimals={1}
              duration={1400}
              className="text-4xl font-bold text-amber-400"
            />
            <span className="text-sm text-slate-400 uppercase tracking-wide">
              Aggressive APY
            </span>
          </FadeIn>

          <FadeIn delay={200} className="flex flex-col items-center gap-2">
            <AnimatedCounter
              value={50}
              decimals={0}
              duration={1200}
              className="text-4xl font-bold text-emerald-400"
            />
            <span className="text-sm text-slate-400 uppercase tracking-wide">
              Protocols Scanned
            </span>
          </FadeIn>

          <FadeIn delay={300} className="flex flex-col items-center gap-2">
            <AnimatedCounter
              value={102}
              decimals={0}
              duration={1200}
              className="text-4xl font-bold text-slate-300"
            />
            <span className="text-sm text-slate-400 uppercase tracking-wide">
              Tests Passing
            </span>
          </FadeIn>
        </div>
      </div>

    </section>
  )
}
