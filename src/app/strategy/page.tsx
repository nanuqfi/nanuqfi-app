'use client'

import { useState } from 'react'
import { FadeIn } from '@/components/ui/fade-in'
import { GlassCard } from '@/components/ui/glass-card'
import { useCountUp } from '@/hooks/use-count-up'
import { useInView } from '@/hooks/use-in-view'
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
  BarChart3,
  RefreshCw,
  Database,
  Box,
  Wallet,
  Bot,
  TrendingUp,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */
type TabId = 'thesis' | 'mechanics' | 'risk' | 'performance' | 'architecture' | 'links'

const tabs: { id: TabId; label: string }[] = [
  { id: 'thesis', label: 'Strategy' },
  { id: 'mechanics', label: 'Mechanics' },
  { id: 'risk', label: 'Risk' },
  { id: 'performance', label: 'Performance' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'links', label: 'Links' },
]

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const guardrails = [
  { label: 'Max Drawdown', moderate: '5%', aggressive: '10%' },
  { label: 'Max Single Asset', moderate: '60%', aggressive: '80%' },
  { label: 'Perp Exposure', moderate: 'None (lending only)', aggressive: 'None (lending only)' },
  { label: 'Rebalance Frequency', moderate: 'Every 2 hours', aggressive: 'Every 2 hours' },
  { label: 'Deposit Cap', moderate: '$10,000', aggressive: '$10,000' },
]

const backtestMetrics = [
  { label: 'Total Return', router: 3.75, baseline: 1.33, unit: '%' },
  { label: 'Annualized (CAGR)', router: 16.1, baseline: 5.5, unit: '%' },
  { label: 'Sharpe Ratio', router: 2.95, baseline: 0.8, unit: '' },
  { label: 'Sortino Ratio', router: 4.86, baseline: 1.2, unit: '' },
  { label: 'Max Drawdown', router: 1.89, baseline: 4.1, unit: '%' },
]

const links = [
  { label: 'Website', href: 'https://nanuqfi.com', icon: Globe, desc: 'Marketing & overview' },
  { label: 'Dashboard', href: 'https://nanuqfi.com/app', icon: Activity, desc: 'Live vault dashboard' },
  { label: 'AI Activity Log', href: 'https://nanuqfi.com/app/activity', icon: BookOpen, desc: 'Every AI decision, viewable' },
  { label: 'Keeper API', href: 'https://keeper.nanuqfi.com', icon: Server, desc: 'Health, backtest, status' },
  { label: 'GitHub', href: 'https://github.com/nanuqfi', icon: Github, desc: '3 repos, open source' },
  { label: 'Program (Solscan)', href: 'https://solscan.io/account/2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P?cluster=devnet', icon: ExternalLink, desc: 'On-chain allocator program' },
]

const techStack = [
  { name: 'Solana', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { name: 'Anchor 0.30', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { name: 'Rust', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { name: 'TypeScript', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { name: 'Next.js 16', color: 'bg-white/10 text-white border-white/20' },
  { name: 'React 19', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { name: 'Tailwind 4', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  { name: 'Playwright', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { name: 'Claude AI', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
  { name: 'Docker', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
  { name: 'Vitest', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { name: 'Turborepo', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
]

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */
function CountUpStat({ end, decimals = 0, suffix = '', label, className = '' }: {
  end: number; decimals?: number; suffix?: string; label: string; className?: string
}) {
  const { ref, display } = useCountUp({ end, decimals, suffix, duration: 2000 })
  return (
    <div ref={ref} className={`relative p-5 rounded-2xl border border-white/[0.04] bg-white/[0.015] text-center group hover:border-white/[0.08] transition-all duration-500 hover:scale-[1.02] ${className}`}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-sky-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <p className="font-mono text-3xl md:text-4xl font-bold text-white relative">{display}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 relative">{label}</p>
    </div>
  )
}

function ProtocolFlowDiagram() {
  const { ref, inView } = useInView({ threshold: 0.2 })
  const steps = [
    { label: 'User\nDeposits USDC', Icon: Wallet, color: '#0EA5E9' },
    { label: 'AI Keeper\nScores Protocols', Icon: Bot, color: '#8B5CF6' },
    { label: 'Guardrails\nEnforce Limits', Icon: Shield, color: '#F59E0B' },
    { label: 'Capital Routes\nto Best Yield', Icon: TrendingUp, color: '#10B981' },
  ]
  return (
    <div ref={ref} className="relative py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            <div className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center transition-all duration-700 hover:border-white/[0.12] hover:bg-white/[0.04]"
              style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transitionDelay: `${i * 200}ms` }}>
              <div className="flex justify-center mb-3"><step.Icon className="w-7 h-7" style={{ color: step.color }} /></div>
              <p className="text-sm text-white font-medium whitespace-pre-line leading-tight">{step.label}</p>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ backgroundColor: step.color, opacity: 0.4 }} />
            </div>
            {i < 3 && (
              <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                <svg width="16" height="16" viewBox="0 0 16 16" className="text-slate-600">
                  <path d="M4 8H12M12 8L9 5M12 8L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                    style={{ opacity: inView ? 1 : 0, transition: `opacity 500ms ${(i + 1) * 200 + 300}ms` }} />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <svg className="hidden md:block absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 pointer-events-none" preserveAspectRatio="none">
        <line x1="12%" y1="50%" x2="88%" y2="50%" stroke="url(#flowGrad)" strokeWidth="1" strokeDasharray="6 4"
          style={{ strokeDashoffset: inView ? 0 : 200, transition: 'stroke-dashoffset 2s ease-out' }} />
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

function ComparisonBar({ label, routerValue, baselineValue, unit, maxValue }: {
  label: string; routerValue: number; baselineValue: number; unit: string; maxValue: number
}) {
  const { ref, inView } = useInView({ threshold: 0.3 })
  const routerWidth = (routerValue / maxValue) * 100
  const baselineWidth = (baselineValue / maxValue) * 100
  return (
    <div ref={ref} className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-sky-400">{routerValue}{unit}</span>
          <span className="text-slate-500">{baselineValue}{unit}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-2 bg-white/[0.03] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-1000 ease-out" style={{ width: inView ? `${routerWidth}%` : '0%' }} />
        </div>
        <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-slate-600 transition-all duration-1000 ease-out" style={{ width: inView ? `${baselineWidth}%` : '0%', transitionDelay: '200ms' }} />
        </div>
      </div>
    </div>
  )
}

function MetricCard({ value, decimals, suffix, label, sublabel, accent }: {
  value: number; decimals: number; suffix: string; label: string; sublabel: string; accent: 'sky' | 'white' | 'emerald'
}) {
  const { ref, display } = useCountUp({ end: value, decimals, suffix, duration: 2000 })
  const colors = {
    sky: { border: 'border-sky-500/20', bg: 'bg-sky-500/[0.03]', text: 'text-sky-400', glow: 'rgba(14,165,233,0.15)' },
    white: { border: 'border-white/[0.06]', bg: 'bg-white/[0.02]', text: 'text-white', glow: 'rgba(255,255,255,0.05)' },
    emerald: { border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.03]', text: 'text-emerald-400', glow: 'rgba(16,185,129,0.1)' },
  }
  const c = colors[accent]
  return (
    <div ref={ref} className={`relative p-6 rounded-2xl border ${c.border} ${c.bg} text-center overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 50% 80%, ${c.glow} 0%, transparent 70%)` }} />
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 relative">{label}</p>
      <p className={`font-mono text-4xl md:text-5xl font-black ${c.text} relative`} style={{ textShadow: accent !== 'white' ? `0 0 30px ${c.glow}` : undefined }}>{display}</p>
      <p className="text-xs text-slate-500 mt-2 relative">{sublabel}</p>
    </div>
  )
}

function GrowthCurve() {
  const { ref, inView } = useInView({ threshold: 0.2 })
  const routerPath = 'M 0 180 C 40 178, 80 175, 120 170 C 160 163, 200 155, 240 145 C 280 133, 320 120, 360 108 C 400 95, 440 82, 480 72 C 520 62, 560 55, 600 48 C 640 42, 680 38, 720 35 C 760 32, 780 30, 800 28'
  const baselinePath = 'M 0 180 C 80 178, 160 176, 240 173 C 320 170, 400 167, 480 163 C 560 159, 640 155, 720 150 C 760 148, 780 146, 800 144'
  return (
    <div ref={ref} className="relative h-[200px] w-full mt-6 mb-2">
      <svg viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="none">
        {[0, 1, 2, 3].map(i => (<line key={i} x1="0" y1={50 + i * 50} x2="800" y2={50 + i * 50} stroke="rgba(148,163,184,0.05)" strokeDasharray="4 4" />))}
        <defs><linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" /><stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" /></linearGradient></defs>
        <path d={`${baselinePath} L 800 200 L 0 200 Z`} fill="rgba(148,163,184,0.03)" style={{ opacity: inView ? 1 : 0, transition: 'opacity 1s 0.5s' }} />
        <path d={baselinePath} stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeDasharray="4 3" style={{ opacity: inView ? 1 : 0, transition: 'opacity 1s 0.5s' }} />
        <path d={`${routerPath} L 800 200 L 0 200 Z`} fill="url(#perfGrad)" style={{ opacity: inView ? 1 : 0, transition: 'opacity 1s 0.3s' }} />
        <path d={routerPath} stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" style={{ opacity: inView ? 1 : 0, transition: 'opacity 1s 0.3s' }} />
        <path d={routerPath} stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" opacity="0.2" filter="blur(4px)" style={{ opacity: inView ? 0.2 : 0, transition: 'opacity 1s 0.3s' }} />
        <circle cx="800" cy="28" r="3" fill="#0EA5E9" style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.5s 1.5s' }} />
        <circle cx="800" cy="144" r="2" fill="rgba(148,163,184,0.5)" style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.5s 1.5s' }} />
      </svg>
      <div className="absolute bottom-0 right-0 flex items-center gap-4 text-[10px] font-mono">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-sky-500 rounded-full" />NanuqFi Router</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-500 rounded-full" />Single Protocol</span>
      </div>
    </div>
  )
}

function ProtocolCard({ name, detail, apy, tvl, color }: { name: string; detail: string; apy: string; tvl: string; color: string }) {
  const borderColors: Record<string, string> = { sky: 'hover:border-sky-500/30 hover:shadow-[0_0_30px_rgba(14,165,233,0.08)]', purple: 'hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]', amber: 'hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.08)]' }
  const textColors: Record<string, string> = { sky: 'text-sky-400', purple: 'text-purple-400', amber: 'text-amber-400' }
  const dotColors: Record<string, string> = { sky: 'bg-sky-400', purple: 'bg-purple-400', amber: 'bg-amber-400' }
  return (
    <GlassCard className={`p-5 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 cursor-default ${borderColors[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <p className="text-white font-semibold text-sm">{name}</p>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{detail}</p>
      <div className="flex items-baseline justify-between pt-3 border-t border-white/5">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">APY</p>
          <p className={`font-mono text-lg font-bold ${textColors[color]}`}>{apy}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">TVL</p>
          <p className="font-mono text-sm text-slate-300">{tvl}</p>
        </div>
      </div>
    </GlassCard>
  )
}

function DriftTimeline() {
  const { ref, inView } = useInView({ threshold: 0.2 })
  const events = [
    { time: 'April 1, 2026', event: 'Drift Protocol hacked — $285M exploit', color: 'bg-red-500', ringColor: 'ring-red-500/20' },
    { time: 'Hours later', event: 'Full pivot to Kamino / Marginfi / Lulo — protocol-agnostic architecture enabled instant migration', color: 'bg-amber-500', ringColor: 'ring-amber-500/20' },
    { time: 'Result', event: 'Architecture proven under real-world adversarial conditions. Generic allocate_to_protocol replaced all Drift-specific code.', color: 'bg-emerald-500', ringColor: 'ring-emerald-500/20' },
  ]
  return (
    <div ref={ref} className="space-y-0">
      {events.map((item, i) => (
        <div key={i} className="flex gap-4 items-start" style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateX(0)' : 'translateX(-20px)', transition: `all 600ms ${i * 300}ms ease-out` }}>
          <div className="flex flex-col items-center gap-0 pt-1.5">
            <span className={`w-3 h-3 rounded-full ${item.color} shrink-0 ring-4 ${item.ringColor}`} />
            {i < 2 && <span className="w-px h-12 bg-gradient-to-b from-white/10 to-transparent" />}
          </div>
          <div className="pb-6">
            <p className="text-xs font-mono text-slate-500 mb-1">{item.time}</p>
            <p className="text-slate-300 leading-relaxed text-sm">{item.event}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function DotGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%)',
      }} />
      <div className="absolute top-1/3 left-1/2 w-[90vw] h-[60vh] -translate-x-1/2 -translate-y-1/2" style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, rgba(8,11,17,0) 65%)' }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab content panels                                                 */
/* ------------------------------------------------------------------ */
function ThesisTab() {
  return (
    <FadeIn>
      <p className="text-slate-300 leading-relaxed mb-6">
        NanuqFi is a protocol-agnostic, AI-powered yield routing layer for
        Solana DeFi. Instead of depositing into a single protocol and hoping
        for the best, NanuqFi dynamically routes USDC across Kamino, Marginfi,
        and Lulo — choosing the optimal allocation based on real-time rates,
        risk constraints, and AI-driven market assessment.
      </p>
      <GlassCard className="p-6 mb-8">
        <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-4">The Edge</h3>
        <ul className="space-y-4">
          {[
            'Most yield protocols are single-strategy. NanuqFi routes across multiple protocols simultaneously.',
            'The AI keeper scans all protocol rates every cycle, identifies yield gaps, and proposes weight adjustments — validated by algorithmic guardrails before on-chain execution.',
            'Architecture survived a live stress test: when Drift Protocol was hacked ($285M, April 1 2026), NanuqFi\u2019s protocol-agnostic design enabled full pivot within hours. Zero user capital lost.',
          ].map((item) => (
            <li key={item} className="flex gap-3 text-slate-300 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
      <div className="grid sm:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Strategy Type</p>
          <p className="text-slate-200 text-sm leading-relaxed">
            AI-driven multi-protocol yield optimization<br />
            <span className="text-slate-400">Lending only — no impermanent loss, no leverage</span>
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target APY</p>
          <p className="font-mono text-2xl font-bold text-emerald-400">10–25%</p>
          <p className="text-xs text-slate-500 mt-1">Depending on risk tier, measured over 90-day rolling windows</p>
        </GlassCard>
      </div>
    </FadeIn>
  )
}

function MechanicsTab() {
  return (
    <FadeIn>
      <p className="text-slate-400 mb-4">How capital flows through the system:</p>
      <ProtocolFlowDiagram />

      <h3 className="text-lg font-semibold text-white mb-6 mt-10">Three-Layer Validation</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-10">
        {[
          { label: 'AI Layer', desc: 'Claude assesses market conditions, rate sustainability, and protocol health', accent: 'sky', icon: Cpu },
          { label: 'Algorithm', desc: 'Scoring matrix validates proposal against rate, volatility, TVL, and risk thresholds', accent: 'emerald', icon: Shield },
          { label: 'On-Chain', desc: 'Anchor program enforces guardrails — drawdown caps, whitelist, weight limits', accent: 'amber', icon: Link2 },
        ].map((layer, i) => {
          const Icon = layer.icon
          const borderColor = layer.accent === 'sky' ? 'border-sky-500/30' : layer.accent === 'emerald' ? 'border-emerald-500/30' : 'border-amber-500/30'
          const iconColor = layer.accent === 'sky' ? 'text-sky-400' : layer.accent === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
          const glowBg = layer.accent === 'sky' ? 'from-sky-500/5' : layer.accent === 'emerald' ? 'from-emerald-500/5' : 'from-amber-500/5'
          return (
            <div key={layer.label} className="flex items-stretch">
              <div className={`flex-1 p-5 border backdrop-blur-md rounded-2xl relative overflow-hidden ${borderColor} bg-white/[0.02] hover:bg-white/[0.04] transition-colors duration-300`}>
                <div className={`absolute inset-0 bg-gradient-to-b ${glowBg} to-transparent opacity-50`} />
                <div className="relative">
                  <Icon className={`w-5 h-5 ${iconColor} mb-3`} />
                  <p className="text-white font-semibold text-sm mb-1">{layer.label}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{layer.desc}</p>
                </div>
              </div>
              {i < 2 && <div className="hidden md:flex items-center px-2"><ArrowRight className="w-4 h-4 text-slate-600" /></div>}
              {i < 2 && <div className="flex md:hidden justify-center py-2"><ArrowRight className="w-4 h-4 text-slate-600 rotate-90" /></div>}
            </div>
          )
        })}
      </div>

      <h3 className="text-lg font-semibold text-white mb-4">Protocol Integrations</h3>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <ProtocolCard name="Kamino Finance" detail="USDC lending via REST API — zero SDK dependency" apy="7.2%" tvl="$1.2B" color="sky" />
        <ProtocolCard name="Marginfi" detail="USDC lending via MarginfiClient SDK — real on-chain bank data" apy="6.5%" tvl="$890M" color="purple" />
        <ProtocolCard name="Lulo" detail="Lending aggregator — routes across Kamino/MarginFi/Jupiter" apy="8.3%" tvl="$19.4M" color="amber" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-4">Keeper Architecture</h3>
      <GlassCard className="p-6">
        <ul className="space-y-3">
          {['Algorithm engine with scoring matrix (rate, volatility, TVL, protocol risk)', 'Claude AI layer for regime detection and sustainability assessment', 'Health monitor with cycle tracking, failure recovery, automatic alerts', 'Circuit breaker pattern for API failures (CLOSED → OPEN → HALF_OPEN)'].map((item) => (
            <li key={item} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />{item}
            </li>
          ))}
        </ul>
      </GlassCard>
    </FadeIn>
  )
}

function RiskTab() {
  return (
    <FadeIn>
      <p className="text-slate-400 mb-6">On-chain guardrails — enforced by program, not promises:</p>

      <GlassCard className="p-0 mb-10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-slate-500 font-medium px-6 py-3">Guardrail</th>
              <th className="text-left text-sky-400/80 font-medium px-6 py-3">Moderate</th>
              <th className="text-left text-amber-400/80 font-medium px-6 py-3">Aggressive</th>
            </tr>
          </thead>
          <tbody>
            {guardrails.map((g, i) => (
              <tr key={g.label} className={i < guardrails.length - 1 ? 'border-b border-white/5' : ''}>
                <td className="px-6 py-3 text-slate-300">{g.label}</td>
                <td className="px-6 py-3 font-mono text-slate-200">{g.moderate}</td>
                <td className="px-6 py-3 font-mono text-slate-200">{g.aggressive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      <div className="space-y-8 mb-12">
        {[
          { title: 'Drawdown Protection', icon: Shield, items: ['On-chain equity tracking (peakEquity, currentEquity, equity24hAgo)', 'Emergency halt instruction — keeper or admin can freeze all operations', 'Protocol whitelist — only approved protocols can receive allocations'] },
          { title: 'Position Sizing', icon: BarChart3, items: ['Weight-based allocation (0–100% per protocol, must sum to 100%)', 'No leverage — lending only, zero liquidation risk', 'Protocol diversification enforced by max single-asset cap'] },
          { title: 'Rebalancing Logic', icon: RefreshCw, items: ['AI proposes → algorithm validates → program enforces', 'Rebalance only when rate differential exceeds threshold (avoids churn)', 'Rebalance counter tracked on-chain for audit trail', 'Every rebalance emits an on-chain event with previous/new weights'] },
        ].map((section) => {
          const Icon = section.icon
          return (
            <div key={section.title}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><Icon className="w-4 h-4 text-sky-400" />{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Drift Hack — embedded in Risk tab */}
      <div className="relative rounded-2xl overflow-hidden p-8 mb-4">
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 40%, transparent 100%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400/80" />
            <span className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest">Live Stress Test</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-6">
            $285M Exploit.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">Zero User Capital Lost.</span>
          </h2>
          <DriftTimeline />
          <p className="text-xs text-slate-500 border-t border-white/5 pt-4">
            This is not a hypothetical scenario. This happened during active development, validating the core architectural thesis.
          </p>
        </div>
      </div>
    </FadeIn>
  )
}

function PerformanceTab() {
  return (
    <FadeIn>
      <h3 className="text-lg font-semibold text-white mb-6">
        Backtest Results <span className="text-sm font-normal text-slate-500 ml-2">90-day simulation</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard value={16.1} decimals={1} suffix="%" label="CAGR" sublabel="vs 5.5% single-protocol baseline" accent="sky" />
        <MetricCard value={2.95} decimals={2} suffix="" label="Sharpe Ratio" sublabel="> 1.0 is considered good" accent="white" />
        <MetricCard value={1.89} decimals={2} suffix="%" label="Max Drawdown" sublabel="worst peak-to-trough" accent="emerald" />
      </div>

      <GlassCard className="p-6 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">Cumulative Growth</h4>
          <span className="text-[10px] font-mono text-slate-500">90-day backtest period</span>
        </div>
        <GrowthCurve />
      </GlassCard>

      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-semibold text-white">Router vs Single Protocol</h4>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-sky-500 rounded-full" />NanuqFi</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-slate-600 rounded-full" />Baseline</span>
          </div>
        </div>
        {backtestMetrics.map((m) => (
          <ComparisonBar key={m.label} label={m.label} routerValue={m.router} baselineValue={m.baseline} unit={m.unit} maxValue={Math.max(m.router, m.baseline) * 1.3} />
        ))}
      </GlassCard>

      <p className="text-xs text-slate-500 leading-relaxed mb-10">
        Backtest uses calibrated synthetic data (Ornstein-Uhlenbeck process) fitted to observed protocol rate ranges. Live performance data at{' '}
        <a href="https://keeper.nanuqfi.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">keeper.nanuqfi.com</a>.
      </p>

      <h3 className="text-lg font-semibold text-white mb-4">Live Performance</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[{ value: 'Continuous', label: 'Keeper uptime' }, { value: '198+', label: 'Decisions logged' }, { value: '98.6%', label: 'Success rate' }, { value: '100%', label: 'Decisions viewable' }].map((stat) => (
          <GlassCard key={stat.label} className="p-4 text-center hover:scale-[1.02] transition-transform duration-300">
            <p className="font-mono text-xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </GlassCard>
        ))}
      </div>
    </FadeIn>
  )
}

function ArchitectureTab() {
  return (
    <FadeIn>
      <p className="text-slate-400 mb-6">Brief overview — judges will read code:</p>

      <h3 className="text-lg font-semibold text-white mb-4">Monorepo Packages</h3>
      <div className="space-y-2 mb-8">
        {[
          { pkg: '@nanuqfi/core', desc: 'Zero-dep interfaces, registry, router, circuit breaker', icon: Box },
          { pkg: '@nanuqfi/backend-marginfi', desc: 'Real Marginfi SDK integration', icon: Database },
          { pkg: '@nanuqfi/backend-kamino', desc: 'Zero-dep REST API integration', icon: Database },
          { pkg: '@nanuqfi/backend-lulo', desc: 'Lulo aggregator integration', icon: Database },
          { pkg: '@nanuqfi/backtest', desc: 'Historical simulation engine', icon: Activity },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.pkg} className="flex items-center gap-3 text-sm p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:border-white/[0.08] transition-colors">
              <Icon className="w-4 h-4 text-sky-400/60 shrink-0" />
              <code className="font-mono text-sky-400 shrink-0 text-xs">{item.pkg}</code>
              <span className="text-slate-600">—</span>
              <span className="text-slate-400">{item.desc}</span>
            </div>
          )
        })}
      </div>

      <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
      <div className="flex flex-wrap gap-2 mb-8">
        {techStack.map((tech) => (
          <span key={tech.name} className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${tech.color} transition-all duration-200 hover:scale-105`}>{tech.name}</span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <GlassCard className="p-4 text-center hover:scale-[1.02] transition-transform"><p className="font-mono text-lg font-bold text-white">27</p><p className="text-xs text-slate-500">Anchor instructions</p></GlassCard>
        <GlassCard className="p-4 text-center hover:scale-[1.02] transition-transform"><p className="font-mono text-lg font-bold text-white">824</p><p className="text-xs text-slate-500">Tests across 3 repos</p></GlassCard>
        <GlassCard className="p-4 text-center hover:scale-[1.02] transition-transform"><p className="font-mono text-lg font-bold text-white">CI/CD</p><p className="text-xs text-slate-500">GitHub Actions → GHCR → VPS</p></GlassCard>
      </div>

      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: CheckCircle2, value: '824', label: 'tests passing', color: 'text-emerald-400' },
            { icon: Shield, value: '27', label: 'on-chain instructions', color: 'text-sky-400' },
            { icon: Zap, value: '3', label: 'repositories', color: 'text-amber-400' },
            { icon: Activity, value: 'Green', label: 'CI/CD pipeline', color: 'text-emerald-400' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
                <div><p className="font-mono text-sm font-bold text-white">{item.value}</p><p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</p></div>
              </div>
            )
          })}
        </div>
      </div>
    </FadeIn>
  )
}

function LinksTab() {
  return (
    <FadeIn>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link) => {
          const Icon = link.icon
          const isLive = link.label === 'Dashboard' || link.label === 'AI Activity Log'
          return (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              className={['group relative p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5',
                isLive ? 'border-sky-500/20 bg-sky-500/[0.03] hover:border-sky-500/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'border-white/[0.04] bg-white/[0.015] hover:border-white/[0.1] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]',
              ].join(' ')}>
              <div className="flex items-start gap-3">
                <Icon className={['w-5 h-5 shrink-0 mt-0.5 transition-colors', isLive ? 'text-sky-400 group-hover:text-sky-300' : 'text-slate-500 group-hover:text-white'].join(' ')} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white flex items-center gap-2">{link.label}{isLive && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                  <p className="font-mono text-[10px] text-slate-600 mt-1.5 truncate">{link.href.replace('https://', '')}</p>
                </div>
              </div>
              <ExternalLink className="absolute top-4 right-4 w-3 h-3 text-slate-700 group-hover:text-slate-500 transition-colors" />
            </a>
          )
        })}
      </div>
    </FadeIn>
  )
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<TabId>('thesis')

  const tabContent: Record<TabId, React.ReactNode> = {
    thesis: <ThesisTab />,
    mechanics: <MechanicsTab />,
    risk: <RiskTab />,
    performance: <PerformanceTab />,
    architecture: <ArchitectureTab />,
    links: <LinksTab />,
  }

  return (
    <>
      <title>Strategy Documentation — NanuqFi</title>

      <main className="max-w-4xl mx-auto px-6 lg:px-8">

        {/* Hero */}
        <section className="relative pt-20 pb-12 overflow-hidden">
          <DotGrid />
          <div className="relative z-10">
            <FadeIn>
              <span className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/[0.03] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[10px] font-mono text-sky-300/80 tracking-wider uppercase">Ranger Build-A-Bear Hackathon — April 2026</span>
              </span>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-4">
                <span className="bg-gradient-to-br from-[#0EA5E9] via-sky-200 to-white bg-clip-text text-transparent">NanuqFi</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-light mb-2">The Yield Routing Layer for DeFi</p>
              <p className="text-sm text-slate-500 mb-10 max-w-lg">Deposit USDC. Pick a risk level. Let AI route your capital to the best yield across Kamino, Marginfi, and Lulo.</p>
            </FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CountUpStat end={824} label="Tests" />
              <CountUpStat end={27} label="Instructions" />
              <CountUpStat end={3} label="Protocols" />
              <CountUpStat end={16.1} decimals={1} suffix="%" label="CAGR" />
            </div>
          </div>
        </section>

        {/* Tab Bar — sticky below top nav */}
        <div className="sticky top-[88px] z-40 -mx-6 lg:-mx-8 px-6 lg:px-8 py-3 bg-[#080B11]/90 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5 overflow-x-auto">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer',
                  activeTab === id
                    ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="py-10 min-h-[60vh]" key={activeTab}>
          {tabContent[activeTab]}
        </div>

        {/* Footer */}
        <div className="mt-8 mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <footer className="text-center">
            <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Nanuq<span className="text-sky-500">Fi</span></span>
            <p className="text-xs text-slate-600 mt-2">Yield, Routed. Built on Solana.</p>
          </footer>
        </div>
      </main>
    </>
  )
}
