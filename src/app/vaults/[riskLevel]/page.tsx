import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bot, Cpu, Clock, ShieldCheck } from 'lucide-react'
import { Card, Badge, Button, ProgressBar, Stat } from '@/components'
import {
  mockVaults,
  mockDecisions,
  formatUsd,
  formatApy,
  formatPct,
  formatRelativeTime,
  sourceDisplayName,
  type RiskLevel,
} from '@/lib/mock-data'

const validRiskLevels: RiskLevel[] = ['conservative', 'moderate', 'aggressive']

export function generateStaticParams() {
  return validRiskLevels.map((riskLevel) => ({ riskLevel }))
}

const allocationColors: Record<string, string> = {
  'drift-lending': 'sky',
  'drift-insurance': 'emerald',
  'drift-basis': 'amber',
  'drift-funding': 'red',
  'drift-jito-dn': 'sky',
}

export default async function VaultDetailPage({
  params,
}: {
  params: Promise<{ riskLevel: string }>
}) {
  const { riskLevel } = await params

  if (!validRiskLevels.includes(riskLevel as RiskLevel)) {
    notFound()
  }

  const vault = mockVaults.find(v => v.riskLevel === riskLevel)
  if (!vault) notFound()

  const vaultDecisions = mockDecisions
    .filter(d => d.vault === riskLevel)
    .slice(0, 5)

  const lastDecision = vaultDecisions[0]

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/vaults"
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vaults
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Badge level={vault.riskLevel} />
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {vault.riskLevel} Vault
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary">Deposit USDC</Button>
          <Button variant="secondary">Withdraw</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <Stat
            label="Total Value Locked"
            value={formatUsd(vault.tvl)}
            trend="up"
          />
        </Card>
        <Card>
          <Stat
            label="Current APY"
            value={formatApy(vault.apy)}
            trend="up"
          />
        </Card>
        <Card>
          <Stat
            label="Current Drawdown"
            value={formatPct(vault.drawdown * 100)}
            subValue={`max ${formatPct(vault.guardrails.maxDrawdown)}`}
            trend="neutral"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card header={
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-400" />
            Allocation Breakdown
          </h2>
        }>
          <div className="space-y-4">
            {Object.entries(vault.weights).map(([source, weight]) => (
              <ProgressBar
                key={source}
                label={sourceDisplayName(source)}
                value={weight}
                max={100}
                color={allocationColors[source] as 'emerald' | 'sky' | 'amber' | 'red' | undefined}
              />
            ))}
          </div>
        </Card>

        <Card header={
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Guardrails
          </h2>
        }>
          <div className="space-y-6">
            <ProgressBar
              label="Max Drawdown"
              value={vault.guardrails.currentDrawdown}
              max={vault.guardrails.maxDrawdown}
            />
            {vault.guardrails.maxPerp > 0 && (
              <ProgressBar
                label="Perp Exposure"
                value={vault.guardrails.currentPerp}
                max={vault.guardrails.maxPerp}
              />
            )}
            {vault.guardrails.maxPerp === 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                No perpetual exposure — lending and insurance only
              </div>
            )}
          </div>
        </Card>
      </div>

      {lastDecision && (
        <Card header={
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cpu className="h-5 w-5 text-sky-400" />
            Last Keeper Decision
          </h2>
        }>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-slate-700 px-3 py-1 text-sm font-medium">
                {lastDecision.action}
              </span>
              {lastDecision.aiInvolved && (
                <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400 border border-sky-500/20">
                  <Bot className="h-3 w-3" />
                  AI Assisted
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-slate-400">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(lastDecision.timestamp)}
              </span>
            </div>

            <p className="text-slate-200">{lastDecision.summary}</p>
            <p className="text-sm text-slate-400">{lastDecision.reason}</p>

            {lastDecision.weightChanges.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">Weight Changes</p>
                <div className="space-y-1">
                  {lastDecision.weightChanges.map((change, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">{sourceDisplayName(change.source)}</span>
                      <span className="font-mono text-red-400">{change.from}%</span>
                      <span className="text-slate-500">&rarr;</span>
                      <span className="font-mono text-emerald-400">{change.to}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card header={
        <h2 className="text-lg font-semibold">Recent Rebalance History</h2>
      }>
        <div className="divide-y divide-slate-700">
          {vaultDecisions.map((decision) => (
            <div key={decision.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
              <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                decision.aiInvolved ? 'bg-sky-500/10' : 'bg-slate-700'
              }`}>
                {decision.aiInvolved
                  ? <Bot className="h-4 w-4 text-sky-400" />
                  : <Cpu className="h-4 w-4 text-slate-400" />
                }
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200">{decision.action}</span>
                  <span className="text-xs text-slate-500">
                    {formatRelativeTime(decision.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{decision.summary}</p>
                {decision.weightChanges.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {decision.weightChanges.map((change, i) => (
                      <span key={i} className="font-mono text-xs text-slate-500">
                        {sourceDisplayName(change.source)}: {change.from}% &rarr; {change.to}%
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {vaultDecisions.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">
              No recent activity for this vault.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
