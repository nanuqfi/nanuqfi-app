import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, Badge, Button } from '@/components'
import {
  mockVaults,
  mockYields,
  formatUsd,
  formatApy,
  sourceDisplayName,
} from '@/lib/mock-data'

const riskColors = {
  conservative: 'bg-emerald-500',
  moderate: 'bg-sky-500',
  aggressive: 'bg-amber-500',
} as const

export default function VaultsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vaults</h1>
        <p className="mt-1 text-slate-400">
          Choose your risk tier. Every allocation is transparent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockVaults.map((vault) => {
          const weightEntries = Object.entries(vault.weights)

          return (
            <Card key={vault.riskLevel}>
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Badge level={vault.riskLevel} />
                    <span className="text-lg font-semibold capitalize">
                      {vault.riskLevel} Vault
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-400">TVL</p>
                      <p className="font-mono text-lg font-bold">{formatUsd(vault.tvl)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">APY</p>
                      <p className="font-mono text-lg font-bold text-emerald-400">
                        {formatApy(vault.apy)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-300">Allocation Breakdown</p>
                  <div className="flex h-3 w-full overflow-hidden rounded-full">
                    {weightEntries.map(([source, weight]) => (
                      <div
                        key={source}
                        className={`${riskColors[vault.riskLevel]} first:rounded-l-full last:rounded-r-full`}
                        style={{
                          width: `${weight}%`,
                          opacity: 0.4 + (weight / 100) * 0.6,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {weightEntries.map(([source, weight]) => {
                      const yieldSource = mockYields.find(y => y.slug === source)
                      return (
                        <div key={source} className="flex items-center gap-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${riskColors[vault.riskLevel]}`} />
                          <span className="text-slate-400">{sourceDisplayName(source)}</span>
                          <span className="font-mono text-slate-200">{weight}%</span>
                          {yieldSource && (
                            <span className="font-mono text-xs text-slate-500">
                              ({formatApy(yieldSource.currentApy)})
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/vaults/${vault.riskLevel}`}>
                    <Button variant="primary" size="sm" className="gap-2">
                      View Details <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm">
                    Deposit
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
