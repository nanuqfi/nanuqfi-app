import { describe, it, expect } from 'vitest'
import { normalizeApy, formatDailyEarnings, formatUsd, formatApy, getWeightedApy } from './mock-data'

describe('normalizeApy', () => {
  it('returns decimal APY as-is', () => {
    expect(normalizeApy(0.065)).toBe(0.065)
    expect(normalizeApy(0.0829)).toBe(0.0829)
    expect(normalizeApy(0.5)).toBe(0.5)
    expect(normalizeApy(1.0)).toBe(1.0)
  })

  it('converts percentage APY to decimal', () => {
    expect(normalizeApy(6.5)).toBeCloseTo(0.065)
    expect(normalizeApy(8.29)).toBeCloseTo(0.0829)
    expect(normalizeApy(100)).toBe(1.0)
    expect(normalizeApy(1.5)).toBeCloseTo(0.015)
  })

  it('handles zero', () => {
    expect(normalizeApy(0)).toBe(0)
  })

  it('handles NaN and Infinity', () => {
    expect(normalizeApy(NaN)).toBe(0)
    expect(normalizeApy(Infinity)).toBe(0)
    expect(normalizeApy(-Infinity)).toBe(0)
  })

  it('handles negative values', () => {
    expect(normalizeApy(-0.05)).toBe(-0.05)
  })
})

describe('formatDailyEarnings', () => {
  it('shows $0.00 for zero', () => {
    expect(formatDailyEarnings(0)).toBe('$0.00')
  })

  it('shows $0.00 for negative amounts', () => {
    expect(formatDailyEarnings(-5)).toBe('$0.00')
  })

  it('shows 4 decimal places for sub-penny amounts', () => {
    expect(formatDailyEarnings(0.005)).toBe('$0.0050')
    expect(formatDailyEarnings(0.001)).toBe('$0.0010')
  })

  it('shows 2 decimal places for sub-dollar amounts', () => {
    expect(formatDailyEarnings(0.05)).toBe('$0.05')
    expect(formatDailyEarnings(0.99)).toBe('$0.99')
  })

  it('delegates to formatUsd for amounts >= $1', () => {
    expect(formatDailyEarnings(1.5)).toBe(formatUsd(1.5))
    expect(formatDailyEarnings(100)).toBe(formatUsd(100))
  })

  it('handles NaN and Infinity', () => {
    expect(formatDailyEarnings(NaN)).toBe('$0.00')
    expect(formatDailyEarnings(Infinity)).toBe('$0.00')
  })

  it('formats real-world daily earnings correctly', () => {
    // $260 TVL * 6.5% APY / 365 = ~$0.0463
    const daily = 260 * 0.065 / 365
    expect(formatDailyEarnings(daily)).toBe('$0.05')
  })
})

describe('formatApy', () => {
  it('formats decimal APY as percentage string', () => {
    expect(formatApy(0.065)).toBe('6.5%')
    expect(formatApy(0.0829)).toBe('8.3%')
    expect(formatApy(0)).toBe('0.0%')
  })
})

describe('getWeightedApy', () => {
  it('returns a normalized decimal APY', () => {
    const result = getWeightedApy()
    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThan(1)
  })
})
