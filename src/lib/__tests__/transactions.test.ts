/**
 * Unit tests for transaction builder functions.
 * Money-handling code paths: instruction encoding, account layout, edge cases.
 * All tests run fully offline — no RPC.
 *
 * Strategy: mock findProgramAddressSync (PDA derivation) and
 * getAssociatedTokenAddress (ATA lookup) to avoid the crypto.subtle grind
 * that makes PDA search unreliable in jsdom.
 */

import { describe, it, expect, vi } from 'vitest'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'

// ─── Env setup ────────────────────────────────────────────────────────────────
// Must precede module import — module-level guards throw if these are absent.

vi.stubEnv('NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID', '2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P')
vi.stubEnv('NEXT_PUBLIC_USDC_MINT', 'BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh')

// ─── Mock crypto.subtle (jsdom provides it but SHA-256 + PDA search is slow) ─
// Mock findProgramAddressSync on the PublicKey class so PDA derivation is O(1).

const STUB = new PublicKey('11111111111111111111111111111112')

vi.spyOn(PublicKey, 'findProgramAddressSync').mockReturnValue([STUB, 255])

// Mock ATA derivation — stays offline, no connection needed.
vi.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  getAssociatedTokenAddress: vi.fn().mockResolvedValue(STUB),
}))

// Import AFTER mocks are registered.
const { buildDepositInstruction, buildRequestWithdrawInstruction, buildWithdrawInstruction } =
  await import('@/lib/transactions')

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// Valid on-curve key (SystemProgram wallet).
const USER = new PublicKey('GsbwXfJraMomNxBcjYLcG3mxkBUiyWXAB32fGbSMQRdW')
const SHARE_MINT = new PublicKey('So11111111111111111111111111111111111111112')

// ─── buildDepositInstruction ──────────────────────────────────────────────────

describe('buildDepositInstruction', () => {
  it('returns a TransactionInstruction', async () => {
    const ix = await buildDepositInstruction(USER, 0, 1_000_000n, SHARE_MINT)
    expect(ix).toBeInstanceOf(TransactionInstruction)
  })

  it('encodes the correct 8-byte discriminator prefix', async () => {
    const ix = await buildDepositInstruction(USER, 1, 5_000_000n, SHARE_MINT)
    // SHA-256("global:deposit")[0..8] — pre-computed in transactions.ts
    expect(Array.from(ix.data.slice(0, 8))).toEqual([242, 35, 198, 137, 82, 225, 242, 182])
  })

  it('encodes the amount as little-endian u64 at bytes 8–15', async () => {
    const amount = 123_456_789n
    const ix = await buildDepositInstruction(USER, 0, amount, SHARE_MINT)
    const view = new DataView(ix.data.buffer, ix.data.byteOffset + 8, 8)
    expect(view.getBigUint64(0, true)).toBe(amount)
  })

  it('data payload is exactly 16 bytes (8 discriminator + 8 u64 amount)', async () => {
    const ix = await buildDepositInstruction(USER, 0, 1_000_000n, SHARE_MINT)
    expect(ix.data.length).toBe(16)
  })

  it('includes user as signer in accounts', async () => {
    const ix = await buildDepositInstruction(USER, 2, 1_000_000n, SHARE_MINT)
    const userKey = ix.keys.find(k => k.pubkey.equals(USER))
    expect(userKey?.isSigner).toBe(true)
  })

  it('includes shareMint as writable in accounts', async () => {
    const ix = await buildDepositInstruction(USER, 0, 1_000_000n, SHARE_MINT)
    const mintKey = ix.keys.find(k => k.pubkey.equals(SHARE_MINT))
    expect(mintKey?.isWritable).toBe(true)
  })

  it('targets the canonical program ID', async () => {
    const ix = await buildDepositInstruction(USER, 0, 1_000_000n, SHARE_MINT)
    expect(ix.programId.toBase58()).toBe('2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P')
  })

  it('throws on risk level > 2', async () => {
    await expect(buildDepositInstruction(USER, 3, 1_000_000n, SHARE_MINT))
      .rejects.toThrow(/invalid risk level/i)
  })

  it('throws on risk level < 0', async () => {
    await expect(buildDepositInstruction(USER, -1, 1_000_000n, SHARE_MINT))
      .rejects.toThrow(/invalid risk level/i)
  })

  it('throws when amount is zero', async () => {
    await expect(buildDepositInstruction(USER, 0, 0n, SHARE_MINT))
      .rejects.toThrow(/greater than zero/i)
  })

  it('handles max u64 value without overflow', async () => {
    const MAX_U64 = 18_446_744_073_709_551_615n
    const ix = await buildDepositInstruction(USER, 0, MAX_U64, SHARE_MINT)
    const view = new DataView(ix.data.buffer, ix.data.byteOffset + 8, 8)
    expect(view.getBigUint64(0, true)).toBe(MAX_U64)
  })
})

// ─── buildRequestWithdrawInstruction ─────────────────────────────────────────

describe('buildRequestWithdrawInstruction', () => {
  it('returns a TransactionInstruction', async () => {
    const ix = await buildRequestWithdrawInstruction(USER, 1, 50_000_000n)
    expect(ix).toBeInstanceOf(TransactionInstruction)
  })

  it('encodes the correct 8-byte discriminator prefix', async () => {
    const ix = await buildRequestWithdrawInstruction(USER, 0, 1_000_000n)
    // SHA-256("global:request_withdraw")[0..8]
    expect(Array.from(ix.data.slice(0, 8))).toEqual([137, 95, 187, 96, 250, 138, 31, 182])
  })

  it('encodes shares as little-endian u64 at bytes 8–15', async () => {
    const shares = 999_999_999n
    const ix = await buildRequestWithdrawInstruction(USER, 0, shares)
    const view = new DataView(ix.data.buffer, ix.data.byteOffset + 8, 8)
    expect(view.getBigUint64(0, true)).toBe(shares)
  })

  it('data payload is exactly 16 bytes (8 discriminator + 8 u64 shares)', async () => {
    const ix = await buildRequestWithdrawInstruction(USER, 0, 1_000_000n)
    expect(ix.data.length).toBe(16)
  })

  it('includes user as signer', async () => {
    const ix = await buildRequestWithdrawInstruction(USER, 1, 1_000_000n)
    const userKey = ix.keys.find(k => k.pubkey.equals(USER))
    expect(userKey?.isSigner).toBe(true)
  })

  it('throws on invalid risk level > 2', async () => {
    await expect(buildRequestWithdrawInstruction(USER, 5, 1_000_000n))
      .rejects.toThrow(/invalid risk level/i)
  })

  it('throws when shares is zero', async () => {
    await expect(buildRequestWithdrawInstruction(USER, 0, 0n))
      .rejects.toThrow(/greater than zero/i)
  })

  it('handles max u64 shares without overflow', async () => {
    const MAX_U64 = 18_446_744_073_709_551_615n
    const ix = await buildRequestWithdrawInstruction(USER, 0, MAX_U64)
    const view = new DataView(ix.data.buffer, ix.data.byteOffset + 8, 8)
    expect(view.getBigUint64(0, true)).toBe(MAX_U64)
  })

  it('targets the canonical program ID', async () => {
    const ix = await buildRequestWithdrawInstruction(USER, 0, 1_000_000n)
    expect(ix.programId.toBase58()).toBe('2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P')
  })
})

// ─── buildWithdrawInstruction ─────────────────────────────────────────────────

describe('buildWithdrawInstruction', () => {
  it('returns a TransactionInstruction', async () => {
    const ix = await buildWithdrawInstruction(USER, 0, SHARE_MINT)
    expect(ix).toBeInstanceOf(TransactionInstruction)
  })

  it('encodes the correct 8-byte discriminator prefix', async () => {
    const ix = await buildWithdrawInstruction(USER, 0, SHARE_MINT)
    // SHA-256("global:withdraw")[0..8]
    expect(Array.from(ix.data.slice(0, 8))).toEqual([183, 18, 70, 156, 148, 109, 161, 34])
  })

  it('data payload is exactly 8 bytes (discriminator only — no amount)', async () => {
    const ix = await buildWithdrawInstruction(USER, 2, SHARE_MINT)
    expect(ix.data.length).toBe(8)
  })

  it('includes user as signer', async () => {
    const ix = await buildWithdrawInstruction(USER, 1, SHARE_MINT)
    const userKey = ix.keys.find(k => k.pubkey.equals(USER))
    expect(userKey?.isSigner).toBe(true)
  })

  it('includes shareMint as writable', async () => {
    const ix = await buildWithdrawInstruction(USER, 0, SHARE_MINT)
    const mintKey = ix.keys.find(k => k.pubkey.equals(SHARE_MINT))
    expect(mintKey?.isWritable).toBe(true)
  })

  it('accepts optional treasuryUsdcAccount override', async () => {
    const customTreasury = new PublicKey('GsbwXfJraMomNxBcjYLcG3mxkBUiyWXAB32fGbSMQRdW')
    const ix = await buildWithdrawInstruction(USER, 0, SHARE_MINT, customTreasury)
    const treasuryKey = ix.keys.find(k => k.pubkey.equals(customTreasury))
    expect(treasuryKey?.isWritable).toBe(true)
  })

  it('throws on invalid risk level > 2', async () => {
    await expect(buildWithdrawInstruction(USER, 99, SHARE_MINT))
      .rejects.toThrow(/invalid risk level/i)
  })

  it('targets the canonical program ID', async () => {
    const ix = await buildWithdrawInstruction(USER, 0, SHARE_MINT)
    expect(ix.programId.toBase58()).toBe('2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P')
  })
})
