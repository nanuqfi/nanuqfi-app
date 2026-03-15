import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, Stat, Badge } from '@/components'
import {
  mockVaults,
  formatUsd,
  formatApy,
  getTotalTvl,
  getWeightedApy,
} from '@/lib/mock-data'

export default function DashboardPage() {
  const totalTvl = getTotalTvl()
  const avgApy = getWeightedApy()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Yield, Routed. Real-time protocol overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <Stat
            label="Total Value Locked"
            value={formatUsd(totalTvl)}
            trend="up"
          />
        </Card>
        <Card>
          <Stat
            label="Weighted Avg APY"
            value={formatApy(avgApy)}
            subValue="across all vaults"
            trend="up"
          />
        </Card>
        <Card>
          <Stat
            label="Active Vaults"
            value={String(mockVaults.length)}
            subValue="conservative to aggressive"
            trend="neutral"
          />
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vaults</h2>
          <Link
            href="/vaults"
            className="flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {mockVaults.map((vault) => (
            <Link
              key={vault.riskLevel}
              href={`/vaults/${vault.riskLevel}`}
            >
              <Card className="transition-colors duration-150 hover:border-slate-600">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge level={vault.riskLevel} />
                    <span className="font-mono text-xs text-slate-400">
                      {formatApy(vault.apy)} APY
                    </span>
                  </div>

                  <div>
                    <p className="font-mono text-2xl font-bold">
                      {formatUsd(vault.tvl)}
                    </p>
                    <p className="text-sm text-slate-400">Total Value Locked</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      {Object.keys(vault.weights).length} sources
                    </span>
                    <span className="flex items-center gap-1 text-sky-400">
                      Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
