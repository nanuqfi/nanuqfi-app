import { describe, it, expect } from 'vitest'
import { parseAllocatorError } from './errors'

describe('parseAllocatorError', () => {
  it('maps Anchor error code object to message', () => {
    const error = {
      error: { errorCode: { number: 6007, code: 'AllocatorHalted' } },
    }
    expect(parseAllocatorError(error)).toBe(
      'Vault is currently halted — deposits paused'
    )
  })

  it('maps hex error from message string', () => {
    const error = {
      message: 'Transaction failed: custom program error: 0x1777',
    }
    // 0x1777 = 6007
    expect(parseAllocatorError(error)).toBe(
      'Vault is currently halted — deposits paused'
    )
  })

  it('maps hex error from logs array', () => {
    const error = {
      logs: [
        'Program log: AnchorError thrown',
        'Program log: custom program error: 0x1770',
      ],
    }
    // 0x1770 = 6000
    expect(parseAllocatorError(error)).toBe('Weights must sum to 100%')
  })

  it('returns fallback for unknown error', () => {
    expect(parseAllocatorError(new Error('random'))).toBe(
      'Transaction failed. Please try again.'
    )
  })

  it('handles null', () => {
    expect(parseAllocatorError(null)).toBe(
      'Transaction failed. Please try again.'
    )
  })

  it('handles undefined', () => {
    expect(parseAllocatorError(undefined)).toBe(
      'Transaction failed. Please try again.'
    )
  })

  it('handles empty object', () => {
    expect(parseAllocatorError({})).toBe(
      'Transaction failed. Please try again.'
    )
  })

  it('handles primitive values', () => {
    expect(parseAllocatorError(42)).toBe(
      'Transaction failed. Please try again.'
    )
    expect(parseAllocatorError('string error')).toBe(
      'Transaction failed. Please try again.'
    )
  })

  it('maps all error codes correctly', () => {
    const cases: [number, string][] = [
      [6000, 'Weights must sum to 100%'],
      [6001, 'Weight exceeds maximum allocation'],
      [6002, 'Negative weight value'],
      [6003, 'Rebalance interval not met'],
      [6004, 'Allocation shift exceeds maximum per rebalance'],
      [6005, 'Unauthorized: not the keeper'],
      [6006, 'Unauthorized: not the admin'],
      [6007, 'Vault is currently halted — deposits paused'],
      [6008, 'Drawdown exceeds maximum for this vault'],
      [6009, 'Oracle price divergence exceeds threshold'],
      [6010, 'Withdrawal not ready — redemption period not elapsed'],
      [6011, 'No pending withdrawal to complete'],
      [6012, 'Invalid risk level'],
      [6013, 'Vault already initialized'],
      [6014, 'Cannot loosen guardrails beyond initial values'],
      [6015, 'Keeper lease conflict — another instance is active'],
      [6016, 'You already have a pending withdrawal'],
      [6017, 'Insufficient vault balance'],
      [6018, 'Arithmetic overflow'],
      [6019, 'Protocol vault capacity exceeded'],
      [6020, 'Oracle price data is stale — try again'],
      [6021, 'Insufficient liquid USDC — keeper is freeing funds'],
      [6022, 'Protocol operation failed — try again'],
      [6023, 'Deposit exceeds vault cap'],
    ]

    for (const [code, message] of cases) {
      const error = { error: { errorCode: { number: code } } }
      expect(parseAllocatorError(error)).toBe(message)
    }
  })

  it('maps deposit-related errors specifically', () => {
    expect(
      parseAllocatorError({ error: { errorCode: { number: 6023 } } })
    ).toBe('Deposit exceeds vault cap')
    expect(
      parseAllocatorError({ error: { errorCode: { number: 6017 } } })
    ).toBe('Insufficient vault balance')
  })

  it('returns fallback for unmapped error code', () => {
    expect(
      parseAllocatorError({ error: { errorCode: { number: 9999 } } })
    ).toBe('Transaction failed. Please try again.')
  })

  it('prefers logs over message for hex extraction', () => {
    const error = {
      message: 'custom program error: 0x1777', // 6007
      logs: ['custom program error: 0x1770'],   // 6000
    }
    // Logs are checked first
    expect(parseAllocatorError(error)).toBe('Weights must sum to 100%')
  })
})
