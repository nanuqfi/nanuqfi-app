# Playwright E2E Test Suite Design

**Date:** 2026-04-10
**Repo:** nanuqfi/nanuqfi-app
**Approach:** Mock at Playwright network layer — zero production code changes

---

## Overview

Comprehensive Playwright E2E test suite covering all user flows in the NanuqFi frontend. Mocks are applied at the browser network layer via `page.route()` and `page.addInitScript()` — the production codebase is untouched.

---

## File Structure

```
e2e/
  fixtures/
    wallet-mock.ts          — Injects window.solana + auto-approves transactions
    rpc-mock.ts             — page.route('/api/rpc') handler with JSON-RPC response factory
    keeper-mock.ts          — page.route('*/v1/*') handler with fixture data
  fixtures/data/
    rpc-responses.ts        — Mock RPC responses (getAccountInfo, getBalance, blockhash, etc.)
    keeper-responses.ts     — Mock keeper API responses (vaults, decisions, health)
  tests/
    marketing.spec.ts       — Homepage, strategy page, navigation links
    dashboard.spec.ts       — Portfolio summary, vault cards, mock data badge
    vault-detail.spec.ts    — Deposit/withdraw flow, validation, share price, MAX button
    activity.spec.ts        — Decision feed, detail panel, AI reasoning
    wallet.spec.ts          — Connect, disconnect, network guard banner
    error.spec.ts           — Error boundaries, graceful error display
    responsive.spec.ts      — Mobile hamburger nav, breakpoint layouts
    accessibility.spec.ts   — axe-core ARIA audit on key pages
playwright.config.ts        — Chromium only, webServer: next dev, CI reporter
```

---

## Mock Strategy

### Wallet Mock (`e2e/fixtures/wallet-mock.ts`)

Injected via `page.addInitScript()` before any page navigation. Creates a fake `window.solana` object that simulates Phantom wallet:

```typescript
// Injected into browser context — NOT production code
window.solana = {
  isPhantom: true,
  isConnected: false,
  publicKey: null,

  async connect() {
    this.isConnected = true
    this.publicKey = { toBase58: () => 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr', toBuffer: () => new Uint8Array(32), toBytes: () => new Uint8Array(32), equals: () => false, toString: () => 'FGSkt...' }
    return { publicKey: this.publicKey }
  },

  async disconnect() {
    this.isConnected = false
    this.publicKey = null
  },

  async signTransaction(tx) { return tx },
  async signAllTransactions(txs) { return txs },

  on(event, cb) { /* store listeners */ },
  off(event, cb) { /* remove listeners */ },
}
```

The wallet adapter library (`@solana/wallet-adapter-wallets`) auto-detects `window.solana` and registers Phantom. The wallet modal's "Phantom" button calls `window.solana.connect()`.

### RPC Mock (`e2e/fixtures/rpc-mock.ts`)

Intercepts `**/api/rpc` POST requests via `page.route()`. Routes JSON-RPC methods to mock responses:

| Method | Mock Response |
|--------|-------------|
| `getAccountInfo` | Returns mock Allocator/RiskVault/UserPosition/Treasury account data (correct Borsh-encoded buffers) |
| `getBalance` | Returns 5 SOL (enough for fees) |
| `getLatestBlockhash` | Returns fixed blockhash + lastValidBlockHeight |
| `sendTransaction` | Returns fixed signature string |
| `getSignatureStatuses` | Returns `{ confirmationStatus: 'confirmed' }` |
| `getTokenAccountBalance` | Returns mock USDC balance (1000 USDC) |
| `getTokenAccountsByOwner` | Returns mock user token accounts (USDC + shares) |
| `getMultipleAccounts` | Delegates to getAccountInfo per key |
| `getSlot` | Returns fixed slot number |

The mock handler parses the JSON-RPC body, dispatches by `method`, and returns a valid `{ jsonrpc: '2.0', result: ..., id }` envelope.

### Keeper Mock (`e2e/fixtures/keeper-mock.ts`)

Intercepts keeper API calls via `page.route()`:

| Route Pattern | Mock Response |
|--------------|-------------|
| `*/v1/health` | `{ uptime: 3600, cyclesCompleted: 50, aiLayerStatus: 'healthy', rpcStatus: 'healthy' }` |
| `*/v1/vaults/moderate` | TVL: 50000, APY: 0.082, weights: { kamino: 6000, marginfi: 2500, lulo: 1500 } |
| `*/v1/vaults/aggressive` | TVL: 25000, APY: 0.115, weights: { kamino: 4000, marginfi: 3000, lulo: 3000 } |
| `*/v1/vaults/*/decisions` | Array of 3 mock decisions with timestamps, weights, reasoning |
| `*/v1/decisions` | Combined decision array |
| `*/v1/yields` | Per-protocol yield estimates |
| `*/v1/ai` | Mock AI insight with regime: 'range', confidence scores |

---

## Test Specifications

### marketing.spec.ts (3 tests)

1. **Homepage loads with all sections** — Navigate to `/`, verify hero title, "How it Works" section, tier showcase (3 risk levels visible), performance proof section, trust bar
2. **Strategy page renders** — Navigate to `/strategy`, verify main heading and content loads
3. **Navigation links work** — Click "Launch App" from homepage → arrives at `/app`, click logo → returns to `/`

### dashboard.spec.ts (3 tests)

1. **Dashboard renders vault cards** — Navigate to `/app`, verify 3 vault cards (conservative, moderate, aggressive) with APY and TVL from keeper mock
2. **Mock data badge visible without wallet** — Without wallet connected, verify "Demo data" badge appears on vault cards
3. **Portfolio summary shows wallet state** — Without wallet: shows "Connect wallet" prompt. With wallet mock: shows balance

### vault-detail.spec.ts (4 tests)

1. **Deposit validation rejects invalid input** — Navigate to `/app/vaults/moderate`, try submit with empty input → validation error, try negative → error, try exceeding balance → error
2. **MAX button fills correct amount** — Connect wallet mock, click MAX in deposit mode → input fills with wallet USDC balance. Switch to withdraw → MAX fills with share value using share price
3. **Withdraw mode shows USDC value** — Switch to withdraw tab, verify "Value: X USDC" label (not raw share count)
4. **Protocol allocation visible** — Verify protocol weight bars render with percentages matching keeper mock data

### activity.spec.ts (2 tests)

1. **Decision feed loads** — Navigate to `/app/activity`, verify decision cards render with timestamps and vault labels
2. **Decision detail opens** — Click a decision card, verify detail panel shows reasoning text, weight changes, and tx link (or "N/A")

### wallet.spec.ts (3 tests)

1. **Connect wallet shows truncated address** — Click wallet button, select Phantom in modal, verify nav shows truncated address (e.g., "FGSk...BWWr")
2. **Disconnect clears wallet state** — After connecting, click address → disconnect, verify wallet button returns to "Connect Wallet"
3. **Network mismatch shows banner** — Inject wallet mock with wrong genesis hash response in RPC mock, verify amber "Wrong Network" banner appears

### error.spec.ts (2 tests)

1. **Error boundary catches render error** — Use `page.route()` to make keeper API return 500, then navigate to `/app` — verify error boundary message "Something went wrong" + "Try again" button visible (not white screen)
2. **Try again resets error** — After error boundary shows, click "Try again", verify page attempts re-render

### responsive.spec.ts (2 tests)

1. **Mobile hamburger menu** — Set viewport to 375x667 (iPhone SE), verify hamburger icon visible, click it → nav items appear, click item → navigates and menu closes
2. **Desktop nav layout** — Set viewport to 1280x720, verify all nav items visible in horizontal bar, no hamburger icon

### accessibility.spec.ts (1 test)

1. **No critical ARIA violations** — Use `@axe-core/playwright` on `/`, `/app`, `/app/vaults/moderate` — assert zero critical/serious violations

---

## Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  retries: 1,
  workers: 1,             // Sequential — shared dev server
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
})
```

Key decisions:
- **Chromium only** — sufficient for E2E validation, keeps CI fast
- **Sequential workers** — avoids port conflicts with single dev server
- **Trace on failure** — captures timeline + screenshots for debugging
- **webServer** — Playwright starts `pnpm dev` automatically, reuses if running locally

---

## CI Integration

Add to `.github/workflows/deploy.yml` in the `build-test` job, after existing test step:

```yaml
- name: Install Playwright browsers
  run: pnpm exec playwright install chromium --with-deps

- name: Run E2E tests
  run: pnpm exec playwright test
  env:
    HELIUS_RPC_URL: https://api.devnet.solana.com
    NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID: 2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P
    NEXT_PUBLIC_USDC_MINT: BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh
    NEXT_PUBLIC_KEEPER_API_URL: http://localhost:3001
```

The `HELIUS_RPC_URL` is set to public devnet as a fallback, but the RPC mock intercepts all calls before they reach the proxy — no real RPC traffic in tests.

---

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.52",
    "@axe-core/playwright": "^4.10"
  }
}
```

---

## Out of Scope

- Multi-browser testing (Firefox, WebKit) — can add later, Chromium-only for now
- Visual regression testing (screenshot comparison) — separate initiative
- Performance testing (Lighthouse CI) — separate initiative
- Real devnet integration tests — the mocks test UI behavior, not on-chain correctness
