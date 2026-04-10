# Test USDC Airdrop + Guided Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let hackathon judges go from zero to an active vault position in under 2 minutes with a 4-step guided onboarding flow and server-side test USDC faucet.

**Architecture:** Server-side `/api/airdrop` route mints test USDC using the mint authority keypair. Client-side `OnboardingGuide` component walks users through 4 steps: switch to devnet → connect wallet → get test USDC → first deposit. Preset amount buttons on the deposit form simplify the flow.

**Tech Stack:** Next.js 16 (App Router), @solana/spl-token, @solana/web3.js, Tailwind 4

---

## Task 1: Airdrop API route

**Files:**
- Create: `src/app/api/airdrop/route.ts`
- Create: `src/app/api/airdrop/__tests__/route.test.ts`
- Modify: `.env.local` (add MINT_AUTHORITY_KEYPAIR)
- Modify: `.env.example` (document new var)

- [ ] **Step 1: Write the failing test**

Create `src/app/api/airdrop/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @solana/spl-token
vi.mock('@solana/spl-token', () => ({
  getOrCreateAssociatedTokenAccount: vi.fn().mockResolvedValue({
    address: { toBase58: () => 'MockATA111' },
  }),
  mintTo: vi.fn().mockResolvedValue('MockMintSignature123'),
}))

// Mock @solana/web3.js
vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual<typeof import('@solana/web3.js')>('@solana/web3.js')
  return {
    ...actual,
    Connection: vi.fn().mockImplementation(() => ({
      requestAirdrop: vi.fn().mockResolvedValue('MockSolAirdropSig'),
      confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
      getTokenAccountBalance: vi.fn().mockResolvedValue({
        value: { uiAmountString: '1000.00' },
      }),
    })),
    Keypair: {
      fromSecretKey: vi.fn().mockReturnValue({
        publicKey: { toBase58: () => 'MockMintAuthority' },
      }),
    },
  }
})

// Mock fs
vi.mock('node:fs', () => ({
  readFileSync: vi.fn().mockReturnValue(JSON.stringify(Array(64).fill(0))),
}))

describe('POST /api/airdrop', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubEnv('MINT_AUTHORITY_KEYPAIR', '/tmp/test-keypair.json')
    vi.stubEnv('HELIUS_RPC_URL', 'https://test-rpc.com')
    vi.stubEnv('NEXT_PUBLIC_USDC_MINT', 'BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh')
  })

  it('mints test USDC and returns success', async () => {
    vi.resetModules()
    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/airdrop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr', amount: 1000 }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.signature).toBeDefined()
  })

  it('rejects invalid amount', async () => {
    vi.resetModules()
    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/airdrop', {
      method: 'POST',
      body: JSON.stringify({ wallet: 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr', amount: 999 }),
    })

    const response = await POST(request as any)
    expect(response.status).toBe(400)
  })

  it('returns 503 when keypair not configured', async () => {
    vi.stubEnv('MINT_AUTHORITY_KEYPAIR', '')
    vi.resetModules()
    const { POST } = await import('../route')

    const request = new Request('http://localhost:3000/api/airdrop', {
      method: 'POST',
      body: JSON.stringify({ wallet: 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr', amount: 100 }),
    })

    const response = await POST(request as any)
    expect(response.status).toBe(503)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/app/api/airdrop/__tests__/route.test.ts
```

Expected: FAIL — route doesn't exist.

- [ ] **Step 3: Create the airdrop route**

Create `src/app/api/airdrop/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { readFileSync } from 'node:fs'

const ALLOWED_AMOUNTS = new Set([100, 1000, 100000])
const USDC_DECIMALS = 6
const SOL_AIRDROP_AMOUNT = 2 * LAMPORTS_PER_SOL

// Rate limiting: 1 airdrop per wallet per 10 minutes
const RATE_LIMIT_MS = 600_000
const recentAirdrops = new Map<string, number>()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamp] of recentAirdrops) {
    if (now - timestamp > RATE_LIMIT_MS) recentAirdrops.delete(key)
  }
}, 300_000).unref()

export async function POST(request: NextRequest) {
  const keypairPath = process.env.MINT_AUTHORITY_KEYPAIR
  const rpcUrl = process.env.HELIUS_RPC_URL
  const usdcMintAddr = process.env.NEXT_PUBLIC_USDC_MINT

  if (!keypairPath || !rpcUrl || !usdcMintAddr) {
    return NextResponse.json(
      { success: false, error: 'Airdrop not configured' },
      { status: 503 },
    )
  }

  let body: { wallet?: string; amount?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { wallet, amount } = body

  // Validate wallet
  if (!wallet || typeof wallet !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing wallet address' },
      { status: 400 },
    )
  }

  let walletPubkey: PublicKey
  try {
    walletPubkey = new PublicKey(wallet)
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid wallet address' },
      { status: 400 },
    )
  }

  // Validate amount
  if (!amount || !ALLOWED_AMOUNTS.has(amount)) {
    return NextResponse.json(
      { success: false, error: `Amount must be one of: ${[...ALLOWED_AMOUNTS].join(', ')}` },
      { status: 400 },
    )
  }

  // Rate limit check
  const lastAirdrop = recentAirdrops.get(wallet)
  if (lastAirdrop && Date.now() - lastAirdrop < RATE_LIMIT_MS) {
    const remainingMs = RATE_LIMIT_MS - (Date.now() - lastAirdrop)
    const remainingMin = Math.ceil(remainingMs / 60_000)
    return NextResponse.json(
      { success: false, error: `Rate limited — try again in ${remainingMin} minute(s)` },
      { status: 429 },
    )
  }

  try {
    // Load mint authority keypair
    const keypairData = JSON.parse(readFileSync(keypairPath, 'utf-8'))
    const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData))

    const connection = new Connection(rpcUrl, 'confirmed')
    const usdcMint = new PublicKey(usdcMintAddr)

    // Get or create user's USDC ATA
    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,  // payer for ATA creation
      usdcMint,
      walletPubkey,
    )

    // Mint test USDC
    const mintAmount = BigInt(amount) * BigInt(10 ** USDC_DECIMALS)
    const signature = await mintTo(
      connection,
      mintAuthority,  // payer
      usdcMint,
      ata.address,
      mintAuthority,  // mint authority
      mintAmount,
    )

    // Airdrop SOL for fees (best-effort — devnet faucet may rate-limit)
    try {
      await connection.requestAirdrop(walletPubkey, SOL_AIRDROP_AMOUNT)
    } catch {
      // Ignore — user may already have SOL, or faucet is rate-limited
    }

    // Get updated balance
    const balance = await connection.getTokenAccountBalance(ata.address)

    // Record rate limit
    recentAirdrops.set(wallet, Date.now())

    return NextResponse.json({
      success: true,
      signature: typeof signature === 'string' ? signature : signature.toString(),
      balance: balance.value.uiAmountString ?? '0',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Airdrop failed'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    )
  }
}
```

- [ ] **Step 4: Update env files**

Add to `.env.local`:
```
MINT_AUTHORITY_KEYPAIR=/Users/rector/Documents/secret/solana-devnet.json
```

Add to `.env.example`:
```
# Mint authority keypair for test USDC airdrop (devnet only, server-side)
MINT_AUTHORITY_KEYPAIR=/path/to/solana-devnet-keypair.json
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm vitest run src/app/api/airdrop/__tests__/route.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/airdrop/ .env.example .env.local
git commit -m "feat: add /api/airdrop route for test USDC minting"
```

---

## Task 2: Onboarding guide component

**Files:**
- Create: `src/components/app/onboarding-guide.tsx`

- [ ] **Step 1: Create the 4-step onboarding component**

Create `src/components/app/onboarding-guide.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useConnection } from '@solana/wallet-adapter-react'
import { GlassCard } from '@/components/ui/glass-card'
import { useToast } from '@/components/ui/toast'
import { CheckCircle, Wallet, Coins, ArrowRight, ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react'

type Step = 1 | 2 | 3 | 4
type AirdropStatus = 'idle' | 'loading' | 'success' | 'error'

const AIRDROP_PRESETS = [100, 1_000, 100_000] as const

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatus>('idle')
  const [airdropError, setAirdropError] = useState<string>('')
  const [airdropBalance, setAirdropBalance] = useState<string>('')

  const { publicKey, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { connection } = useConnection()
  const { toast } = useToast()

  // Auto-advance Step 2 when wallet connects
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

      // Auto-advance after 2s
      setTimeout(() => setStep(4), 2000)
    } catch {
      setAirdropStatus('error')
      setAirdropError('Network error — please try again')
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors ml-2"
      >
        New here? Get started →
      </button>
    )
  }

  const stepComplete = (s: Step) => s < step
  const stepActive = (s: Step) => s === step

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 mt-2 mb-4 max-w-[1440px] mx-auto">
      <GlassCard className="p-6 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
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
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={[
                'h-1.5 flex-1 rounded-full transition-colors',
                stepComplete(s as Step) ? 'bg-emerald-500' :
                stepActive(s as Step) ? 'bg-sky-500' :
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
                I've switched to Devnet <ArrowRight className="h-4 w-4" />
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
                    Don't have a wallet?{' '}
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
                We'll also send you 2 devnet SOL for transaction fees.
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/app/onboarding-guide.tsx
git commit -m "feat: add 4-step onboarding guide component"
```

---

## Task 3: Add preset amounts to DepositForm

**Files:**
- Modify: `src/components/app/deposit-form.tsx`
- Modify: `src/app/app/vaults/[riskLevel]/page.tsx`

- [ ] **Step 1: Add presetAmounts prop to DepositForm**

In `src/components/app/deposit-form.tsx`, update the interface:

```typescript
// Add to DepositFormProps
  presetAmounts?: number[]
```

Add to destructuring:

```typescript
  presetAmounts,
```

Add preset buttons in the render, right after the `<label>Amount</label>` div and before the input div:

```typescript
      {/* Preset amount buttons */}
      {presetAmounts && presetAmounts.length > 0 && (
        <div className="flex gap-2 mb-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(String(preset))
                setValidationError(null)
              }}
              disabled={loading}
              className="px-3 py-1.5 bg-white/5 text-slate-300 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-xs font-mono disabled:opacity-50"
            >
              ${preset.toLocaleString()}
            </button>
          ))}
        </div>
      )}
```

- [ ] **Step 2: Pass presetAmounts from vault detail page**

In `src/app/app/vaults/[riskLevel]/page.tsx`, find where `<DepositForm` is rendered and add:

```typescript
            presetAmounts={[100, 1000]}
```

- [ ] **Step 3: Run tests**

```bash
pnpm vitest run
```

Expected: All existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/app/deposit-form.tsx src/app/app/vaults/\\[riskLevel\\]/page.tsx
git commit -m "feat: add preset amount buttons to deposit form"
```

---

## Task 4: Integration — wire onboarding into devnet banner

**Files:**
- Modify: `src/app/app/layout.tsx`
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add onboarding trigger to devnet banner**

In `src/app/app/layout.tsx`, update the devnet banner to include the onboarding trigger. The layout needs to become a client component wrapper for the banner section since `OnboardingGuide` uses hooks:

Create a wrapper: replace the inline devnet banner div with a component:

```typescript
import { Nav } from '@/components/app/nav'
import { SolanaProvider } from '@/providers/solana-provider'
import { ToastProvider } from '@/components/ui/toast'
import { DevnetBanner } from '@/components/app/devnet-banner'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <ToastProvider>
        <DevnetBanner />
        <Nav />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          {children}
        </main>
      </ToastProvider>
    </SolanaProvider>
  )
}
```

Create `src/components/app/devnet-banner.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { OnboardingGuide } from './onboarding-guide'

export function DevnetBanner() {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs font-mono text-center py-1.5">
        ⚠ Devnet Mode — Transactions use test USDC, not real funds
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors ml-2"
        >
          {showGuide ? 'Hide guide' : 'New here? Get started →'}
        </button>
      </div>
      {showGuide && (
        <div className="fixed inset-x-0 top-8 z-[55] pt-2">
          <OnboardingGuide />
        </div>
      )}
    </>
  )
}
```

Note: The `OnboardingGuide` component's internal `isOpen` state can be simplified since the parent now controls visibility. Adjust if needed — the parent `showGuide` controls the panel, the guide itself manages steps.

- [ ] **Step 2: Add MINT_AUTHORITY_KEYPAIR to CI and deployment**

In `.github/workflows/deploy.yml`, add the env var to the deploy job (as a secret since it's a keypair path on the VPS):

```yaml
    - name: Deploy to VPS
      env:
        MINT_AUTHORITY_KEYPAIR: /data/secrets/solana-devnet.json
```

Also add to `docker-compose.yml` if it exists:

```yaml
    environment:
      - MINT_AUTHORITY_KEYPAIR=/data/secrets/solana-devnet.json
```

- [ ] **Step 3: Run full test suite + build**

```bash
pnpm vitest run && pnpm build
```

Expected: All tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/app/layout.tsx src/components/app/devnet-banner.tsx .github/workflows/deploy.yml docker-compose.yml
git commit -m "feat: wire onboarding guide into devnet banner + CI config"
```
