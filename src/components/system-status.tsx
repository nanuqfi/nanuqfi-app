'use client'

import { useState, useEffect } from 'react'
import { Brain, Radio, ChevronDown, ChevronUp, Activity } from 'lucide-react'
import { useKeeperHealth, useAIInsight } from '@/hooks/use-keeper-api'

type OverallStatus = 'online' | 'degraded' | 'offline'

function getOverallStatus(
  health: { cyclesCompleted?: number; cyclesFailed?: number; rpcStatus?: string; aiLayerStatus?: string } | null,
  aiAvailable: boolean,
): OverallStatus {
  if (!health) return 'offline'
  if (health.rpcStatus !== 'healthy') return 'degraded'
  if ((health.cyclesFailed ?? 0) > 0) return 'degraded'
  if (!aiAvailable) return 'degraded'
  return 'online'
}

const STATUS_CONFIG = {
  online: { dot: 'bg-emerald-500', label: 'Online', shadow: 'shadow-emerald-500/20' },
  degraded: { dot: 'bg-amber-500', label: 'Degraded', shadow: 'shadow-amber-500/20' },
  offline: { dot: 'bg-red-500', label: 'Offline', shadow: 'shadow-red-500/20' },
} as const

function formatUptime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function SystemStatus() {
  const keeper = useKeeperHealth()
  const ai = useAIInsight()
  const [expanded, setExpanded] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const health = keeper.data as {
    uptime?: number
    cyclesCompleted?: number
    cyclesFailed?: number
    rpcStatus?: string
    aiLayerStatus?: string
  } | null

  const aiAvailable = ai.data?.available ?? false
  const aiInsight = ai.data?.insight ?? null
  const status = getOverallStatus(health, aiAvailable)
  const config = STATUS_CONFIG[status]

  const aiAge = aiInsight ? Math.floor((now - aiInsight.timestamp) / 60_000) : null
  const aiAgeLabel = aiAge !== null
    ? aiAge < 60 ? `${aiAge}m ago` : `${Math.floor(aiAge / 60)}h ago`
    : null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full cursor-pointer items-center justify-between py-2 text-xs"
        >
          <div className="flex items-center gap-6">
            {/* Overall status */}
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${config.dot} ${config.shadow} shadow-[0_0_6px]`} />
              <span className="font-medium text-slate-300">System {config.label}</span>
            </div>

            {/* Keeper */}
            <div className="hidden items-center gap-1.5 text-slate-500 sm:flex">
              <Activity className="h-3 w-3" />
              <span>
                {health
                  ? `${health.cyclesCompleted ?? 0} cycles, ${health.cyclesFailed ?? 0} failures`
                  : 'Connecting...'}
              </span>
            </div>

            {/* AI */}
            <div className="hidden items-center gap-1.5 text-slate-500 sm:flex">
              <Brain className="h-3 w-3" />
              <span>
                {aiAvailable
                  ? `Active${aiAgeLabel ? ` — ${aiAgeLabel}` : ''}`
                  : 'Unavailable'}
              </span>
            </div>

            {/* RPC */}
            <div className="hidden items-center gap-1.5 text-slate-500 md:flex">
              <Radio className="h-3 w-3" />
              <span>{health?.rpcStatus === 'healthy' ? 'RPC Healthy' : 'RPC Down'}</span>
            </div>
          </div>

          <div className="text-slate-500">
            {expanded
              ? <ChevronUp className="h-3 w-3" />
              : <ChevronDown className="h-3 w-3" />}
          </div>
        </button>

        {expanded && (
          <div className="border-t border-slate-800/50 py-4 space-y-3">
            {/* Uptime + Cycles */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">Uptime</p>
                <p className="font-mono text-sm text-slate-300">
                  {health?.uptime ? formatUptime(health.uptime) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Cycles</p>
                <p className="font-mono text-sm text-slate-300">
                  {health?.cyclesCompleted ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Failures</p>
                <p className={`font-mono text-sm ${(health?.cyclesFailed ?? 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {health?.cyclesFailed ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">AI Layer</p>
                <p className={`font-mono text-sm ${aiAvailable ? 'text-sky-400' : 'text-slate-500'}`}>
                  {aiAvailable ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {/* AI Reasoning */}
            {aiInsight && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Last AI Reasoning</p>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {aiInsight.reasoning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
