import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PortfolioSummary } from './portfolio-summary'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: vi.fn(() => ({ setVisible: vi.fn() })),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useParams: vi.fn(() => ({})),
}))

vi.mock('@/hooks/use-allocator', () => ({
  useAllocatorState: vi.fn(() => ({ data: null, loading: false, error: null, refresh: vi.fn() })),
  useRiskVault: vi.fn(() => ({ data: null, loading: false, error: null, refresh: vi.fn() })),
  useUserPosition: vi.fn(() => ({ data: null, loading: false, error: null, refresh: vi.fn() })),
  useUsdcBalance: vi.fn(() => ({ data: null, loading: false, error: null, refresh: vi.fn() })),
}))

vi.mock('@/hooks/use-keeper-api', () => ({
  useKeeperHealth: vi.fn(() => ({ data: null, loading: false, error: null, isStale: false })),
  useVaultData: vi.fn(() => ({ data: null, loading: false, error: null, isStale: false })),
  useAllDecisions: vi.fn(() => ({ data: null, loading: false, error: null, isStale: false })),
  useKeeperDecisions: vi.fn(() => ({ data: null, loading: false, error: null, isStale: false })),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultProps = {
  isConnected: false,
  positionsLoading: false,
  userModValue: 0,
  userAggValue: 0,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PortfolioSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loading state: renders skeleton placeholders when positionsLoading is true', () => {
    const { container } = render(
      <PortfolioSummary {...defaultProps} positionsLoading={true} />
    )
    // All four skeleton divs carry animate-pulse
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
    // None of the data labels should be visible
    expect(screen.queryByText(/Your Value/i)).toBeNull()
    expect(screen.queryByText(/Daily Earnings/i)).toBeNull()
    expect(screen.queryByText(/Protocol TVL/i)).toBeNull()
  })

  it('state 3 (has position): renders "Your Value" and "Daily Earnings" when connected with funds', () => {
    render(
      <PortfolioSummary
        {...defaultProps}
        isConnected={true}
        positionsLoading={false}
        userModValue={210}
        userAggValue={50}
      />
    )
    expect(screen.getByText(/Your Value/i)).toBeDefined()
    expect(screen.getByText(/Daily Earnings/i)).toBeDefined()
  })

  it('state 3: does NOT render "Protocol TVL" when user has a position', () => {
    render(
      <PortfolioSummary
        {...defaultProps}
        isConnected={true}
        positionsLoading={false}
        userModValue={210}
        userAggValue={50}
      />
    )
    expect(screen.queryByText(/Protocol TVL/i)).toBeNull()
  })

  it('state 2 (connected, no position): renders "Protocol TVL", "Deposit Now" CTA, and wallet balance', () => {
    render(
      <PortfolioSummary
        {...defaultProps}
        isConnected={true}
        positionsLoading={false}
        userModValue={0}
        userAggValue={0}
        walletBalance={500}
      />
    )
    // Protocol-level stats visible in the estimator section
    expect(screen.getByText(/Protocol TVL/i)).toBeDefined()
    // Connected ctaMode → "Deposit Now"
    expect(screen.getByRole('button', { name: /Deposit Now/i })).toBeDefined()
    // Wallet balance surfaced via YieldEstimator
    expect(screen.getByText(/Your balance/i)).toBeDefined()
    expect(screen.getByText(/500 USDC/i)).toBeDefined()
  })

  it('state 1 (disconnected): renders "Protocol TVL" and "Start Earning" CTA', () => {
    render(
      <PortfolioSummary
        {...defaultProps}
        isConnected={false}
        positionsLoading={false}
        userModValue={0}
        userAggValue={0}
      />
    )
    expect(screen.getByText(/Protocol TVL/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Start Earning/i })).toBeDefined()
  })

  it('state 1 (disconnected): does NOT render "Your Value" or "Daily Earnings"', () => {
    render(
      <PortfolioSummary
        {...defaultProps}
        isConnected={false}
        positionsLoading={false}
        userModValue={0}
        userAggValue={0}
      />
    )
    expect(screen.queryByText(/Your Value/i)).toBeNull()
    expect(screen.queryByText(/Daily Earnings/i)).toBeNull()
  })
})
