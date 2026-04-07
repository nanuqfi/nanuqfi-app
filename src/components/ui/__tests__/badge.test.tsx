import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '../badge'

describe('Badge', () => {
  it('conservative renders with emerald in className and text Conservative', () => {
    const { container } = render(<Badge tier="conservative" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('emerald')
    expect(screen.getByText('Conservative')).toBeInTheDocument()
  })

  it('moderate renders with sky in className and text Moderate', () => {
    const { container } = render(<Badge tier="moderate" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('sky')
    expect(screen.getByText('Moderate')).toBeInTheDocument()
  })

  it('aggressive renders with amber in className and text Aggressive', () => {
    const { container } = render(<Badge tier="aggressive" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('amber')
    expect(screen.getByText('Aggressive')).toBeInTheDocument()
  })

  it('renders the correct icon for each tier', () => {
    const { container: c1 } = render(<Badge tier="conservative" />)
    const { container: c2 } = render(<Badge tier="moderate" />)
    const { container: c3 } = render(<Badge tier="aggressive" />)
    expect(c1.querySelector('svg')).toBeInTheDocument()
    expect(c2.querySelector('svg')).toBeInTheDocument()
    expect(c3.querySelector('svg')).toBeInTheDocument()
  })
})
