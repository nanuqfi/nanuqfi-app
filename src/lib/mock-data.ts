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

export const mockVaults: Vault[] = [
  {
    riskLevel: 'conservative',
    tvl: 150_000,
    apy: 0.124,
    drawdown: 0.005,
    weights: { 'drift-lending': 60, 'drift-insurance': 40 },
    guardrails: { maxDrawdown: 2, currentDrawdown: 0.5, maxPerp: 0, currentPerp: 0 },
  },
  {
    riskLevel: 'moderate',
    tvl: 320_000,
    apy: 0.184,
    drawdown: 0.018,
    weights: { 'drift-lending': 25, 'drift-insurance': 20, 'drift-basis': 40, 'drift-jito-dn': 15 },
    guardrails: { maxDrawdown: 5, currentDrawdown: 1.8, maxPerp: 60, currentPerp: 53 },
  },
  {
    riskLevel: 'aggressive',
    tvl: 85_000,
    apy: 0.312,
    drawdown: 0.042,
    weights: { 'drift-lending': 10, 'drift-insurance': 10, 'drift-basis': 30, 'drift-funding': 35, 'drift-jito-dn': 15 },
    guardrails: { maxDrawdown: 10, currentDrawdown: 4.2, maxPerp: 70, currentPerp: 65 },
  },
]

export const mockDecisions: KeeperDecision[] = [
  {
    id: 'dec-001',
    timestamp: '2026-03-15T10:32:00Z',
    vault: 'moderate',
    action: 'Rebalance',
    summary: 'Shifted 8% from basis trade to JIT-DN due to declining basis spread',
    weightChanges: [
      { source: 'drift-basis', from: 48, to: 40 },
      { source: 'drift-jito-dn', from: 7, to: 15 },
    ],
    aiInvolved: true,
    reason: 'AI detected basis spread compression below 4bps threshold. JIT-DN showing stronger fill rates on SOL-PERP.',
  },
  {
    id: 'dec-002',
    timestamp: '2026-03-15T06:15:00Z',
    vault: 'aggressive',
    action: 'Guardrail Trigger',
    summary: 'Reduced funding rate exposure after drawdown warning',
    weightChanges: [
      { source: 'drift-funding', from: 42, to: 35 },
      { source: 'drift-lending', from: 3, to: 10 },
    ],
    aiInvolved: false,
    reason: 'Drawdown reached 3.8% (threshold: 4.0%). Algorithm automatically reduced perp exposure to lending.',
  },
  {
    id: 'dec-003',
    timestamp: '2026-03-14T22:48:00Z',
    vault: 'conservative',
    action: 'Rebalance',
    summary: 'Increased insurance fund allocation for higher yield',
    weightChanges: [
      { source: 'drift-lending', from: 65, to: 60 },
      { source: 'drift-insurance', from: 35, to: 40 },
    ],
    aiInvolved: true,
    reason: 'Insurance fund APY surged to 14.2% (lending at 10.8%). AI recommended shift within conservative guardrails.',
  },
  {
    id: 'dec-004',
    timestamp: '2026-03-14T16:20:00Z',
    vault: 'moderate',
    action: 'Yield Capture',
    summary: 'Entered new JIT-DN position on ETH-PERP market',
    weightChanges: [
      { source: 'drift-jito-dn', from: 12, to: 15 },
      { source: 'drift-lending', from: 28, to: 25 },
    ],
    aiInvolved: true,
    reason: 'ETH-PERP market showing 92% fill rate with 6.2bps average spread. AI flagged as high-confidence opportunity.',
  },
  {
    id: 'dec-005',
    timestamp: '2026-03-14T08:05:00Z',
    vault: 'aggressive',
    action: 'Position Adjustment',
    summary: 'Rotated funding rate positions from SOL to BTC',
    weightChanges: [
      { source: 'drift-funding', from: 35, to: 35 },
    ],
    aiInvolved: true,
    reason: 'SOL funding rates declining (from 28% to 19% annualized). BTC funding rates stable at 31%. Rotated within same allocation.',
  },
  {
    id: 'dec-006',
    timestamp: '2026-03-13T20:30:00Z',
    vault: 'moderate',
    action: 'Risk Check',
    summary: 'Passed scheduled risk assessment — no action needed',
    weightChanges: [],
    aiInvolved: false,
    reason: 'All positions within guardrail bounds. Drawdown at 1.2%, perp exposure at 48%. No rebalance required.',
  },
  {
    id: 'dec-007',
    timestamp: '2026-03-13T14:12:00Z',
    vault: 'conservative',
    action: 'Rebalance',
    summary: 'Minor rebalance to maintain target weights after deposits',
    weightChanges: [
      { source: 'drift-lending', from: 58, to: 60 },
      { source: 'drift-insurance', from: 42, to: 40 },
    ],
    aiInvolved: false,
    reason: 'New $12,000 deposit shifted weights. Algorithm rebalanced to target 60/40 split.',
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
