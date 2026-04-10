import { describe, it, expect, vi, beforeAll } from 'vitest'
import { writeFileSync } from 'node:fs'
import { Keypair } from '@solana/web3.js'

// Mock @solana/spl-token — must stay hoisted, not reset between tests
vi.mock('@solana/spl-token', () => ({
  getOrCreateAssociatedTokenAccount: vi.fn().mockResolvedValue({
    address: { toBase58: () => 'MockATA111' },
  }),
  mintTo: vi.fn().mockResolvedValue('MockMintSignature123'),
}))

// Mock @solana/web3.js — Connection must use a real function (not arrow) to be new-able
vi.mock('@solana/web3.js', async () => {
  const actual = await vi.importActual<typeof import('@solana/web3.js')>('@solana/web3.js')
  return {
    ...actual,
    Connection: vi.fn().mockImplementation(function () {
      return {
        requestAirdrop: vi.fn().mockResolvedValue('MockSolAirdropSig'),
        confirmTransaction: vi.fn().mockResolvedValue({ value: { err: null } }),
        getTokenAccountBalance: vi.fn().mockResolvedValue({
          value: { uiAmountString: '1000.00' },
        }),
      }
    }),
  }
})

// Note: node:fs native bindings cannot be reliably intercepted for named ESM imports
// in vitest. Instead, the test keypair file is pre-written to /tmp/test-keypair.json
// in the beforeAll setup below.

// Import route once — mocks are stable across all tests in this file
let POST: (req: Request) => Promise<Response>

const TEST_KEYPAIR_PATH = '/tmp/nanuqfi-test-keypair.json'

beforeAll(async () => {
  // Write a valid Ed25519 keypair to /tmp for the route to load via readFileSync
  const kp = Keypair.generate()
  writeFileSync(TEST_KEYPAIR_PATH, JSON.stringify(Array.from(kp.secretKey)))

  vi.stubEnv('MINT_AUTHORITY_KEYPAIR', TEST_KEYPAIR_PATH)
  vi.stubEnv('HELIUS_RPC_URL', 'https://test-rpc.com')
  vi.stubEnv('NEXT_PUBLIC_USDC_MINT', 'BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh')
  const mod = await import('../route')
  POST = mod.POST as unknown as (req: Request) => Promise<Response>
})

describe('POST /api/airdrop', () => {
  it('mints test USDC and returns success', async () => {
    const request = new Request('http://localhost:3000/api/airdrop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr', amount: 1000 }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.signature).toBeDefined()
  })

  it('rejects invalid amount', async () => {
    const request = new Request('http://localhost:3000/api/airdrop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr', amount: 999 }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 503 when keypair not configured', async () => {
    // Temporarily unset the keypair env var for this test
    const saved = process.env.MINT_AUTHORITY_KEYPAIR
    process.env.MINT_AUTHORITY_KEYPAIR = ''

    const request = new Request('http://localhost:3000/api/airdrop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr', amount: 100 }),
    })

    const response = await POST(request)
    process.env.MINT_AUTHORITY_KEYPAIR = saved
    expect(response.status).toBe(503)
  })
})
