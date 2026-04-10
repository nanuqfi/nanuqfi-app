/**
 * Network configuration constants.
 *
 * All network-specific values are centralized here for easy mainnet migration.
 *
 * MAINNET MIGRATION CHECKLIST:
 * 1. Set NEXT_PUBLIC_NETWORK=mainnet (or remove devnet-specific env vars)
 * 2. Replace DEVNET_GENESIS_HASH with mainnet genesis hash:
 *    '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'
 * 3. Replace DEVNET_RPC_FALLBACK with a mainnet RPC endpoint
 * 4. Replace DEVNET_USDC_MINT with Circle's mainnet USDC:
 *    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
 * 5. Replace DEVNET_PROGRAM_ID with mainnet-deployed allocator program
 * 6. Update SOLSCAN_CLUSTER to 'mainnet-beta'
 * 7. Remove or update the devnet onboarding guide in VaultDetailPage
 * 8. Verify keeper API URL points to mainnet keeper
 */

// ─── Environment ──────────────────────────────────────────────────────────────

/** Current network — controls UI labels and cluster params. */
export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK ?? 'devnet') as 'devnet' | 'mainnet'

export const IS_DEVNET = NETWORK === 'devnet'

// ─── RPC ─────────────────────────────────────────────────────────────────────

/**
 * Devnet public RPC fallback — used if HELIUS_RPC_URL env is not set.
 * MAINNET: replace with a mainnet RPC (Helius/Quicknode/Triton).
 */
export const DEVNET_RPC_FALLBACK = 'https://api.devnet.solana.com'

// ─── Genesis Hashes ──────────────────────────────────────────────────────────

/**
 * Devnet genesis hash — stable canonical identifier for network detection.
 * Source: getGenesisHash on https://api.devnet.solana.com
 * MAINNET: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'
 */
export const DEVNET_GENESIS_HASH = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG'

// ─── Program IDs & Addresses ──────────────────────────────────────────────────

/**
 * Allocator program ID — currently on devnet only.
 * MAINNET: redeploy allocator, update to mainnet program ID.
 * This is a display fallback — transactional code uses NEXT_PUBLIC_ALLOCATOR_PROGRAM_ID.
 */
export const DEVNET_PROGRAM_ID = '2QtJ5kmxLuW2jYCFpJMtzZ7PCnKdoMwkeueYoDUi5z5P'

/**
 * Test USDC mint (devnet) — minted by NanuqFi team, NOT Circle's devnet USDC.
 * MAINNET: Circle's mainnet USDC = EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
 */
export const DEVNET_USDC_MINT = 'BiTXT15XyfSakk5Yz8L8QrzHPWbK8NjoZeEMFrDvKdKh'

// ─── Explorer URLs ────────────────────────────────────────────────────────────

/**
 * Solscan cluster query param for deep links.
 * MAINNET: change to 'mainnet-beta'
 */
export const SOLSCAN_CLUSTER = 'devnet'

export function solscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}?cluster=${SOLSCAN_CLUSTER}`
}

export function solscanAccountUrl(address: string): string {
  return `https://solscan.io/account/${address}?cluster=${SOLSCAN_CLUSTER}`
}
