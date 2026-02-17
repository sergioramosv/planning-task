import React from 'react'
import { render, screen } from '@testing-library/react'
import Badge from '@/components/ui/Badge'

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Completed</Badge>)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should render primary variant by default', () => {
    render(<Badge>Primary</Badge>)
    expect(screen.getByText('Primary')).toHaveClass('bg-primary-100')
  })

  it('should render all variants', () => {
    const { rerender } = render(<Badge variant="primary">Primary</Badge>)
    expect(screen.getByText('Primary')).toHaveClass('bg-primary-100')

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-neutral-200')

    rerender(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-green-100')

    rerender(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100')

    rerender(<Badge variant="danger">Danger</Badge>)
    expect(screen.getByText('Danger')).toHaveClass('bg-red-100')

    rerender(<Badge variant="info">Info</Badge>)
    expect(screen.getByText('Info')).toHaveClass('bg-blue-100')
  })

  it('should have correct text color for each variant', () => {
    const { rerender } = render(<Badge variant="primary">Primary</Badge>)
    expect(screen.getByText('Primary')).toHaveClass('text-primary-700')

    rerender(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('text-green-700')
  })

  it('should accept custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('custom-class')
  })

  it('should have proper padding and styling', () => {
    render(<Badge>Styled</Badge>)
    expect(screen.getByText('Styled')).toHaveClass('px-3', 'py-1', 'rounded-full', 'text-sm')
  })

  it('should have font-medium class', () => {
    render(<Badge>Bold</Badge>)
    expect(screen.getByText('Bold')).toHaveClass('font-medium')
  })
})
