'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

const KEEPER_API =
  process.env.NEXT_PUBLIC_KEEPER_API_URL ?? 'https://keeper.nanuqfi.com'

const KEEPER_POLL_INTERVAL = 30_000

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KeeperHealthData {
  uptime: number
  lastCycle: string
  rpcStatus: string
  version?: string
}

export interface VaultData {
  tvl: number
  apy: number
  weights: Record<string, number>
  drawdown: number
  sharePrice?: number
}

export interface KeeperDecisionData {
  id: string
  timestamp: string
  action: string
  summary: string
  weightChanges: { source: string; from: number; to: number }[]
  aiInvolved: boolean
  reason: string
}

export interface YieldEstimate {
  source: string
  apy: number
  protocol: string
}

interface KeeperHookResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  isStale: boolean
}

// ─── Generic Fetcher ─────────────────────────────────────────────────────────

async function fetchKeeper<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(`${KEEPER_API}${path}`, {
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`Keeper API ${res.status}: ${res.statusText}`)
    }
    return res.json() as Promise<T>
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Generic Hook Factory ────────────────────────────────────────────────────

function useKeeperData<T>(
  path: string,
  pollInterval: number = KEEPER_POLL_INTERVAL
): KeeperHookResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)
  const mountedRef = useRef(true)
  const lastDataRef = useRef<T | null>(null)

  const doFetch = useCallback(async () => {
    try {
      const result = await fetchKeeper<T>(path)
      if (!mountedRef.current) return

      setData(result)
      lastDataRef.current = result
      setError(null)
      setIsStale(false)
    } catch (err) {
      if (!mountedRef.current) return

      const fetchError =
        err instanceof Error ? err : new Error(String(err))
      setError(fetchError)

      // Keep last-known data but mark as stale
      if (lastDataRef.current) {
        setData(lastDataRef.current)
        setIsStale(true)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [path])

  useEffect(() => {
    mountedRef.current = true
    doFetch()

    const interval = setInterval(doFetch, pollInterval)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') doFetch()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [doFetch, pollInterval])

  return { data, loading, error, isStale }
}

// ─── Exported Hooks ──────────────────────────────────────────────────────────

/**
 * Keeper health status — uptime, last cycle, RPC connectivity.
 * Polls every 30s.
 */
export function useKeeperHealth(): KeeperHookResult<KeeperHealthData> {
  return useKeeperData<KeeperHealthData>('/v1/health')
}

/**
 * Vault data from keeper perspective — TVL, APY, weights, drawdown.
 * Polls every 30s.
 */
export function useVaultData(
  riskLevel: string
): KeeperHookResult<VaultData> {
  return useKeeperData<VaultData>(`/v1/vaults/${riskLevel}`)
}

// ─── Raw Decision Transform ─────────────────────────────────────────────────

/** Shape returned by keeper /v1/vaults/:level/decisions */
interface RawDecisionLog {
  timestamp: number
  action: string
  previousWeights: Record<string, number>
  newWeights: Record<string, number>
  algoScores: Record<string, number>
  aiInvolved: boolean
  guardrailPassed: boolean
}

function formatSourceName(slug: string): string {
  return slug.replace(/^drift-/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function transformDecision(d: RawDecisionLog): KeeperDecisionData {
  const allSources = new Set([
    ...Object.keys(d.newWeights ?? {}),
    ...Object.keys(d.previousWeights ?? {}),
  ])

  const weightChanges = Array.from(allSources)
    .filter(s => (d.newWeights?.[s] ?? 0) > 0 || (d.previousWeights?.[s] ?? 0) > 0)
    .map(source => ({
      source,
      from: Math.round((d.previousWeights?.[source] ?? 0) / 100),
      to: Math.round((d.newWeights?.[source] ?? 0) / 100),
    }))
    .sort((a, b) => b.to - a.to)

  const topWeights = Object.entries(d.newWeights ?? {})
    .filter(([, w]) => w > 0)
    .sort(([, a], [, b]) => b - a)

  const summary = topWeights.length > 0
    ? topWeights.map(([s, w]) => `${(w / 100).toFixed(1)}% ${formatSourceName(s)}`).join(', ')
    : 'Keeper cycle completed'

  return {
    id: String(d.timestamp),
    timestamp: new Date(d.timestamp).toISOString(),
    action: d.action ?? 'Rebalance',
    summary,
    weightChanges,
    aiInvolved: d.aiInvolved ?? true,
    reason: d.guardrailPassed !== false ? 'All guardrails passed' : 'Guardrail triggered',
  }
}

/**
 * Recent keeper decisions for a vault — rebalances, guardrail triggers, etc.
 * Polls every 30s. Transforms raw DecisionLog to display format.
 */
export function useKeeperDecisions(
  riskLevel: string
): KeeperHookResult<KeeperDecisionData[]> {
  const raw = useKeeperData<RawDecisionLog[]>(
    `/v1/vaults/${riskLevel}/decisions`
  )

  const data = useMemo(
    () => raw.data?.map(transformDecision) ?? null,
    [raw.data]
  )

  return { ...raw, data }
}

/**
 * Current yield estimates per source from the keeper's perspective.
 * Polls every 30s.
 */
export function useYieldEstimates(): KeeperHookResult<YieldEstimate[]> {
  return useKeeperData<YieldEstimate[]>('/v1/yields')
}

// ─── Market Scan ────────────────────────────────────────────────────────────

export interface MarketScanOpportunity {
  protocol: string
  strategy: string
  asset: string
  apy: number
  tvl: number
  risk: 'low' | 'medium' | 'high'
  source: string
}

export interface MarketScanData {
  timestamp: number
  opportunities: MarketScanOpportunity[]
  bestByRisk: {
    low: MarketScanOpportunity | null
    medium: MarketScanOpportunity | null
    high: MarketScanOpportunity | null
  }
  driftComparison: {
    driftBestApy: number
    marketBestApy: number
    driftRank: number
    totalScanned: number
  }
}

/**
 * DeFi market yield scan — cross-protocol opportunities + Drift comparison.
 * Polls every 30s.
 */
export function useMarketScan(): KeeperHookResult<MarketScanData> {
  return useKeeperData<MarketScanData>('/v1/market-scan')
}

// ─── AI Insight ──────────────────────────────────────────────────────────────

export interface AIInsightData {
  available: boolean
  insight: {
    strategies: Record<string, number>
    riskElevated: boolean
    reasoning: string
    timestamp: number
  } | null
}

/**
 * AI strategy assessment — confidence scores, risk flag, reasoning.
 * Polls every 30s.
 */
export function useAIInsight(): KeeperHookResult<AIInsightData> {
  return useKeeperData<AIInsightData>('/v1/ai')
}
