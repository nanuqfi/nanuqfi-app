'use client'

import { useState, useCallback } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Transaction, type PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { GlassCard } from '@/components/ui/glass-card'
import { AIContext } from '@/components/app/ai-context'
import { useToast } from '@/components/ui/toast'
import {
  buildDepositInstruction,
  buildRequestWithdrawInstruction,
  buildWithdrawInstruction,
} from '@/lib/transactions'
import { parseAllocatorError } from '@/lib/errors'
import type { RiskLevel } from '@/lib/mock-data'

// ─── Types ──────────────────────────────────────────────────────────────────

interface DepositFormProps {
  riskLevel: RiskLevel
  riskLevelNum: number
  apy: number
  dailyEarnings: number
  walletBalance?: number
  shareMint?: PublicKey
  userShares?: bigint
  sharePrice?: number
  redemptionPeriodSlots?: bigint
  onSuccess?: () => void
}

// ─── Constants ──────────────────────────────────────────────────────────────

const USDC_DECIMALS = 6

// ─── Component ──────────────────────────────────────────────────────────────

export function DepositForm({
  riskLevel,
  riskLevelNum,
  apy,
  dailyEarnings,
  walletBalance,
  shareMint,
  userShares,
  sharePrice,
  redemptionPeriodSlots,
  onSuccess,
}: DepositFormProps) {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()

  const parsedAmount = Number(amount) || 0
  const estimatedDaily = parsedAmount > 0
    ? (parsedAmount * apy) / 365
    : dailyEarnings

  const isWalletConnected = !!publicKey
  const isShareMintReady = !!shareMint
  const canDeposit = isWalletConnected && isShareMintReady && parsedAmount > 0 && !loading && !validationError
  const canWithdraw = isWalletConnected && parsedAmount > 0 && !loading && !validationError

  // ─── Validation ───────────────────────────────────────────────────────────

  function validateAmount(raw: string, currentMode: 'deposit' | 'withdraw'): string | null {
    if (raw === '' || raw === '0') return null // empty is fine until submit

    const n = Number(raw)
    if (!isFinite(n) || isNaN(n)) return 'Enter a valid number.'
    if (n <= 0) return 'Amount must be greater than 0.'

    if (currentMode === 'deposit') {
      if (walletBalance !== undefined && n > walletBalance) {
        return `Amount exceeds wallet balance (${walletBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC).`
      }
    }

    if (currentMode === 'withdraw') {
      if (userShares !== undefined) {
        const price = sharePrice ?? 1
        const maxUsdc = Number(userShares) * price / 10 ** USDC_DECIMALS
        if (n > maxUsdc) {
          return `Amount exceeds available balance (${maxUsdc.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC).`
        }
      }
    }

    return null
  }

  function handleAmountChange(value: string) {
    setAmount(value)
    setValidationError(validateAmount(value, mode))
  }

  function handleModeChange(newMode: 'deposit' | 'withdraw') {
    setMode(newMode)
    setValidationError(validateAmount(amount, newMode))
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function handleMax() {
    if (mode === 'deposit' && walletBalance !== undefined && walletBalance > 0) {
      setAmount(String(walletBalance))
      setValidationError(null)
    } else if (mode === 'withdraw' && userShares !== undefined && userShares > 0n) {
      // Convert shares to USDC using actual share price
      const price = sharePrice ?? 1
      setAmount(String(Number(userShares) * price / 10 ** USDC_DECIMALS))
      setValidationError(null)
    }
  }

  const handleDeposit = useCallback(async () => {
    if (!publicKey || !shareMint) return
    const err = validateAmount(amount, 'deposit')
    if (err) { setValidationError(err); return }
    if (parsedAmount <= 0) { setValidationError('Amount must be greater than 0.'); return }

    setLoading(true)
    try {
      const amountInSmallestUnit = BigInt(Math.round(parsedAmount * 10 ** USDC_DECIMALS))

      const instruction = await buildDepositInstruction(
        publicKey,
        riskLevelNum,
        amountInSmallestUnit,
        shareMint,
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      const tx = new Transaction()
      tx.recentBlockhash = blockhash
      tx.feePayer = publicKey
      tx.add(instruction)
      const signature = await sendTransaction(tx, connection)

      toast('Confirming transaction...', 'info')
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')

      toast('Deposit confirmed!', 'success')
      setAmount('')
      onSuccess?.()
    } catch (err) {
      const message = parseAllocatorError(err)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [publicKey, shareMint, amount, parsedAmount, riskLevelNum, walletBalance, sendTransaction, connection, toast, onSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleWithdraw = useCallback(async () => {
    if (!publicKey) return
    const err = validateAmount(amount, 'withdraw')
    if (err) { setValidationError(err); return }
    if (parsedAmount <= 0) { setValidationError('Amount must be greater than 0.'); return }

    setLoading(true)
    try {
      // Convert entered USDC amount to shares using actual share price
      const price = sharePrice ?? 1
      const sharesAmount = BigInt(Math.round(parsedAmount / price * 10 ** USDC_DECIMALS))

      const requestIx = await buildRequestWithdrawInstruction(
        publicKey,
        riskLevelNum,
        sharesAmount,
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      const tx = new Transaction()
      tx.recentBlockhash = blockhash
      tx.feePayer = publicKey
      tx.add(requestIx)

      // If redemption period is 0 (devnet), chain the complete-withdraw instruction too
      const isInstantRedemption = redemptionPeriodSlots === 0n
      if (isInstantRedemption && shareMint) {
        const withdrawIx = await buildWithdrawInstruction(
          publicKey,
          riskLevelNum,
          shareMint,
        )
        tx.add(withdrawIx)
      }

      const signature = await sendTransaction(tx, connection)

      toast('Confirming transaction...', 'info')
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')

      if (isInstantRedemption && shareMint) {
        toast('Withdrawal complete!', 'success')
      } else {
        toast('Withdrawal requested — complete after redemption period.', 'success')
      }

      setAmount('')
      onSuccess?.()
    } catch (err) {
      const message = parseAllocatorError(err)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [publicKey, amount, parsedAmount, riskLevelNum, shareMint, sharePrice, userShares, redemptionPeriodSlots, sendTransaction, connection, toast, onSuccess]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    if (mode === 'deposit') {
      handleDeposit()
    } else {
      handleWithdraw()
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const isDisabled = mode === 'deposit' ? !canDeposit : !canWithdraw

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      {/* Tab toggle */}
      <div className="flex p-1 bg-black/40 rounded-xl border border-white/5 mb-6">
        <button
          type="button"
          onClick={() => handleModeChange('deposit')}
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
          onClick={() => handleModeChange('withdraw')}
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
          {mode === 'deposit' && walletBalance !== undefined && (
            <span className="text-xs text-slate-500 font-mono">
              Balance: {walletBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC
            </span>
          )}
          {mode === 'withdraw' && userShares !== undefined && (
            <span className="text-xs text-slate-500 font-mono">
              Value: {(Number(userShares) * (sharePrice ?? 1) / 10 ** USDC_DECIMALS).toLocaleString('en-US', { maximumFractionDigits: 2 })} USDC
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
            onChange={(e) => handleAmountChange(e.target.value)}
            disabled={loading}
            className="w-full bg-[#030407] border border-white/10 rounded-xl py-4 pl-12 pr-20 text-2xl font-mono text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 focus:outline-none transition-all disabled:opacity-50"
          />
          {/* MAX button */}
          <button
            type="button"
            onClick={handleMax}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/5 text-sky-400 font-mono text-xs px-2.5 py-1 rounded-md border border-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-xs text-red-400 mt-1 mb-2 px-1" role="alert">
          {validationError}
        </p>
      )}

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

      {/* Wallet not connected hint */}
      {!isWalletConnected && (
        <p className="text-xs text-amber-400/80 text-center mb-3">
          Connect your wallet to {mode === 'deposit' ? 'deposit' : 'withdraw'}
        </p>
      )}

      {/* Share mint loading hint (deposit only) */}
      {isWalletConnected && !isShareMintReady && mode === 'deposit' && (
        <p className="text-xs text-slate-500 text-center mb-3">
          Loading vault data...
        </p>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isDisabled}
        className="w-full py-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-semibold text-lg border border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      {/* AI Context */}
      <div className="mt-4">
        <AIContext text="Kamino rate leads by 2.1%, routing 60% for optimal risk-adjusted yield." />
      </div>
    </GlassCard>
  )
}
