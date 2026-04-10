import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import type { RiskLevel } from '@/lib/mock-data'

interface TierData {
  riskLevel: RiskLevel
  apy: string
  description: string
  protocols: string[]
}

const tiers: TierData[] = [
  {
    riskLevel: 'conservative',
    apy: '5.5%',
    description:
      'Stable USDC lending only. No perp exposure, tight drawdown guardrails. Capital preservation first.',
    protocols: ['Kamino', 'Marginfi'],
  },
  {
    riskLevel: 'moderate',
    apy: '6.5%',
    description:
      'Balanced allocation across lending protocols. AI-optimized routing for better risk-adjusted yield.',
    protocols: ['Kamino', 'Marginfi', 'Lulo'],
  },
  {
    riskLevel: 'aggressive',
    apy: '8.3%',
    description:
      'Higher Lulo allocation for maximum aggregated yield. Wider guardrails, higher return potential.',
    protocols: ['Kamino', 'Marginfi', 'Lulo'],
  },
]

const tierGlow: Record<RiskLevel, string> = {
  conservative: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.08)]',
  moderate: 'hover:shadow-[0_0_30px_rgba(14,165,233,0.08)]',
  aggressive: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]',
}

const protocolColor: Record<string, string> = {
  Kamino: 'text-emerald-400',
  Marginfi: 'text-sky-400',
  Lulo: 'text-amber-400',
}

export function TierShowcase() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <FadeIn>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
          Choose Your Risk Level
        </h2>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, i) => (
          <FadeIn key={tier.riskLevel} delay={i * 100}>
            <GlassCard
              tier={tier.riskLevel}
              className={`p-6 transition-shadow duration-300 ${tierGlow[tier.riskLevel]}`}
            >
              <Badge tier={tier.riskLevel} className="mb-4" />

              <div className="font-mono text-3xl font-bold text-white mb-3 tracking-tight">
                {tier.apy}
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {tier.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {tier.protocols.map((p) => (
                  <span
                    key={p}
                    className={`text-xs font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.05] ${protocolColor[p] ?? 'text-slate-400'}`}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
