'use client'
import { FadeIn } from '@/components/pitch/FadeIn'

function FlowArrow() {
  return (
    <div className="flex justify-center my-1" aria-hidden="true">
      <div className="w-px h-8 bg-slate-700" />
    </div>
  )
}

function FlowBox({
  title,
  subtitle,
  accent = false,
}: {
  title: string
  subtitle: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-xl border p-5 text-center mx-auto max-w-xs w-full ${
        accent
          ? 'bg-sky-950/40 border-sky-800/60'
          : 'bg-slate-900 border-slate-800'
      }`}
    >
      <p className={`font-semibold text-base ${accent ? 'text-sky-300' : 'text-slate-200'}`}>
        {title}
      </p>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
  )
}

function StrategyGrid() {
  const strategies = [
    { name: 'Lending', desc: 'USDC lending — stable baseline yield' },
    { name: 'Basis Trade', desc: 'Delta-neutral, 4h funding auto-exit' },
    { name: 'Funding Rate', desc: 'Directional capture, PnL auto-exit' },
    { name: 'JitoSOL DN', desc: 'JitoSOL delta-neutral, borrow rate exit' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {strategies.map((s) => (
        <div
          key={s.name}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center"
        >
          <p className="font-semibold text-sm text-emerald-400">{s.name}</p>
          <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
        </div>
      ))}
    </div>
  )
}

const comparisons = [
  {
    title: 'vs Manual DeFi',
    description: 'No spreadsheets, no 3am rebalances',
  },
  {
    title: 'vs Yearn / Kamino',
    description: 'Protocol-agnostic routing, not locked to one protocol',
  },
  {
    title: 'vs Existing Drift Vaults',
    description: 'AI-enhanced with auto-exit triggers, not static allocations',
  },
  {
    title: 'vs Centralized Yield',
    description:
      'On-chain program enforces guardrails — trust the code, not the operator',
  },
]

export function Architecture() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      {/* Heading */}
      <FadeIn delay={0} className="text-center mb-4">
        <h2 className="text-3xl font-bold text-slate-50">How It Works</h2>
      </FadeIn>

      <FadeIn delay={100} className="text-center mb-16">
        <p className="text-lg text-slate-400">
          One vault. AI-optimized. Fully transparent.
        </p>
      </FadeIn>

      {/* Flow diagram */}
      <div className="mb-20">
        <FadeIn delay={100}>
          <FlowBox
            title="User"
            subtitle="Deposits USDC, picks a risk level"
            accent
          />
        </FadeIn>

        <FlowArrow />

        <FadeIn delay={200}>
          <FlowBox
            title="Allocator Program"
            subtitle="On-chain guardrails — 23 instructions, auditable"
          />
        </FadeIn>

        <FlowArrow />

        <FadeIn delay={300}>
          <FlowBox
            title="AI Keeper"
            subtitle="Algorithm engine + Claude AI reasoning — proposes rebalances"
          />
        </FadeIn>

        <div className="flex justify-center my-1" aria-hidden="true">
          <div className="w-px h-8 bg-slate-700" />
        </div>

        <FadeIn delay={400}>
          <StrategyGrid />
        </FadeIn>
      </div>

      {/* Comparison section */}
      <FadeIn delay={0} className="text-center mb-10">
        <h3 className="text-2xl font-bold text-slate-50">
          NanuqFi vs Status Quo
        </h3>
      </FadeIn>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {comparisons.map((c, i) => (
          <FadeIn key={c.title} delay={(i + 1) * 100}>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-full">
              <p className="text-sky-400 font-semibold mb-2">{c.title}</p>
              <p className="text-slate-400 text-sm">{c.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
