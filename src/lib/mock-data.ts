export type RiskLevel = 'conservative' | 'moderate' | 'aggressive'

export interface Vault {
  riskLevel: RiskLevel
  tvl: number
  apy: number
  drawdown: number
  weights: Record<string, number>
  guardrails: {
    maxDrawdown: number
    currentDrawdown: number
    maxPerp: number
    currentPerp: number
  }
}

export interface KeeperDecision {
  id: string
  timestamp: string
  vault: RiskLevel
  action: string
  summary: string
  weightChanges: { source: string; from: number; to: number }[]
  aiInvolved: boolean
  reason: string
}

export interface YieldSource {
  name: string
  slug: string
  currentApy: number
  protocol: string
}

// Fallback values aligned with 90-day backtest (2026-01-01 to 2026-03-31).
// Weights reflect final-day allocations from backtest dailyReturns (converted from bps to %).
// On-chain TVL and keeper API data take priority when available.
export const mockVaults: Vault[] = [
  {
    riskLevel: 'moderate',
    tvl: 200,
    apy: 0.1608,
    drawdown: 0.018942,
    weights: { 'drift-lending': 56.7, 'drift-basis': 32.2, 'drift-jito-dn': 11.1 },
    guardrails: { maxDrawdown: 5, currentDrawdown: 1.89, maxPerp: 60, currentPerp: 43 },
  },
  {
    riskLevel: 'aggressive',
    tvl: 0,
    apy: 0.1939,
    drawdown: 0.030073,
    weights: { 'drift-lending': 39.8, 'drift-basis': 22.6, 'drift-jito-dn': 7.5, 'drift-funding': 30.1 },
    guardrails: { maxDrawdown: 10, currentDrawdown: 3.01, maxPerp: 70, currentPerp: 53 },
  },
]

export const mockDecisions: KeeperDecision[] = [
  {
    id: 'dec-001',
    timestamp: '2026-03-31T10:32:00Z',
    vault: 'moderate',
    action: 'Rebalance',
    summary: 'Increased lending allocation as basis spread narrowed',
    weightChanges: [
      { source: 'drift-basis', from: 3800, to: 3218 },
      { source: 'drift-lending', from: 5085, to: 5667 },
    ],
    aiInvolved: true,
    reason: 'AI detected basis spread compression below 4bps threshold. Shifted to lending for safer yield.',
  },
  {
    id: 'dec-002',
    timestamp: '2026-03-30T06:15:00Z',
    vault: 'aggressive',
    action: 'Guardrail Trigger',
    summary: 'Reduced funding rate exposure after drawdown spike',
    weightChanges: [
      { source: 'drift-funding', from: 3500, to: 3009 },
      { source: 'drift-lending', from: 3485, to: 3976 },
    ],
    aiInvolved: false,
    reason: 'Drawdown reached 2.8% (threshold: 10%). Algorithm reduced perp exposure to lending as precaution.',
  },
  {
    id: 'dec-003',
    timestamp: '2026-03-29T16:20:00Z',
    vault: 'moderate',
    action: 'Yield Capture',
    summary: 'Increased JitoSOL DN allocation on favorable borrow rates',
    weightChanges: [
      { source: 'drift-jito-dn', from: 900, to: 1115 },
      { source: 'drift-lending', from: 5882, to: 5667 },
    ],
    aiInvolved: true,
    reason: 'SOL borrow rate dropped to 4.1% while JitoSOL staking yield at 7%. AI flagged positive carry opportunity.',
  },
  {
    id: 'dec-004',
    timestamp: '2026-03-28T20:30:00Z',
    vault: 'moderate',
    action: 'Risk Check',
    summary: 'Passed scheduled risk assessment — no action needed',
    weightChanges: [],
    aiInvolved: false,
    reason: 'All positions within guardrail bounds. Drawdown at 0.8%, perp exposure at 43%. No rebalance required.',
  },
  {
    id: 'dec-005',
    timestamp: '2026-03-28T08:05:00Z',
    vault: 'aggressive',
    action: 'Position Adjustment',
    summary: 'Increased funding rate capture on strong SOL funding',
    weightChanges: [
      { source: 'drift-funding', from: 2500, to: 3009 },
      { source: 'drift-basis', from: 2757, to: 2257 },
    ],
    aiInvolved: true,
    reason: 'SOL funding rates elevated at 28% annualized. AI recommended shifting from basis to direct funding capture.',
  },
]

export const mockYields: YieldSource[] = [
  { name: 'Drift Lending', slug: 'drift-lending', currentApy: 0.108, protocol: 'Drift' },
  { name: 'Drift Insurance', slug: 'drift-insurance', currentApy: 0.142, protocol: 'Drift' },
  { name: 'Drift Basis Trade', slug: 'drift-basis', currentApy: 0.221, protocol: 'Drift' },
  { name: 'Drift Funding Rate', slug: 'drift-funding', currentApy: 0.318, protocol: 'Drift' },
  { name: 'Drift JIT-DN', slug: 'drift-jito-dn', currentApy: 0.196, protocol: 'Drift' },
]

// Utility: format dollar amounts
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Utility: format APY as percentage
export function formatApy(apy: number): string {
  return `${(apy * 100).toFixed(1)}%`
}

// Utility: format percentage
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

// Utility: format relative time
export function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

// Utility: get total TVL
export function getTotalTvl(): number {
  return mockVaults.reduce((sum, v) => sum + v.tvl, 0)
}

// Utility: get average APY (weighted by TVL)
export function getWeightedApy(): number {
  const totalTvl = getTotalTvl()
  if (totalTvl === 0) return 0
  return mockVaults.reduce((sum, v) => sum + v.apy * v.tvl, 0) / totalTvl
}

// Utility: source display name
export function sourceDisplayName(slug: string): string {
  const source = mockYields.find(y => y.slug === slug)
  return source?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
