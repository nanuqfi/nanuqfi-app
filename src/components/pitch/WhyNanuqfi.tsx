'use client'

import { FadeIn } from '@/components/pitch/FadeIn'

// ─── Metric card data ─────────────────────────────────────────────────────────

const METRICS = [
  {
    label: 'On-chain Instructions',
    value: '23',
    sub: null,
  },
  {
    label: 'Devnet Tests',
    value: '102/107',
    sub: '(95%)',
  },
  {
    label: 'Keeper Uptime',
    value: '49.5h+',
    sub: '0 crashes',
  },
  {
    label: 'Active Strategies',
    value: '4',
    sub: 'extensible interface',
  },
  {
    label: 'Protocols Scanned',
    value: '50+',
    sub: 'via DeFi Llama',
  },
  {
    label: 'Architecture',
    value: '3 repos',
    sub: 'SDK, keeper, frontend',
  },
] as const

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string | null
}) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-center">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-sky-400">{value}</p>
      {sub && (
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      )}
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function WhyNanuqfi() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <FadeIn>
        <h2 className="text-3xl font-bold text-white text-center">
          Why NanuqFi
        </h2>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12">
          {METRICS.map((m, i) => (
            <FadeIn key={m.label} delay={200 + i * 80}>
              <MetricCard label={m.label} value={m.value} sub={m.sub} />
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={700}>
        <p className="text-lg font-semibold text-slate-300 text-center max-w-3xl mx-auto mt-8">
          Devnet-validated, mainnet-ready. Full deposit &rarr; rebalance &rarr; withdraw
          cycle verified on live infrastructure.
        </p>
      </FadeIn>
    </section>
  )
}
