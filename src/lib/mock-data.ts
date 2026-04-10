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
  confidence?: number
  txSignature?: string
}

export interface YieldSource {
  name: string
  slug: string
  currentApy: number
  protocol: string
}

// Fallback values aligned with current multi-protocol stack (Kamino, Marginfi, Lulo).
// APY reflects real-world rates: Kamino ~2.08%, Marginfi ~6.5%, Lulo ~8.29%.
// On-chain TVL and keeper API data take priority when available.
export const mockVaults: Vault[] = [
  {
    riskLevel: 'moderate',
    tvl: 200,
    apy: 0.065,
    drawdown: 0.005,
    weights: { 'kamino-lending': 50, 'marginfi-lending': 35, 'lulo-lending': 15 },
    guardrails: { maxDrawdown: 5, currentDrawdown: 0.5, maxPerp: 0, currentPerp: 0 },
  },
  {
    riskLevel: 'aggressive',
    tvl: 0,
    apy: 0.083,
    drawdown: 0.010,
    weights: { 'kamino-lending': 25, 'marginfi-lending': 35, 'lulo-lending': 40 },
    guardrails: { maxDrawdown: 10, currentDrawdown: 1.0, maxPerp: 0, currentPerp: 0 },
  },
]

export const mockDecisions: KeeperDecision[] = [
  {
    id: 'dec-001',
    timestamp: '2026-04-05T10:32:00Z',
    vault: 'moderate',
    action: 'Protocol Pivot',
    summary: 'Rotated from Drift to Kamino + Marginfi after protocol compromise',
    weightChanges: [
      { source: 'kamino-lending', from: 0, to: 5000 },
      { source: 'marginfi-lending', from: 0, to: 3500 },
      { source: 'lulo-lending', from: 0, to: 1500 },
    ],
    aiInvolved: true,
    reason: 'AI flagged Drift protocol compromise. Architecture is protocol-agnostic — pivoted capital to Kamino, Marginfi, and Lulo within hours. All guardrails passed.',
  },
  {
    id: 'dec-002',
    timestamp: '2026-04-04T06:15:00Z',
    vault: 'aggressive',
    action: 'Yield Optimization',
    summary: 'Increased Lulo allocation to capture higher aggregated yield',
    weightChanges: [
      { source: 'lulo-lending', from: 2500, to: 4000 },
      { source: 'kamino-lending', from: 3500, to: 2500 },
    ],
    aiInvolved: false,
    reason: 'Lulo APY at 8.29% vs Kamino at 2.08%. Algorithm increased Lulo weight within guardrail limits.',
  },
  {
    id: 'dec-003',
    timestamp: '2026-04-03T16:20:00Z',
    vault: 'moderate',
    action: 'Rebalance',
    summary: 'Increased Marginfi allocation on improving lending rates',
    weightChanges: [
      { source: 'marginfi-lending', from: 3000, to: 3500 },
      { source: 'kamino-lending', from: 5500, to: 5000 },
    ],
    aiInvolved: true,
    reason: 'Marginfi USDC rates improved to 6.5%. AI recommended shifting 5% from Kamino to Marginfi for better risk-adjusted yield.',
  },
  {
    id: 'dec-004',
    timestamp: '2026-04-02T20:30:00Z',
    vault: 'moderate',
    action: 'Risk Check',
    summary: 'Passed scheduled risk assessment — no action needed',
    weightChanges: [],
    aiInvolved: false,
    reason: 'All positions within guardrail bounds. Drawdown at 0.5%, all lending — no perp exposure. No rebalance required.',
  },
  {
    id: 'dec-005',
    timestamp: '2026-04-01T08:05:00Z',
    vault: 'aggressive',
    action: 'Emergency Rebalance',
    summary: 'Emergency rotation triggered by Drift hack — $285M exploit',
    weightChanges: [
      { source: 'lulo-lending', from: 0, to: 4000 },
      { source: 'marginfi-lending', from: 0, to: 3500 },
      { source: 'kamino-lending', from: 0, to: 2500 },
    ],
    aiInvolved: true,
    reason: 'Drift Protocol suffered $285M exploit on 2026-04-01. NanuqFi\'s protocol-agnostic architecture allowed immediate pivot to Kamino, Marginfi, and Lulo. Capital preserved. Architecture proven.',
  },
]

export const mockYields: YieldSource[] = [
  { name: 'Kamino Lending', slug: 'kamino-lending', currentApy: 0.0208, protocol: 'Kamino' },
  { name: 'Marginfi Lending', slug: 'marginfi-lending', currentApy: 0.065, protocol: 'Marginfi' },
  { name: 'Lulo Yield', slug: 'lulo-lending', currentApy: 0.0829, protocol: 'Lulo' },
]

// Utility: normalize APY — keeper may return percentage (6.5) or decimal (0.065).
// Assumes any value > 1 is a percentage. Values in [1.0, 1.99] are ambiguous —
// keeper contract guarantees decimal format for APYs in this range.
export function normalizeApy(v: number): number {
  if (!Number.isFinite(v)) return 0
  return v > 1 ? v / 100 : v
}

// Utility: format daily earnings (small amounts need precision)
export function formatDailyEarnings(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return '$0.00'
  if (amount < 0.01) return `$${amount.toFixed(4)}`
  if (amount < 1) return `$${amount.toFixed(2)}`
  return formatUsd(amount)
}

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
  return mockVaults.reduce((sum, v) => sum + normalizeApy(v.apy) * v.tvl, 0) / totalTvl
}

// Utility: source display name
export function sourceDisplayName(slug: string): string {
  const source = mockYields.find(y => y.slug === slug)
  return source?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
