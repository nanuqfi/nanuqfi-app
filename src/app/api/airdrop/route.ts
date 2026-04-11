import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { readFileSync } from 'node:fs'

const ALLOWED_AMOUNTS = new Set([100, 1000, 100000])
const USDC_DECIMALS = 6
const SOL_AIRDROP_AMOUNT = 0.1 * LAMPORTS_PER_SOL

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
      signature: String(signature),
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
