/** Mock keeper API responses */

export const healthResponse = {
  uptime: 3600,
  lastCycleTimestamp: Date.now(),
  cyclesCompleted: 50,
  cyclesFailed: 1,
  aiLayerStatus: 'healthy',
  rpcStatus: 'healthy',
}

export const vaultModerate = {
  riskLevel: 'moderate',
  tvl: 50000,
  apy: 0.082,
  weights: {
    'kamino-lending': 6000,
    'marginfi-lending': 2500,
    'lulo-lending': 1500,
  },
  drawdown: 0.005,
  sharePrice: 1.02,
}

export const vaultAggressive = {
  riskLevel: 'aggressive',
  tvl: 25000,
  apy: 0.115,
  weights: {
    'kamino-lending': 4000,
    'marginfi-lending': 3000,
    'lulo-lending': 3000,
  },
  drawdown: 0.012,
  sharePrice: 1.05,
}

export const vaultConservative = {
  riskLevel: 'conservative',
  tvl: 0,
  apy: 0,
  weights: {},
  drawdown: 0,
  sharePrice: 1.0,
}

export const mockDecisions = [
  {
    id: 'd1',
    timestamp: new Date(Date.now() - 600_000).toISOString(),
    vault: 'moderate',
    action: 'rebalance',
    summary: 'Increased Kamino allocation from 55% to 60% due to rising APY',
    weightChanges: [
      { source: 'kamino-lending', from: 5500, to: 6000 },
      { source: 'marginfi-lending', from: 3000, to: 2500 },
    ],
    aiInvolved: true,
    reason: 'Kamino USDC lending rate increased to 8.2%, outperforming Marginfi at 6.5%. AI confidence: 0.85.',
  },
  {
    id: 'd2',
    timestamp: new Date(Date.now() - 1_200_000).toISOString(),
    vault: 'aggressive',
    action: 'hold',
    summary: 'Weights unchanged — market in stable range regime',
    weightChanges: [],
    aiInvolved: true,
    reason: 'Market regime classified as range-bound. No rebalance needed.',
  },
  {
    id: 'd3',
    timestamp: new Date(Date.now() - 3_600_000).toISOString(),
    vault: 'moderate',
    action: 'rebalance',
    summary: 'Added Lulo allocation for diversification',
    weightChanges: [
      { source: 'lulo-lending', from: 1000, to: 1500 },
      { source: 'marginfi-lending', from: 3000, to: 2500 },
    ],
    aiInvolved: false,
    reason: 'Algorithm-only rebalance. Lulo aggregator rate improved.',
  },
]

export const yieldsResponse = {
  'kamino-lending': { apy: 0.082, tvl: 50_000_000 },
  'marginfi-lending': { apy: 0.065, tvl: 120_000_000 },
  'lulo-lending': { apy: 0.073, tvl: 19_000_000 },
}

export const aiResponse = {
  strategies: { 'kamino-lending': 0.85, 'marginfi-lending': 0.6, 'lulo-lending': 0.7 },
  riskElevated: false,
  regime: 'range',
  reasoning: 'Market is in a stable range-bound regime. Kamino leads on risk-adjusted yield.',
  timestamp: Date.now(),
}
