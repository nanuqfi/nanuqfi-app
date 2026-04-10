import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DevnetBanner } from '../devnet-banner'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({ connected: false, publicKey: null }),
}))

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({ setVisible: vi.fn() }),
}))

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DevnetBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders devnet warning text', () => {
    render(<DevnetBanner />)
    expect(screen.getByText(/Devnet Mode/i)).toBeDefined()
    expect(screen.getByText(/Transactions use test USDC, not real funds/i)).toBeDefined()
  })

  it('"New here? Get started" link is visible initially', () => {
    render(<DevnetBanner />)
    expect(screen.getByText(/New here\? Get started/i)).toBeDefined()
  })

  it('clicking the link renders the onboarding guide (step 1 visible)', () => {
    render(<DevnetBanner />)

    fireEvent.click(screen.getByText(/New here\? Get started/i))

    // OnboardingGuide step 1 heading confirms guide is mounted
    expect(screen.getByText('Switch Your Wallet to Devnet')).toBeDefined()
  })

  it('clicking the link changes button label to "Hide guide"', () => {
    render(<DevnetBanner />)

    fireEvent.click(screen.getByText(/New here\? Get started/i))

    expect(screen.getByText('Hide guide')).toBeDefined()
    expect(screen.queryByText(/New here\? Get started/i)).toBeNull()
  })

  it('clicking "Hide guide" dismisses the onboarding guide', () => {
    render(<DevnetBanner />)

    // Open
    fireEvent.click(screen.getByText(/New here\? Get started/i))
    expect(screen.getByText('Switch Your Wallet to Devnet')).toBeDefined()

    // Close
    fireEvent.click(screen.getByText('Hide guide'))
    expect(screen.queryByText('Switch Your Wallet to Devnet')).toBeNull()
  })

  it('closing via onboarding close button (×) hides the guide', () => {
    render(<DevnetBanner />)

    // Open guide
    fireEvent.click(screen.getByText(/New here\? Get started/i))
    expect(screen.getByText('Switch Your Wallet to Devnet')).toBeDefined()

    // Click the OnboardingGuide's own close button
    fireEvent.click(screen.getByLabelText('Close onboarding guide'))
    expect(screen.queryByText('Switch Your Wallet to Devnet')).toBeNull()

    // Banner toggle label reverts to "New here? Get started →"
    expect(screen.getByText(/New here\? Get started/i)).toBeDefined()
  })

  it('guide is not rendered on initial mount (showGuide starts false)', () => {
    render(<DevnetBanner />)
    expect(screen.queryByText('Switch Your Wallet to Devnet')).toBeNull()
  })

  it('toggle can be opened and closed multiple times', () => {
    render(<DevnetBanner />)

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText(/New here\? Get started/i))
      expect(screen.getByText('Switch Your Wallet to Devnet')).toBeDefined()

      fireEvent.click(screen.getByText('Hide guide'))
      expect(screen.queryByText('Switch Your Wallet to Devnet')).toBeNull()
    }
  })
})
