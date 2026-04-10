'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GlassCard } from '@/components/ui/glass-card'
import { useToast } from '@/components/ui/toast'
import { CheckCircle, Wallet, Coins, ArrowRight, ChevronUp, ExternalLink, Loader2 } from 'lucide-react'

type Step = 1 | 2 | 3 | 4
type AirdropStatus = 'idle' | 'loading' | 'success' | 'error'

const AIRDROP_PRESETS = [100, 1_000, 100_000] as const

interface OnboardingGuideProps {
  onClose: () => void
}

export function OnboardingGuide({ onClose }: OnboardingGuideProps) {
  const [step, setStep] = useState<Step>(1)
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatus>('idle')
  const [airdropError, setAirdropError] = useState<string>('')
  const [airdropBalance, setAirdropBalance] = useState<string>('')

  const { publicKey, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const { toast } = useToast()

  // Auto-advance Step 2 → 3 when wallet connects
  useEffect(() => {
    if (connected && publicKey && step === 2) {
      setStep(3)
    }
  }, [connected, publicKey, step])

  async function handleAirdrop(amount: number) {
    if (!publicKey) return

    setAirdropStatus('loading')
    setAirdropError('')

    try {
      const res = await fetch('/api/airdrop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toBase58(), amount }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setAirdropStatus('error')
        setAirdropError(data.error ?? 'Airdrop failed')
        return
      }

      setAirdropBalance(data.balance)
      setAirdropStatus('success')
      toast(`Received ${amount.toLocaleString()} test USDC!`, 'success')

      // Auto-advance to Step 4 after 2s
      setTimeout(() => setStep(4), 2000)
    } catch {
      setAirdropStatus('error')
      setAirdropError('Network error — please try again')
    }
  }

  const stepComplete = (s: Step) => s < step
  const stepActive = (s: Step) => s === step

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mt-2 mb-4 max-w-[1440px] mx-auto">
      <GlassCard className="p-6 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close onboarding guide"
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        {/* Header */}
        <h2 className="text-lg font-semibold text-white mb-1">Getting Started with NanuqFi</h2>
        <p className="text-sm text-slate-400 mb-5">4 quick steps to test deposits and withdrawals on devnet</p>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div
              key={s}
              className={[
                'h-1.5 flex-1 rounded-full transition-colors',
                stepComplete(s) ? 'bg-emerald-500' :
                stepActive(s) ? 'bg-sky-500' :
                'bg-white/10',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Step 1: Switch to Devnet */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold">1</div>
              <h3 className="text-white font-medium">Switch Your Wallet to Devnet</h3>
            </div>
            <div className="ml-11 space-y-3">
              <div className="bg-black/30 rounded-lg p-4 border border-white/5 space-y-2">
                <p className="text-sm text-slate-300 font-medium">Phantom</p>
                <p className="text-sm text-slate-400">Settings → Developer Settings → Testnet Mode → <span className="text-emerald-400">ON</span></p>
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-white/5 space-y-2">
                <p className="text-sm text-slate-300 font-medium">Solflare</p>
                <p className="text-sm text-slate-400">Settings → General → Network → <span className="text-emerald-400">Devnet</span></p>
              </div>
              <p className="text-xs text-slate-500">This ensures you use test tokens, not real funds.</p>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 transition-colors flex items-center gap-2"
              >
                I&apos;ve switched to Devnet <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Connect Wallet */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold">2</div>
              <h3 className="text-white font-medium">Connect Your Wallet</h3>
            </div>
            <div className="ml-11 space-y-3">
              {!connected ? (
                <>
                  <p className="text-sm text-slate-400">Click below to connect your Phantom or Solflare wallet.</p>
                  <button
                    onClick={() => setVisible(true)}
                    className="px-5 py-3 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 transition-colors flex items-center gap-2 text-base font-medium"
                  >
                    <Wallet className="h-5 w-5" /> Connect Wallet
                  </button>
                  <p className="text-xs text-slate-500">
                    Don&apos;t have a wallet?{' '}
                    <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline inline-flex items-center gap-1">
                      Install Phantom <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-mono">{publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</span>
                  <span className="text-sm text-slate-400">connected</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Get Test USDC */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold">3</div>
              <h3 className="text-white font-medium">Get Free Test USDC</h3>
            </div>
            <div className="ml-11 space-y-3">
              <p className="text-sm text-slate-400">This is devnet — test tokens have no real value. Pick an amount:</p>
              <div className="flex gap-3">
                {AIRDROP_PRESETS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAirdrop(amount)}
                    disabled={airdropStatus === 'loading'}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {airdropStatus === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      `$${amount.toLocaleString()}`
                    )}
                  </button>
                ))}
              </div>
              {airdropStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Received! Balance: {airdropBalance} USDC</span>
                </div>
              )}
              {airdropStatus === 'error' && (
                <p className="text-sm text-red-400">{airdropError}</p>
              )}
              <p className="text-xs text-slate-500">
                We&apos;ll also send you 2 devnet SOL for transaction fees.
                {' '}If transactions fail later, visit{' '}
                <a href="https://faucet.solana.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                  faucet.solana.com
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Step 4: First Deposit */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">4</div>
              <h3 className="text-white font-medium">Make Your First Deposit</h3>
            </div>
            <div className="ml-11 space-y-3">
              <p className="text-sm text-slate-400">Head to a vault and deposit your test USDC to start earning yield.</p>
              <div className="flex gap-3">
                <a
                  href="/app/vaults/moderate"
                  className="px-5 py-3 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg hover:bg-sky-500/20 transition-colors flex items-center gap-2 font-medium"
                >
                  <Coins className="h-5 w-5" /> Moderate Vault
                  <span className="text-xs text-slate-500 ml-1">(recommended)</span>
                </a>
                <a
                  href="/app/vaults/aggressive"
                  className="px-5 py-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-2 font-medium"
                >
                  <Coins className="h-5 w-5" /> Aggressive Vault
                </a>
              </div>
              <p className="text-xs text-slate-500">Use the preset $100 or $1,000 buttons on the vault page for a quick deposit.</p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
