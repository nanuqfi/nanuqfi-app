import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '../button'

describe('Button', () => {
  it('default renders with bg-sky-500 (primary variant)', () => {
    const { container } = render(<Button>Click</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-sky-500')
    expect(screen.getByText('Click')).toBeInTheDocument()
  })

  it('ghost variant has border but not bg-sky-500', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('border')
    expect(btn.className).not.toContain('bg-sky-500')
  })

  it('small size has px-3', () => {
    const { container } = render(<Button size="sm">Small</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('px-3')
  })

  it('danger variant has red styling', () => {
    const { container } = render(<Button variant="danger">Delete</Button>)
    const btn = container.firstChild as HTMLElement
    expect(btn.className).toContain('bg-red-500')
    expect(btn.className).toContain('text-red-300')
  })

  it('passes through native button props', () => {
    render(<Button disabled aria-label="test-btn">Disabled</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute('aria-label', 'test-btn')
  })
})
