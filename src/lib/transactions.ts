import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token'

const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID ??
    'CDhkMBnc43wJQyVaSrreXk2ojvQvZMWrAWNBLSjaRJxq'
)

const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_USDC_MINT ??
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
)

// ─── Browser-Safe Helpers ────────────────────────────────────────────────────

const enc = new TextEncoder()

function toSeed(s: string): Uint8Array {
  return enc.encode(s)
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const len = arrays.reduce((acc, a) => acc + a.length, 0)
  const result = new Uint8Array(len)
  let offset = 0
  for (const a of arrays) {
    result.set(a, offset)
    offset += a.length
  }
  return result
}

function writeU64LE(value: bigint): Uint8Array {
  const buf = new Uint8Array(8)
  const view = new DataView(buf.buffer)
  view.setBigUint64(0, value, true)
  return buf
}

// ─── PDA Derivation ──────────────────────────────────────────────────────────

export function getAllocatorPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([toSeed('allocator')], PROGRAM_ID)
}

export function getRiskVaultPDA(riskLevel: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [toSeed('vault'), Uint8Array.from([riskLevel])],
    PROGRAM_ID
  )
}

export function getUserPositionPDA(
  user: PublicKey,
  riskVault: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [toSeed('position'), user.toBytes(), riskVault.toBytes()],
    PROGRAM_ID
  )
}

export function getTreasuryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([toSeed('treasury')], PROGRAM_ID)
}

// ─── Anchor Instruction Discriminator ────────────────────────────────────────
// SHA-256 of "global:<instruction_name>" truncated to 8 bytes.
// Pre-computed to avoid async crypto in hot paths.

const DISCRIMINATORS: Record<string, Uint8Array> = {
  deposit: Uint8Array.from([242, 35, 198, 137, 82, 225, 242, 182]),
  request_withdraw: Uint8Array.from([137, 95, 187, 96, 250, 138, 31, 182]),
  withdraw: Uint8Array.from([183, 18, 70, 156, 148, 109, 161, 34]),
}

async function computeDiscriminator(name: string): Promise<Uint8Array> {
  const data = enc.encode(`global:${name}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hash).slice(0, 8)
}

async function getDiscriminator(name: string): Promise<Uint8Array> {
  if (DISCRIMINATORS[name]) return DISCRIMINATORS[name]!
  const disc = await computeDiscriminator(name)
  DISCRIMINATORS[name] = disc
  return disc
}

// ─── Transaction Builders ────────────────────────────────────────────────────

/**
 * Build a deposit instruction for the allocator program.
 *
 * @param userWallet - The depositing user's wallet public key
 * @param riskLevel - 0 = conservative, 1 = moderate, 2 = aggressive
 * @param amount - USDC amount in smallest unit (6 decimals)
 * @param shareMint - The vault's share mint address (read from RiskVault.shareMint)
 */
export async function buildDepositInstruction(
  userWallet: PublicKey,
  riskLevel: number,
  amount: bigint,
  shareMint: PublicKey
): Promise<TransactionInstruction> {
  if (riskLevel < 0 || riskLevel > 2) {
    throw new Error(`Invalid risk level: ${riskLevel}. Must be 0, 1, or 2.`)
  }
  if (amount <= 0n) {
    throw new Error('Deposit amount must be greater than zero.')
  }

  const [allocator] = getAllocatorPDA()
  const [riskVault] = getRiskVaultPDA(riskLevel)
  const [userPosition] = getUserPositionPDA(userWallet, riskVault)

  const userUsdc = await getAssociatedTokenAddress(USDC_MINT, userWallet)
  const userShares = await getAssociatedTokenAddress(shareMint, userWallet)
  const vaultUsdc = await getAssociatedTokenAddress(USDC_MINT, allocator, true)

  const discriminator = await getDiscriminator('deposit')
  const data = concatBytes(discriminator, writeU64LE(amount))

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: allocator, isSigner: false, isWritable: true },
      { pubkey: riskVault, isSigner: false, isWritable: true },
      { pubkey: userPosition, isSigner: false, isWritable: true },
      { pubkey: shareMint, isSigner: false, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: userUsdc, isSigner: false, isWritable: true },
      { pubkey: userShares, isSigner: false, isWritable: true },
      { pubkey: vaultUsdc, isSigner: false, isWritable: true },
      { pubkey: userWallet, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: data as Buffer,
  })
}

/**
 * Build a request_withdraw instruction.
 * Initiates the two-phase withdrawal — locks shares for redemption period.
 *
 * @param userWallet - The withdrawing user's wallet public key
 * @param riskLevel - 0 = conservative, 1 = moderate, 2 = aggressive
 * @param shares - Number of share tokens to withdraw
 */
export async function buildRequestWithdrawInstruction(
  userWallet: PublicKey,
  riskLevel: number,
  shares: bigint
): Promise<TransactionInstruction> {
  if (riskLevel < 0 || riskLevel > 2) {
    throw new Error(`Invalid risk level: ${riskLevel}. Must be 0, 1, or 2.`)
  }
  if (shares <= 0n) {
    throw new Error('Shares must be greater than zero.')
  }

  const [allocator] = getAllocatorPDA()
  const [riskVault] = getRiskVaultPDA(riskLevel)
  const [userPosition] = getUserPositionPDA(userWallet, riskVault)

  const discriminator = await getDiscriminator('request_withdraw')
  const data = concatBytes(discriminator, writeU64LE(shares))

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: allocator, isSigner: false, isWritable: false },
      { pubkey: riskVault, isSigner: false, isWritable: false },
      { pubkey: userPosition, isSigner: false, isWritable: true },
      { pubkey: userWallet, isSigner: true, isWritable: false },
    ],
    data: data as Buffer,
  })
}

/**
 * Build a withdraw instruction (phase 2).
 * Completes the withdrawal after redemption period has elapsed.
 *
 * @param userWallet - The withdrawing user's wallet public key
 * @param riskLevel - 0 = conservative, 1 = moderate, 2 = aggressive
 * @param shareMint - The vault's share mint address (read from RiskVault.shareMint)
 */
export async function buildWithdrawInstruction(
  userWallet: PublicKey,
  riskLevel: number,
  shareMint: PublicKey,
  treasuryUsdcAccount?: PublicKey
): Promise<TransactionInstruction> {
  if (riskLevel < 0 || riskLevel > 2) {
    throw new Error(`Invalid risk level: ${riskLevel}. Must be 0, 1, or 2.`)
  }

  const [allocator] = getAllocatorPDA()
  const [riskVault] = getRiskVaultPDA(riskLevel)
  const [userPosition] = getUserPositionPDA(userWallet, riskVault)
  const [treasury] = getTreasuryPDA()

  const userUsdc = await getAssociatedTokenAddress(USDC_MINT, userWallet)
  const userShares = await getAssociatedTokenAddress(shareMint, userWallet)
  const vaultUsdc = await getAssociatedTokenAddress(USDC_MINT, allocator, true)
  // Treasury USDC must match on-chain treasury.usdc_token_account — not a derived ATA
  const treasuryUsdc = treasuryUsdcAccount ?? await getAssociatedTokenAddress(USDC_MINT, treasury, true)

  const discriminator = await getDiscriminator('withdraw')

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: allocator, isSigner: false, isWritable: true },
      { pubkey: riskVault, isSigner: false, isWritable: true },
      { pubkey: userPosition, isSigner: false, isWritable: true },
      { pubkey: treasury, isSigner: false, isWritable: true },
      { pubkey: shareMint, isSigner: false, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: userShares, isSigner: false, isWritable: true },
      { pubkey: userUsdc, isSigner: false, isWritable: true },
      { pubkey: vaultUsdc, isSigner: false, isWritable: true },
      { pubkey: treasuryUsdc, isSigner: false, isWritable: true },
      { pubkey: userWallet, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: discriminator as Buffer,
  })
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { PROGRAM_ID, USDC_MINT }
