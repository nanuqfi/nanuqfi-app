'use client'

import { TrendingUp, CheckCircle, Zap } from 'lucide-react'
import { Card } from '@/components'
import { useMarketScan } from '@/hooks/use-keeper-api'
import type { MarketScanOpportunity } from '@/hooks/use-keeper-api'

function formatApy(apy: number): string {
  return `${(apy * 100).toFixed(1)}%`
}

function RiskBadge({ risk }: { risk: string }) {
  const colors = {
    low: 'bg-emerald-500/10 text-emerald-400',
    medium: 'bg-amber-500/10 text-amber-400',
    high: 'bg-red-500/10 text-red-400',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[risk as keyof typeof colors] ?? colors.medium}`}>
      {risk}
    </span>
  )
}

function OpportunityRow({ opp, baseApy }: { opp: MarketScanOpportunity; baseApy: number }) {
  const gap = opp.apy - baseApy
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
          <TrendingUp className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{opp.protocol}</p>
          <p className="text-xs text-slate-500">{opp.strategy}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div>
          <p className="font-mono text-sm font-bold text-amber-400">{formatApy(opp.apy)}</p>
          <p className="text-[10px] text-slate-500">vs current {formatApy(baseApy)}</p>
        </div>
        <div>
          <p className="font-mono text-xs text-emerald-400">+{formatApy(gap)}</p>
        </div>
        <RiskBadge risk={opp.risk} />
      </div>
    </div>
  )
}

export function YieldOpportunityAlerts() {
  const scan = useMarketScan()

  const data = scan.data && 'opportunities' in scan.data ? scan.data : null
  if (!data) return null

  const { driftComparison, opportunities } = data
  const currentBestApy = driftComparison.driftBestApy
  const hasYieldGap = driftComparison.marketBestApy > currentBestApy * 1.5

  // Find top 3 opportunities that beat current best
  const betterYields = opportunities
    .filter((o: MarketScanOpportunity) => o.apy > currentBestApy)
    .slice(0, 3)

  if (!hasYieldGap || betterYields.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-400">Current Protocols Are Competitive</p>
            <p className="text-xs text-slate-500">
              No significantly better yields detected across {driftComparison.totalScanned} protocols scanned.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card header={
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400 animate-pulse" />
          Better Yields Detected
        </h2>
        <span className="text-xs text-slate-500">
          {driftComparison.totalScanned} protocols scanned
        </span>
      </div>
    }>
      <div className="divide-y divide-slate-700">
        {betterYields.map((opp: MarketScanOpportunity, i: number) => (
          <OpportunityRow
            key={i}
            opp={opp}
            baseApy={currentBestApy}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500 text-center">
        NanuqFi monitors {driftComparison.totalScanned}+ protocols for optimal rotation opportunities
      </p>
    </Card>
  )
}
