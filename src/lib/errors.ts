/**
 * Allocator program error code mapping.
 *
 * Anchor errors start at 6000. The order here mirrors
 * `programs/allocator/src/errors.rs` — AllocatorError enum.
 */

const ERROR_MAP: Record<number, string> = {
  6000: 'Weights must sum to 100%',
  6001: 'Weight exceeds maximum allocation',
  6002: 'Negative weight value',
  6003: 'Rebalance interval not met',
  6004: 'Allocation shift exceeds maximum per rebalance',
  6005: 'Unauthorized: not the keeper',
  6006: 'Unauthorized: not the admin',
  6007: 'Vault is currently halted — deposits paused',
  6008: 'Drawdown exceeds maximum for this vault',
  6009: 'Oracle price divergence exceeds threshold',
  6010: 'Withdrawal not ready — redemption period not elapsed',
  6011: 'No pending withdrawal to complete',
  6012: 'Invalid risk level',
  6013: 'Vault already initialized',
  6014: 'Cannot loosen guardrails beyond initial values',
  6015: 'Keeper lease conflict — another instance is active',
  6016: 'You already have a pending withdrawal',
  6017: 'Insufficient vault balance',
  6018: 'Arithmetic overflow',
  6019: 'Protocol vault capacity exceeded',
  6020: 'Oracle price data is stale — try again',
  6021: 'Insufficient liquid USDC — keeper is freeing funds',
  6022: 'Protocol operation failed — try again',
  6023: 'Deposit exceeds vault cap',
  6024: 'Position has non-zero shares — withdraw first',
  6025: 'Pending withdrawal exists — complete it first',
  6026: 'Arithmetic underflow',
  6027: 'Deposit too small (minimum 1 USDC for first deposit)',
  6028: 'Protocol not whitelisted',
  6029: 'Whitelist is full (max 8 protocols)',
  6030: 'Protocol not found in whitelist',
  6031: 'Redemption period too short',
  6032: 'Deposit exceeds per-transaction limit',
}

/**
 * Parse an allocator program error into a human-readable message.
 * Handles Anchor error objects, hex codes in logs, and unknown shapes.
 */
export function parseAllocatorError(error: unknown): string {
  // Wallet rejection — user cancelled in their wallet
  if (isWalletRejection(error)) return 'Transaction cancelled.'

  const code = extractErrorCode(error)
  if (code !== null && ERROR_MAP[code]) return ERROR_MAP[code]!

  // Wallet adapter errors that aren't user rejections (e.g., Phantom internal issues)
  if (typeof error === 'object' && error !== null) {
    const msg = String((error as Record<string, unknown>).message ?? '')
    if (msg.includes('WalletSendTransactionError') || msg.includes('Unexpected error')) {
      return 'Wallet error — refresh page and try again.'
    }
  }

  return 'Transaction failed. Please try again.'
}

function isWalletRejection(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false
  const msg = String((error as Record<string, unknown>).message ?? '')
  return (
    msg.includes('User rejected') ||
    msg.includes('user rejected') ||
    msg.includes('Transaction cancelled') ||
    msg.includes('WalletSignTransactionError')
  )
}

function extractErrorCode(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null

  const e = error as Record<string, unknown>

  // Anchor error format: { error: { errorCode: { number, code } } }
  const errorObj = e.error as Record<string, unknown> | undefined
  if (errorObj?.errorCode) {
    const ec = errorObj.errorCode as Record<string, unknown>
    if (typeof ec.number === 'number') return ec.number
  }

  // SendTransactionError format: { logs: [...] }
  const logs = e.logs as string[] | undefined
  if (Array.isArray(logs)) {
    for (const log of logs) {
      const match = log.match(/custom program error: 0x([0-9a-fA-F]+)/)
      if (match) return parseInt(match[1]!, 16)
    }
  }

  // Fallback: parse from error message string
  const msg = String(e.message ?? '')
  const match = msg.match(/custom program error: 0x([0-9a-fA-F]+)/)
  if (match) return parseInt(match[1]!, 16)

  return null
}
