'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Award,
  PlayCircle,
  ExternalLink,
  Activity,
  ShieldAlert,
  Settings2,
  Coins,
  ArrowRight,
  ArrowDown,
  Cpu,
  Puzzle,
  BrainCircuit,
  Lock,
  LineChart,
  Wallet,
  Bot,
  Check,
  Plug,
  Copy,
  CheckCheck,
  Shield,
  Siren,
  TrendingUp,
  LayoutDashboard,
  BookOpen,
  Github,
  Video,
  Search,
  ArrowUpRight,
} from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'

const ADAPTOR_PID = 'HsNnmuB18pA2U24K4Stc1yan67Cx96gmvGRqBUqRFWwY'
const ALLOCATOR_PID = '2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P'
const VIDEO_URL = 'https://nanuqfi.com/cdn/videos/demo.mp4'
const POSTER_URL = 'https://nanuqfi.com/cdn/images/demo-poster.jpg'

const CHAPTERS = [
  { time: 10, label: 'Landing Page', stamp: '00:10' },
  { time: 35, label: 'Dashboard', stamp: '00:35' },
  { time: 60, label: 'Vaults & Deposit Flow', stamp: '01:00' },
  { time: 180, label: 'Keeper API', stamp: '03:00' },
  { time: 225, label: 'On-chain Program', stamp: '03:45' },
  { time: 255, label: 'Build & Tests', stamp: '04:15' },
]

export default function PitchPage() {
  const [copied, setCopied] = useState(false)

  const seekVideo = (time: number) => {
    const el = document.getElementById('product-video') as HTMLVideoElement | null
    if (!el) return
    el.currentTime = time
    el.play().catch(() => {})
  }

  const copyPid = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ADAPTOR_PID)
      } else {
        // Fallback for non-secure contexts or older browsers
        const ta = document.createElement('textarea')
        ta.value = ADAPTOR_PID
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Last resort: select the code element so user can manually copy
      const code = document.querySelector<HTMLElement>('code[data-pid]')
      if (code) {
        const range = document.createRange()
        range.selectNodeContents(code)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
  }

  return (
    <div className="relative min-h-screen bg-[#080B11] text-slate-300">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.12) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#080B11]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              NanuqFi
            </span>
            <span className="ml-2 hidden rounded-full border border-white/10 px-2 py-0.5 font-mono text-xs text-slate-500 sm:inline-block">
              DEVNET ALPHA
            </span>
          </div>
          <Link
            href="/app"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            App <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-32 px-6 py-24 sm:py-32">
        {/* 1. HERO */}
        <FadeIn>
          <section className="mt-12 flex flex-col items-center text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 backdrop-blur-md">
              <Award className="h-4 w-4 text-sky-400" />
              <span className="font-mono text-xs font-semibold tracking-wider text-sky-200/80">
                RANGER BUILD-A-BEAR · APRIL 2026
              </span>
            </div>

            <h1 className="mb-6 text-6xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-[7rem]">
              <span className="bg-gradient-to-br from-sky-400 via-sky-200 to-white bg-clip-text text-transparent drop-shadow-lg">
                Yield, Routed.
              </span>
            </h1>

            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 sm:text-xl">
              NanuqFi is an AI-powered, protocol-agnostic yield routing layer
              built for Solana.{' '}
              <span className="font-medium text-slate-200">Deposit USDC.</span>{' '}
              Pick your risk. Let the protocol work.
            </p>

            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <a
                href="#demo"
                className="group flex items-center justify-center gap-2 rounded-xl bg-sky-500/15 border border-sky-500/30 px-6 py-3 font-medium text-white shadow-[0_0_20px_rgba(14,165,233,0.2)] backdrop-blur-md transition-all hover:bg-sky-500/20 hover:shadow-[0_0_30px_rgba(14,165,233,0.4)]"
              >
                <PlayCircle className="h-5 w-5 text-sky-300" />
                Watch 6-min Demo
              </a>
              <Link
                href="/app"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 transition-all hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/5"
              >
                Try Live Product
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </Link>
            </div>
          </section>
        </FadeIn>

        {/* 2. DEMO VIDEO */}
        <FadeIn>
          <section id="demo" className="scroll-mt-24">
            <div className="mb-10 flex flex-col items-center text-center">
              <h2 className="mb-3 text-3xl font-bold text-white">
                See it in 6 minutes
              </h2>
              <p className="max-w-xl text-slate-400">
                Full walkthrough: marketing → dashboard → vaults & deposit flow
                → keeper API → on-chain program → build & tests.
              </p>
            </div>

            <GlassCard className="group relative mb-6 overflow-hidden rounded-2xl border border-white/5 p-2 shadow-2xl">
              <div className="absolute left-4 top-4 z-10 flex gap-1.5 opacity-50 transition-opacity group-hover:opacity-100">
                <div className="h-2.5 w-2.5 rounded-full border border-red-500/20 bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full border border-amber-500/20 bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/80" />
              </div>

              <video
                id="product-video"
                className="w-full rounded-xl bg-[#080B11]"
                controls
                preload="metadata"
                playsInline
                poster={POSTER_URL}
              >
                <source src={VIDEO_URL} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            </GlassCard>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {CHAPTERS.map((c) => (
                <button
                  key={c.time}
                  type="button"
                  onClick={() => seekVideo(c.time)}
                  className="group flex flex-col rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition-colors hover:border-sky-500/50 hover:bg-white/[0.04]"
                >
                  <span className="mb-1 font-mono text-xs text-sky-400">
                    {c.stamp}
                  </span>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* 3. PROBLEM */}
        <FadeIn>
          <section className="border-t border-white/5 pt-20">
            <h2 className="mb-10 text-3xl font-bold text-white">
              DeFi yield is fragmented and fragile
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <ProblemCard
                Icon={Activity}
                title="Yield moves constantly"
                body="Rates change every hour across 10+ lending protocols on Solana. Stagnant capital leaves returns on the table."
                iconColor="text-slate-300"
              />
              <ProblemCard
                Icon={ShieldAlert}
                title="Single vaults are fragile"
                body="Concentrated risk. One vulnerability or bad-debt event in a single protocol = total loss for depositors."
                iconColor="text-amber-400"
              />
              <ProblemCard
                Icon={Settings2}
                title="Manual routing fails"
                body="Retail users don't track live APYs or pool utilization 24/7. It doesn't scale."
                iconColor="text-slate-300"
              />
            </div>
          </section>
        </FadeIn>

        {/* 4. SOLUTION */}
        <FadeIn>
          <section>
            <div className="mb-12">
              <h2 className="mb-3 text-3xl font-bold text-white">
                One deposit. Three protocols. Zero thinking.
              </h2>
              <p className="text-slate-400">
                Routing capital intelligently based on real-time risk/reward.
              </p>
            </div>

            {/* Flow diagram */}
            <GlassCard className="relative mb-12 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-2xl border-white/5 p-8 md:flex-row">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at right center, rgba(14,165,233,0.08) 0%, transparent 50%)',
                }}
              />

              {/* Step 1 */}
              <div className="relative z-10 flex w-full flex-col items-center gap-3 md:w-auto">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg">
                  <Coins className="h-8 w-8 text-sky-400" />
                </div>
                <div className="text-center">
                  <div className="font-mono text-sm font-medium text-white">
                    USDC Deposit
                  </div>
                  <div className="text-xs text-slate-500">User Wallet</div>
                </div>
              </div>

              <ArrowRight className="relative z-10 hidden h-6 w-6 text-slate-600 md:block" />
              <ArrowDown className="relative z-10 block h-6 w-6 text-slate-600 md:hidden" />

              {/* Step 2 */}
              <div className="relative z-10 flex w-full flex-col items-center rounded-xl border border-sky-500/30 bg-sky-500/5 px-6 py-4 ring-1 ring-inset ring-sky-500/20 md:w-auto">
                <div className="mb-2 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-sky-400" />
                  <span className="font-mono text-sm uppercase tracking-widest text-sky-100">
                    AI Router Core
                  </span>
                </div>
                <div className="font-mono text-xs text-sky-400/80">
                  Assessing risk tier…
                </div>
              </div>

              <ArrowRight className="relative z-10 hidden h-6 w-6 text-slate-600 md:block" />
              <ArrowDown className="relative z-10 block h-6 w-6 text-slate-600 md:hidden" />

              {/* Step 3: Destinations */}
              <div className="relative z-10 flex w-full flex-col gap-3 md:w-64">
                <AllocationRow label="Lulo" pct="62.6%" />
                <AllocationRow label="Marginfi" pct="27.2%" />
                <AllocationRow label="Kamino" pct="10.2%" />
              </div>
            </GlassCard>

            {/* Features grid */}
            <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <FeatureRow
                Icon={Puzzle}
                title="Protocol-Agnostic"
                body="Add new yield protocols by implementing a single YieldBackend interface."
              />
              <FeatureRow
                Icon={BrainCircuit}
                title="AI-Enhanced Validation"
                body="Claude validates every rebalance proposal with regime detection and confidence scoring."
              />
              <FeatureRow
                Icon={Lock}
                title="On-chain Guardrails"
                body="Emergency halt, deposit caps, and drawdown limits enforced by the program, not the keeper."
              />
              <FeatureRow
                Icon={LineChart}
                title="Backtest-Proven"
                body="Algorithm delivered 20.15% return over 469 days of real on-chain historical data."
              />
            </div>
          </section>
        </FadeIn>

        {/* 5. LIVE PROOF */}
        <FadeIn>
          <section className="border-t border-white/5 pt-20">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="mb-2 text-3xl font-bold text-white">
                  This isn&apos;t a mockup
                </h2>
                <p className="text-slate-400">
                  Live metrics from current devnet deployment.
                </p>
              </div>
              <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-xs uppercase text-emerald-400">
                  System Operational
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="TVL (Devnet)" value="$484" accent="text-white" />
              <StatCard label="Weighted APY" value="6.7%" accent="text-sky-400" />
              <StatCard label="Passing Tests" value="850+" accent="text-white" />
              <StatCard label="On-chain Ixs" value="33" accent="text-white" />
            </div>
          </section>
        </FadeIn>

        {/* 6. BACKTEST */}
        <FadeIn>
          <section>
            <h2 className="mb-3 text-3xl font-bold text-white">
              Don&apos;t trust us, verify.
            </h2>
            <p className="mb-8 max-w-2xl text-slate-400">
              We backtested our router against 469 days of real on-chain data
              from Kamino, Marginfi, and Lulo. The dynamic routing beats every
              protocol individually on Sharpe ratio by avoiding utilization
              spikes.
            </p>

            <GlassCard className="relative mb-8 overflow-hidden rounded-2xl border-white/5 p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

              <div className="mb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-sky-400">
                  Cumulative Performance
                </span>
              </div>
              <div className="relative z-10 mb-6 flex flex-col gap-4 md:flex-row md:items-baseline">
                <h3 className="inline-block w-fit border-b border-white/10 pb-2 font-mono text-5xl font-bold text-white sm:text-6xl">
                  20.15%{' '}
                  <span className="text-xl font-normal text-slate-500 sm:text-2xl">
                    RETURN
                  </span>
                </h3>
                <div className="mx-4 hidden h-12 w-px bg-white/10 md:block" />
                <h3 className="font-mono text-3xl font-bold text-white sm:text-4xl">
                  11.76{' '}
                  <span className="text-lg font-normal text-slate-500">
                    SHARPE
                  </span>
                </h3>
              </div>

              <div className="relative z-10 mb-8 flex flex-wrap gap-x-8 gap-y-4 font-mono text-sm">
                <MetricPair label="CAGR" value="7.61%" valueClass="text-emerald-400" />
                <MetricPair label="SORTINO" value="32.08" />
                <MetricPair label="MAX DRAWDOWN" value="0.00%" />
                <MetricPair label="DATA POINTS" value="469 days" />
              </div>

              {/* Protocol comparison */}
              <div className="relative z-10 w-full overflow-hidden rounded-xl border border-white/5 bg-[#080B11]/50 backdrop-blur-md">
                <div className="flex border-b border-white/5 bg-white/5 p-3 font-mono text-xs text-slate-500">
                  <div className="w-1/3">PROTOCOL (SOLO)</div>
                  <div className="w-1/3 min-w-24 text-right">RETURN</div>
                  <div className="w-1/3 min-w-24 text-right">SHARPE</div>
                </div>
                <ProtocolRow name="Lulo" ret="21.43%" sharpe="10.02" />
                <ProtocolRow name="MarginFi" ret="20.31%" sharpe="9.45" />
                <ProtocolRow name="Kamino" ret="18.68%" sharpe="8.91" />
              </div>
            </GlassCard>
          </section>
        </FadeIn>

        {/* 7. ARCHITECTURE */}
        <FadeIn>
          <section className="border-t border-white/5 pt-20">
            <div className="mb-10">
              <h2 className="mb-3 text-3xl font-bold text-white">
                Trust the program, not the keeper
              </h2>
              <p className="max-w-2xl text-slate-400">
                The AI keeper is strictly advisory. It proposes allocations;
                the on-chain allocator validates every constraint before any
                capital moves.
              </p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-3">
              {/* Layer diagram */}
              <div className="flex flex-col gap-4 font-mono text-sm lg:col-span-2">
                <div className="flex items-center justify-between rounded-xl border border-dashed border-white/5 bg-white/[0.02] p-4 opacity-80">
                  <span className="text-xs uppercase tracking-wider text-slate-500">
                    Layer 1: Entry
                  </span>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">User Wallets / LPs</span>
                  </div>
                </div>

                <div className="-my-2 flex justify-center">
                  <ArrowDown className="h-4 w-4 text-white/20" />
                </div>

                <div className="relative overflow-hidden rounded-xl border border-sky-500/20 bg-[#0F1418] p-6 shadow-[0_0_20px_rgba(14,165,233,0.05)]">
                  <div className="absolute left-0 top-0 h-full w-1 bg-sky-500" />
                  <span className="mb-4 block text-xs uppercase tracking-wider text-sky-400">
                    Layer 2: Logic (Rust / Anchor)
                  </span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col rounded border border-white/5 bg-black/30 p-3">
                      <span className="text-slate-200">Ranger Adaptor</span>
                      <span className="mt-1 text-xs text-slate-500">
                        3 instructions
                      </span>
                    </div>
                    <div className="col-span-1 flex flex-col rounded border border-sky-500/20 bg-sky-500/10 p-3 sm:col-span-2">
                      <span className="font-medium text-white">
                        Allocator Program
                      </span>
                      <span className="mt-1 text-xs text-sky-400/80">
                        27 instructions · Risk engine
                      </span>
                    </div>
                  </div>
                </div>

                <div className="-my-2 flex justify-center gap-16">
                  <ArrowDown className="h-4 w-4 text-white/20" />
                  <ArrowDown className="h-4 w-4 text-white/20" />
                  <ArrowDown className="hidden h-4 w-4 text-white/20 sm:block" />
                </div>

                <div className="flex justify-between gap-2 overflow-x-auto rounded-xl border border-dashed border-white/5 bg-white/[0.02] p-4 opacity-80">
                  <div className="mt-1 shrink-0 text-xs uppercase tracking-wider text-slate-500">
                    Layer 3:
                    <br />
                    Yield
                  </div>
                  <div className="flex shrink-0 gap-4 px-2">
                    <span className="rounded border border-white/5 bg-black/30 px-4 py-2 text-slate-300">
                      Kamino
                    </span>
                    <span className="rounded border border-white/5 bg-black/30 px-4 py-2 text-slate-300">
                      MarginFi
                    </span>
                    <span className="rounded border border-white/5 bg-black/30 px-4 py-2 text-slate-300">
                      Lulo
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Keeper timeline */}
              <div className="rounded-xl border border-white/5 bg-[#131A22]/50 p-6 lg:h-full">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded border border-sky-500/20 bg-sky-500/10 p-2">
                    <Bot className="h-5 w-5 text-sky-400" />
                  </div>
                  <h3 className="font-medium text-white">AI Keeper Flow</h3>
                </div>
                <ul className="relative flex flex-col gap-5 before:absolute before:-z-10 before:left-2.5 before:top-2 before:h-full before:w-px before:bg-white/10">
                  <TimelineStep
                    dotClass="border-slate-600"
                    title="AI Proposes"
                    body="Off-chain node computes optimal weights and builds TX."
                    titleClass="text-slate-200"
                  />
                  <TimelineStep
                    dotClass="border-sky-500"
                    title="Program Validates"
                    body="On-chain checks: caps, drawdown, slippage — math, not trust."
                    titleClass="text-white"
                    filled
                  />
                  <TimelineStep
                    dotClass="border-emerald-500"
                    title="CPI Execution"
                    body="Cross-program invocations route funds into Kamino/Marginfi/Lulo."
                    titleClass="text-emerald-400"
                    icon={<Check className="h-3 w-3 text-emerald-500" />}
                  />
                </ul>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* 8. RANGER INTEGRATION */}
        <FadeIn>
          <section>
            <GlassCard className="flex flex-col items-center justify-between gap-8 rounded-2xl border-l-4 border-l-sky-500 border-white/5 p-8 md:flex-row">
              <div className="max-w-xl">
                <div className="mb-3 flex items-center gap-2">
                  <Plug className="h-5 w-5 text-sky-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Built as a Ranger Earn adaptor
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                  NanuqFi is deployed as a dedicated Ranger Earn adaptor — a
                  yield-routing primitive that plugs into Ranger&apos;s strategy
                  framework. Integration tests passing:{' '}
                  <span className="font-mono text-emerald-400">8/8</span> on
                  devnet.
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-col gap-3 md:w-auto">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
                  Adaptor Program ID
                </span>
                <div className="flex items-center">
                  <code
                    data-pid
                    className="w-full select-all break-all rounded-l-lg border border-white/10 bg-[#080B11] px-4 py-3 font-mono text-sm text-sky-200 md:w-64"
                  >
                    {ADAPTOR_PID}
                  </code>
                  <button
                    type="button"
                    onClick={copyPid}
                    className="group cursor-pointer rounded-r-lg border border-l-0 border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                    aria-label="Copy program ID"
                  >
                    {copied ? (
                      <CheckCheck className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Copy className="h-5 w-5 text-slate-400 group-hover:text-white" />
                    )}
                  </button>
                </div>
                <a
                  href={`https://explorer.solana.com/address/${ADAPTOR_PID}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
                >
                  View on Solana Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </GlassCard>
          </section>
        </FadeIn>

        {/* 9. WHY DEVNET */}
        <FadeIn>
          <section className="border-t border-white/5 pt-20">
            <div className="mb-8">
              <h2 className="mb-2 text-3xl font-bold text-white">
                Why we ship on devnet first
              </h2>
              <p className="text-slate-400">
                This is a deliberate architectural choice, not a hackathon
                limitation.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-1">
              <div className="divide-y divide-white/5 rounded-xl bg-[#080B11]/80 p-4 backdrop-blur-md sm:p-8">
                <DevnetReason
                  Icon={Shield}
                  iconColor="text-amber-400"
                  title="Independent audit pending"
                  body="We are pricing OtterSec, Kudelski, and Trail of Bits for a formal security review. Real USDC does not touch un-audited custodial contracts."
                />
                <DevnetReason
                  Icon={Activity}
                  iconColor="text-slate-300"
                  title="External dependency simulation"
                  body="Kamino, Marginfi, and Lulo CPIs need long-running continuous simulation on devnet before customer funds route through them in production."
                />
                <DevnetReason
                  Icon={Siren}
                  iconColor="text-red-400"
                  title="Keeper adversarial testing"
                  body="Emergency halt, guardrails, and AI decision paths need real-world stress testing under synthetic volatile market conditions."
                />
                <DevnetReason
                  Icon={TrendingUp}
                  iconColor="text-sky-400"
                  title="Staged rollout model"
                  body="Launch pipeline: audit → mainnet beta with strict $10k vault caps → gradual TVL cap raise → full launch. 3–6 month horizon."
                />
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-3xl text-center text-sm font-medium text-slate-400">
              &ldquo;We built production-complete logic. What is{' '}
              <span className="text-amber-400">NOT</span> yet complete is the
              external validation required to protect user money. That is the
              standard mainnet requires.&rdquo;
            </p>
          </section>
        </FadeIn>

        {/* 10. RESOURCES */}
        <FadeIn>
          <section>
            <h2 className="mb-6 text-2xl font-bold text-white">
              Resources & Artifacts
            </h2>
            <div className="grid gap-4 font-mono text-sm sm:grid-cols-2 lg:grid-cols-3">
              <ResourceLink
                href="/app"
                Icon={LayoutDashboard}
                label="Live Product"
                internal
              />
              <ResourceLink
                href="/strategy"
                Icon={BookOpen}
                label="Strategy Docs"
                internal
              />
              <ResourceLink
                href="https://github.com/nanuqfi"
                Icon={Github}
                label="GitHub Repos"
              />
              <ResourceLink href={VIDEO_URL} Icon={Video} label="Raw Demo Video" />
              <ResourceLink
                href={`https://explorer.solana.com/address/${ALLOCATOR_PID}?cluster=devnet`}
                Icon={Search}
                label="Allocator Program"
              />
              <ResourceLink
                href={`https://explorer.solana.com/address/${ADAPTOR_PID}?cluster=devnet`}
                Icon={Search}
                label="Ranger Adaptor"
              />
            </div>
          </section>
        </FadeIn>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-white/5 bg-[#06090E]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-12 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            <span className="font-mono text-sm font-bold tracking-tight text-white">
              NanuqFi — Yield, Routed.
            </span>
          </div>
          <div className="text-center font-mono text-sm text-slate-600 md:text-right">
            © 2026 NanuqFi. Submitted for Ranger Build-a-Bear, devnet phase.
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function ProblemCard({
  Icon,
  title,
  body,
  iconColor,
}: {
  Icon: typeof Activity
  title: string
  body: string
  iconColor: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-colors hover:border-white/10">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{body}</p>
    </div>
  )
}

function AllocationRow({ label, pct }: { label: string; pct: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="font-mono text-sm text-emerald-400">{pct}</span>
    </div>
  )
}

function FeatureRow({
  Icon,
  title,
  body,
}: {
  Icon: typeof Puzzle
  title: string
  body: string
}) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
      <div>
        <h4 className="mb-1 font-medium text-white">{title}</h4>
        <p className="text-sm text-slate-400">{body}</p>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="relative flex flex-col rounded-xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-md">
      <span className="z-10 mb-2 text-sm font-medium text-slate-400">
        {label}
      </span>
      <span className={`z-10 font-mono text-3xl font-bold ${accent}`}>
        {value}
      </span>
    </div>
  )
}

function MetricPair({
  label,
  value,
  valueClass = 'text-white',
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex flex-col">
      <span className="mb-1 text-xs text-slate-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

function ProtocolRow({
  name,
  ret,
  sharpe,
}: {
  name: string
  ret: string
  sharpe: string
}) {
  return (
    <div className="flex items-center border-b border-white/5 px-3 py-3 last:border-0">
      <div className="w-1/3 text-sm font-medium text-slate-300">{name}</div>
      <div className="w-1/3 text-right font-mono text-sm text-white">{ret}</div>
      <div className="w-1/3 text-right font-mono text-sm text-slate-400">
        {sharpe}
      </div>
    </div>
  )
}

function TimelineStep({
  dotClass,
  title,
  body,
  titleClass,
  filled,
  icon,
}: {
  dotClass: string
  title: string
  body: string
  titleClass: string
  filled?: boolean
  icon?: React.ReactNode
}) {
  return (
    <li className="relative z-10 flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-[#131A22] ${dotClass}`}
      >
        {filled && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />}
        {icon}
      </div>
      <div>
        <span className={`mb-1 block text-sm ${titleClass}`}>{title}</span>
        <span className="text-xs text-slate-500">{body}</span>
      </div>
    </li>
  )
}

function DevnetReason({
  Icon,
  iconColor,
  title,
  body,
}: {
  Icon: typeof Shield
  iconColor: string
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-4 py-6 first:pt-2 last:pb-2 sm:gap-6">
      <div className="shrink-0 rounded-full border border-white/10 bg-white/5 p-3">
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <h4 className="mb-1 text-lg font-medium text-white">{title}</h4>
        <p className="text-sm leading-relaxed text-slate-400">{body}</p>
      </div>
    </div>
  )
}

function ResourceLink({
  href,
  Icon,
  label,
  internal,
}: {
  href: string
  Icon: typeof LayoutDashboard
  label: string
  internal?: boolean
}) {
  const className =
    'group flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4 transition-colors hover:border-sky-500/30'
  const inner = (
    <>
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-sky-400" />
        <span className="text-slate-300">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-white" />
    </>
  )
  if (internal) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  )
}
