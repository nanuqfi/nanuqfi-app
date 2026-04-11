import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingGuide } from '../onboarding-guide'

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockSetVisible = vi.fn()
let mockConnected = false
let mockPublicKey: { toBase58: () => string } | null = null

vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: mockConnected,
    publicKey: mockPublicKey,
  }),
}))

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({ setVisible: mockSetVisible }),
}))

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderGuide(onClose = vi.fn()) {
  return render(<OnboardingGuide onClose={onClose} />)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OnboardingGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConnected = false
    mockPublicKey = null
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ── Step 1 ─────────────────────────────────────────────────────────────────

  describe('Step 1 — Switch to Devnet', () => {
    it('renders the step 1 heading on initial mount', () => {
      renderGuide()
      expect(screen.getByText('Switch Your Wallet to Devnet')).toBeDefined()
    })

    it('shows Phantom instructions', () => {
      renderGuide()
      expect(screen.getByText('Phantom')).toBeDefined()
      expect(screen.getByText(/Settings → Developer Settings/)).toBeDefined()
    })

    it('shows Solflare instructions', () => {
      renderGuide()
      expect(screen.getByText('Solflare')).toBeDefined()
      expect(screen.getByText(/Settings → General → Network/)).toBeDefined()
    })

    it('renders the "I\'ve switched to Devnet" CTA button', () => {
      renderGuide()
      expect(screen.getByRole('button', { name: /I've switched to Devnet/i })).toBeDefined()
    })

    it('"I\'ve switched to Devnet" advances to Step 2', () => {
      renderGuide()
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))
      expect(screen.getByText('Connect Your Wallet')).toBeDefined()
    })

    it('renders 4-segment progress bar with first segment active', () => {
      const { container } = renderGuide()
      // Progress bar segments — sky-500 for active, bg-sky-500 first segment
      const segments = container.querySelectorAll('.h-1\\.5.flex-1.rounded-full')
      expect(segments.length).toBe(4)
    })
  })

  // ── Step 2 ─────────────────────────────────────────────────────────────────

  describe('Step 2 — Connect Wallet', () => {
    it('shows "Connect Wallet" button when not connected', () => {
      renderGuide()
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))
      expect(screen.getByRole('button', { name: /Connect Wallet/i })).toBeDefined()
    })

    it('"Connect Wallet" button calls setVisible(true)', () => {
      renderGuide()
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))
      fireEvent.click(screen.getByRole('button', { name: /Connect Wallet/i }))
      expect(mockSetVisible).toHaveBeenCalledWith(true)
    })

    it('auto-advances to Step 3 when wallet connects while on Step 2', async () => {
      mockConnected = false
      mockPublicKey = null
      const { rerender } = renderGuide()

      // Advance to step 2
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))
      expect(screen.getByText('Connect Your Wallet')).toBeDefined()

      // Simulate wallet connecting — update module mock state and re-render
      mockConnected = true
      mockPublicKey = { toBase58: () => 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr' }

      // Re-render with new wallet state to trigger the useEffect
      rerender(<OnboardingGuide onClose={vi.fn()} />)

      await waitFor(() => {
        expect(screen.getByText('Get Free Test USDC')).toBeDefined()
      })
    })

    it('shows connected address when wallet is already connected on Step 2', () => {
      mockConnected = true
      mockPublicKey = { toBase58: () => 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr' }

      renderGuide()
      // Go to step 2 — useEffect fires immediately because connected is true
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))

      // Should auto-advance to step 3
      expect(screen.getByText('Get Free Test USDC')).toBeDefined()
    })
  })

  // ── Step 3 ─────────────────────────────────────────────────────────────────

  describe('Step 3 — Get Test USDC', () => {
    function setupStep3() {
      mockConnected = true
      mockPublicKey = { toBase58: () => 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr' }
      renderGuide()
      // Steps 1 → 2 → (auto-advance to 3 via useEffect because wallet is connected)
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))
    }

    it('shows 3 preset amount buttons', async () => {
      setupStep3()
      await waitFor(() => {
        expect(screen.getByText('$100')).toBeDefined()
        expect(screen.getByText('$1,000')).toBeDefined()
        expect(screen.getByText('$100,000')).toBeDefined()
      })
    })

    it('calls /api/airdrop with correct amount on $100 click', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, signature: 'sig123', balance: '100.00' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      setupStep3()

      await waitFor(() => expect(screen.getByText('$100')).toBeDefined())
      fireEvent.click(screen.getByText('$100'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/airdrop',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"amount":100'),
          }),
        )
      })
    })

    it('calls /api/airdrop with correct amount on $1,000 click', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, signature: 'sig123', balance: '1000.00' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      setupStep3()

      await waitFor(() => expect(screen.getByText('$1,000')).toBeDefined())
      fireEvent.click(screen.getByText('$1,000'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/airdrop',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"amount":1000'),
          }),
        )
      })
    })

    it('calls /api/airdrop with correct amount on $100,000 click', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, signature: 'sig123', balance: '100000.00' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      setupStep3()

      await waitFor(() => expect(screen.getByText('$100,000')).toBeDefined())
      fireEvent.click(screen.getByText('$100,000'))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/airdrop',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"amount":100000'),
          }),
        )
      })
    })

    it('shows success state after successful airdrop', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, signature: 'sig123', balance: '1000.00' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      setupStep3()

      await waitFor(() => expect(screen.getByText('$1,000')).toBeDefined())
      fireEvent.click(screen.getByText('$1,000'))

      await waitFor(() => {
        // Success message includes balance
        expect(screen.getByText(/Received.*1000\.00.*USDC/i)).toBeDefined()
      })
    })

    it('shows error message when airdrop API returns failure', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false, error: 'Rate limit exceeded' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      setupStep3()

      await waitFor(() => expect(screen.getByText('$100')).toBeDefined())
      fireEvent.click(screen.getByText('$100'))

      await waitFor(() => {
        expect(screen.getByText('Rate limit exceeded')).toBeDefined()
      })
    })

    it('shows network error message on fetch exception', async () => {
      const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
      vi.stubGlobal('fetch', mockFetch)

      setupStep3()

      await waitFor(() => expect(screen.getByText('$100')).toBeDefined())
      fireEvent.click(screen.getByText('$100'))

      await waitFor(() => {
        expect(screen.getByText(/Network error — please try again/i)).toBeDefined()
      })
    })
  })

  // ── Step 4 ─────────────────────────────────────────────────────────────────
  // Step 4 is reached via a 2-second setTimeout after a successful airdrop.
  // Rather than battling fake timers + async React state, we drive to step 4
  // by completing a fast airdrop and then advancing real time via a short
  // waitFor poll. We allow up to 4 seconds for the state machine to settle.

  describe('Step 4 — First Deposit', () => {
    async function setupStep4() {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, signature: 'sig123', balance: '1000.00' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      mockConnected = true
      mockPublicKey = { toBase58: () => 'FGSkt8MwXH83daNNW8ZkoqhL1KLcLoZLcdGJz84BWWr' }
      renderGuide()

      // Step 1 → 2 → 3 (auto because wallet connected)
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))
      await waitFor(() => expect(screen.getByText('$1,000')).toBeDefined())

      // Trigger airdrop — success → auto-advance to step 4 after component's 2s timeout
      fireEvent.click(screen.getByText('$1,000'))

      // Wait for step 4 content (the 2-second setTimeout fires in real time)
      await waitFor(
        () => expect(screen.getByText('Make Your First Deposit')).toBeDefined(),
        { timeout: 4000 },
      )
    }

    it('renders vault links on Step 4', async () => {
      await setupStep4()
      expect(screen.getByText('Moderate Vault')).toBeDefined()
      expect(screen.getByText('Aggressive Vault')).toBeDefined()
    }, 10000)

    it('Moderate Vault link points to /app/vaults/moderate', async () => {
      await setupStep4()
      const link = screen.getByRole('link', { name: /Moderate Vault/i })
      expect(link.getAttribute('href')).toBe('/app/vaults/moderate')
    }, 10000)

    it('Aggressive Vault link points to /app/vaults/aggressive', async () => {
      await setupStep4()
      const link = screen.getByRole('link', { name: /Aggressive Vault/i })
      expect(link.getAttribute('href')).toBe('/app/vaults/aggressive')
    }, 10000)
  })

  // ── Progress bar ───────────────────────────────────────────────────────────

  describe('Progress bar', () => {
    it('first segment is active (sky) on step 1', () => {
      const { container } = renderGuide()
      const segments = container.querySelectorAll('.h-1\\.5.flex-1.rounded-full')
      expect(segments[0].className).toContain('bg-sky-500')
    })

    it('first segment completes (emerald) and second becomes active (sky) on step 2', () => {
      const { container } = renderGuide()
      fireEvent.click(screen.getByRole('button', { name: /I've switched to Devnet/i }))
      const segments = container.querySelectorAll('.h-1\\.5.flex-1.rounded-full')
      expect(segments[0].className).toContain('bg-emerald-500')
      expect(segments[1].className).toContain('bg-sky-500')
    })
  })

  // ── Close button ───────────────────────────────────────────────────────────

  describe('Close button', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      renderGuide(onClose)
      fireEvent.click(screen.getByLabelText('Close onboarding guide'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
