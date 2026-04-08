'use client'

import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'
import {
  ExternalLink,
  Github,
  Globe,
  Activity,
  Server,
  BookOpen,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Metadata (handled via <title> since this is a client component)    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Guardrails table data                                              */
/* ------------------------------------------------------------------ */
const guardrails = [
  { label: 'Max Drawdown', moderate: '5%', aggressive: '10%' },
  { label: 'Max Single Asset', moderate: '60%', aggressive: '80%' },
  { label: 'Perp Exposure', moderate: 'None (lending only)', aggressive: 'None (lending only)' },
  { label: 'Rebalance Frequency', moderate: 'Every 2 hours', aggressive: 'Every 2 hours' },
  { label: 'Deposit Cap', moderate: '$10,000', aggressive: '$10,000' },
]

/* ------------------------------------------------------------------ */
/*  Backtest metrics                                                   */
/* ------------------------------------------------------------------ */
const backtestMetrics = [
  { label: 'Total Return', router: '3.75%', routerSub: '90d', baseline: '1.33%', baselineSub: '90d' },
  { label: 'Annualized (CAGR)', router: '~16.1%', routerSub: null, baseline: '~5.5%', baselineSub: null },
  { label: 'Sharpe Ratio', router: '2.95', routerSub: null, baseline: '\u2014', baselineSub: null },
  { label: 'Sortino Ratio', router: '4.86', routerSub: null, baseline: '\u2014', baselineSub: null },
  { label: 'Max Drawdown', router: '1.89%', routerSub: null, baseline: '\u2014', baselineSub: null },
]

/* ------------------------------------------------------------------ */
/*  Links                                                              */
/* ------------------------------------------------------------------ */
const links = [
  { label: 'Website', href: 'https://nanuqfi.com', icon: Globe },
  { label: 'Dashboard', href: 'https://nanuqfi.com/app', icon: Activity },
  { label: 'AI Activity Log', href: 'https://nanuqfi.com/app/activity', icon: BookOpen },
  { label: 'Keeper API', href: 'https://keeper.nanuqfi.com', icon: Server },
  { label: 'GitHub', href: 'https://github.com/nanuqfi', icon: Github },
  {
    label: 'Program (Solscan)',
    href: 'https://solscan.io/account/2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P?cluster=devnet',
    icon: ExternalLink,
  },
]

/* ------------------------------------------------------------------ */
/*  Reusable section heading                                           */
/* ------------------------------------------------------------------ */
function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="border-b border-white/5 pb-4 mb-8">
      <span className="text-xs font-mono text-sky-400/60 uppercase tracking-widest">
        Section {number}
      </span>
      <h2 className="text-2xl font-bold text-white mt-1">{title}</h2>
    </div>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function StrategyPage() {
  return (
    <>
      <title>Strategy Documentation — NanuqFi</title>

      <main className="max-w-4xl mx-auto px-6 py-20">
        {/* -------------------------------------------------------- */}
        {/*  Header                                                   */}
        {/* -------------------------------------------------------- */}
        <FadeIn>
          <header className="mb-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
              NanuqFi Strategy Documentation
            </h1>
            <p className="text-lg text-slate-400 mb-6">
              Submitted for Ranger Build-A-Bear Hackathon — April 2026
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-mono text-slate-500">
              <span>
                Protocol:{' '}
                <a
                  href="https://nanuqfi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  nanuqfi.com
                </a>
              </span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <span>
                GitHub:{' '}
                <a
                  href="https://github.com/nanuqfi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  github.com/nanuqfi
                </a>
              </span>
              <span className="hidden sm:inline text-slate-700">|</span>
              <span>
                Program:{' '}
                <span className="text-slate-400">2QtJ5k...5z5P</span>
              </span>
            </div>
          </header>
        </FadeIn>

        {/* -------------------------------------------------------- */}
        {/*  Section 1: Strategy Thesis                               */}
        {/* -------------------------------------------------------- */}
        <FadeIn>
          <section className="mb-20">
            <SectionHeading number="01" title="Strategy Thesis" />

            <p className="text-slate-300 leading-relaxed mb-6">
              NanuqFi is a protocol-agnostic, AI-powered yield routing layer for
              Solana DeFi. Instead of depositing into a single protocol and hoping
              for the best, NanuqFi dynamically routes USDC across Kamino, Marginfi,
              and Lulo — choosing the optimal allocation based on real-time rates,
              risk constraints, and AI-driven market assessment.
            </p>

            <GlassCard className="p-6 mb-8">
              <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-4">
                The Edge
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-300 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                  <span>
                    Most yield protocols are single-strategy. NanuqFi routes across
                    multiple protocols simultaneously.
                  </span>
                </li>
                <li className="flex gap-3 text-slate-300 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                  <span>
                    The AI keeper scans all protocol rates every cycle, identifies
                    yield gaps, and proposes weight adjustments — validated by
                    algorithmic guardrails before on-chain execution.
                  </span>
                </li>
                <li className="flex gap-3 text-slate-300 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                  <span>
                    Architecture survived a live stress test: when Drift Protocol was
                    hacked ($285M, April 1 2026), NanuqFi&apos;s protocol-agnostic
                    design enabled full pivot to Kamino/Marginfi/Lulo within hours.
                    Zero user capital lost.
                  </span>
                </li>
              </ul>
            </GlassCard>

            <div className="grid sm:grid-cols-2 gap-4">
              <GlassCard className="p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Strategy Type
                </p>
                <p className="text-slate-200 text-sm leading-relaxed">
                  AI-driven multi-protocol yield optimization
                  <br />
                  <span className="text-slate-400">
                    Lending only — no impermanent loss, no leverage
                  </span>
                </p>
              </GlassCard>
              <GlassCard className="p-5">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Target APY
                </p>
                <p className="font-mono text-2xl font-bold text-emerald-400">
                  10–25%
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Depending on risk tier, measured over 90-day rolling windows
                </p>
              </GlassCard>
            </div>
          </section>
        </FadeIn>

        {/* -------------------------------------------------------- */}
        {/*  Section 2: Operational Mechanics                         */}
        {/* -------------------------------------------------------- */}
        <FadeIn>
          <section className="mb-20">
            <SectionHeading number="02" title="Operational Mechanics" />

            <p className="text-slate-400 mb-8">
              How capital flows through the system:
            </p>

            {/* Flow steps */}
            <div className="space-y-4 mb-10">
              {[
                {
                  step: '1',
                  title: 'User deposits USDC',
                  desc: 'Into a risk-tiered vault (Moderate or Aggressive) via the on-chain allocator program.',
                },
                {
                  step: '2',
                  title: 'AI Keeper runs every 2 hours',
                  desc: null,
                  sub: [
                    'Scans live APY rates across all integrated protocols (Kamino, Marginfi, Lulo)',
                    'AI (Claude) assesses market conditions, protocol health, and rate sustainability',
                    'Algorithm engine scores each protocol and proposes optimal weight allocation',
                    'Three-layer validation: AI reasoning \u2192 algorithm guardrails \u2192 on-chain program enforcement',
                  ],
                },
                {
                  step: '3',
                  title: 'On-chain program enforces guardrails',
                  desc: 'Max drawdown, max single-asset exposure, deposit caps, rebalance frequency limits.',
                },
                {
                  step: '4',
                  title: 'User can withdraw',
                  desc: 'At any time. Two-phase on mainnet (request \u2192 redeem after cooling period); instant on devnet.',
                },
              ].map((item) => (
                <GlassCard key={item.step} className="p-5 flex gap-4">
                  <span className="font-mono text-sky-400 text-sm font-bold shrink-0 mt-0.5">
                    {item.step}.
                  </span>
                  <div>
                    <p className="text-white font-medium mb-1">{item.title}</p>
                    {item.desc && (
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    )}
                    {item.sub && (
                      <ul className="mt-2 space-y-1.5">
                        {item.sub.map((s) => (
                          <li
                            key={s}
                            className="flex gap-2 text-sm text-slate-400 leading-relaxed"
                          >
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-slate-600 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Protocol Integrations */}
            <h3 className="text-lg font-semibold text-white mb-4">
              Protocol Integrations
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {[
                {
                  name: 'Kamino Finance',
                  detail: 'USDC lending via REST API',
                  stat: 'Live mainnet rates, $1.2B TVL',
                },
                {
                  name: 'Marginfi',
                  detail: 'USDC lending via MarginfiClient SDK',
                  stat: 'Real on-chain bank data',
                },
                {
                  name: 'Lulo',
                  detail: 'Lending aggregator',
                  stat: 'Routes across Kamino/MarginFi/Jupiter',
                },
              ].map((p) => (
                <GlassCard key={p.name} className="p-5">
                  <p className="text-white font-semibold text-sm mb-1">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    {p.detail}
                  </p>
                  <p className="text-xs text-slate-500">{p.stat}</p>
                </GlassCard>
              ))}
            </div>

            {/* Keeper Architecture */}
            <h3 className="text-lg font-semibold text-white mb-4">
              Keeper Architecture
            </h3>
            <GlassCard className="p-6">
              <ul className="space-y-3">
                {[
                  'Algorithm engine with scoring matrix (rate, volatility, TVL, protocol risk)',
                  'Claude AI layer for regime detection and sustainability assessment',
                  'Health monitor with cycle tracking, failure recovery, automatic alerts',
                  'Circuit breaker pattern for API failures (CLOSED \u2192 OPEN \u2192 HALF_OPEN)',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm text-slate-300 leading-relaxed"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </section>
        </FadeIn>

        {/* -------------------------------------------------------- */}
        {/*  Section 3: Risk Management                               */}
        {/* -------------------------------------------------------- */}
        <FadeIn>
          <section className="mb-20">
            <SectionHeading number="03" title="Risk Management" />

            <p className="text-slate-400 mb-6">
              On-chain guardrails — enforced by program, not promises:
            </p>

            {/* Guardrails table */}
            <GlassCard className="p-0 mb-10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-slate-500 font-medium px-6 py-3">
                      Guardrail
                    </th>
                    <th className="text-left text-sky-400/80 font-medium px-6 py-3">
                      Moderate Vault
                    </th>
                    <th className="text-left text-amber-400/80 font-medium px-6 py-3">
                      Aggressive Vault
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guardrails.map((g, i) => (
                    <tr
                      key={g.label}
                      className={
                        i < guardrails.length - 1
                          ? 'border-b border-white/5'
                          : ''
                      }
                    >
                      <td className="px-6 py-3 text-slate-300">{g.label}</td>
                      <td className="px-6 py-3 font-mono text-slate-200">
                        {g.moderate}
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-200">
                        {g.aggressive}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>

            {/* Subsections */}
            <div className="space-y-8">
              {/* Drawdown Protection */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Drawdown Protection
                </h3>
                <ul className="space-y-2">
                  {[
                    'On-chain equity tracking (peakEquity, currentEquity, equity24hAgo)',
                    'Emergency halt instruction — keeper or admin can freeze all operations',
                    'Protocol whitelist — only approved protocols can receive allocations',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-slate-300 leading-relaxed"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Position Sizing */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Position Sizing
                </h3>
                <ul className="space-y-2">
                  {[
                    'Weight-based allocation (0\u2013100% per protocol, must sum to 100%)',
                    'No leverage — lending only, zero liquidation risk',
                    'Protocol diversification enforced by max single-asset cap',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-slate-300 leading-relaxed"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rebalancing Logic */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Rebalancing Logic
                </h3>
                <ul className="space-y-2">
                  {[
                    'AI proposes \u2192 algorithm validates \u2192 program enforces',
                    'Rebalance only when rate differential exceeds threshold (avoids churn)',
                    'Rebalance counter tracked on-chain for audit trail',
                    'Every rebalance emits an on-chain event with previous/new weights',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-slate-300 leading-relaxed"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stress Test */}
              <GlassCard className="p-6 border-l-2 border-l-amber-500/40">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Stress Test: Drift Protocol Hack
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    April 1, 2026
                  </span>
                </h3>
                <ul className="space-y-2">
                  {[
                    'Drift suffered $285M exploit',
                    'NanuqFi\u2019s protocol-agnostic architecture enabled full pivot within hours',
                    'allocate_to_drift + recall_from_drift replaced by generic allocate_to_protocol + recall_from_protocol',
                    'Zero user capital at risk — architecture designed for exactly this scenario',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-slate-300 leading-relaxed"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </div>
          </section>
        </FadeIn>

        {/* -------------------------------------------------------- */}
        {/*  Section 4: Performance                                   */}
        {/* -------------------------------------------------------- */}
        <FadeIn>
          <section className="mb-20">
            <SectionHeading number="04" title="Performance" />

            <h3 className="text-lg font-semibold text-white mb-4">
              Backtest Results
              <span className="text-sm font-normal text-slate-500 ml-2">
                90-day simulation
              </span>
            </h3>

            {/* Metrics table */}
            <GlassCard className="p-0 mb-6 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-slate-500 font-medium px-6 py-3">
                      Metric
                    </th>
                    <th className="text-left text-sky-400/80 font-medium px-6 py-3">
                      NanuqFi Router
                    </th>
                    <th className="text-left text-slate-500 font-medium px-6 py-3">
                      Single Protocol
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backtestMetrics.map((m, i) => (
                    <tr
                      key={m.label}
                      className={
                        i < backtestMetrics.length - 1
                          ? 'border-b border-white/5'
                          : ''
                      }
                    >
                      <td className="px-6 py-3 text-slate-300">{m.label}</td>
                      <td className="px-6 py-3 font-mono text-emerald-400 font-medium">
                        {m.router}
                        {m.routerSub && (
                          <span className="text-slate-500 text-xs ml-1">
                            ({m.routerSub})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono text-slate-400">
                        {m.baseline}
                        {m.baselineSub && (
                          <span className="text-slate-500 text-xs ml-1">
                            ({m.baselineSub})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>

            <p className="text-xs text-slate-500 leading-relaxed mb-10">
              Backtest uses calibrated synthetic data (Ornstein-Uhlenbeck process)
              fitted to observed protocol rate ranges. Live performance data from
              devnet keeper available at{' '}
              <a
                href="https://keeper.nanuqfi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                keeper.nanuqfi.com
              </a>
              .
            </p>

            {/* Live Performance */}
            <h3 className="text-lg font-semibold text-white mb-4">
              Live Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: 'Continuous', label: 'Keeper uptime' },
                { value: '142+', label: 'Decisions logged' },
                { value: '98.6%', label: 'Success rate' },
                { value: '100%', label: 'Decisions viewable' },
              ].map((stat) => (
                <GlassCard key={stat.label} className="p-4 text-center">
                  <p className="font-mono text-xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </GlassCard>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* -------------------------------------------------------- */}
        {/*  Section 5: Technical Architecture                        */}
        {/* -------------------------------------------------------- */}
        <FadeIn>
          <section className="mb-20">
            <SectionHeading number="05" title="Technical Architecture" />

            <p className="text-slate-400 mb-6">
              Brief overview — judges will read code:
            </p>

            {/* Packages */}
            <h3 className="text-lg font-semibold text-white mb-4">
              Monorepo Packages
            </h3>
            <div className="space-y-2 mb-8">
              {[
                {
                  pkg: '@nanuqfi/core',
                  desc: 'Zero-dep interfaces, registry, router, circuit breaker',
                },
                {
                  pkg: '@nanuqfi/backend-marginfi',
                  desc: 'Real Marginfi SDK integration',
                },
                {
                  pkg: '@nanuqfi/backend-kamino',
                  desc: 'Zero-dep REST API integration',
                },
                {
                  pkg: '@nanuqfi/backend-lulo',
                  desc: 'Lulo aggregator integration',
                },
                {
                  pkg: '@nanuqfi/backtest',
                  desc: 'Historical simulation engine',
                },
              ].map((item) => (
                <div
                  key={item.pkg}
                  className="flex items-baseline gap-3 text-sm"
                >
                  <code className="font-mono text-sky-400 shrink-0 text-xs">
                    {item.pkg}
                  </code>
                  <span className="text-slate-600">&mdash;</span>
                  <span className="text-slate-400">{item.desc}</span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <GlassCard className="p-4 text-center">
                <p className="font-mono text-lg font-bold text-white">27</p>
                <p className="text-xs text-slate-500">Anchor instructions</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="font-mono text-lg font-bold text-white">540</p>
                <p className="text-xs text-slate-500">Tests across 4 repos</p>
              </GlassCard>
              <GlassCard className="p-4 text-center">
                <p className="font-mono text-lg font-bold text-white">CI/CD</p>
                <p className="text-xs text-slate-500">
                  GitHub Actions &rarr; GHCR &rarr; VPS
                </p>
              </GlassCard>
            </div>
          </section>
        </FadeIn>

        {/* -------------------------------------------------------- */}
        {/*  Section 6: Links                                         */}
        {/* -------------------------------------------------------- */}
        <FadeIn>
          <section className="mb-20">
            <SectionHeading number="06" title="Links" />

            <div className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors group py-2"
                  >
                    <Icon className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
                    <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                    <span className="font-mono text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                      {link.href.replace('https://', '')}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-slate-500 transition-colors ml-auto" />
                  </a>
                )
              })}
            </div>
          </section>
        </FadeIn>

        {/* -------------------------------------------------------- */}
        {/*  Footer                                                   */}
        {/* -------------------------------------------------------- */}
        <footer className="border-t border-white/5 pt-8 pb-12 text-center">
          <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Nanuq<span className="text-sky-500">Fi</span>
          </span>
          <p className="text-xs text-slate-600 mt-2">
            Yield, Routed. Built on Solana.
          </p>
        </footer>
      </main>
    </>
  )
}
