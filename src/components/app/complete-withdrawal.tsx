'use client'

import { useState, useCallback, useEffect } from 'react'
import { Clock, ArrowRight, Loader2 } from 'lucide-react'
import { Transaction, type PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useToast } from '@/components/ui/toast'
import { buildWithdrawInstruction } from '@/lib/transactions'
import { parseAllocatorError } from '@/lib/errors'

const SLOT_POLL_MS = 3_000
const AVG_SLOT_MS = 400 // Solana target ~400ms per slot

interface CompleteWithdrawalProps {
  riskLevelNum: number
  shareMint: PublicKey
  pendingShares: bigint
  withdrawRequestSlot: bigint
  redemptionPeriodSlots: bigint
  onSuccess?: () => void
}

export function CompleteWithdrawal({
  riskLevelNum,
  shareMint,
  pendingShares,
  withdrawRequestSlot,
  redemptionPeriodSlots,
  onSuccess,
}: CompleteWithdrawalProps) {
  const [loading, setLoading] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<bigint | null>(null)
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    const poll = async () => {
      try {
        const slot = await connection.getSlot('confirmed')
        if (mounted) setCurrentSlot(BigInt(slot))
      } catch {
        // Silent — next poll will retry.
      }
    }
    poll()
    const interval = setInterval(poll, SLOT_POLL_MS)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [connection])

  const readySlot = withdrawRequestSlot + redemptionPeriodSlots
  const slotsRemaining =
    currentSlot !== null && readySlot > currentSlot ? readySlot - currentSlot : 0n
  const isReady = currentSlot !== null && slotsRemaining === 0n
  const secondsRemaining = Number(slotsRemaining) * AVG_SLOT_MS / 1000

  const handleComplete = useCallback(async () => {
    if (!publicKey) return
    setLoading(true)
    try {
      const ix = await buildWithdrawInstruction(publicKey, riskLevelNum, shareMint)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      const tx = new Transaction()
      tx.recentBlockhash = blockhash
      tx.feePayer = publicKey
      tx.add(ix)
      const signature = await sendTransaction(tx, connection, { skipPreflight: true })
      toast('Confirming withdrawal...', 'info')
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')
      toast('Withdrawal complete! USDC returned to your wallet.', 'success')
      await new Promise((r) => setTimeout(r, 1500))
      onSuccess?.()
    } catch (err) {
      const message = parseAllocatorError(err)
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }, [publicKey, riskLevelNum, shareMint, sendTransaction, connection, toast, onSuccess])

  const label = isReady
    ? 'Complete Withdrawal'
    : currentSlot === null
      ? 'Checking readiness…'
      : `Ready in ~${Math.max(1, Math.ceil(secondsRemaining))}s`

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-3 w-3 text-amber-400" />
        <p className="text-xs text-amber-400">
          Pending: {(Number(pendingShares) / 1e6).toFixed(2)} shares
          {!isReady && currentSlot !== null && (
            <span className="ml-1 text-slate-500">· {slotsRemaining.toString()} slots left</span>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={handleComplete}
        disabled={loading || !isReady}
        className="w-full py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-semibold border border-amber-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {label}
            {isReady && <ArrowRight className="h-4 w-4" />}
          </>
        )}
      </button>
    </div>
  )
}
