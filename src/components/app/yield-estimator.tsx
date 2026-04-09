'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDailyEarnings } from '@/lib/mock-data'

const PRESETS = [100, 500, 1_000, 5_000]
const MAX_DEFAULT = 5_000

const PRESET_LABELS: Record<number, string> = {
  100: '$100',
  500: '$500',
  1_000: '$1,000',
  5_000: '$5,000',
}

interface YieldEstimatorProps {
  apy: number
  onConnect: () => void
  walletBalance?: number
  ctaMode?: 'connect' | 'deposit'
}

export function YieldEstimator({
  apy,
  onConnect,
  walletBalance,
  ctaMode = 'connect',
}: YieldEstimatorProps) {
  const defaultAmount = walletBalance && walletBalance > 0
    ? Math.min(walletBalance, MAX_DEFAULT)
    : PRESETS[0]!

  const defaultPreset = PRESETS.includes(defaultAmount) ? defaultAmount : null
  const [selectedAmount, setSelectedAmount] = useState(defaultAmount)
  const [activePreset, setActivePreset] = useState<number | null>(defaultPreset)

  const projectedDaily = selectedAmount * apy / 365
  const projectedMonthly = projectedDaily * 30
  const projectedYearly = selectedAmount * apy

  return (
    <div className="space-y-4">
      {walletBalance !== undefined && (
        <p className="text-xs text-slate-400">
          Your balance: <span className="text-slate-200 font-mono">{walletBalance.toLocaleString()} USDC</span>
        </p>
      )}

      <p className="text-xs text-slate-400 uppercase tracking-wider">
        If you deposit:
      </p>

      <div className="flex gap-2">
        {PRESETS.map(amount => (
          <button
            key={amount}
            aria-pressed={activePreset === amount}
            onClick={() => { setSelectedAmount(amount); setActivePreset(amount) }}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 outline-none',
              activePreset === amount
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 border border-white/5 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            {PRESET_LABELS[amount]}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Projected daily</span>
          <span className="font-mono text-sm text-sky-400">{formatDailyEarnings(projectedDaily)}/day</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Projected monthly</span>
          <span className="font-mono text-sm text-slate-300">${projectedMonthly.toFixed(2)}/mo</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Projected yearly</span>
          <span className="font-mono text-sm text-slate-300">${projectedYearly.toFixed(2)}/yr</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="md"
        className="w-full mt-2"
        onClick={onConnect}
      >
        {ctaMode === 'deposit' ? 'Deposit Now →' : 'Start Earning →'}
      </Button>
    </div>
  )
}
