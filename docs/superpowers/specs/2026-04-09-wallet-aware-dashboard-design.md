# Wallet-Aware Dashboard UX

**Date:** 2026-04-09
**Status:** Draft
**Scope:** Dashboard, vault cards, vault detail page — wallet state-dependent rendering

---

## Problem

The dashboard displays protocol-level metrics (TVL, APY) alongside user-level metrics (Daily Earnings, Deposited) with no distinction. When a wallet is disconnected, users see "$260 TVL", "$0.05/day earnings", "$210 deposited" — implying they have an active position when they don't. This is misleading and breaks trust.

## Principle

Every metric is either **protocol-level** (always visible, clearly labeled) or **user-level** (wallet-gated). No ambiguity. Protocol data sells the product. User data appears only when real.

## Three Dashboard States

### State 1: Disconnected (no wallet)

**Hero card** becomes an **Interactive Yield Estimator**:

```
┌──────────────────────────────────────────────────────────┐
│ PROTOCOL TVL    WEIGHTED APY    AI PULSE                 │
│ $260            6.8%            Active 5m ago             │
│──────────────────────────────────────────────────────────│
│ YIELD ESTIMATOR                                          │
│ If you deposit:  [$100] [$500] [$1,000] [$5,000]        │
│                                                          │
│ Projected daily:   $0.19/day                             │
│ Projected monthly: $5.59/mo                              │
│ Projected yearly:  $68.00/yr                             │
│                                                          │
│              [ Start Earning → ]                         │
└──────────────────────────────────────────────────────────┘
```

- Preset amount buttons: $100, $500, $1,000, $5,000
- Calculations use current weighted APY (6.8%)
- "Start Earning →" triggers `useWalletModal().setVisible(true)`
- Protocol metrics row (TVL, APY, AI Pulse) always visible at top

### State 2: Connected, no position

**Hero card** — same estimator, but:
- Presets still visible for quick comparison
- Shows wallet balance above presets: "Your balance: X USDC"
- Default selection: wallet balance capped at $5,000 (avoids absurd projections on devnet with large test balances). Falls back to first preset ($100) if balance is 0.
- CTA changes to "Deposit Now →" linking to `/app/vaults/moderate`
- Protocol metrics row unchanged

### State 3: Connected, has position(s)

**Hero card** becomes **Your Portfolio**:

```
┌──────────────────────────────────────────────────────────┐
│ YOUR VALUE      DAILY EARNINGS    WEIGHTED APY  AI PULSE │
│ $260            $0.05/day         6.8%          Active   │
└──────────────────────────────────────────────────────────┘
```

- User TVL = sum of (user shares * share price) per vault, read from `useUserPosition` + `useRiskVault`
- Daily Earnings = user TVL * weighted APY / 365
- This is the current layout — no change needed except sourcing from user position data instead of protocol-level

## Vault Cards (Dashboard)

| Field | Disconnected | Connected (no position) | Connected (has position) |
|-------|-------------|------------------------|-------------------------|
| APY | Show | Show | Show |
| Daily Projection | Vault-level estimate | Vault-level estimate | User deposit-based |
| Deposited row | **Hidden** — replaced by "Deposit →" CTA button | **Hidden** — "Deposit →" CTA | Shows user deposit |
| Confidence | Show | Show | Show |

The "Deposit →" CTA in disconnected state triggers wallet connect modal. In connected-no-position state, it links to the vault detail page.

## Vault Detail Page

No major changes. The `DepositForm` already handles wallet state internally (disables submit, shows "Connect your wallet" hint). The header stats (APY, Daily, TVL) are protocol-level and should always display.

One tweak: the "Daily" stat in the header pill should clarify it's protocol-level when disconnected:
- Disconnected: label "Daily (vault)" with vault-level earnings
- Connected with position: label "Daily (yours)" with user-level earnings

## Vaults Explorer Page

No changes needed. VaultColumn shows protocol-level data (TVL, APY, daily earnings, allocation). This is a comparison/browse view — wallet state is irrelevant here.

## Activity Page

No changes. AI decisions are protocol-level — always visible regardless of wallet state.

## Implementation Details

### Wallet state detection

Use existing `useWallet()` hook from `@solana/wallet-adapter-react`:

```typescript
const { publicKey, connected } = useWallet()
const isConnected = !!publicKey
```

### User position detection

Use existing `useUserPosition()` hook from `use-allocator.ts`:

```typescript
const modPosition = useUserPosition(1) // moderate
const aggPosition = useUserPosition(2) // aggressive
const hasPosition = (modPosition.data?.shares ?? 0n) > 0n
  || (aggPosition.data?.shares ?? 0n) > 0n
```

### Yield estimator calculation

```typescript
const weightedApy = apy // from existing calculation
const presets = [100, 500, 1000, 5000]
const [selectedAmount, setSelectedAmount] = useState(presets[0])

const projectedDaily = selectedAmount * weightedApy / 365
const projectedMonthly = projectedDaily * 30
const projectedYearly = selectedAmount * weightedApy
```

### Components affected

| Component | Change |
|-----------|--------|
| `portfolio-summary.tsx` | Major — three-state rendering (estimator / estimator+balance / portfolio) |
| `vault-card.tsx` | Minor — hide Deposited row when no position, show CTA instead |
| `app/page.tsx` | Minor — pass wallet state + position data to child components |
| `vaults/[riskLevel]/page.tsx` | Minor — "Daily" label tweak in header pill |

### New components

| Component | Purpose |
|-----------|---------|
| `yield-estimator.tsx` | Preset buttons, projection display, CTA — used inside PortfolioSummary |

## Testing

- Unit test: `yield-estimator.test.tsx` — projection calculations for each preset
- Unit test: `portfolio-summary` three-state rendering (mock useWallet)
- Unit test: `vault-card` deposited row visibility based on wallet state
- Visual: verify all three states in browser (disconnect → connect → deposit)

## Scope Exclusions

- No changes to marketing pages — they don't show user-specific data
- No changes to activity page — all protocol-level
- No changes to strategy page
- No wallet-gating or splash screens — users can always browse
