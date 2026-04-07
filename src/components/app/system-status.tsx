'use client'

import { useKeeperHealth } from '@/hooks/use-keeper-api'

export function SystemStatus() {
  const { data, loading, error } = useKeeperHealth()

  const isOnline = !!data && !loading
  const dotColor = isOnline ? 'bg-emerald-400' : 'bg-amber-400'
  const pillBg = isOnline
    ? 'bg-emerald-500/10 border-emerald-500/20'
    : 'bg-amber-500/10 border-amber-500/20'
  const label = isOnline ? 'Online' : 'Checking...'

  return (
    <div
      className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${pillBg}`}
      title={
        data
          ? `Uptime ${data.uptime}s · RPC ${data.rpcStatus}${data.version ? ` · v${data.version}` : ''}`
          : error
            ? error.message
            : 'Connecting to keeper...'
      }
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
        {label}
      </span>
    </div>
  )
}
