import { Wallet, Shield, Zap } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'

const steps = [
  {
    step: '01',
    title: 'Deposit USDC',
    description:
      'Connect your wallet and deposit USDC into any risk tier. No lockups, no minimums.',
    icon: Wallet,
  },
  {
    step: '02',
    title: 'Pick Your Risk',
    description:
      'Choose conservative, moderate, or aggressive. Each tier has different guardrails and yield targets.',
    icon: Shield,
  },
  {
    step: '03',
    title: 'Auto-Route',
    description:
      'The AI keeper continuously routes capital to the best risk-adjusted yield across Kamino, Marginfi, and Lulo.',
    icon: Zap,
  },
] as const

export function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <FadeIn>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
          How It Works
        </h2>
      </FadeIn>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connecting line between cards (desktop only) */}
        <div
          className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-px border-t border-dashed border-slate-700 -translate-y-1/2 z-0"
          aria-hidden="true"
        />

        {steps.map((s, i) => (
          <FadeIn key={s.step} delay={i * 100}>
            <GlassCard className="p-6 text-center relative z-10">
              <span className="inline-block text-sky-500 font-mono text-sm mb-4">
                {s.step}
              </span>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20">
                <s.icon className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {s.description}
              </p>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
