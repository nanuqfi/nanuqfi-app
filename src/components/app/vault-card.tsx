'use client'

import Link from 'next/link'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { ConfidenceBar } from '@/components/ui/confidence-bar'
import { formatUsd, formatApy, formatDailyEarnings, normalizeApy, type Vault } from '@/lib/mock-data'

const tierGlow: Record<string, string> = {
  conservative: 'from-emerald-500/20',
  moderate: 'from-sky-500/20',
  aggressive: 'from-amber-500/20',
}

const confidenceColor: Record<string, string> = {
  conservative: 'bg-emerald-500',
  moderate: 'bg-sky-500',
  aggressive: 'bg-amber-500',
}

interface VaultCardProps {
  vault: Vault
  deposited?: number
  confidence?: number
  isConnected?: boolean
}

export function VaultCard({ vault, deposited, confidence, isConnected }: VaultCardProps) {
  const { setVisible } = useWalletModal()
  const hasPosition = deposited !== undefined && deposited > 0
  const apy = normalizeApy(vault.apy)
  // User-specific daily when they have a position, vault-level otherwise
  const dailyProjection = hasPosition
    ? deposited * apy / 365
    : vault.tvl * apy / 365

  const handleClick = (e: React.MouseEvent) => {
    if (!isConnected) {
      e.preventDefault()
      setVisible(true)
    }
  }

  return (
    <Link href={`/app/vaults/${vault.riskLevel}`} onClick={handleClick}>
      <GlassCard
        tier={vault.riskLevel}
        className="group relative p-6 transition-all duration-200 hover:border-white/10"
      >
        {/* Top — Badge + APY */}
        <div className="flex items-center justify-between">
          <Badge tier={vault.riskLevel} />
          <span className="text-3xl font-mono tabular-nums text-white">
            {formatApy(apy)}
          </span>
        </div>

        {/* Middle rows */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="text-xs text-slate-400">Daily Projection</span>
            <span className="font-mono text-sm text-slate-200">
              {formatDailyEarnings(dailyProjection)}
            </span>
          </div>

          {hasPosition ? (
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs text-slate-400">Deposited</span>
              <span className="font-mono text-sm text-slate-200">
                {formatUsd(deposited)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs text-emerald-400 font-medium">Deposit →</span>
              <span className="text-xs text-slate-400">
                Earn {formatApy(apy)}
              </span>
            </div>
          )}
        </div>

        {/* Confidence */}
        {confidence !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">AI Confidence</span>
            </div>
            <ConfidenceBar
              value={confidence}
              color={confidenceColor[vault.riskLevel]}
            />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-b-2xl bg-gradient-to-t from-slate-900/90 to-transparent py-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className={`text-sm font-medium bg-gradient-to-r ${tierGlow[vault.riskLevel]} to-transparent bg-clip-text`}>
            {hasPosition ? (
              <span className="text-white">Details &rarr;</span>
            ) : (
              <span className="text-white">Deposit &rarr;</span>
            )}
          </span>
        </div>
      </GlassCard>
    </Link>
  )
}
