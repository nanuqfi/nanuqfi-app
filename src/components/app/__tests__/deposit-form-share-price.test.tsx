import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DepositForm } from '../deposit-form'

// Mock wallet + connection
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({ publicKey: null, sendTransaction: vi.fn() }),
  useConnection: () => ({ connection: {} }),
}))
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

describe('DepositForm share price handling', () => {
  const baseProps = {
    riskLevel: 'moderate' as const,
    riskLevelNum: 1,
    apy: 0.08,
    dailyEarnings: 0.22,
  }

  it('MAX button uses share price for withdraw USDC estimate', () => {
    render(
      <DepositForm
        {...baseProps}
        userShares={100_000_000n}
        sharePrice={1.2}
      />,
    )

    fireEvent.click(screen.getByText('Withdraw'))
    fireEvent.click(screen.getByText('MAX'))

    const input = screen.getByPlaceholderText('0.00') as HTMLInputElement
    expect(Number(input.value)).toBeCloseTo(120, 1)
  })

  it('MAX button defaults to 1:1 when sharePrice not provided', () => {
    render(
      <DepositForm
        {...baseProps}
        userShares={100_000_000n}
      />,
    )

    fireEvent.click(screen.getByText('Withdraw'))
    fireEvent.click(screen.getByText('MAX'))

    const input = screen.getByPlaceholderText('0.00') as HTMLInputElement
    expect(Number(input.value)).toBeCloseTo(100, 1)
  })
})
