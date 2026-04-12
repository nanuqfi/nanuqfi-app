'use client'

import { useState, useCallback } from 'react'
import { Clock, ArrowRight, Loader2 } from 'lucide-react'
import { Transaction, type PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { useToast } from '@/components/ui/toast'
import { buildWithdrawInstruction } from '@/lib/transactions'
import { parseAllocatorError } from '@/lib/errors'

interface CompleteWithdrawalProps {
  riskLevelNum: number
  shareMint: PublicKey
  pendingShares: bigint
  onSuccess?: () => void
}

export function CompleteWithdrawal({
  riskLevelNum,
  shareMint,
  pendingShares,
  onSuccess,
}: CompleteWithdrawalProps) {
  const [loading, setLoading] = useState(false)
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()

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
      // Wait a moment for RPC to propagate the new state before refreshing
      await new Promise((r) => setTimeout(r, 1500))
      onSuccess?.()
    } catch (err) {
      const message = parseAllocatorError(err)
      if (message.includes('RedemptionPeriodNotElapsed')) {
        toast('Redemption period not elapsed yet. Please wait a moment and try again.', 'error')
      } else {
        toast(message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [publicKey, riskLevelNum, shareMint, sendTransaction, connection, toast, onSuccess])

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-3 w-3 text-amber-400" />
        <p className="text-xs text-amber-400">
          Pending: {(Number(pendingShares) / 1e6).toFixed(2)} shares
        </p>
      </div>
      <button
        type="button"
        onClick={handleComplete}
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-sm font-semibold border border-amber-500/20 transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Complete Withdrawal
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  )
}
