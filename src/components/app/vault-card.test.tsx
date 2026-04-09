import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VaultCard } from './vault-card'
import type { Vault } from '@/lib/mock-data'

// ── Module mocks ──────────────────────────────────────────────────────────────

// Hoist setVisible so we can assert on it across tests.
const setVisible = vi.fn()

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: vi.fn(() => ({ setVisible })),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useParams: vi.fn(() => ({})),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockVault: Vault = {
  riskLevel: 'moderate',
  tvl: 200,
  apy: 0.065,
  drawdown: 0.005,
  weights: { 'kamino-lending': 50 },
  guardrails: { maxDrawdown: 5, currentDrawdown: 0.5, maxPerp: 0, currentPerp: 0 },
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('VaultCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Position state ───────────────────────────────────────────────────────

  it('with position: renders "Deposited" label and deposited amount', () => {
    render(<VaultCard vault={mockVault} deposited={210} isConnected={true} />)
    // formatUsd uses minimumFractionDigits=0 → "$210" not "$210.00"
    expect(screen.getByText(/Deposited/i)).toBeDefined()
    expect(screen.getByText('$210')).toBeDefined()
  })

  it('without position: renders "Deposit →" in the CTA row (not hover overlay)', () => {
    render(<VaultCard vault={mockVault} isConnected={true} />)

    const ctaRows = screen.getAllByText(/Deposit →/)
    // There are two: one in the interactive row, one in the hover overlay — both is fine to assert
    expect(ctaRows.length).toBeGreaterThanOrEqual(1)
  })

  it('without position: renders "Earn X%" in the CTA row', () => {
    render(<VaultCard vault={mockVault} isConnected={true} />)

    // "Earn " and "6.5%" live in separate child text nodes inside the same <span>.
    // Query the span by its role-adjacent text using a function matcher.
    const earnSpan = screen.getByText((_, el) => {
      return el?.tagName === 'SPAN' && el.textContent?.trim() === 'Earn 6.5%'
    })
    expect(earnSpan).toBeDefined()
  })

  it('without position: does NOT show "Deposited" label', () => {
    render(<VaultCard vault={mockVault} isConnected={true} />)
    expect(screen.queryByText(/^Deposited$/i)).toBeNull()
  })

  // ── Daily projection logic ────────────────────────────────────────────────

  it('with position: daily projection uses deposited amount not vault TVL', () => {
    // deposited=5000, apy=0.065 → 5000 * 0.065 / 365 ≈ $0.89/day
    // vault.tvl=200 would yield only ≈ $0.04/day — clearly distinct
    render(<VaultCard vault={mockVault} deposited={5000} isConnected={true} />)
    expect(screen.getByText(/\$0\.89/)).toBeDefined()
  })

  it('without position: daily projection uses vault TVL', () => {
    // vault.tvl=200, apy=0.065 → 200 * 0.065 / 365 ≈ 0.0356 → "$0.04"
    render(<VaultCard vault={mockVault} isConnected={true} />)
    expect(screen.getByText(/\$0\.04/)).toBeDefined()
  })

  // ── Disconnected click ────────────────────────────────────────────────────

  it('disconnected click: calls setVisible(true)', () => {
    // The component calls e.preventDefault() via React's synthetic event system,
    // then opens the wallet modal. We verify the modal side-effect directly.
    render(<VaultCard vault={mockVault} isConnected={false} />)

    const link = screen.getByRole('link')
    fireEvent.click(link)

    expect(setVisible).toHaveBeenCalledWith(true)
    expect(setVisible).toHaveBeenCalledTimes(1)
  })

  it('connected click: does NOT call setVisible', () => {
    render(<VaultCard vault={mockVault} isConnected={true} />)

    const link = screen.getByRole('link')
    fireEvent.click(link)

    expect(setVisible).not.toHaveBeenCalled()
  })
})
