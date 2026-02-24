import React from 'react'
import { render, screen } from '@testing-library/react'
import Badge from '@/components/ui/Badge'

const VARIANTS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Completed</Badge>)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should render as a span element', () => {
    render(<Badge>Test</Badge>)
    const badge = screen.getByText('Test')
    expect(badge.tagName).toBe('SPAN')
  })

  it('should render with default variant (primary) without crashing', () => {
    render(<Badge>Primary</Badge>)
    const badge = screen.getByText('Primary')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toBeTruthy()
  })

  it.each(VARIANTS)('should render %s variant without crashing', (variant) => {
    render(<Badge variant={variant}>{variant}</Badge>)
    const badge = screen.getByText(variant)
    expect(badge).toBeInTheDocument()
    expect(badge.className).toBeTruthy()
  })

  it('should accept and apply a custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  it('should render sm size without crashing', () => {
    render(<Badge size="sm">Small</Badge>)
    const badge = screen.getByText('Small')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toBeTruthy()
  })

  it('should render md size by default without crashing', () => {
    render(<Badge>Default Size</Badge>)
    const badge = screen.getByText('Default Size')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toBeTruthy()
  })

  it('should render all prop combinations without crashing', () => {
    const sizes = ['sm', 'md'] as const

    VARIANTS.forEach((variant) => {
      sizes.forEach((size) => {
        const { unmount } = render(
          <Badge variant={variant} size={size} className="extra">
            {`${variant}-${size}`}
          </Badge>
        )
        const badge = screen.getByText(`${variant}-${size}`)
        expect(badge).toBeInTheDocument()
        expect(badge).toHaveClass('extra')
        unmount()
      })
    })
  })

  it('should render children content correctly', () => {
    render(<Badge>Hello World</Badge>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should render with JSX children', () => {
    render(
      <Badge>
        <strong>Bold text</strong>
      </Badge>
    )
    expect(screen.getByText('Bold text')).toBeInTheDocument()
  })
})
