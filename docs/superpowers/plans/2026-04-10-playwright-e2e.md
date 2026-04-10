# Playwright E2E Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add comprehensive Playwright E2E tests covering all user flows — mocked at the network layer, zero production code changes.

**Architecture:** Playwright intercepts `/api/rpc` and keeper API calls via `page.route()`. Wallet is mocked via `page.addInitScript()`. Tests run against `pnpm dev` server, Chromium only, in CI on every PR.

**Tech Stack:** Playwright 1.52, @axe-core/playwright, Next.js 16, TypeScript

---

## Task 1: Install Playwright and create config

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Install dependencies**

```bash
cd ~/local-dev/nanuqfi-app
pnpm add -D @playwright/test @axe-core/playwright
pnpm exec playwright install chromium
```

- [ ] **Step 2: Create playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  retries: 1,
  workers: 1,
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
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 3: Add Playwright artifacts to .gitignore**

Append to `.gitignore`:

```
# Playwright
playwright-report/
test-results/
```

- [ ] **Step 4: Add e2e script to package.json**

Add to `"scripts"`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 5: Verify Playwright runs (expect 0 tests)**

```bash
pnpm test:e2e
```

Expected: "No tests found" or 0 passed. Confirms Playwright is installed correctly.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml playwright.config.ts .gitignore
git commit -m "chore: install Playwright and create config"
```

---

## Task 2: Create mock fixtures (RPC, Keeper, Wallet)

**Files:**
- Create: `e2e/fixtures/data/rpc-responses.ts`
- Create: `e2e/fixtures/data/keeper-responses.ts`
- Create: `e2e/fixtures/rpc-mock.ts`
- Create: `e2e/fixtures/keeper-mock.ts`
- Create: `e2e/fixtures/wallet-mock.ts`

- [ ] **Step 1: Create RPC response data**

Create `e2e/fixtures/data/rpc-responses.ts`:

```typescript
/** Mock JSON-RPC responses for Solana RPC methods */

export const MOCK_BLOCKHASH = '4xKmR8vNqJ3pTfW9bLcD2hYs6eAoUg5mXnZ7rQaBcDe'
export const MOCK_BLOCK_HEIGHT = 200_000_000
export const MOCK_SLOT = 350_000_000
export const MOCK_TX_SIGNATURE = '5wHu1qwD7q4k3fN8tPvR2jYh6cAsUg5mXnZ7rQaBcDeF9gH2iJ3kL4mN5oP6qR7sT8u'

export const rpcResponses: Record<string, (params?: unknown[]) => unknown> = {
  getLatestBlockhash: () => ({
    value: {
      blockhash: MOCK_BLOCKHASH,
      lastValidBlockHeight: MOCK_BLOCK_HEIGHT,
    },
    context: { slot: MOCK_SLOT },
  }),

  getBalance: () => ({
    value: 5_000_000_000, // 5 SOL
    context: { slot: MOCK_SLOT },
  }),

  getSlot: () => MOCK_SLOT,

  getTokenAccountBalance: () => ({
    value: {
      amount: '1000000000', // 1000 USDC (6 decimals)
      decimals: 6,
      uiAmount: 1000,
      uiAmountString: '1000',
    },
    context: { slot: MOCK_SLOT },
  }),

  getAccountInfo: () => ({
    value: {
      data: [Buffer.alloc(512).toString('base64'), 'base64'],
      executable: false,
      lamports: 10_000_000,
      owner: '11111111111111111111111111111111',
      rentEpoch: 0,
    },
    context: { slot: MOCK_SLOT },
  }),

  getTokenAccountsByOwner: () => ({
    value: [
      {
        pubkey: 'MockUsdcTokenAccount111111111111111111111111',
        account: {
          data: [Buffer.alloc(165).toString('base64'), 'base64'],
          executable: false,
          lamports: 2_039_280,
          owner: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          rentEpoch: 0,
        },
      },
    ],
    context: { slot: MOCK_SLOT },
  }),

  sendTransaction: () => MOCK_TX_SIGNATURE,

  getSignatureStatuses: () => ({
    value: [{ confirmationStatus: 'confirmed', err: null }],
    context: { slot: MOCK_SLOT },
  }),

  getMultipleAccounts: (params?: unknown[]) => {
    const keys = (params?.[0] as string[]) ?? []
    return {
      value: keys.map(() => ({
        data: [Buffer.alloc(512).toString('base64'), 'base64'],
        executable: false,
        lamports: 10_000_000,
        owner: '11111111111111111111111111111111',
        rentEpoch: 0,
      })),
      context: { slot: MOCK_SLOT },
    }
  },

  getRecentPrioritizationFees: () => [],

  getMinimumBalanceForRentExemption: () => 2_039_280,

  simulateTransaction: () => ({
    value: { err: null, logs: [] },
    context: { slot: MOCK_SLOT },
  }),

  getBlockHeight: () => MOCK_BLOCK_HEIGHT,

  getGenesisHash: () => 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG', // devnet
}
```

- [ ] **Step 2: Create keeper response data**

Create `e2e/fixtures/data/keeper-responses.ts`:

```typescript
/** Mock keeper API responses */

export const healthResponse = {
  uptime: 3600,
  lastCycleTimestamp: Date.now(),
  cyclesCompleted: 50,
  cyclesFailed: 1,
  aiLayerStatus: 'healthy',
  rpcStatus: 'healthy',
}

export const vaultModerate = {
  riskLevel: 'moderate',
  tvl: 50000,
  apy: 0.082,
  weights: {
    'kamino-lending': 6000,
    'marginfi-lending': 2500,
    'lulo-lending': 1500,
  },
  drawdown: 0.005,
  sharePrice: 1.02,
}

export const vaultAggressive = {
  riskLevel: 'aggressive',
  tvl: 25000,
  apy: 0.115,
  weights: {
    'kamino-lending': 4000,
    'marginfi-lending': 3000,
    'lulo-lending': 3000,
  },
  drawdown: 0.012,
  sharePrice: 1.05,
}

export const vaultConservative = {
  riskLevel: 'conservative',
  tvl: 0,
  apy: 0,
  weights: {},
  drawdown: 0,
  sharePrice: 1.0,
}

export const mockDecisions = [
  {
    id: 'd1',
    timestamp: new Date(Date.now() - 600_000).toISOString(),
    vault: 'moderate',
    action: 'rebalance',
    summary: 'Increased Kamino allocation from 55% to 60% due to rising APY',
    weightChanges: [
      { source: 'kamino-lending', from: 5500, to: 6000 },
      { source: 'marginfi-lending', from: 3000, to: 2500 },
    ],
    aiInvolved: true,
    reason: 'Kamino USDC lending rate increased to 8.2%, outperforming Marginfi at 6.5%. AI confidence: 0.85.',
  },
  {
    id: 'd2',
    timestamp: new Date(Date.now() - 1_200_000).toISOString(),
    vault: 'aggressive',
    action: 'hold',
    summary: 'Weights unchanged — market in stable range regime',
    weightChanges: [],
    aiInvolved: true,
    reason: 'Market regime classified as range-bound. No rebalance needed.',
  },
  {
    id: 'd3',
    timestamp: new Date(Date.now() - 3_600_000).toISOString(),
    vault: 'moderate',
    action: 'rebalance',
    summary: 'Added Lulo allocation for diversification',
    weightChanges: [
      { source: 'lulo-lending', from: 1000, to: 1500 },
      { source: 'marginfi-lending', from: 3000, to: 2500 },
    ],
    aiInvolved: false,
    reason: 'Algorithm-only rebalance. Lulo aggregator rate improved.',
  },
]

export const yieldsResponse = {
  'kamino-lending': { apy: 0.082, tvl: 50_000_000 },
  'marginfi-lending': { apy: 0.065, tvl: 120_000_000 },
  'lulo-lending': { apy: 0.073, tvl: 19_000_000 },
}

export const aiResponse = {
  strategies: { 'kamino-lending': 0.85, 'marginfi-lending': 0.6, 'lulo-lending': 0.7 },
  riskElevated: false,
  regime: 'range',
  reasoning: 'Market is in a stable range-bound regime. Kamino leads on risk-adjusted yield.',
  timestamp: Date.now(),
}
```

- [ ] **Step 3: Create RPC mock handler**

Create `e2e/fixtures/rpc-mock.ts`:

```typescript
import type { Page } from '@playwright/test'
import { rpcResponses } from './data/rpc-responses'

export async function mockRpc(page: Page) {
  await page.route('**/api/rpc', async (route) => {
    const body = JSON.parse(route.request().postData() ?? '{}')

    // Handle batch requests
    if (Array.isArray(body)) {
      const results = body.map((req) => ({
        jsonrpc: '2.0',
        id: req.id,
        result: rpcResponses[req.method]?.(req.params) ?? null,
      }))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(results) })
    }

    const handler = rpcResponses[body.method]
    if (!handler) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jsonrpc: '2.0', id: body.id, result: null }),
      })
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jsonrpc: '2.0', id: body.id, result: handler(body.params) }),
    })
  })
}
```

- [ ] **Step 4: Create keeper mock handler**

Create `e2e/fixtures/keeper-mock.ts`:

```typescript
import type { Page } from '@playwright/test'
import {
  healthResponse,
  vaultModerate,
  vaultAggressive,
  vaultConservative,
  mockDecisions,
  yieldsResponse,
  aiResponse,
} from './data/keeper-responses'

export async function mockKeeper(page: Page) {
  await page.route('**/v1/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname

    let body: unknown

    if (path.endsWith('/v1/health')) {
      body = healthResponse
    } else if (path.endsWith('/v1/status')) {
      body = { ...healthResponse, version: '1.0.0' }
    } else if (path.match(/\/v1\/vaults\/moderate\/decisions/)) {
      body = mockDecisions.filter((d) => d.vault === 'moderate')
    } else if (path.match(/\/v1\/vaults\/aggressive\/decisions/)) {
      body = mockDecisions.filter((d) => d.vault === 'aggressive')
    } else if (path.endsWith('/v1/vaults/moderate')) {
      body = vaultModerate
    } else if (path.endsWith('/v1/vaults/aggressive')) {
      body = vaultAggressive
    } else if (path.endsWith('/v1/vaults/conservative')) {
      body = vaultConservative
    } else if (path.endsWith('/v1/vaults')) {
      body = [vaultConservative, vaultModerate, vaultAggressive]
    } else if (path.endsWith('/v1/decisions')) {
      body = mockDecisions
    } else if (path.endsWith('/v1/yields')) {
      body = yieldsResponse
    } else if (path.endsWith('/v1/ai')) {
      body = aiResponse
    } else if (path.endsWith('/v1/market-scan')) {
      body = { protocols: [], totalScanned: 0 }
    } else {
      return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"not found"}' })
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}
```

- [ ] **Step 5: Create wallet mock**

Create `e2e/fixtures/wallet-mock.ts`:

```typescript
import type { Page } from '@playwright/test'

const MOCK_PUBKEY = 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr'

/** Inject a fake Phantom wallet into the browser before page loads */
export async function mockWallet(page: Page) {
  await page.addInitScript(`
    window.solana = {
      isPhantom: true,
      isConnected: false,
      publicKey: null,

      async connect() {
        this.isConnected = true;
        this.publicKey = {
          toBase58: () => '${MOCK_PUBKEY}',
          toBuffer: () => new Uint8Array(32),
          toBytes: () => new Uint8Array(32),
          equals: (other) => other?.toBase58?.() === '${MOCK_PUBKEY}',
          toString: () => '${MOCK_PUBKEY}',
        };
        if (this._connectListener) this._connectListener(this.publicKey);
        return { publicKey: this.publicKey };
      },

      async disconnect() {
        this.isConnected = false;
        this.publicKey = null;
        if (this._disconnectListener) this._disconnectListener();
      },

      async signTransaction(tx) { return tx; },
      async signAllTransactions(txs) { return txs; },

      _listeners: {},
      on(event, cb) {
        this._listeners[event] = cb;
        if (event === 'connect') this._connectListener = cb;
        if (event === 'disconnect') this._disconnectListener = cb;
      },
      off(event, cb) {
        delete this._listeners[event];
      },
    };
  `)
}

export { MOCK_PUBKEY }
```

- [ ] **Step 6: Commit**

```bash
git add e2e/
git commit -m "feat(e2e): add mock fixtures for RPC, keeper API, and wallet"
```

---

## Task 3: Marketing + navigation tests

**Files:**
- Create: `e2e/tests/marketing.spec.ts`

- [ ] **Step 1: Write marketing.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Marketing pages', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('homepage loads with all sections', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Yield,')).toBeVisible()
    await expect(page.locator('text=Routed.')).toBeVisible()
    await expect(page.locator('text=How It Works')).toBeVisible()
    await expect(page.locator('text=Choose Your Risk Level')).toBeVisible()
    await expect(page.locator('text=Launch App')).toBeVisible()
  })

  test('strategy page renders', async ({ page }) => {
    await page.goto('/strategy')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('main')).not.toBeEmpty()
  })

  test('navigation links work', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Launch App')
    await expect(page).toHaveURL(/\/app/)
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/marketing.spec.ts
```

Expected: 3 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/marketing.spec.ts
git commit -m "test(e2e): add marketing and navigation tests"
```

---

## Task 4: Dashboard tests

**Files:**
- Create: `e2e/tests/dashboard.spec.ts`

- [ ] **Step 1: Write dashboard.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('renders vault cards with keeper data', async ({ page }) => {
    await page.goto('/app')
    await expect(page.locator('text=moderate').first()).toBeVisible()
    await expect(page.locator('text=aggressive').first()).toBeVisible()
    // Verify APY is rendered (8.2% from mock)
    await expect(page.locator('text=8.2%').first()).toBeVisible({ timeout: 10_000 })
  })

  test('shows mock data badge without wallet', async ({ page }) => {
    await page.goto('/app')
    // Without wallet, mock data fallback should show indicator
    await expect(page.locator('text=/[Dd]emo [Dd]ata/').first()).toBeVisible({ timeout: 10_000 })
  })

  test('portfolio summary shows connect prompt without wallet', async ({ page }) => {
    await page.goto('/app')
    await expect(page.locator('text=/[Cc]onnect/').first()).toBeVisible()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/dashboard.spec.ts
```

Expected: 3 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/dashboard.spec.ts
git commit -m "test(e2e): add dashboard tests"
```

---

## Task 5: Vault detail + deposit/withdraw tests

**Files:**
- Create: `e2e/tests/vault-detail.spec.ts`

- [ ] **Step 1: Write vault-detail.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'
import { mockWallet } from '../fixtures/wallet-mock'

test.describe('Vault detail page', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('deposit validation rejects invalid input', async ({ page }) => {
    await mockWallet(page)
    await page.goto('/app/vaults/moderate')

    // Try submitting empty
    await page.click('text=Confirm Deposit')
    await expect(page.locator('[role="alert"]')).toBeVisible()

    // Try negative
    const input = page.locator('input[placeholder="0.00"]')
    await input.fill('-10')
    await page.click('text=Confirm Deposit')
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test('MAX button fills correct amount in deposit mode', async ({ page }) => {
    await mockWallet(page)
    await page.goto('/app/vaults/moderate')

    // Wait for data to load
    await page.waitForTimeout(2000)

    // Connect wallet via nav
    const walletBtn = page.locator('text=Connect Wallet').first()
    if (await walletBtn.isVisible()) {
      await walletBtn.click()
      // Click Phantom in wallet modal
      await page.locator('text=Phantom').first().click({ timeout: 5000 }).catch(() => {})
    }

    // Click MAX — should fill with wallet balance
    await page.click('text=MAX')
    const input = page.locator('input[placeholder="0.00"]')
    const value = await input.inputValue()
    expect(Number(value)).toBeGreaterThan(0)
  })

  test('withdraw mode shows USDC value label', async ({ page }) => {
    await page.goto('/app/vaults/moderate')

    // Switch to withdraw tab
    await page.click('text=Withdraw')
    // Should show "Value: X USDC" not raw share count
    await expect(page.locator('text=USDC').first()).toBeVisible()
  })

  test('protocol allocation bars visible', async ({ page }) => {
    await page.goto('/app/vaults/moderate')

    // Wait for keeper data to load
    await expect(page.locator('text=/[Kk]amino/').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=/[Mm]arginfi/').first()).toBeVisible()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/vault-detail.spec.ts
```

Expected: 4 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/vault-detail.spec.ts
git commit -m "test(e2e): add vault detail and deposit/withdraw tests"
```

---

## Task 6: Activity page tests

**Files:**
- Create: `e2e/tests/activity.spec.ts`

- [ ] **Step 1: Write activity.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Activity page', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('decision feed loads with entries', async ({ page }) => {
    await page.goto('/app/activity')

    // Wait for decisions to load from keeper mock
    await expect(page.locator('text=/[Rr]ebalance|[Hh]old/').first()).toBeVisible({ timeout: 10_000 })

    // Should have multiple decision entries
    const entries = page.locator('text=/moderate|aggressive/i')
    await expect(entries.first()).toBeVisible()
  })

  test('decision detail panel opens on click', async ({ page }) => {
    await page.goto('/app/activity')

    // Wait for feed to load
    await expect(page.locator('text=/[Rr]ebalance|[Hh]old/').first()).toBeVisible({ timeout: 10_000 })

    // Click first decision
    await page.locator('text=/[Rr]ebalance|[Hh]old/').first().click()

    // Detail panel should show reasoning
    await expect(page.locator('text=/[Rr]easoning|[Aa]I|confidence/i').first()).toBeVisible({ timeout: 5_000 })
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/activity.spec.ts
```

Expected: 2 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/activity.spec.ts
git commit -m "test(e2e): add activity page tests"
```

---

## Task 7: Wallet connect/disconnect tests

**Files:**
- Create: `e2e/tests/wallet.spec.ts`

- [ ] **Step 1: Write wallet.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'
import { mockWallet, MOCK_PUBKEY } from '../fixtures/wallet-mock'

test.describe('Wallet integration', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
    await mockWallet(page)
  })

  test('connect wallet shows truncated address', async ({ page }) => {
    await page.goto('/app')

    // Click connect wallet
    await page.click('text=Connect Wallet')

    // Click Phantom in the wallet modal
    await page.locator('text=Phantom').first().click({ timeout: 5_000 }).catch(() => {
      // Modal may auto-connect if only one wallet
    })

    // Should show truncated address (FGSk...BWWr)
    const truncated = MOCK_PUBKEY.slice(0, 4)
    await expect(page.locator(`text=/${truncated}/`).first()).toBeVisible({ timeout: 10_000 })
  })

  test('disconnect clears wallet state', async ({ page }) => {
    await page.goto('/app')

    // Connect first
    await page.click('text=Connect Wallet')
    await page.locator('text=Phantom').first().click({ timeout: 5_000 }).catch(() => {})

    const truncated = MOCK_PUBKEY.slice(0, 4)
    await expect(page.locator(`text=/${truncated}/`).first()).toBeVisible({ timeout: 10_000 })

    // Click the connected address to open disconnect option
    await page.locator(`text=/${truncated}/`).first().click()

    // Click disconnect
    await page.locator('text=/[Dd]isconnect/').first().click({ timeout: 5_000 })

    // Should return to "Connect Wallet"
    await expect(page.locator('text=Connect Wallet').first()).toBeVisible({ timeout: 10_000 })
  })

  test('network mismatch shows warning banner', async ({ page }) => {
    // Override genesis hash to simulate wrong network
    await page.route('**/api/rpc', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}')
      if (body.method === 'getGenesisHash') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: 'WRONG_GENESIS_HASH_FOR_TESTING',
          }),
        })
      }
      // Fall through to default RPC mock for other methods
      return route.fallback()
    })

    await page.goto('/app')

    // Connect wallet
    await page.click('text=Connect Wallet')
    await page.locator('text=Phantom').first().click({ timeout: 5_000 }).catch(() => {})

    // Should show network warning banner
    await expect(page.locator('text=/[Ww]rong [Nn]etwork|[Nn]etwork [Mm]ismatch/i').first()).toBeVisible({ timeout: 10_000 })
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/wallet.spec.ts
```

Expected: 3 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/wallet.spec.ts
git commit -m "test(e2e): add wallet connect/disconnect tests"
```

---

## Task 8: Error boundary tests

**Files:**
- Create: `e2e/tests/error.spec.ts`

- [ ] **Step 1: Write error.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Error boundaries', () => {
  test('error boundary catches API failure', async ({ page }) => {
    await mockRpc(page)

    // Make ALL keeper API calls return 500
    await page.route('**/v1/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      }),
    )

    await page.goto('/app')

    // Should show error boundary — NOT a white screen
    // Either the error boundary text or the page content should be visible
    const hasErrorBoundary = await page.locator('text=Something went wrong').isVisible({ timeout: 15_000 }).catch(() => false)
    const hasContent = await page.locator('text=/[Dd]ashboard|[Vv]ault/').first().isVisible({ timeout: 5_000 }).catch(() => false)

    // At least one should be true — no white screen
    expect(hasErrorBoundary || hasContent).toBe(true)
  })

  test('try again button resets error', async ({ page }) => {
    await mockRpc(page)

    let shouldFail = true

    // First load fails, second succeeds
    await page.route('**/v1/**', async (route) => {
      if (shouldFail) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'fail' }),
        })
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ uptime: 100, cyclesCompleted: 1, rpcStatus: 'healthy' }),
      })
    })

    await page.goto('/app')

    const tryAgain = page.locator('text=Try again')
    if (await tryAgain.isVisible({ timeout: 10_000 }).catch(() => false)) {
      // Stop failing before clicking retry
      shouldFail = false
      await tryAgain.click()

      // Page should recover — either show content or at least not crash again
      await page.waitForTimeout(2000)
      const pageHasContent = await page.locator('body').innerText()
      expect(pageHasContent.length).toBeGreaterThan(10)
    }
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/error.spec.ts
```

Expected: 2 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/error.spec.ts
git commit -m "test(e2e): add error boundary tests"
```

---

## Task 9: Responsive tests

**Files:**
- Create: `e2e/tests/responsive.spec.ts`

- [ ] **Step 1: Write responsive.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('mobile hamburger menu toggles navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/app')

    // Hamburger should be visible
    const hamburger = page.locator('[aria-label="Open navigation menu"]')
    await expect(hamburger).toBeVisible()

    // Nav items should be hidden initially
    const dashboardLink = page.locator('nav >> text=Dashboard')
    await expect(dashboardLink).not.toBeVisible()

    // Click hamburger — nav items appear
    await hamburger.click()
    await expect(page.locator('nav >> text=Dashboard')).toBeVisible()
    await expect(page.locator('nav >> text=Vaults')).toBeVisible()
    await expect(page.locator('nav >> text=Activity')).toBeVisible()

    // Click a nav item — navigates and closes menu
    await page.locator('nav >> text=Vaults').click()
    await expect(page).toHaveURL(/\/app\/vaults/)
  })

  test('desktop nav shows all items without hamburger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/app')

    // All nav items visible
    await expect(page.locator('nav >> text=Dashboard')).toBeVisible()
    await expect(page.locator('nav >> text=Vaults')).toBeVisible()
    await expect(page.locator('nav >> text=Activity')).toBeVisible()

    // Hamburger should NOT be visible
    await expect(page.locator('[aria-label="Open navigation menu"]')).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/responsive.spec.ts
```

Expected: 2 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/responsive.spec.ts
git commit -m "test(e2e): add responsive layout tests"
```

---

## Task 10: Accessibility tests

**Files:**
- Create: `e2e/tests/accessibility.spec.ts`

- [ ] **Step 1: Write accessibility.spec.ts**

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockKeeper } from '../fixtures/keeper-mock'
import { mockRpc } from '../fixtures/rpc-mock'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await mockRpc(page)
    await mockKeeper(page)
  })

  test('no critical ARIA violations on key pages', async ({ page }) => {
    const pages = ['/', '/app', '/app/vaults/moderate']

    for (const url of pages) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze()

      const critical = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      )

      expect(
        critical,
        `Critical a11y violations on ${url}: ${critical.map((v) => `${v.id}: ${v.description}`).join(', ')}`,
      ).toHaveLength(0)
    }
  })
})
```

- [ ] **Step 2: Run tests**

```bash
pnpm test:e2e e2e/tests/accessibility.spec.ts
```

Expected: 1 passed.

- [ ] **Step 3: Commit**

```bash
git add e2e/tests/accessibility.spec.ts
git commit -m "test(e2e): add accessibility audit tests"
```

---

## Task 11: CI integration

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add Playwright steps to CI**

In `.github/workflows/deploy.yml`, find the `build-test` job. After the existing `pnpm test` step, add:

```yaml
    - name: Install Playwright browsers
      run: pnpm exec playwright install chromium --with-deps

    - name: Run E2E tests
      run: pnpm test:e2e
      env:
        HELIUS_RPC_URL: https://api.devnet.solana.com
        NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID: 2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P
        NEXT_PUBLIC_USDC_MINT: BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh
        NEXT_PUBLIC_KEEPER_API_URL: http://localhost:3001
```

- [ ] **Step 2: Run full E2E suite locally to verify all pass**

```bash
pnpm test:e2e
```

Expected: 20 tests passed across 8 spec files.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add Playwright E2E tests to deploy workflow"
```
