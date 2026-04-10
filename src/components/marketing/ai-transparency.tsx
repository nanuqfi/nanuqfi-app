import { Bot } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'
import { ConfidenceBar } from '@/components/ui/confidence-bar'

export function AITransparency() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <FadeIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Every decision, explained.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            The AI keeper logs every action with full reasoning. No black boxes,
            no hidden moves.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <div className="max-w-2xl mx-auto">
          <GlassCard elevated className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20">
                  <Bot className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Rebalanced Moderate
                  </p>
                  <p className="text-xs text-slate-500">Keeper Decision</p>
                </div>
              </div>

              {/* AI indicator */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400">AI</span>
              </span>
            </div>

            {/* Reasoning */}
            <div className="mb-4 rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                &ldquo;Kamino rate rose 2.1% above Marginfi. Shifting 5%
                allocation from Marginfi to Kamino for the moderate vault.
                Drawdown within guardrail bounds at 0.5%. All lending exposure
                &mdash; no perp risk.&rdquo;
              </p>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  Confidence
                </span>
                {/* Static demo value for marketing showcase */}
                <ConfidenceBar value={87} />
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block mb-1">
                  Timestamp
                </span>
                <span className="text-xs font-mono text-slate-400">
                  2 hours ago
                </span>
              </div>
            </div>

            {/* Weight changes */}
            <div className="flex gap-3 text-xs font-mono">
              <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
                Kamino 50% &rarr; 55%
              </span>
              <span className="px-2 py-1 rounded-md bg-sky-500/10 text-sky-400">
                Marginfi 35% &rarr; 30%
              </span>
              <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400">
                Lulo 15%
              </span>
            </div>
          </GlassCard>
        </div>
      </FadeIn>
    </section>
  )
}
