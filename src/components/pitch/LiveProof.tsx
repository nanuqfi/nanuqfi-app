'use client'

import { FadeIn } from '@/components/pitch/FadeIn'
import { PulseDot } from '@/components/pitch/PulseDot'
import {
  useKeeperHealth,
  useYieldEstimates,
  useKeeperDecisions,
  useMarketScan,
  useAIInsight,
} from '@/hooks/use-keeper-api'
import { AIInsightCard } from '@/components/ai-insight-card'
import fallbackData from '@/data/fallback-keeper-data.json'

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000)
  const days = Math.floor(hours / 24)
  const h = hours % 24
  return days > 0 ? `${days}d ${h}h` : `${h}h`
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function pct(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// ─── Shared card shell ────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
      {children}
    </div>
  )
}

function CardTitle({
  children,
  live,
  fallback,
}: {
  children: React.ReactNode
  live: boolean
  fallback?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
        {children}
      </span>
      {fallback ? (
        <span className="text-slate-500 text-xs" title="Showing cached data">
          🕐
        </span>
      ) : live ? (
        <PulseDot />
      ) : null}
    </div>
  )
}

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`text-sm font-mono font-medium ${
          highlight ? 'text-emerald-400' : 'text-slate-200'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Card 1: Keeper Status ────────────────────────────────────────────────────

function KeeperStatusCard() {
  const { data, loading } = useKeeperHealth()
  const isFallback = data === null

  const uptime = isFallback
    ? fallbackData.health.uptime
    : data.uptime
  const rpcStatus = isFallback ? fallbackData.health.rpcStatus : data.rpcStatus
  const aiStatus = isFallback ? fallbackData.health.aiLayerStatus : 'available'
  const cycles = isFallback ? fallbackData.health.cyclesCompleted : null
  const failures = isFallback ? fallbackData.health.cyclesFailed : null

  return (
    <Card>
      <CardTitle live={!loading && !isFallback} fallback={isFallback}>
        Keeper Status
      </CardTitle>
      <div className="flex flex-col gap-2">
        <MetricRow label="Uptime" value={formatUptime(uptime)} highlight />
        {cycles !== null && (
          <MetricRow label="Cycles completed" value={cycles.toLocaleString()} />
        )}
        {failures !== null && (
          <MetricRow
            label="Failures"
            value={failures === 0 ? '0 ✓' : String(failures)}
            highlight={failures === 0}
          />
        )}
        <MetricRow
          label="RPC"
          value={rpcStatus === 'healthy' ? 'Healthy' : rpcStatus}
          highlight={rpcStatus === 'healthy'}
        />
        <MetricRow
          label="AI layer"
          value={aiStatus === 'available' ? 'Available' : aiStatus}
          highlight={aiStatus === 'available'}
        />
      </div>
      {isFallback && (
        <p className="text-xs text-slate-600 mt-1">
          Last updated: Mar 30, 2026
        </p>
      )}
    </Card>
  )
}

// ─── Card 2: Live Yields ──────────────────────────────────────────────────────

function LiveYieldsCard() {
  const { data, loading } = useYieldEstimates()
  const isFallback = data === null

  const fb = fallbackData.yields

  // useYieldEstimates returns { live: { usdcLendingRate, ... } } — extract the live object
  const raw = data as Record<string, unknown> | null
  const live = raw && typeof raw === 'object' && 'live' in raw
    ? raw.live as Record<string, number>
    : null

  const usdcLending = live?.usdcLendingRate ?? fb.usdcLendingRate
  const solFunding = live?.solFundingRate ?? fb.solFundingRate
  const solBorrow = live?.solBorrowRate ?? fb.solBorrowRate
  const jitoYield = live?.jitoStakingYield ?? fb.jitoStakingYield

  return (
    <Card>
      <CardTitle live={!loading && !isFallback} fallback={isFallback}>
        Live Yields
      </CardTitle>
      <div className="flex flex-col gap-2">
        <MetricRow
          label="USDC Lending"
          value={usdcLending !== null ? pct(usdcLending) : '—'}
          highlight={usdcLending !== null && usdcLending > 0}
        />
        <MetricRow
          label="SOL Funding"
          value={solFunding !== null ? pct(solFunding) : '—'}
          highlight={solFunding !== null && solFunding > 0}
        />
        <MetricRow
          label="SOL Borrow"
          value={solBorrow !== null ? pct(solBorrow) : '—'}
          highlight={solBorrow !== null && solBorrow > 0}
        />
        <MetricRow
          label="JitoSOL Yield"
          value={jitoYield !== null ? pct(jitoYield) : '—'}
          highlight={jitoYield !== null && jitoYield > 0}
        />
      </div>
      {isFallback && (
        <p className="text-xs text-slate-600 mt-1">
          Last updated: Mar 30, 2026
        </p>
      )}
    </Card>
  )
}

// ─── Card 3: Last Keeper Decision ────────────────────────────────────────────

const RISK_BADGE: Record<string, string> = {
  conservative: 'bg-sky-900/60 text-sky-400 border border-sky-800',
  moderate: 'bg-amber-900/60 text-amber-400 border border-amber-800',
  aggressive: 'bg-red-900/60 text-red-400 border border-red-800',
}

function LastDecisionCard() {
  const { data, loading } = useKeeperDecisions('moderate')
  const isFallback = data === null

  // Live path: use the most recent transformed decision
  const liveDecision = isFallback ? null : data[0] ?? null

  // Fallback path: use first entry in fallback decisions array
  const fbDecision = fallbackData.decisions[0]
  const fbWeights = fbDecision?.weights ?? {}
  const fbTopTwo = Object.entries(fbWeights)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)

  const riskLevel = isFallback ? fbDecision?.riskLevel : 'moderate'
  const badgeClass = RISK_BADGE[riskLevel ?? 'moderate'] ?? RISK_BADGE.moderate

  return (
    <Card>
      <CardTitle live={!loading && !isFallback} fallback={isFallback}>
        Last Keeper Decision
      </CardTitle>

      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}
        >
          {(riskLevel ?? 'moderate').charAt(0).toUpperCase() +
            (riskLevel ?? 'moderate').slice(1)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {isFallback ? (
          fbTopTwo.map(([key, weight]) => (
            <MetricRow
              key={key}
              label={key.replace(/^drift-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              value={`${(weight / 100).toFixed(1)}%`}
              highlight={weight > 5000}
            />
          ))
        ) : liveDecision ? (
          liveDecision.weightChanges.slice(0, 2).map((wc) => (
            <MetricRow
              key={wc.source}
              label={wc.source
                .replace(/^drift-/, '')
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              value={`${wc.to.toFixed(1)}%`}
              highlight={wc.to > 50}
            />
          ))
        ) : (
          <p className="text-xs text-slate-600">No decisions yet</p>
        )}
      </div>

      <p className="text-xs text-slate-600">
        {isFallback
          ? `Last updated: Mar 30, 2026`
          : liveDecision
            ? timeAgo(new Date(liveDecision.timestamp).getTime())
            : '—'}
      </p>
    </Card>
  )
}

// ─── Card 4: DeFi Scanner ────────────────────────────────────────────────────

function ScannerCard() {
  const { data, loading } = useMarketScan()
  const isFallback = data === null

  const ms = fallbackData.marketScan
  const totalScanned = isFallback ? ms.totalScanned : data.driftComparison.totalScanned
  const driftRank = isFallback ? ms.driftRank : data.driftComparison.driftRank
  const top3 = isFallback
    ? ms.topOpportunities.slice(0, 3)
    : data.opportunities.slice(0, 3).map((o) => ({
        protocol: o.protocol,
        asset: o.asset,
        apy: o.apy,
      }))

  function protocolLabel(name: string): string {
    return name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  return (
    <Card>
      <CardTitle live={!loading && !isFallback} fallback={isFallback}>
        Yield Scanner
      </CardTitle>

      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-emerald-400">
          {totalScanned}
        </span>
        <span className="text-xs text-slate-500">protocols scanned</span>
        {driftRank && (
          <span className="ml-auto text-xs text-slate-500">
            Drift rank{' '}
            <span className="text-slate-300 font-medium">#{driftRank}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {top3.map((opp, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-slate-600 font-mono w-4">
                #{i + 1}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {protocolLabel(opp.protocol)}
              </span>
              <span className="text-xs text-slate-600">{opp.asset}</span>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-400 ml-2 shrink-0">
              {pct(opp.apy)}
            </span>
          </div>
        ))}
      </div>

      {isFallback && (
        <p className="text-xs text-slate-600 mt-1">
          Last updated: Mar 30, 2026
        </p>
      )}
    </Card>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function LiveProof() {
  const aiInsight = useAIInsight()

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <FadeIn>
        <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
          Live System
          <PulseDot />
        </h2>
        <p className="text-slate-400 text-center mt-3">
          Real-time data from the keeper bot running on our VPS.
        </p>
      </FadeIn>

      <div className="mt-12">
        <FadeIn delay={100}>
          <AIInsightCard
            insight={aiInsight.data?.insight ?? null}
            available={aiInsight.data?.available ?? false}
          />
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <FadeIn delay={100}><KeeperStatusCard /></FadeIn>
        <FadeIn delay={200}><LiveYieldsCard /></FadeIn>
        <FadeIn delay={300}><LastDecisionCard /></FadeIn>
        <FadeIn delay={400}><ScannerCard /></FadeIn>
      </div>
    </section>
  )
}
