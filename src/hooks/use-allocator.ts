'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getAllocatorPDA,
  getRiskVaultPDA,
  getUserPositionPDA,
} from '@/lib/transactions'

// ─── In-Flight Request Deduplication ─────────────────────────────────────────
// When multiple hooks call getAccountInfo on the same address simultaneously
// (e.g. on mount or visibility change), we deduplicate by caching the in-flight
// Promise. All callers awaiting the same address share one RPC call.
// The cache entry is deleted once the promise settles to allow future polls.

type AccountInfoResult = Awaited<ReturnType<Connection['getAccountInfo']>>

const _inFlightGetAccountInfo = new Map<string, Promise<AccountInfoResult>>()

function deduplicatedGetAccountInfo(
  connection: Connection,
  pubkey: PublicKey
): Promise<AccountInfoResult> {
  const key = pubkey.toBase58()
  const existing = _inFlightGetAccountInfo.get(key)
  if (existing) return existing

  const promise = connection.getAccountInfo(pubkey).finally(() => {
    _inFlightGetAccountInfo.delete(key)
  })
  _inFlightGetAccountInfo.set(key, promise)
  return promise
}

// ─── Account Parsing ─────────────────────────────────────────────────────────
// Manual Borsh deserialization matching `programs/allocator/src/state.rs`.
// All Anchor accounts have an 8-byte discriminator prefix.

const ANCHOR_DISCRIMINATOR_SIZE = 8

const _HOOK_USDC_MINT_ADDR = process.env.NEXT_PUBLIC_USDC_MINT
if (!_HOOK_USDC_MINT_ADDR) {
  throw new Error(
    'NEXT_PUBLIC_USDC_MINT is not set. Set it to BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh (devnet test mint) in your .env.local.'
  )
}
const USDC_MINT = new PublicKey(_HOOK_USDC_MINT_ADDR)

export interface AllocatorAccount {
  admin: PublicKey
  keeperAuthority: PublicKey
  totalTvl: bigint
  halted: boolean
  bump: number
}

export interface RiskVaultAccount {
  allocator: PublicKey
  riskLevel: number
  protocolVault: PublicKey
  shareMint: PublicKey
  totalShares: bigint
  totalAssets: bigint
  peakEquity: bigint
  currentEquity: bigint
  equity24hAgo: bigint
  lastRebalanceSlot: bigint
  rebalanceCounter: number
  lastMgmtFeeSlot: bigint
  currentWeights: number[]
  maxPerpAllocationBps: number
  maxLendingAllocationBps: number
  maxSingleAssetBps: number
  maxDrawdownBps: number
  maxLeverageBps: number
  redemptionPeriodSlots: bigint
  depositCap: bigint
  bump: number
  // Derived
  sharePrice: number
}

export interface UserPositionAccount {
  user: PublicKey
  riskVault: PublicKey
  shares: bigint
  depositedUsdc: bigint
  entrySlot: bigint
  highWaterMarkPrice: bigint
  pendingWithdrawalShares: bigint
  withdrawRequestSlot: bigint
  requestTimeSharePrice: bigint
  bump: number
}

// ─── Binary Helpers (browser-safe, no Node.js Buffer) ───────────────────────

function toBytes(data: Uint8Array | ArrayBuffer): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data)
}

function readPubkey(bytes: Uint8Array, offset: number): PublicKey {
  return new PublicKey(bytes.slice(offset, offset + 32))
}

function readU64(view: DataView, offset: number): bigint {
  return view.getBigUint64(offset, true)
}

function readU32(view: DataView, offset: number): number {
  return view.getUint32(offset, true)
}

function readU16(view: DataView, offset: number): number {
  return view.getUint16(offset, true)
}

// ─── Parsers ────────────────────────────────────────────────────────────────

function parseAllocator(raw: Uint8Array | ArrayBuffer): AllocatorAccount {
  const bytes = toBytes(raw)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = ANCHOR_DISCRIMINATOR_SIZE

  const admin = readPubkey(bytes, offset); offset += 32
  const keeperAuthority = readPubkey(bytes, offset); offset += 32
  const totalTvl = readU64(view, offset); offset += 8
  const halted = bytes[offset] === 1; offset += 1
  const bump = bytes[offset]!

  return { admin, keeperAuthority, totalTvl, halted, bump }
}

function parseRiskVault(raw: Uint8Array | ArrayBuffer): RiskVaultAccount {
  const bytes = toBytes(raw)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = ANCHOR_DISCRIMINATOR_SIZE

  const allocator = readPubkey(bytes, offset); offset += 32
  const riskLevel = bytes[offset]!; offset += 1
  const protocolVault = readPubkey(bytes, offset); offset += 32
  const shareMint = readPubkey(bytes, offset); offset += 32

  const totalShares = readU64(view, offset); offset += 8
  const totalAssets = readU64(view, offset); offset += 8
  const peakEquity = readU64(view, offset); offset += 8
  const currentEquity = readU64(view, offset); offset += 8
  const equity24hAgo = readU64(view, offset); offset += 8
  const lastRebalanceSlot = readU64(view, offset); offset += 8
  const rebalanceCounter = readU32(view, offset); offset += 4
  const lastMgmtFeeSlot = readU64(view, offset); offset += 8

  // Vec<u16> — 4-byte length prefix + N * 2 bytes
  const weightsLen = readU32(view, offset); offset += 4
  const currentWeights: number[] = []
  for (let i = 0; i < weightsLen; i++) {
    currentWeights.push(readU16(view, offset)); offset += 2
  }

  const maxPerpAllocationBps = readU16(view, offset); offset += 2
  const maxLendingAllocationBps = readU16(view, offset); offset += 2
  const maxSingleAssetBps = readU16(view, offset); offset += 2
  const maxDrawdownBps = readU16(view, offset); offset += 2
  const maxLeverageBps = readU16(view, offset); offset += 2
  const redemptionPeriodSlots = readU64(view, offset); offset += 8
  const depositCap = readU64(view, offset); offset += 8
  const bump = bytes[offset]!

  const sharePrice =
    totalShares > 0n
      ? Number((totalAssets * 1_000_000n) / totalShares) / 1_000_000
      : 1.0

  return {
    allocator, riskLevel, protocolVault, shareMint,
    totalShares, totalAssets, peakEquity, currentEquity, equity24hAgo,
    lastRebalanceSlot, rebalanceCounter, lastMgmtFeeSlot, currentWeights,
    maxPerpAllocationBps, maxLendingAllocationBps, maxSingleAssetBps,
    maxDrawdownBps, maxLeverageBps, redemptionPeriodSlots, depositCap,
    bump, sharePrice,
  }
}

function parseUserPosition(raw: Uint8Array | ArrayBuffer): UserPositionAccount {
  const bytes = toBytes(raw)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = ANCHOR_DISCRIMINATOR_SIZE

  const user = readPubkey(bytes, offset); offset += 32
  const riskVault = readPubkey(bytes, offset); offset += 32
  const shares = readU64(view, offset); offset += 8
  const depositedUsdc = readU64(view, offset); offset += 8
  const entrySlot = readU64(view, offset); offset += 8
  const highWaterMarkPrice = readU64(view, offset); offset += 8
  const pendingWithdrawalShares = readU64(view, offset); offset += 8
  const withdrawRequestSlot = readU64(view, offset); offset += 8
  const requestTimeSharePrice = readU64(view, offset); offset += 8
  const bump = bytes[offset]!

  return {
    user, riskVault, shares, depositedUsdc, entrySlot,
    highWaterMarkPrice, pendingWithdrawalShares, withdrawRequestSlot,
    requestTimeSharePrice, bump,
  }
}

// ─── Hook Return Type ────────────────────────────────────────────────────────

interface HookResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refresh: () => void
}

// Increased from 15s to 30s — reduces RPC call frequency by 50% while
// keeping data fresh enough for a yield dashboard context.
// All hooks share the same interval, so thundering herd risk is at mount
// time only (each hook does one immediate fetch). Stagger is handled by
// the fact that hooks mount sequentially and use independent intervals.
const POLL_INTERVAL = 30_000

// ─── useAllocatorState ───────────────────────────────────────────────────────

export function useAllocatorState(): HookResult<AllocatorAccount> {
  const { connection } = useConnection()
  const [data, setData] = useState<AllocatorAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    try {
      const [pda] = getAllocatorPDA()
      const info = await deduplicatedGetAccountInfo(connection, pda)
      if (!mountedRef.current) return

      if (!info) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      setData(parseAllocator(info.data))
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [connection])

  useEffect(() => {
    mountedRef.current = true
    fetch()

    const interval = setInterval(fetch, POLL_INTERVAL)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetch()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetch])

  return { data, loading, error, refresh: fetch }
}

// ─── useRiskVault ────────────────────────────────────────────────────────────

export function useRiskVault(riskLevel: number): HookResult<RiskVaultAccount> {
  const { connection } = useConnection()
  const [data, setData] = useState<RiskVaultAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    try {
      const [pda] = getRiskVaultPDA(riskLevel)
      const info = await deduplicatedGetAccountInfo(connection, pda)
      if (!mountedRef.current) return

      if (!info) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      setData(parseRiskVault(info.data))
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [connection, riskLevel])

  useEffect(() => {
    mountedRef.current = true
    fetch()

    const interval = setInterval(fetch, POLL_INTERVAL)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetch()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetch])

  return { data, loading, error, refresh: fetch }
}

// ─── useUserPosition ─────────────────────────────────────────────────────────

export function useUserPosition(
  riskLevel: number
): HookResult<UserPositionAccount> {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [data, setData] = useState<UserPositionAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    if (!publicKey) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      const [riskVault] = getRiskVaultPDA(riskLevel)
      const [pda] = getUserPositionPDA(publicKey, riskVault)
      const info = await deduplicatedGetAccountInfo(connection, pda)
      if (!mountedRef.current) return

      if (!info) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      setData(parseUserPosition(info.data))
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [connection, publicKey, riskLevel])

  useEffect(() => {
    mountedRef.current = true
    fetch()

    const interval = setInterval(fetch, POLL_INTERVAL)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetch()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetch])

  return { data, loading, error, refresh: fetch }
}

// ─── RebalanceRecord Parsing ────────────────────────────────────────────

export interface RebalanceRecordAccount {
  riskVault: PublicKey
  counter: number
  slot: bigint
  previousWeights: number[] // bps
  newWeights: number[]      // bps
  aiReasoningHash: Uint8Array
  approved: boolean
  bump: number
}

function parseRebalanceRecord(raw: Uint8Array | ArrayBuffer): RebalanceRecordAccount {
  const bytes = toBytes(raw)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let offset = ANCHOR_DISCRIMINATOR_SIZE

  const riskVault = readPubkey(bytes, offset); offset += 32
  const counter = readU32(view, offset); offset += 4
  const slot = readU64(view, offset); offset += 8

  // Vec<u16> — previous_weights
  const prevLen = readU32(view, offset); offset += 4
  const previousWeights: number[] = []
  for (let i = 0; i < prevLen; i++) {
    previousWeights.push(readU16(view, offset)); offset += 2
  }

  // Vec<u16> — new_weights
  const newLen = readU32(view, offset); offset += 4
  const newWeights: number[] = []
  for (let i = 0; i < newLen; i++) {
    newWeights.push(readU16(view, offset)); offset += 2
  }

  // Vec<u8> — ai_reasoning_hash
  const hashLen = readU32(view, offset); offset += 4
  const aiReasoningHash = bytes.slice(offset, offset + hashLen); offset += hashLen

  const approved = bytes[offset] === 1; offset += 1
  const bump = bytes[offset]!

  return { riskVault, counter, slot, previousWeights, newWeights, aiReasoningHash, approved, bump }
}

// ─── useRebalanceRecords ────────────────────────────────────────────────

const _HOOK_PROGRAM_ID_ADDR = process.env.NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID
if (!_HOOK_PROGRAM_ID_ADDR) {
  throw new Error(
    'NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID is not set. Set it to 2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P in your .env.local.'
  )
}
const PROGRAM_ID_PK = new PublicKey(_HOOK_PROGRAM_ID_ADDR)

/**
 * Compute the 8-byte Anchor account discriminator for RebalanceRecord.
 * SHA-256("account:RebalanceRecord") truncated to 8 bytes.
 */
async function getRebalanceRecordDiscriminator(): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const data = encoder.encode('account:RebalanceRecord')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hash).slice(0, 8)
}

export function useRebalanceRecords(
  riskLevel: number
): HookResult<RebalanceRecordAccount[]> {
  const { connection } = useConnection()
  const [data, setData] = useState<RebalanceRecordAccount[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    try {
      const [riskVaultPda] = getRiskVaultPDA(riskLevel)

      const discriminator = await getRebalanceRecordDiscriminator()

      // getProgramAccounts with two memcmp filters:
      // 1. discriminator at offset 0 (8 bytes)
      // 2. risk_vault pubkey at offset 8 (32 bytes)
      const accounts = await connection.getProgramAccounts(PROGRAM_ID_PK, {
        filters: [
          { memcmp: { offset: 0, bytes: toBase58(discriminator) } },
          { memcmp: { offset: 8, bytes: riskVaultPda.toBase58() } },
        ],
      })
      if (!mountedRef.current) return

      const records = accounts
        .map(a => parseRebalanceRecord(a.account.data))
        .sort((a, b) => b.counter - a.counter)

      setData(records)
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [connection, riskLevel])

  useEffect(() => {
    mountedRef.current = true
    fetch()

    const interval = setInterval(fetch, POLL_INTERVAL)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetch()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetch])

  return { data, loading, error, refresh: fetch }
}

// ─── Base58 Helper ──────────────────────────────────────────────────────
// Minimal base58 encoder for discriminator bytes (browser-safe, no deps).

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function toBase58(bytes: Uint8Array): string {
  const digits: number[] = [0]
  for (const byte of bytes) {
    let carry = byte
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j]! * 256
      digits[j] = carry % 58
      carry = Math.floor(carry / 58)
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = Math.floor(carry / 58)
    }
  }
  // Leading zeros
  let output = ''
  for (const byte of bytes) {
    if (byte === 0) output += BASE58_ALPHABET[0]
    else break
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    output += BASE58_ALPHABET[digits[i]!]
  }
  return output
}

// ─── useUsdcBalance ──────────────────────────────────────────────────────────

export function useUsdcBalance(): HookResult<bigint> {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [data, setData] = useState<bigint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetch = useCallback(async () => {
    if (!publicKey) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey)
      const info = await deduplicatedGetAccountInfo(connection, ata)
      if (!mountedRef.current) return

      if (!info) {
        // No USDC token account — balance is zero
        setData(0n)
        setError(null)
        setLoading(false)
        return
      }

      // SPL Token account data layout: amount is at offset 64, 8 bytes LE
      const bytes = toBytes(info.data)
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
      const amount = view.getBigUint64(64, true)
      setData(amount)
      setError(null)
    } catch (err) {
      if (!mountedRef.current) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [connection, publicKey])

  useEffect(() => {
    mountedRef.current = true
    fetch()

    const interval = setInterval(fetch, POLL_INTERVAL)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetch()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mountedRef.current = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [fetch])

  return { data, loading, error, refresh: fetch }
}
