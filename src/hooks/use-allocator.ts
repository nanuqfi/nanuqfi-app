'use client'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getAllocatorPDA,
  getRiskVaultPDA,
  getUserPositionPDA,
} from '@/lib/transactions'

// ─── Account Parsing ─────────────────────────────────────────────────────────
// Manual Borsh deserialization matching `programs/allocator/src/state.rs`.
// All Anchor accounts have an 8-byte discriminator prefix.

const ANCHOR_DISCRIMINATOR_SIZE = 8

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

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
  driftVault: PublicKey
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

function parseAllocator(data: Buffer): AllocatorAccount {
  let offset = ANCHOR_DISCRIMINATOR_SIZE
  const admin = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32
  const keeperAuthority = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32
  const totalTvl = data.readBigUInt64LE(offset)
  offset += 8
  const halted = data[offset] === 1
  offset += 1
  const bump = data[offset]!

  return { admin, keeperAuthority, totalTvl, halted, bump }
}

function parseRiskVault(data: Buffer): RiskVaultAccount {
  let offset = ANCHOR_DISCRIMINATOR_SIZE

  const allocator = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  // RiskLevel enum — Borsh encodes as 1-byte variant index
  const riskLevel = data[offset]!
  offset += 1

  const driftVault = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32
  const shareMint = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32

  const totalShares = data.readBigUInt64LE(offset)
  offset += 8
  const totalAssets = data.readBigUInt64LE(offset)
  offset += 8
  const peakEquity = data.readBigUInt64LE(offset)
  offset += 8
  const currentEquity = data.readBigUInt64LE(offset)
  offset += 8
  const equity24hAgo = data.readBigUInt64LE(offset)
  offset += 8
  const lastRebalanceSlot = data.readBigUInt64LE(offset)
  offset += 8
  const rebalanceCounter = data.readUInt32LE(offset)
  offset += 4
  const lastMgmtFeeSlot = data.readBigUInt64LE(offset)
  offset += 8

  // Vec<u16> — 4-byte length prefix + N * 2 bytes
  const weightsLen = data.readUInt32LE(offset)
  offset += 4
  const currentWeights: number[] = []
  for (let i = 0; i < weightsLen; i++) {
    currentWeights.push(data.readUInt16LE(offset))
    offset += 2
  }

  const maxPerpAllocationBps = data.readUInt16LE(offset)
  offset += 2
  const maxLendingAllocationBps = data.readUInt16LE(offset)
  offset += 2
  const maxSingleAssetBps = data.readUInt16LE(offset)
  offset += 2
  const maxDrawdownBps = data.readUInt16LE(offset)
  offset += 2
  const maxLeverageBps = data.readUInt16LE(offset)
  offset += 2
  const redemptionPeriodSlots = data.readBigUInt64LE(offset)
  offset += 8
  const depositCap = data.readBigUInt64LE(offset)
  offset += 8
  const bump = data[offset]!

  // Derive share price: totalAssets * 1e6 / totalShares (or 1.0 if no shares)
  const sharePrice =
    totalShares > 0n
      ? Number((totalAssets * 1_000_000n) / totalShares) / 1_000_000
      : 1.0

  return {
    allocator,
    riskLevel,
    driftVault,
    shareMint,
    totalShares,
    totalAssets,
    peakEquity,
    currentEquity,
    equity24hAgo,
    lastRebalanceSlot,
    rebalanceCounter,
    lastMgmtFeeSlot,
    currentWeights,
    maxPerpAllocationBps,
    maxLendingAllocationBps,
    maxSingleAssetBps,
    maxDrawdownBps,
    maxLeverageBps,
    redemptionPeriodSlots,
    depositCap,
    bump,
    sharePrice,
  }
}

function parseUserPosition(data: Buffer): UserPositionAccount {
  let offset = ANCHOR_DISCRIMINATOR_SIZE

  const user = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32
  const riskVault = new PublicKey(data.subarray(offset, offset + 32))
  offset += 32
  const shares = data.readBigUInt64LE(offset)
  offset += 8
  const depositedUsdc = data.readBigUInt64LE(offset)
  offset += 8
  const entrySlot = data.readBigUInt64LE(offset)
  offset += 8
  const highWaterMarkPrice = data.readBigUInt64LE(offset)
  offset += 8
  const pendingWithdrawalShares = data.readBigUInt64LE(offset)
  offset += 8
  const withdrawRequestSlot = data.readBigUInt64LE(offset)
  offset += 8
  const requestTimeSharePrice = data.readBigUInt64LE(offset)
  offset += 8
  const bump = data[offset]!

  return {
    user,
    riskVault,
    shares,
    depositedUsdc,
    entrySlot,
    highWaterMarkPrice,
    pendingWithdrawalShares,
    withdrawRequestSlot,
    requestTimeSharePrice,
    bump,
  }
}

// ─── Hook Return Type ────────────────────────────────────────────────────────

interface HookResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refresh: () => void
}

const POLL_INTERVAL = 15_000

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
      const info = await connection.getAccountInfo(pda)
      if (!mountedRef.current) return

      if (!info) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      setData(parseAllocator(Buffer.from(info.data)))
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
      const info = await connection.getAccountInfo(pda)
      if (!mountedRef.current) return

      if (!info) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      setData(parseRiskVault(Buffer.from(info.data)))
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
      const info = await connection.getAccountInfo(pda)
      if (!mountedRef.current) return

      if (!info) {
        setData(null)
        setError(null)
        setLoading(false)
        return
      }

      setData(parseUserPosition(Buffer.from(info.data)))
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
      const info = await connection.getAccountInfo(ata)
      if (!mountedRef.current) return

      if (!info) {
        // No USDC token account — balance is zero
        setData(0n)
        setError(null)
        setLoading(false)
        return
      }

      // SPL Token account data layout: amount is at offset 64, 8 bytes LE
      const amount = Buffer.from(info.data).readBigUInt64LE(64)
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
