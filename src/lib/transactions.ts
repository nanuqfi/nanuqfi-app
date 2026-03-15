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
    '2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P'
)

const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
)

// ─── PDA Derivation ──────────────────────────────────────────────────────────

export function getAllocatorPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('allocator')], PROGRAM_ID)
}

export function getRiskVaultPDA(riskLevel: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), Buffer.from([riskLevel])],
    PROGRAM_ID
  )
}

export function getUserPositionPDA(
  user: PublicKey,
  riskVault: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('position'), user.toBuffer(), riskVault.toBuffer()],
    PROGRAM_ID
  )
}

export function getTreasuryPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('treasury')], PROGRAM_ID)
}

export function getShareMintPDA(riskLevel: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('shares'), Buffer.from([riskLevel])],
    PROGRAM_ID
  )
}

// ─── Anchor Instruction Discriminator ────────────────────────────────────────
// SHA-256 of "global:<instruction_name>" truncated to 8 bytes.
// Pre-computed to avoid async crypto in hot paths.

const DISCRIMINATORS: Record<string, Buffer> = {
  deposit: Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]),
  request_withdraw: Buffer.from([137, 95, 187, 96, 250, 138, 31, 182]),
  withdraw: Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]),
}

/**
 * Compute an Anchor instruction discriminator at runtime.
 * Uses Web Crypto API (available in both browser and Node 18+).
 */
async function computeDiscriminator(name: string): Promise<Buffer> {
  const data = new TextEncoder().encode(`global:${name}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Buffer.from(hashBuffer).subarray(0, 8)
}

/**
 * Get discriminator — uses pre-computed values, falls back to runtime computation.
 */
async function getDiscriminator(name: string): Promise<Buffer> {
  if (DISCRIMINATORS[name]) return DISCRIMINATORS[name]!
  const disc = await computeDiscriminator(name)
  DISCRIMINATORS[name] = disc
  return disc
}

// ─── Instruction Data Serialization ──────────────────────────────────────────

function serializeU64(value: bigint): Buffer {
  const buf = Buffer.alloc(8)
  buf.writeBigUInt64LE(value)
  return buf
}

// ─── Transaction Builders ────────────────────────────────────────────────────

/**
 * Build a deposit instruction for the allocator program.
 *
 * @param userWallet - The depositing user's wallet public key
 * @param riskLevel - 0 = conservative, 1 = moderate, 2 = aggressive
 * @param amount - USDC amount in smallest unit (6 decimals)
 */
export async function buildDepositInstruction(
  userWallet: PublicKey,
  riskLevel: number,
  amount: bigint
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
  const [shareMint] = getShareMintPDA(riskLevel)

  const userUsdc = await getAssociatedTokenAddress(USDC_MINT, userWallet)
  const userShares = await getAssociatedTokenAddress(shareMint, userWallet)

  // Vault USDC account — ATA owned by the allocator PDA
  const vaultUsdc = await getAssociatedTokenAddress(USDC_MINT, allocator, true)

  // Instruction data: 8-byte discriminator + 8-byte u64 amount
  const discriminator = await getDiscriminator('deposit')
  const data = Buffer.concat([discriminator, serializeU64(amount)])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: allocator, isSigner: false, isWritable: true },
      { pubkey: riskVault, isSigner: false, isWritable: true },
      { pubkey: userPosition, isSigner: false, isWritable: true },
      { pubkey: shareMint, isSigner: false, isWritable: true },
      { pubkey: userUsdc, isSigner: false, isWritable: true },
      { pubkey: userShares, isSigner: false, isWritable: true },
      { pubkey: vaultUsdc, isSigner: false, isWritable: true },
      { pubkey: userWallet, isSigner: true, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
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
  const data = Buffer.concat([discriminator, serializeU64(shares)])

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: allocator, isSigner: false, isWritable: false },
      { pubkey: riskVault, isSigner: false, isWritable: false },
      { pubkey: userPosition, isSigner: false, isWritable: true },
      { pubkey: userWallet, isSigner: true, isWritable: false },
    ],
    data,
  })
}

/**
 * Build a withdraw instruction (phase 2).
 * Completes the withdrawal after redemption period has elapsed.
 *
 * @param userWallet - The withdrawing user's wallet public key
 * @param riskLevel - 0 = conservative, 1 = moderate, 2 = aggressive
 */
export async function buildWithdrawInstruction(
  userWallet: PublicKey,
  riskLevel: number
): Promise<TransactionInstruction> {
  if (riskLevel < 0 || riskLevel > 2) {
    throw new Error(`Invalid risk level: ${riskLevel}. Must be 0, 1, or 2.`)
  }

  const [allocator] = getAllocatorPDA()
  const [riskVault] = getRiskVaultPDA(riskLevel)
  const [userPosition] = getUserPositionPDA(userWallet, riskVault)
  const [treasury] = getTreasuryPDA()
  const [shareMint] = getShareMintPDA(riskLevel)

  const userUsdc = await getAssociatedTokenAddress(USDC_MINT, userWallet)
  const userShares = await getAssociatedTokenAddress(shareMint, userWallet)
  const vaultUsdc = await getAssociatedTokenAddress(USDC_MINT, allocator, true)
  const treasuryUsdc = await getAssociatedTokenAddress(
    USDC_MINT,
    treasury,
    true
  )

  const discriminator = await getDiscriminator('withdraw')
  // No args — withdraw uses pending_withdrawal_shares from on-chain state
  const data = discriminator

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: allocator, isSigner: false, isWritable: true },
      { pubkey: riskVault, isSigner: false, isWritable: true },
      { pubkey: userPosition, isSigner: false, isWritable: true },
      { pubkey: treasury, isSigner: false, isWritable: true },
      { pubkey: shareMint, isSigner: false, isWritable: true },
      { pubkey: userShares, isSigner: false, isWritable: true },
      { pubkey: userUsdc, isSigner: false, isWritable: true },
      { pubkey: vaultUsdc, isSigner: false, isWritable: true },
      { pubkey: treasuryUsdc, isSigner: false, isWritable: true },
      { pubkey: userWallet, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  })
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { PROGRAM_ID, USDC_MINT }
