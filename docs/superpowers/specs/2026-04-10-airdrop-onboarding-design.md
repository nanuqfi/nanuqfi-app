# Test USDC Airdrop + Guided Onboarding Design

**Date:** 2026-04-10
**Repo:** nanuqfi/nanuqfi-app
**Purpose:** Let hackathon judges and new users test deposits/withdrawals with zero friction

---

## Problem

Judges can't test the core product. Our USDC mint is custom (`BiTXT15...`) — judges won't have it. Without test USDC, they see the UI but can't actually deposit or withdraw. The entire on-chain experience is unreachable.

## Solution

A 4-step guided onboarding flow with a server-side test USDC faucet. Judge goes from zero to an active vault position in under 2 minutes.

---

## User Journey (4 steps)

```
1. Switch wallet to Devnet (clear per-wallet instructions)
2. Connect Wallet (one click)
3. Get Test USDC ($100 / $1,000 / $100,000 presets) + auto SOL for fees
4. First Deposit ($100 / $1,000 presets into Moderate or Aggressive vault)
```

---

## Components

### 1. API Route: `/api/airdrop`

**Server-side only.** Mints test USDC to a connected wallet.

**Request:** `POST /api/airdrop`
```json
{ "wallet": "FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr", "amount": 100000 }
```
- `wallet` — base58 public key string
- `amount` — USDC in human units (100, 1000, 100000)

**Response:**
```json
{ "success": true, "signature": "5wHu...", "balance": "101000.00" }
```

**Error response:**
```json
{ "success": false, "error": "Rate limited — try again in 10 minutes" }
```

**Implementation:**
1. Validate: wallet is valid base58 pubkey, amount is one of [100, 1000, 100000]
2. Load mint authority keypair from `MINT_AUTHORITY_KEYPAIR` env var (path to keypair JSON file)
3. Connect to RPC via `HELIUS_RPC_URL`
4. Get or create the user's USDC ATA using `getOrCreateAssociatedTokenAccount`
5. Call `mintTo` to mint `amount * 10^6` (6 decimals) test USDC
6. Also call `connection.requestAirdrop` for 2 SOL (devnet faucet) for transaction fees — catch and ignore if faucet rate-limits
7. Return signature and new balance
8. Rate limit: 1 airdrop per wallet per 10 minutes (in-memory Map with cleanup)

**Environment:**
```
MINT_AUTHORITY_KEYPAIR=/path/to/solana-devnet.json
```

**Security:**
- Devnet only — reject if not pointing to devnet RPC
- Amount whitelist — only 100, 1000, 100000 accepted (no arbitrary minting)
- Rate limit per wallet — prevents abuse

### 2. Onboarding Guide Component

A slide-out panel triggered from the devnet banner. Glass card styling, consistent with app design system.

**Trigger:** "New here? Get started →" link in the existing devnet banner at top of `/app`

**Layout:** Full-width panel below the devnet banner (not a modal — stays in page flow). Progress bar at top showing steps 1-4.

**Step 1 — Switch to Devnet**
- Heading: "Switch Your Wallet to Devnet"
- Instructions for Phantom: "Settings → Developer Settings → Testnet Mode → ON"
- Instructions for Solflare: "Settings → General → Network → Devnet"
- Small info note: "This ensures you're using test tokens, not real funds"
- "I've switched to Devnet" button → advances to Step 2

**Step 2 — Connect Wallet**
- Heading: "Connect Your Wallet"
- If no wallet detected: show "Install Phantom" link to phantom.app, plus note about Solflare
- If wallet detected but not connected: big "Connect Wallet" button (triggers existing wallet modal)
- If already connected: auto-advance with green checkmark, show truncated address
- Auto-advances when `publicKey` becomes available

**Step 3 — Get Test USDC**
- Heading: "Get Free Test USDC"
- Subtext: "This is devnet — test tokens have no real value"
- Three preset buttons side by side:
  - **$100** (small test)
  - **$1,000** (recommended)
  - **$100,000** (whale mode)
- Loading state on the clicked button while tx confirms
- Success: green checkmark + "Received! Balance: X USDC" + auto-advance after 2s
- Error: red message + retry button
- Also silently airdrops 2 SOL for fees (no UI for this — just happens)

**Step 4 — First Deposit**
- Heading: "Make Your First Deposit"
- Subtext: "Pick a vault and deposit amount"
- Vault selector: two cards — **Moderate** (recommended badge) and **Aggressive**
- Amount presets: **$100** | **$1,000** buttons
- "Deposit $X into [Vault]" CTA button
- Uses existing `buildDepositInstruction` + `sendTransaction` flow
- Success: celebration state — "You're earning yield! 🎉" + link to vault detail page
- The existing DepositForm validation handles edge cases

**Completion:**
- Guide collapses/dismisses
- User is on the dashboard with a live position
- A "Run the guide again" link in devnet banner for re-access

### 3. Deposit Form Preset Amounts

Add an optional `presetAmounts` prop to the existing `DepositForm` component:

```typescript
interface DepositFormProps {
  // ... existing props
  presetAmounts?: number[]  // e.g., [100, 1000]
}
```

When provided, render preset buttons above the manual input:
```
[ $100 ] [ $1,000 ] [ ____custom____ ]
```

Clicking a preset fills the input and clears validation errors. This is reusable — the onboarding uses it, but regular users see it too on the vault detail page.

### 4. Integration Points

- **Devnet banner** (`src/app/app/layout.tsx`): Add "New here? Get started →" link
- **DepositForm** (`src/components/app/deposit-form.tsx`): Add `presetAmounts` prop
- **Vault detail page**: Pass `presetAmounts={[100, 1000]}` to DepositForm

---

## File Structure

```
src/
  app/
    api/
      airdrop/
        route.ts              — POST handler (mint USDC + airdrop SOL)
  components/
    app/
      onboarding-guide.tsx    — 4-step guided panel
      deposit-form.tsx        — MODIFY: add presetAmounts prop
  app/
    app/
      layout.tsx              — MODIFY: add onboarding trigger to devnet banner
```

---

## Edge Cases

- **Wallet not on devnet**: NetworkGuard banner already warns. Step 1 of onboarding explicitly addresses this.
- **SOL airdrop fails**: Devnet faucet rate-limits aggressively. Catch and ignore — user might already have SOL, and the error is non-critical. Show a note: "If transactions fail, you may need devnet SOL — use faucet.solana.com"
- **User already has test USDC**: Step 3 still works — minting adds to existing balance. Show current balance.
- **User skips steps**: Each step checks preconditions. Can't get USDC without connecting. Can't deposit without USDC.
- **Multiple airdrops**: Rate limited to 1 per wallet per 10 minutes. Show countdown if limited.
- **Judge on mobile**: The guide works on mobile viewport. Steps stack vertically.

---

## Out of Scope

- Custom airdrop amounts (only presets: 100, 1000, 100000)
- Mainnet airdrop (this is devnet only, forever)
- Automatic wallet network switching (wallets don't support this programmatically)
- Persisting onboarding completion state (localStorage could work but YAGNI)
