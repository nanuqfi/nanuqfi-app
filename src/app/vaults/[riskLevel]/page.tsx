'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bot, Cpu, Clock, ShieldCheck, Wallet, AlertCircle } from 'lucide-react'
import { Transaction } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { Card, Badge, Button, ProgressBar, Stat } from '@/components'
import { useRiskVault, useUserPosition, useUsdcBalance } from '@/hooks/use-allocator'
import { useVaultData, useKeeperDecisions } from '@/hooks/use-keeper-api'
import {
  buildDepositInstruction,
  buildRequestWithdrawInstruction,
  buildWithdrawInstruction,
} from '@/lib/transactions'
import { parseAllocatorError } from '@/lib/errors'
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

// ─── Constants ──────────────────────────────────────────────────────────────

const RISK_LEVEL_MAP: Record<string, number> = {
  conservative: 0,
  moderate: 1,
  aggressive: 2,
}

const validRiskLevels: RiskLevel[] = ['moderate', 'aggressive']

const allocationColors: Record<string, string> = {
  'drift-lending': 'sky',
  'drift-insurance': 'emerald',
  'drift-basis': 'amber',
  'drift-funding': 'red',
  'drift-jito-dn': 'sky',
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-700 ${className}`} />
}

// ─── Deposit Form ───────────────────────────────────────────────────────────

function DepositForm({
  riskLevelNum,
  onSuccess,
}: {
  riskLevelNum: number
  onSuccess: () => void
}) {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const usdcBalance = useUsdcBalance()
  const [depositAmount, setDepositAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const balanceDisplay = usdcBalance.data !== null
    ? Number(usdcBalance.data) / 1e6
    : null

  async function handleDeposit() {
    const amount = Number(depositAmount)
    if (!publicKey || !amount || amount <= 0) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const ix = await buildDepositInstruction(
        publicKey,
        riskLevelNum,
        BigInt(Math.round(amount * 1e6))
      )
      const tx = new Transaction().add(ix)
      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setSuccess(true)
      setDepositAmount('')
      onSuccess()
    } catch (err) {
      setError(parseAllocatorError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-300">Deposit USDC</p>
        {balanceDisplay !== null && (
          <button
            type="button"
            onClick={() => setDepositAmount(String(balanceDisplay))}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Balance: <span className="font-mono">{formatUsd(balanceDisplay)}</span>
          </button>
        )}
      </div>
      <input
        type="number"
        placeholder="USDC amount"
        min="0"
        step="0.01"
        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 font-mono text-slate-50 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
      />
      <Button
        onClick={handleDeposit}
        disabled={!publicKey || loading || !depositAmount || Number(depositAmount) <= 0}
        className="w-full"
      >
        {loading ? 'Depositing...' : 'Deposit USDC'}
      </Button>
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Deposit confirmed. Refreshing...
        </div>
      )}
    </div>
  )
}

// ─── Withdraw Section ───────────────────────────────────────────────────────

function WithdrawSection({
  riskLevelNum,
  riskLevel,
  onSuccess,
}: {
  riskLevelNum: number
  riskLevel: string
  onSuccess: () => void
}) {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const position = useUserPosition(riskLevelNum)
  const vault = useRiskVault(riskLevelNum)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!publicKey || !position.data) return null

  const shares = position.data.shares
  const pendingShares = position.data.pendingWithdrawalShares
  const hasPending = pendingShares > 0n
  const hasShares = shares > 0n

  if (!hasShares && !hasPending) return null

  const sharePrice = vault.data?.sharePrice ?? 1
  const currentValue = Number(shares) / 1e6 * sharePrice

  async function handleRequestWithdraw() {
    if (!publicKey || shares <= 0n) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const ix = await buildRequestWithdrawInstruction(publicKey, riskLevelNum, shares)
      const tx = new Transaction().add(ix)
      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setSuccess(true)
      onSuccess()
    } catch (err) {
      setError(parseAllocatorError(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteWithdraw() {
    if (!publicKey) return
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const ix = await buildWithdrawInstruction(publicKey, riskLevelNum)
      const tx = new Transaction().add(ix)
      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setSuccess(true)
      onSuccess()
    } catch (err) {
      setError(parseAllocatorError(err))
    } finally {
      setLoading(false)
    }
  }

  // Determine withdrawal state
  // Pending withdrawal: check if redemption period has elapsed
  // We don't have current slot from this context so we show both buttons
  // and let the on-chain program enforce the timing
  const redemptionSlots = vault.data?.redemptionPeriodSlots ?? 0n

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-300">Withdraw</p>

      {hasShares && !hasPending && (
        <>
          <div className="rounded-lg bg-slate-900/50 px-3 py-2 text-sm">
            <span className="text-slate-400">Position value: </span>
            <span className="font-mono text-slate-200">{formatUsd(currentValue)}</span>
            <span className="text-slate-500 ml-2">
              ({(Number(shares) / 1e6).toFixed(2)} shares)
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={handleRequestWithdraw}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Requesting...' : 'Request Withdrawal'}
          </Button>
          <p className="text-xs text-slate-500">
            Two-phase withdrawal: request first, then complete after the
            {redemptionSlots > 0n ? ` ${Number(redemptionSlots)} slot` : ''} redemption period.
          </p>
        </>
      )}

      {hasPending && (
        <>
          <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
            Pending withdrawal: {(Number(pendingShares) / 1e6).toFixed(2)} shares
          </div>
          <Button
            variant="primary"
            onClick={handleCompleteWithdraw}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Completing...' : 'Complete Withdrawal'}
          </Button>
          <p className="text-xs text-slate-500">
            If the redemption period has not elapsed, this transaction will fail with a clear error.
          </p>
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Transaction confirmed. Refreshing...
        </div>
      )}
    </div>
  )
}

// ─── Decision Item ──────────────────────────────────────────────────────────

interface DecisionDisplay {
  id: string
  timestamp: string
  action: string
  summary: string
  weightChanges: { source: string; from: number; to: number }[]
  aiInvolved: boolean
  reason: string
}

function DecisionItem({ decision }: { decision: DecisionDisplay }) {
  return (
    <div className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
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
          {decision.aiInvolved && (
            <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400 border border-sky-500/20">
              <Bot className="h-3 w-3" />
              AI
            </span>
          )}
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
  )
}

// ─── Vault Detail Page ──────────────────────────────────────────────────────

export default function VaultDetailPage() {
  const params = useParams<{ riskLevel: string }>()
  const riskLevel = params.riskLevel as RiskLevel

  // Validate risk level
  if (!validRiskLevels.includes(riskLevel)) {
    return (
      <div className="space-y-4 text-center py-20">
        <h1 className="text-2xl font-bold text-slate-200">Vault Not Found</h1>
        <p className="text-slate-400">
          {riskLevel === 'conservative'
            ? 'Conservative vault is not available during hackathon.'
            : 'Invalid risk level.'}
        </p>
        <Link href="/vaults">
          <Button variant="secondary">Back to Vaults</Button>
        </Link>
      </div>
    )
  }

  const riskLevelNum = RISK_LEVEL_MAP[riskLevel]!

  return <VaultDetailContent riskLevel={riskLevel} riskLevelNum={riskLevelNum} />
}

function VaultDetailContent({
  riskLevel,
  riskLevelNum,
}: {
  riskLevel: RiskLevel
  riskLevelNum: number
}) {
  const { publicKey } = useWallet()

  // On-chain data
  const onChain = useRiskVault(riskLevelNum)
  const position = useUserPosition(riskLevelNum)

  // Keeper API data
  const keeper = useVaultData(riskLevel)
  const keeperDecisions = useKeeperDecisions(riskLevel)

  // Mock fallback
  const mockVault = mockVaults.find(v => v.riskLevel === riskLevel)
  const loading = onChain.loading && keeper.loading

  // Derived values — on-chain > keeper API > mock
  const tvl = onChain.data
    ? Number(onChain.data.totalAssets) / 1e6
    : keeper.data?.tvl ?? mockVault?.tvl ?? 0
  const apy = keeper.data?.apy ?? mockVault?.apy ?? 0
  const drawdown = keeper.data?.drawdown ?? mockVault?.drawdown ?? 0
  const weights = keeper.data?.weights ?? mockVault?.weights ?? {}

  // Guardrails from on-chain data
  const maxDrawdownBps = onChain.data?.maxDrawdownBps ?? (mockVault?.guardrails.maxDrawdown ?? 5) * 100
  const maxDrawdown = maxDrawdownBps / 100
  const currentDrawdown = drawdown * 100
  const maxPerpBps = onChain.data?.maxPerpAllocationBps ?? (mockVault?.guardrails.maxPerp ?? 60) * 100
  const maxPerp = maxPerpBps / 100
  // Compute current perp exposure from weights
  const perpSources = ['drift-basis', 'drift-funding', 'drift-jito-dn']
  const currentPerp = Object.entries(weights)
    .filter(([source]) => perpSources.includes(source))
    .reduce((sum, [, w]) => sum + w, 0)

  // Decisions: keeper API > mock fallback
  const decisions: DecisionDisplay[] = useMemo(() => {
    if (keeperDecisions.data && keeperDecisions.data.length > 0) {
      return keeperDecisions.data.slice(0, 5)
    }
    return mockDecisions
      .filter(d => d.vault === riskLevel)
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        timestamp: d.timestamp,
        action: d.action,
        summary: d.summary,
        weightChanges: d.weightChanges,
        aiInvolved: d.aiInvolved,
        reason: d.reason,
      }))
  }, [keeperDecisions.data, riskLevel])

  const lastDecision = decisions[0] ?? null

  // User position
  const userShares = position.data?.shares ?? 0n
  const sharePrice = onChain.data?.sharePrice ?? 1
  const userValue = Number(userShares) / 1e6 * sharePrice
  const deposited = position.data
    ? Number(position.data.depositedUsdc) / 1e6
    : 0
  const pnl = userValue - deposited

  function handleRefresh() {
    onChain.refresh()
    position.refresh()
  }

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
          <Badge level={riskLevel} />
          <h1 className="text-3xl font-bold tracking-tight capitalize">
            {riskLevel} Vault
          </h1>
        </div>
        {!publicKey && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-400">
            <Wallet className="h-4 w-4" />
            Connect wallet to deposit
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          {loading ? (
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Total Value Locked</p>
              <Skeleton className="h-8 w-32" />
            </div>
          ) : (
            <Stat
              label="Total Value Locked"
              value={formatUsd(tvl)}
              trend="up"
            />
          )}
        </Card>
        <Card>
          {loading ? (
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Current APY</p>
              <Skeleton className="h-8 w-24" />
            </div>
          ) : (
            <Stat
              label="Current APY"
              value={formatApy(apy)}
              trend="up"
            />
          )}
        </Card>
        <Card>
          <Stat
            label="Current Drawdown"
            value={formatPct(currentDrawdown)}
            subValue={`max ${formatPct(maxDrawdown)}`}
            trend="neutral"
          />
        </Card>
      </div>

      {/* User Position (only when connected + has position) */}
      {publicKey && position.data && userShares > 0n && (
        <Card header={
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-sky-400" />
            Your Position
          </h2>
        }>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Position Value</p>
              <p className="font-mono text-xl font-bold text-slate-50">
                {formatUsd(userValue)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Total Deposited</p>
              <p className="font-mono text-xl font-bold text-slate-200">
                {formatUsd(deposited)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">P&L</p>
              <p className={`font-mono text-xl font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {pnl >= 0 ? '+' : ''}{formatUsd(pnl)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Deposit/Withdraw + Allocation Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Deposit/Withdraw (wallet-gated) */}
        {publicKey ? (
          <Card header={
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-sky-400" />
              Manage Position
            </h2>
          }>
            <div className="space-y-6">
              <DepositForm riskLevelNum={riskLevelNum} onSuccess={handleRefresh} />
              <WithdrawSection
                riskLevelNum={riskLevelNum}
                riskLevel={riskLevel}
                onSuccess={handleRefresh}
              />
            </div>
          </Card>
        ) : (
          <Card header={
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
              Allocation Breakdown
            </h2>
          }>
            <div className="space-y-4">
              {Object.entries(weights).map(([source, weight]) => (
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
        )}

        {/* Right: Allocation (when wallet connected) or Guardrails */}
        {publicKey ? (
          <div className="space-y-6">
            <Card header={
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-400" />
                Allocation Breakdown
              </h2>
            }>
              <div className="space-y-4">
                {Object.entries(weights).map(([source, weight]) => (
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
                  value={currentDrawdown}
                  max={maxDrawdown}
                />
                {maxPerp > 0 && (
                  <ProgressBar
                    label="Perp Exposure"
                    value={currentPerp}
                    max={maxPerp}
                  />
                )}
                {maxPerp === 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    No perpetual exposure — lending and insurance only
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card header={
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Guardrails
            </h2>
          }>
            <div className="space-y-6">
              <ProgressBar
                label="Max Drawdown"
                value={currentDrawdown}
                max={maxDrawdown}
              />
              {maxPerp > 0 && (
                <ProgressBar
                  label="Perp Exposure"
                  value={currentPerp}
                  max={maxPerp}
                />
              )}
              {maxPerp === 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  No perpetual exposure — lending and insurance only
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Last Keeper Decision */}
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

      {/* Rebalance History */}
      <Card header={
        <h2 className="text-lg font-semibold">Recent Rebalance History</h2>
      }>
        <div className="divide-y divide-slate-700">
          {decisions.map((decision) => (
            <DecisionItem key={decision.id} decision={decision} />
          ))}
          {decisions.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">
              {keeperDecisions.error
                ? 'Keeper data unavailable. Showing cached data.'
                : 'No recent activity for this vault.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
