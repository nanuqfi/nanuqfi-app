import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { YieldEstimator } from './yield-estimator'

describe('YieldEstimator', () => {
  const defaultProps = {
    apy: 0.068,
    onConnect: () => {},
  }

  it('renders preset amount buttons', () => {
    render(<YieldEstimator {...defaultProps} />)
    expect(screen.getByRole('button', { name: '$100' })).toBeDefined()
    expect(screen.getByRole('button', { name: '$500' })).toBeDefined()
    expect(screen.getByRole('button', { name: '$1,000' })).toBeDefined()
    expect(screen.getByRole('button', { name: '$5,000' })).toBeDefined()
  })

  it('shows projected earnings for default preset ($100)', () => {
    render(<YieldEstimator {...defaultProps} />)
    expect(screen.getByText(/Projected daily/)).toBeDefined()
    expect(screen.getByText(/\$0\.02/)).toBeDefined()
  })

  it('updates projection when a different preset is clicked', () => {
    render(<YieldEstimator {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: '$1,000' }))
    expect(screen.getByText(/\$0\.19/)).toBeDefined()
  })

  it('shows "Start Earning" CTA when no wallet', () => {
    render(<YieldEstimator {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Start Earning/ })).toBeDefined()
  })

  it('shows "Deposit Now" CTA when wallet connected', () => {
    render(<YieldEstimator {...defaultProps} ctaMode="deposit" />)
    expect(screen.getByRole('button', { name: /Deposit Now/ })).toBeDefined()
  })

  it('shows wallet balance when provided', () => {
    render(<YieldEstimator {...defaultProps} walletBalance={500} ctaMode="deposit" />)
    expect(screen.getByText(/Your balance/)).toBeDefined()
    expect(screen.getByText(/500 USDC/)).toBeDefined()
  })

  it('caps default selection at $5,000 even with large balance', () => {
    render(<YieldEstimator {...defaultProps} walletBalance={999999} ctaMode="deposit" />)
    expect(screen.getByText(/\$0\.93/)).toBeDefined()
  })

  it('falls back to $100 preset when balance is 0', () => {
    render(<YieldEstimator {...defaultProps} walletBalance={0} ctaMode="deposit" />)
    expect(screen.getByText(/\$0\.02/)).toBeDefined()
  })
})
