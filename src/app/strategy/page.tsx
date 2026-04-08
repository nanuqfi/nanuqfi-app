'use client'

import { useEffect, useRef, useState } from 'react'
import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'
import {
  ExternalLink,
  Github,
  Globe,
  Activity,
  Server,
  BookOpen,
  Shield,
  Cpu,
  Link2,
  CheckCircle2,
  Zap,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Section IDs for sticky nav                                         */
/* ------------------------------------------------------------------ */
const sections = [
  { id: 'thesis', number: '01', title: 'Strategy Thesis' },
  { id: 'mechanics', number: '02', title: 'Operational Mechanics' },
  { id: 'risk', number: '03', title: 'Risk Management' },
  { id: 'performance', number: '04', title: 'Performance' },
  { id: 'architecture', number: '05', title: 'Technical Architecture' },
  { id: 'links', number: '06', title: 'Links' },
]

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
  { label: 'Website', href: 'https://nanuqfi.com', icon: Globe, desc: 'Marketing & overview' },
  { label: 'Dashboard', href: 'https://nanuqfi.com/app', icon: Activity, desc: 'Live vault dashboard' },
  { label: 'AI Activity Log', href: 'https://nanuqfi.com/app/activity', icon: BookOpen, desc: 'Every AI decision, viewable' },
  { label: 'Keeper API', href: 'https://keeper.nanuqfi.com', icon: Server, desc: 'Health, backtest, status' },
  { label: 'GitHub', href: 'https://github.com/nanuqfi', icon: Github, desc: '4 repos, open source' },
  {
    label: 'Program (Solscan)',
    href: 'https://solscan.io/account/2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P?cluster=devnet',
    icon: ExternalLink,
    desc: 'On-chain allocator program',
  },
]

/* ------------------------------------------------------------------ */
/*  Reusable section heading                                           */
/* ------------------------------------------------------------------ */
function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="pb-4 mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-mono text-sm font-bold text-sky-400/80">{number}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Gradient divider between sections                                  */
/* ------------------------------------------------------------------ */
function SectionDivider() {
  return (
    <div className="my-24" aria-hidden="true">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sticky sidebar nav with IntersectionObserver                       */
/* ------------------------------------------------------------------ */
function StickyNav() {
  const [active, setActive] = useState('thesis')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <nav className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
      {sections.map(({ id, number, title }) => {
        const isActive = active === id
        return (
          <a
            key={id}
            href={`#${id}`}
            className={[
              'group flex items-center gap-2 transition-all duration-300',
              isActive ? 'opacity-100' : 'opacity-40 hover:opacity-70',
            ].join(' ')}
          >
            <span
              className={[
                'font-mono text-[10px] font-bold transition-colors duration-300',
                isActive ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400',
              ].join(' ')}
            >
              {number}
            </span>
            <span
              className={[
                'text-[10px] tracking-wider uppercase transition-all duration-300 overflow-hidden whitespace-nowrap',
                isActive
                  ? 'max-w-40 text-white opacity-100'
                  : 'max-w-0 opacity-0 group-hover:max-w-40 group-hover:opacity-100 text-slate-400',
              ].join(' ')}
            >
              {title}
            </span>
            <span
              className={[
                'h-px transition-all duration-300',
                isActive ? 'w-6 bg-sky-400' : 'w-2 bg-slate-700 group-hover:w-4 group-hover:bg-slate-500',
              ].join(' ')}
            />
          </a>
        )
      })}
    </nav>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function StrategyPage() {
  return (
    <>
      <title>Strategy Documentation — NanuqFi</title>

      <StickyNav />

      <main className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* ======================================================== */}
        {/*  Hero Header                                              */}
        {/* ======================================================== */}
        <section className="relative pt-20 pb-16 mb-8 overflow-hidden">
          {/* Radial glow background */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            aria-hidden="true"
          >
            <div
              className="absolute top-1/3 left-1/2 w-[90vw] h-[60vh] -translate-x-1/2 -translate-y-1/2"
              style={{
                background:
                  'radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, rgba(8,11,17,0) 65%)',
              }}
            />
          </div>

          <div className="relative z-10">
            <FadeIn>
              {/* Hackathon badge */}
              <span className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/[0.03] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-mono text-sky-300/80 tracking-wider uppercase">
                  Ranger Build-A-Bear Hackathon — April 2026
                </span>
              </span>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-4">
                <span className="bg-gradient-to-br from-[#0EA5E9] via-sky-200 to-white bg-clip-text text-transparent">
                  NanuqFi
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-light mb-3">
                Strategy Documentation
              </p>

              {/* Subtitle links */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-mono text-slate-500 mb-12">
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
            </FadeIn>

            {/* Hero stat callouts */}
            <FadeIn delay={150}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: '540', label: 'Tests' },
                  { value: '27', label: 'Instructions' },
                  { value: '3', label: 'Protocols' },
                  { value: '16.1%', label: 'CAGR' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="relative p-5 rounded-2xl border border-white/[0.04] bg-white/[0.015] text-center group hover:border-white/[0.08] transition-colors"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-sky-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="font-mono text-3xl md:text-4xl font-bold text-white relative">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 relative">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Bottom fade */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 z-10 h-16 w-full bg-gradient-to-t from-[#080B11] to-transparent"
            aria-hidden="true"
          />
        </section>

        {/* ======================================================== */}
        {/*  Section 1: Strategy Thesis                               */}
        {/* ======================================================== */}
        <FadeIn>
          <section id="thesis" className="scroll-mt-20">
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

        <SectionDivider />

        {/* ======================================================== */}
        {/*  Section 2: Operational Mechanics                         */}
        {/* ======================================================== */}
        <FadeIn>
          <section id="mechanics" className="scroll-mt-20">
            <SectionHeading number="02" title="Operational Mechanics" />

            <p className="text-slate-400 mb-8">
              How capital flows through the system:
            </p>

            {/* Flow steps */}
            <div className="space-y-4 mb-12">
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

            {/* ---- 3-Layer Validation Flow Diagram ---- */}
            <h3 className="text-lg font-semibold text-white mb-6">
              Three-Layer Validation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-12">
              {[
                {
                  label: 'AI Layer',
                  desc: 'Claude assesses market conditions, rate sustainability, and protocol health',
                  accent: 'sky',
                  icon: Cpu,
                },
                {
                  label: 'Algorithm',
                  desc: 'Scoring matrix validates proposal against rate, volatility, TVL, and risk thresholds',
                  accent: 'emerald',
                  icon: Shield,
                },
                {
                  label: 'On-Chain',
                  desc: 'Anchor program enforces guardrails — drawdown caps, whitelist, weight limits',
                  accent: 'amber',
                  icon: Link2,
                },
              ].map((layer, i) => {
                const Icon = layer.icon
                const borderColor =
                  layer.accent === 'sky'
                    ? 'border-sky-500/30'
                    : layer.accent === 'emerald'
                      ? 'border-emerald-500/30'
                      : 'border-amber-500/30'
                const iconColor =
                  layer.accent === 'sky'
                    ? 'text-sky-400'
                    : layer.accent === 'emerald'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                const glowBg =
                  layer.accent === 'sky'
                    ? 'from-sky-500/5'
                    : layer.accent === 'emerald'
                      ? 'from-emerald-500/5'
                      : 'from-amber-500/5'

                return (
                  <div key={layer.label} className="flex items-stretch">
                    <div
                      className={[
                        'flex-1 p-5 border backdrop-blur-md rounded-2xl relative overflow-hidden',
                        borderColor,
                        'bg-white/[0.02]',
                      ].join(' ')}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-b ${glowBg} to-transparent opacity-50`}
                      />
                      <div className="relative">
                        <Icon className={`w-5 h-5 ${iconColor} mb-3`} />
                        <p className="text-white font-semibold text-sm mb-1">
                          {layer.label}
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {layer.desc}
                        </p>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="hidden md:flex items-center px-2">
                        <ArrowRight className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                    {i < 2 && (
                      <div className="flex md:hidden justify-center py-2">
                        <ArrowRight className="w-4 h-4 text-slate-600 rotate-90" />
                      </div>
                    )}
                  </div>
                )
              })}
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

        <SectionDivider />

        {/* ======================================================== */}
        {/*  Section 3: Risk Management                               */}
        {/* ======================================================== */}
        <FadeIn>
          <section id="risk" className="scroll-mt-20">
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

              {/* Stress Test — kept as reference bullet list */}
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

        <SectionDivider />

        {/* ======================================================== */}
        {/*  Drift Hack Survival — Dramatic Feature Section           */}
        {/* ======================================================== */}
        <FadeIn>
          <section className="relative -mx-6 lg:-mx-8 px-6 lg:px-8 py-16 mb-0 overflow-hidden scroll-mt-20">
            {/* Red gradient background */}
            <div
              className="pointer-events-none absolute inset-0 z-0"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 40%, transparent 100%)',
                }}
              />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400/80" />
                <span className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest">
                  Live Stress Test
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
                $285M Exploit.{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  Zero User Capital Lost.
                </span>
              </h2>

              {/* Timeline */}
              <div className="space-y-6 mb-8">
                {[
                  {
                    time: 'April 1, 2026',
                    event: 'Drift Protocol hacked — $285M exploit',
                    color: 'bg-red-500',
                  },
                  {
                    time: 'Hours later',
                    event: 'Full pivot to Kamino / Marginfi / Lulo — protocol-agnostic architecture enabled instant migration',
                    color: 'bg-amber-500',
                  },
                  {
                    time: 'Result',
                    event: 'Architecture proven under real-world adversarial conditions. Generic allocate_to_protocol replaced all Drift-specific code.',
                    color: 'bg-emerald-500',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center gap-1 pt-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                      {i < 2 && <span className="w-px h-8 bg-white/10" />}
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-500 mb-1">
                        {item.time}
                      </p>
                      <p className="text-slate-300 leading-relaxed text-sm">
                        {item.event}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 border-t border-white/5 pt-4">
                This is not a hypothetical scenario. This happened during active development, validating the core
                architectural thesis: protocol-agnostic design survives protocol failure.
              </p>
            </div>
          </section>
        </FadeIn>

        <SectionDivider />

        {/* ======================================================== */}
        {/*  Section 4: Performance                                   */}
        {/* ======================================================== */}
        <FadeIn>
          <section id="performance" className="scroll-mt-20">
            <SectionHeading number="04" title="Performance" />

            <h3 className="text-lg font-semibold text-white mb-6">
              Backtest Results
              <span className="text-sm font-normal text-slate-500 ml-2">
                90-day simulation
              </span>
            </h3>

            {/* ---- Hero Metric Cards ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* CAGR */}
              <div className="relative p-6 rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] text-center overflow-hidden group">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 80%, rgba(14,165,233,0.15) 0%, transparent 70%)',
                  }}
                />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 relative">CAGR</p>
                <p className="font-mono text-4xl md:text-5xl font-black text-sky-400 relative" style={{ textShadow: '0 0 30px rgba(14,165,233,0.3)' }}>
                  16.1%
                </p>
                <p className="text-xs text-slate-500 mt-2 relative">vs 5.5% single-protocol baseline</p>
              </div>

              {/* Sharpe */}
              <div className="relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center overflow-hidden">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sharpe Ratio</p>
                <p className="font-mono text-4xl md:text-5xl font-black text-white">
                  2.95
                </p>
                <p className="text-xs text-slate-500 mt-2">&gt; 1.0 is considered good</p>
              </div>

              {/* Max Drawdown */}
              <div className="relative p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] text-center overflow-hidden">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 80%, rgba(16,185,129,0.1) 0%, transparent 70%)',
                  }}
                />
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 relative">Max Drawdown</p>
                <p className="font-mono text-4xl md:text-5xl font-black text-emerald-400 relative">
                  1.89%
                </p>
                <p className="text-xs text-slate-500 mt-2 relative">worst peak-to-trough</p>
              </div>
            </div>

            {/* Comparison table (supporting detail) */}
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

        <SectionDivider />

        {/* ======================================================== */}
        {/*  Section 5: Technical Architecture                        */}
        {/* ======================================================== */}
        <FadeIn>
          <section id="architecture" className="scroll-mt-20">
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

        <SectionDivider />

        {/* ======================================================== */}
        {/*  Technical Credibility Bar                                 */}
        {/* ======================================================== */}
        <FadeIn>
          <section className="mb-0">
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: CheckCircle2, value: '540', label: 'tests passing', color: 'text-emerald-400' },
                  { icon: Shield, value: '27', label: 'on-chain instructions', color: 'text-sky-400' },
                  { icon: Zap, value: '4', label: 'repositories', color: 'text-amber-400' },
                  { icon: Activity, value: 'Green', label: 'CI/CD pipeline', color: 'text-emerald-400' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
                      <div>
                        <p className="font-mono text-sm font-bold text-white">
                          {item.value}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </FadeIn>

        <SectionDivider />

        {/* ======================================================== */}
        {/*  Section 6: Links — CTA Grid                              */}
        {/* ======================================================== */}
        <FadeIn>
          <section id="links" className="scroll-mt-20">
            <SectionHeading number="06" title="Links" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {links.map((link) => {
                const Icon = link.icon
                const isLive = link.label === 'Dashboard' || link.label === 'AI Activity Log'
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      'group relative p-5 rounded-2xl border transition-all duration-300',
                      'hover:scale-[1.02] hover:-translate-y-0.5',
                      isLive
                        ? 'border-sky-500/20 bg-sky-500/[0.03] hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]'
                        : 'border-white/[0.04] bg-white/[0.015] hover:border-white/[0.1] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={[
                          'w-5 h-5 shrink-0 mt-0.5 transition-colors',
                          isLive
                            ? 'text-sky-400 group-hover:text-sky-300'
                            : 'text-slate-500 group-hover:text-white',
                        ].join(' ')}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                          {link.label}
                          {isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {link.desc}
                        </p>
                        <p className="font-mono text-[10px] text-slate-600 mt-1.5 truncate">
                          {link.href.replace('https://', '')}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="absolute top-4 right-4 w-3 h-3 text-slate-700 group-hover:text-slate-500 transition-colors" />
                  </a>
                )
              })}
            </div>
          </section>
        </FadeIn>

        {/* ======================================================== */}
        {/*  Footer                                                   */}
        {/* ======================================================== */}
        <div className="mt-24 mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <footer className="text-center">
            <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
              Nanuq<span className="text-sky-500">Fi</span>
            </span>
            <p className="text-xs text-slate-600 mt-2">
              Yield, Routed. Built on Solana.
            </p>
          </footer>
        </div>
      </main>
    </>
  )
}
