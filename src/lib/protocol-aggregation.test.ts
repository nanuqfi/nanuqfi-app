import { describe, it, expect } from 'vitest'
import { aggregateProtocolAllocations } from './protocol-aggregation'

describe('aggregateProtocolAllocations', () => {
  it('aggregates dollars by protocol across vaults (TVL-weighted)', () => {
    const result = aggregateProtocolAllocations([
      { tvl: 200, weights: { 'kamino-lending': 50, 'marginfi-lending': 50 } },
      { tvl: 100, weights: { 'kamino-lending': 100 } },
    ])

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      slug: 'kamino-lending',
      dollars: 200, // 200*0.5 + 100*1.0
    })
    expect(result[1]).toMatchObject({
      slug: 'marginfi-lending',
      dollars: 100, // 200*0.5
    })
    // Percentages: kamino 200/300 = 66.67%, marginfi 100/300 = 33.33%
    expect(result[0].percentage).toBeCloseTo(66.667, 1)
    expect(result[1].percentage).toBeCloseTo(33.333, 1)
  })

  it('sorts protocols by dollars deployed (descending)', () => {
    const result = aggregateProtocolAllocations([
      { tvl: 100, weights: { 'a': 10, 'b': 60, 'c': 30 } },
    ])
    expect(result.map(p => p.slug)).toEqual(['b', 'c', 'a'])
  })

  it('filters out protocols with zero dollars deployed', () => {
    const result = aggregateProtocolAllocations([
      { tvl: 100, weights: { 'kamino-lending': 100 } },
      { tvl: 0, weights: { 'marginfi-lending': 50, 'lulo-lending': 50 } }, // zero TVL
    ])
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('kamino-lending')
  })

  it('returns empty array when total TVL is zero', () => {
    const result = aggregateProtocolAllocations([
      { tvl: 0, weights: { 'kamino-lending': 100 } },
    ])
    expect(result).toEqual([])
  })

  it('returns empty array for empty vaults array', () => {
    expect(aggregateProtocolAllocations([])).toEqual([])
  })

  it('handles vaults with identical weights (real keeper scenario)', () => {
    // All 3 vaults get same proposed weights from keeper, differing only in TVL.
    const result = aggregateProtocolAllocations([
      { tvl: 0, weights: { 'kamino-lending': 10, 'marginfi-lending': 30, 'lulo-lending': 60 } },
      { tvl: 200, weights: { 'kamino-lending': 10, 'marginfi-lending': 30, 'lulo-lending': 60 } },
      { tvl: 50, weights: { 'kamino-lending': 10, 'marginfi-lending': 30, 'lulo-lending': 60 } },
    ])
    expect(result).toHaveLength(3)
    // Aggregate preserves the 10/30/60 ratio since weights are identical
    const total = result.reduce((s, p) => s + p.dollars, 0)
    expect(total).toBeCloseTo(250, 1)
    expect(result[0].slug).toBe('lulo-lending')
    expect(result[0].percentage).toBeCloseTo(60, 1)
    expect(result[1].slug).toBe('marginfi-lending')
    expect(result[1].percentage).toBeCloseTo(30, 1)
    expect(result[2].slug).toBe('kamino-lending')
    expect(result[2].percentage).toBeCloseTo(10, 1)
  })
})
