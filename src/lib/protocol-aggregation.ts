export interface VaultSnapshot {
  tvl: number // USDC
  weights: Record<string, number> // percent 0-100
}

export interface ProtocolAllocation {
  slug: string
  percentage: number // TVL-weighted share, 0-100
  dollars: number // USDC deployed across all vaults
}

// Capital map: $ deployed per protocol, aggregated across vaults and
// normalized to a TVL-weighted percentage. A vault with zero TVL
// contributes zero dollars, so its weights don't skew the capital map
// (a 0-TVL vault's 50% Kamino weight = $0, not "50% of allocation").
export function aggregateProtocolAllocations(
  vaults: VaultSnapshot[]
): ProtocolAllocation[] {
  const totals: Record<string, number> = {}
  let totalDollars = 0

  for (const vault of vaults) {
    for (const [slug, weight] of Object.entries(vault.weights)) {
      const dollars = vault.tvl * (Number(weight) / 100)
      totals[slug] = (totals[slug] ?? 0) + dollars
      totalDollars += dollars
    }
  }

  if (totalDollars === 0) return []

  return Object.entries(totals)
    .filter(([, dollars]) => dollars > 0)
    .map(([slug, dollars]) => ({
      slug,
      percentage: (dollars / totalDollars) * 100,
      dollars,
    }))
    .sort((a, b) => b.dollars - a.dollars)
}
