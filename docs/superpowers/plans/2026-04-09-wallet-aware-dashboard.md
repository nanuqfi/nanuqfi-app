# Wallet-Aware Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the dashboard wallet-aware — show a yield estimator when disconnected, user portfolio when connected with positions, and clear CTAs throughout.

**Architecture:** PortfolioSummary becomes a three-state component (estimator / estimator+balance / portfolio). A new YieldEstimator child handles the interactive preset buttons and projection math. VaultCard gets a `hasWallet` prop to toggle deposited row vs CTA.

**Tech Stack:** React 19, @solana/wallet-adapter-react (useWallet, useWalletModal), existing use-allocator hooks (useUserPosition, useUsdcBalance), Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/app/yield-estimator.tsx` | Create | Preset buttons, projection calc, CTA |
| `src/components/app/yield-estimator.test.tsx` | Create | Unit tests for estimator |
| `src/components/app/portfolio-summary.tsx` | Modify | Three-state rendering based on wallet |
| `src/components/app/vault-card.tsx` | Modify | Deposited row → CTA when no position |
| `src/app/app/page.tsx` | Modify | Pass wallet/position state to children |
| `src/lib/mock-data.ts` | Modify | Remove hardcoded VAULT_DEPOSITS |

---

### Task 1: YieldEstimator Component — Tests

**Files:**
- Create: `src/components/app/yield-estimator.test.tsx`

- [ ] **Step 1: Write failing tests for YieldEstimator**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { YieldEstimator } from './yield-estimator'

describe('YieldEstimator', () => {
  const defaultProps = {
    apy: 0.068,
    onConnect: () => {},
  }

  it('renders preset amount buttons', () => {
    render(<YieldEstimator {...defaultProps} />)
    expect(screen.getByRole('button', { name: '$100' })).toBeDefined()
    expect(screen.getByRole('button', { name: '$500' })).toBeDefined()
    expect(screen.getByRole('button', { name: '$1,000' })).toBeDefined()
    expect(screen.getByRole('button', { name: '$5,000' })).toBeDefined()
  })

  it('shows projected earnings for default preset ($100)', () => {
    render(<YieldEstimator {...defaultProps} />)
    // $100 * 6.8% / 365 = $0.019/day
    expect(screen.getByText(/Projected daily/)).toBeDefined()
    expect(screen.getByText(/\$0\.02/)).toBeDefined()
  })

  it('updates projection when a different preset is clicked', () => {
    render(<YieldEstimator {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '$1,000' }))
    // $1000 * 6.8% / 365 = $0.19/day
    expect(screen.getByText(/\$0\.19/)).toBeDefined()
  })

  it('shows "Start Earning" CTA when no wallet', () => {
    render(<YieldEstimator {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Start Earning/ })).toBeDefined()
  })

  it('shows "Deposit Now" CTA when wallet connected', () => {
    render(<YieldEstimator {...defaultProps} ctaMode="deposit" />)
    expect(screen.getByRole('button', { name: /Deposit Now/ })).toBeDefined()
  })

  it('shows wallet balance when provided', () => {
    render(<YieldEstimator {...defaultProps} walletBalance={500} ctaMode="deposit" />)
    expect(screen.getByText(/Your balance/)).toBeDefined()
    expect(screen.getByText(/500 USDC/)).toBeDefined()
  })

  it('caps default selection at $5,000 even with large balance', () => {
    render(<YieldEstimator {...defaultProps} walletBalance={999999} ctaMode="deposit" />)
    // Should show $5,000 projection, not $999,999
    // $5000 * 6.8% / 365 = $0.93/day
    expect(screen.getByText(/\$0\.93/)).toBeDefined()
  })

  it('falls back to $100 preset when balance is 0', () => {
    render(<YieldEstimator {...defaultProps} walletBalance={0} ctaMode="deposit" />)
    // $100 * 6.8% / 365 = $0.019/day
    expect(screen.getByText(/\$0\.02/)).toBeDefined()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd ~/local-dev/nanuqfi-app && pnpm vitest run src/components/app/yield-estimator.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Commit test file**

```bash
git add src/components/app/yield-estimator.test.tsx
git commit -m "test: add YieldEstimator unit tests (red)"
```

---

### Task 2: YieldEstimator Component — Implementation

**Files:**
- Create: `src/components/app/yield-estimator.tsx`

- [ ] **Step 1: Implement YieldEstimator**

```tsx
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
      {/* Balance indicator */}
      {walletBalance !== undefined && (
        <p className="text-xs text-slate-400">
          Your balance: <span className="text-slate-200 font-mono">{walletBalance.toLocaleString()} USDC</span>
        </p>
      )}

      {/* Label */}
      <p className="text-xs text-slate-400 uppercase tracking-wider">
        If you deposit:
      </p>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {PRESETS.map(amount => (
          <button
            key={amount}
            onClick={() => { setSelectedAmount(amount); setActivePreset(amount) }}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors',
              activePreset === amount
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 border border-white/5 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            {PRESET_LABELS[amount]}
          </button>
        ))}
      </div>

      {/* Projections */}
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

      {/* CTA */}
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
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd ~/local-dev/nanuqfi-app && pnpm vitest run src/components/app/yield-estimator.test.tsx`
Expected: 8 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/app/yield-estimator.tsx
git commit -m "feat: add YieldEstimator component"
```

---

### Task 3: PortfolioSummary — Three-State Rendering

**Files:**
- Modify: `src/components/app/portfolio-summary.tsx`

- [ ] **Step 1: Rewrite PortfolioSummary with wallet-aware states**

Replace the entire file with:

```tsx
'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { YieldEstimator } from '@/components/app/yield-estimator'
import { useAllocatorState, useRiskVault, useUserPosition, useUsdcBalance } from '@/hooks/use-allocator'
import { useKeeperHealth, useVaultData } from '@/hooks/use-keeper-api'
import {
  mockVaults,
  formatUsd,
  formatApy,
  formatDailyEarnings,
  normalizeApy,
  getTotalTvl,
  getWeightedApy,
} from '@/lib/mock-data'

function useMinutesAgo(timestampMs: number | undefined): number | null {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!timestampMs) return () => {}
    const interval = setInterval(onStoreChange, 60_000)
    return () => clearInterval(interval)
  }, [timestampMs])

  const getSnapshot = useCallback(() => {
    if (!timestampMs) return null
    return Math.round((Date.now() - timestampMs) / 60000)
  }, [timestampMs])

  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

export function PortfolioSummary() {
  const { publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const router = useRouter()
  const isConnected = !!publicKey

  // Protocol data (always fetched)
  const allocator = useAllocatorState()
  const modOnChain = useRiskVault(1)
  const aggOnChain = useRiskVault(2)
  const modKeeper = useVaultData('moderate')
  const aggKeeper = useVaultData('aggressive')
  const health = useKeeperHealth()

  // User position data (only meaningful when connected)
  const modPosition = useUserPosition(1)
  const aggPosition = useUserPosition(2)
  const usdcBalance = useUsdcBalance()

  const hasPosition = isConnected && (
    (modPosition.data?.shares ?? 0n) > 0n ||
    (aggPosition.data?.shares ?? 0n) > 0n
  )

  // Protocol TVL
  const modMock = mockVaults.find(v => v.riskLevel === 'moderate')
  const aggMock = mockVaults.find(v => v.riskLevel === 'aggressive')

  const modTvl = modOnChain.data
    ? Number(modOnChain.data.totalAssets) / 1e6
    : modKeeper.data?.tvl ?? modMock?.tvl ?? 0
  const aggTvl = aggOnChain.data
    ? Number(aggOnChain.data.totalAssets) / 1e6
    : aggKeeper.data?.tvl ?? aggMock?.tvl ?? 0

  const protocolTvl = allocator.data
    ? Number(allocator.data.totalTvl) / 1e6
    : (modTvl + aggTvl) > 0
      ? modTvl + aggTvl
      : getTotalTvl()

  // Weighted APY
  const modApy = normalizeApy(modKeeper.data?.apy ?? modMock?.apy ?? 0)
  const aggApy = normalizeApy(aggKeeper.data?.apy ?? aggMock?.apy ?? 0)
  const totalTvlForWeight = modTvl + aggTvl
  const apy = totalTvlForWeight > 0
    ? (modApy * modTvl + aggApy * aggTvl) / totalTvlForWeight
    : getWeightedApy()

  // User TVL (shares * share price)
  const userModValue = modPosition.data && modOnChain.data
    ? Number(modPosition.data.shares) * modOnChain.data.sharePrice / 1e6
    : 0
  const userAggValue = aggPosition.data && aggOnChain.data
    ? Number(aggPosition.data.shares) * aggOnChain.data.sharePrice / 1e6
    : 0
  const userTvl = userModValue + userAggValue
  const userDailyEarnings = userTvl * apy / 365

  // Wallet USDC balance (human readable)
  const walletUsdcBalance = usdcBalance.data !== null
    ? Number(usdcBalance.data) / 1e6
    : undefined

  // AI Pulse
  const minutesAgo = useMinutesAgo(health.data?.lastCycleTimestamp)
  const isKeeperOnline = !!health.data && !health.loading
  const pulseColor = isKeeperOnline ? 'bg-emerald-400' : 'bg-amber-400'
  const pulseText = health.loading
    ? '...'
    : minutesAgo !== null
      ? `Active ${minutesAgo}m ago`
      : 'Offline'
  const pulseTextColor = isKeeperOnline ? 'text-emerald-400' : 'text-amber-400'

  // ─── Protocol metrics row (always visible) ────────────────────────────

  const protocolRow = (
    <div className="grid grid-cols-3 gap-6 sm:divide-x divide-white/5">
      <div className="space-y-1">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Protocol TVL</p>
        <p className="text-2xl font-mono tabular-nums text-white">
          {formatUsd(protocolTvl)}
        </p>
      </div>
      <div className="space-y-1 sm:pl-6">
        <p className="text-xs text-slate-400 uppercase tracking-wider">Weighted APY</p>
        <p className="text-2xl font-mono tabular-nums text-white">
          {formatApy(apy)}
        </p>
      </div>
      <div className="space-y-1 sm:pl-6">
        <p className="text-xs text-slate-400 uppercase tracking-wider">AI Pulse</p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {isKeeperOnline && (
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pulseColor} opacity-75`} />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${pulseColor}`} />
          </span>
          <span className={`text-lg font-mono tabular-nums ${pulseTextColor}`}>
            {pulseText}
          </span>
        </div>
      </div>
    </div>
  )

  // ─── State 3: Connected with position ─────────────────────────────────

  if (hasPosition) {
    return (
      <GlassCard className="p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:divide-x divide-white/5">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Your Value</p>
            <p className="text-2xl font-mono tabular-nums text-white">
              {formatUsd(userTvl)}
            </p>
          </div>
          <div className="relative space-y-1 sm:pl-6">
            <div className="absolute -left-2 top-0 h-full w-[2px] bg-sky-500 blur-[2px] hidden sm:block" />
            <p className="text-xs text-sky-400/80 uppercase tracking-wider">Daily Earnings</p>
            <p className="text-3xl font-mono tabular-nums text-sky-400">
              {formatDailyEarnings(userDailyEarnings)}
              <span className="text-sm text-sky-400/60 ml-1">/day</span>
            </p>
          </div>
          <div className="space-y-1 sm:pl-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Weighted APY</p>
            <p className="text-2xl font-mono tabular-nums text-white">
              {formatApy(apy)}
            </p>
          </div>
          <div className="space-y-1 sm:pl-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider">AI Pulse</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isKeeperOnline && (
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${pulseColor} opacity-75`} />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${pulseColor}`} />
              </span>
              <span className={`text-lg font-mono tabular-nums ${pulseTextColor}`}>
                {pulseText}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    )
  }

  // ─── State 1 & 2: Disconnected / Connected without position ───────────

  return (
    <GlassCard className="p-6 space-y-5">
      {protocolRow}
      <div className="border-t border-white/5 pt-5">
        <YieldEstimator
          apy={apy}
          walletBalance={isConnected ? walletUsdcBalance : undefined}
          ctaMode={isConnected ? 'deposit' : 'connect'}
          onConnect={() => {
            if (isConnected) {
              router.push('/app/vaults/moderate')
            } else {
              setVisible(true)
            }
          }}
        />
      </div>
    </GlassCard>
  )
}
```

- [ ] **Step 2: Build to verify no type errors**

Run: `cd ~/local-dev/nanuqfi-app && pnpm build 2>&1 | tail -15`
Expected: clean build

- [ ] **Step 3: Run all tests**

Run: `cd ~/local-dev/nanuqfi-app && pnpm test`
Expected: all tests pass (existing + new estimator tests)

- [ ] **Step 4: Commit**

```bash
git add src/components/app/portfolio-summary.tsx
git commit -m "feat: three-state PortfolioSummary (estimator/balance/portfolio)"
```

---

### Task 4: VaultCard — Wallet-Aware Deposited Row

**Files:**
- Modify: `src/components/app/vault-card.tsx`

- [ ] **Step 1: Update VaultCard to accept wallet state**

Replace `VaultCardProps` and the deposited row section:

```tsx
// In vault-card.tsx, update the interface:
interface VaultCardProps {
  vault: Vault
  deposited?: number
  confidence?: number
  isConnected?: boolean
}

// Update the component signature:
export function VaultCard({ vault, deposited, confidence, isConnected }: VaultCardProps) {
  const hasPosition = deposited !== undefined && deposited > 0
  const apy = normalizeApy(vault.apy)
  const dailyProjection = vault.tvl * apy / 365

  // ... keep everything the same until the Deposited row ...

  // Replace the Deposited row (lines 55-60) with:
  {hasPosition ? (
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
      <span className="text-xs text-slate-400">Deposited</span>
      <span className="font-mono text-sm text-slate-200">
        {formatUsd(deposited)}
      </span>
    </div>
  ) : (
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
      <span className="text-xs text-emerald-400 font-medium">
        {isConnected ? 'Deposit →' : 'Deposit →'}
      </span>
      <span className="text-xs text-slate-400">
        Earn {formatApy(apy)}
      </span>
    </div>
  )}

  // ... rest unchanged
```

- [ ] **Step 2: Update dashboard page to pass isConnected**

In `src/app/app/page.tsx`, add wallet hook and pass to VaultCard:

```tsx
// Add imports at top:
import { useWallet } from '@solana/wallet-adapter-react'
import { useUserPosition } from '@/hooks/use-allocator'

// Inside DashboardPage(), add:
const { publicKey } = useWallet()
const isConnected = !!publicKey

const modPosition = useUserPosition(1)
const aggPosition = useUserPosition(2)

const userDeposits: Record<string, number> = {
  moderate: modPosition.data && moderateVault.tvl > 0
    ? Number(modPosition.data.depositedUsdc) / 1e6
    : 0,
  aggressive: aggPosition.data && aggressiveVault.tvl > 0
    ? Number(aggPosition.data.depositedUsdc) / 1e6
    : 0,
}

// Update VaultCard rendering — replace VAULT_DEPOSITS usage:
<VaultCard
  key={level}
  vault={vaults[level]}
  deposited={isConnected ? userDeposits[level] : undefined}
  confidence={VAULT_CONFIDENCE[level]}
  isConnected={isConnected}
/>
```

Also remove the hardcoded `VAULT_DEPOSITS` constant (lines 19-22).

- [ ] **Step 3: Build and test**

Run: `cd ~/local-dev/nanuqfi-app && pnpm build 2>&1 | tail -15 && pnpm test`
Expected: clean build, all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/app/vault-card.tsx src/app/app/page.tsx
git commit -m "feat: wallet-aware vault cards with real position data"
```

---

### Task 5: Vault Detail Page — Daily Label Tweak

**Files:**
- Modify: `src/app/app/vaults/[riskLevel]/page.tsx`

- [ ] **Step 1: Add wallet-aware "Daily" label in header pill**

In `VaultDetailContent`, add wallet check and update the Daily stat label:

```tsx
// Add import:
import { useWallet } from '@solana/wallet-adapter-react'

// Inside VaultDetailContent, add:
const { publicKey } = useWallet()
const isConnected = !!publicKey
const userHasPosition = isConnected && (userPosition.data?.shares ?? 0n) > 0n

// Compute user-specific daily if they have a position:
const userValue = userHasPosition && onChain.data
  ? Number(userPosition.data!.shares) * onChain.data.sharePrice / 1e6
  : 0
const displayDaily = userHasPosition ? userValue * apy / 365 : dailyEarnings

// Update the Daily stat in the header pill (line ~165-166):
<p className="text-[11px] text-slate-500 uppercase tracking-widest mb-0.5">
  {userHasPosition ? 'Daily (yours)' : 'Daily (vault)'}
</p>
<p className="text-lg font-bold font-mono text-slate-200">
  {formatDailyEarnings(displayDaily)}
</p>
```

- [ ] **Step 2: Build and test**

Run: `cd ~/local-dev/nanuqfi-app && pnpm build 2>&1 | tail -15 && pnpm test`
Expected: clean build, all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/app/app/vaults/\[riskLevel\]/page.tsx
git commit -m "feat: vault detail daily label shows (yours) vs (vault)"
```

---

### Task 6: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `cd ~/local-dev/nanuqfi-app && pnpm build`
Expected: clean build, no warnings

- [ ] **Step 2: Full test suite**

Run: `cd ~/local-dev/nanuqfi-app && pnpm test`
Expected: all tests pass (26 existing + 8 new estimator = 48+ total)

- [ ] **Step 3: Visual verification in browser**

Open `nanuqfi.com/app` after deploy:
1. **Disconnected**: hero shows Protocol TVL + APY + AI Pulse on top row, yield estimator below with preset buttons, "Start Earning →" CTA
2. **Connect wallet**: estimator shows balance, CTA changes to "Deposit Now →"
3. **With position**: hero shows "Your Value" + "Daily Earnings" + APY + AI Pulse (current layout with real data)
4. **Vault cards**: show "Deposit → Earn X%" when no position, show actual deposited when has position

- [ ] **Step 4: Push**

```bash
git push origin main
```
