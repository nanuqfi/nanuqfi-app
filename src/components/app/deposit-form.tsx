'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { AIContext } from '@/components/app/ai-context'
import type { RiskLevel } from '@/lib/mock-data'

interface DepositFormProps {
  riskLevel: RiskLevel
  apy: number
  dailyEarnings: number
  walletBalance?: number
}

export function DepositForm({
  riskLevel,
  apy,
  dailyEarnings,
  walletBalance,
}: DepositFormProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')

  const parsedAmount = Number(amount) || 0
  const estimatedDaily = parsedAmount > 0
    ? (parsedAmount * apy) / 365
    : dailyEarnings

  function handleMax() {
    if (walletBalance !== undefined && walletBalance > 0) {
      setAmount(String(walletBalance))
    }
  }

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      {/* Tab toggle */}
      <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-6">
        <button
          type="button"
          onClick={() => setMode('deposit')}
          className={[
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150',
            mode === 'deposit'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-slate-500 hover:text-white',
          ].join(' ')}
        >
          Deposit
        </button>
        <button
          type="button"
          onClick={() => setMode('withdraw')}
          className={[
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150',
            mode === 'withdraw'
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-slate-500 hover:text-white',
          ].join(' ')}
        >
          Withdraw
        </button>
      </div>

      {/* Amount input */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-400">Amount</label>
          {walletBalance !== undefined && (
            <span className="text-xs text-slate-500 font-mono">
              Balance: {walletBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC
            </span>
          )}
        </div>
        <div className="relative">
          {/* USDC icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600">
            <span className="text-white text-xs font-bold">$</span>
          </div>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#030407] border border-white/10 rounded-xl py-4 pl-12 pr-20 text-2xl font-mono text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 focus:outline-none transition-all"
          />
          {/* MAX button */}
          <button
            type="button"
            onClick={handleMax}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/5 text-sky-400 font-mono text-xs px-2.5 py-1 rounded-md border border-white/5 hover:bg-white/10 transition-colors"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Preview section */}
      <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Current APY</span>
          <span className="text-sm font-mono text-sky-400">
            {(apy * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Est. Daily Yield</span>
          <span className="text-sm font-mono text-slate-200">
            ${estimatedDaily.toFixed(2)}/day
          </span>
        </div>
        <div className="border-t border-dashed border-white/5" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Minimum Lock</span>
          <span className="text-sm font-mono text-slate-200">None</span>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="button"
        disabled={parsedAmount <= 0}
        className="w-full py-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold text-lg border border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
        <ArrowRight className="h-5 w-5" />
      </button>

      {/* AI Context */}
      <div className="mt-4">
        <AIContext text="Kamino rate leads by 2.1%, routing 60% for optimal risk-adjusted yield." />
      </div>
    </GlassCard>
  )
}
