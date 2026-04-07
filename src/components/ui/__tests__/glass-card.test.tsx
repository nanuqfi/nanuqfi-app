import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GlassCard } from '../glass-card'

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard><p>Hello</p></GlassCard>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies border-l-2 when tier prop provided', () => {
    const { container } = render(
      <GlassCard tier="moderate">Content</GlassCard>
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-l-2')
    expect(card.className).toContain('border-l-sky-500/40')
  })

  it('applies glass-elevated when elevated prop is true', () => {
    const { container } = render(
      <GlassCard elevated>Content</GlassCard>
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('glass-elevated')
  })

  it('does not apply border-l-2 without tier', () => {
    const { container } = render(<GlassCard>Content</GlassCard>)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('border-l-2')
  })

  it('merges custom className', () => {
    const { container } = render(
      <GlassCard className="p-6">Content</GlassCard>
    )
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('p-6')
    expect(card.className).toContain('glass')
  })
})
