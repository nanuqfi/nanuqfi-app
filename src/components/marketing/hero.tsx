'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Github, Sparkles } from 'lucide-react'
import { FadeIn } from '@/components/ui/fade-in'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* --- Background layers --- */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        {/* Ambient radial glow */}
        <div
          className="absolute top-1/2 left-1/2 w-[80vw] h-[80vh] -translate-x-1/2 -translate-y-1/2 animate-[corePulse_8s_ease-in-out_infinite_alternate]"
          style={{
            background:
              'radial-gradient(circle, rgba(14,165,233,0.15) 0%, rgba(8,11,17,0) 60%)',
          }}
        />

        {/* Perspective grid mesh */}
        <div
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-60 animate-[gridFlow_30s_linear_infinite]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            transform:
              'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            transformOrigin: 'center center',
            maskImage:
              'radial-gradient(circle at center, black 10%, transparent 60%)',
            WebkitMaskImage:
              'radial-gradient(circle at center, black 10%, transparent 60%)',
          }}
        />

        {/* Routing line animations */}
        <div className="routing-line line-1" />
        <div className="routing-line line-2" />
        <div className="routing-line line-3" />
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-32 w-full bg-gradient-to-t from-[#080B11] to-transparent"
        aria-hidden="true"
      />

      {/* --- Content --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 pt-24 pb-16 max-w-6xl mx-auto w-full">
        {/* Status badge */}
        <FadeIn>
          <span className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/20 bg-sky-500/[0.03] backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span className="text-xs font-mono text-sky-300 tracking-wider">
              AI ROUTING ENGINE ONLINE
            </span>
          </span>
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={100}>
          <h1 className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-black leading-[0.95] tracking-tight mb-6 hero-glow">
            <span className="bg-gradient-to-br from-[#0EA5E9] via-sky-200 to-white bg-clip-text text-transparent">
              Yield,
            </span>
            <br />
            <span className="bg-gradient-to-tr from-white via-slate-200 to-slate-500 bg-clip-text text-transparent opacity-90">
              Routed.
            </span>
          </h1>
        </FadeIn>

        {/* Subtitle */}
        <FadeIn delay={200}>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
            AI-powered yield routing across Solana DeFi.{' '}
            <span className="text-slate-200 font-medium">Deposit USDC.</span>{' '}
            Pick your risk. Let the protocol work.
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={300}>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 w-full sm:w-auto">
            <Link
              href="/app"
              className="glass-btn group w-full sm:w-auto px-8 py-4 rounded-xl bg-sky-500/15 border border-sky-500/30 backdrop-blur-md flex items-center justify-center gap-3 font-semibold text-white tracking-wide transition-all duration-300 hover:bg-sky-500/20 hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:-translate-y-0.5"
            >
              Launch App
              <ArrowRight className="w-4 h-4 text-sky-300 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/strategy"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 flex items-center justify-center gap-3 text-slate-300 transition-all duration-300 hover:bg-white/5 hover:border-white/40 hover:-translate-y-0.5"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Strategy Docs</span>
            </Link>

            <a
              href="https://github.com/nanuqfi/nanuqfi"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 flex items-center justify-center gap-3 text-slate-300 transition-all duration-300 hover:bg-white/5 hover:border-white/40 hover:-translate-y-0.5"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHub</span>
            </a>
          </div>
        </FadeIn>

        {/* Stat cards */}
        <FadeIn delay={400}>
          <div className="w-full max-w-4xl relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              <StatCard label="Total Value Locked">
                <AnimatedCounter
                  end={260}
                  prefix="$"
                  className="text-3xl lg:text-4xl font-bold text-white tracking-tight"
                />
              </StatCard>

              <StatCard label="Weighted APY" pulse>
                <span className="flex items-baseline gap-1">
                  <AnimatedCounter
                    end={14.2}
                    decimals={1}
                    className="text-3xl lg:text-4xl font-bold text-white tracking-tight"
                  />
                  <span className="font-mono text-xl text-slate-400 font-medium">
                    %
                  </span>
                </span>
              </StatCard>

              <StatCard label="Active Protocols">
                <span className="flex items-center gap-3">
                  <AnimatedCounter
                    end={3}
                    prefix="0"
                    className="text-3xl lg:text-4xl font-bold text-white tracking-tight"
                  />
                  <span className="flex flex-col gap-1">
                    <span className="w-8 h-0.5 bg-sky-500/40 rounded-full" />
                    <span className="w-6 h-0.5 bg-slate-600 rounded-full" />
                    <span className="w-10 h-0.5 bg-slate-700 rounded-full" />
                  </span>
                </span>
              </StatCard>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function StatCard({
  label,
  pulse,
  children,
}: {
  label: string
  pulse?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-white/[0.02] bg-white/[0.01] rounded-2xl backdrop-blur-sm relative overflow-hidden group hover:border-white/[0.08] transition-colors">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center gap-1.5 mb-3">
        {pulse && (
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        )}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
