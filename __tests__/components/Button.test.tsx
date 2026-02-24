import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '@/components/ui/Button'

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Click me' }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render all variants without crashing', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'] as const
    const { rerender } = render(<Button variant="primary">Btn</Button>)

    for (const variant of variants) {
      rerender(<Button variant={variant}>{variant}</Button>)
      expect(screen.getByRole('button', { name: variant })).toBeInTheDocument()
    }
  })

  it('should render all sizes without crashing', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    const { rerender } = render(<Button size="sm">Btn</Button>)

    for (const size of sizes) {
      rerender(<Button size={size}>{size}</Button>)
      expect(screen.getByRole('button', { name: size })).toBeInTheDocument()
    }
  })

  it('should be disabled when disabled prop is true', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    )
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })

  it('should show loading state with "..." text', () => {
    render(<Button loading>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('...')
    expect(button).not.toHaveTextContent('Save')
  })

  it('should be disabled and not clickable when loading', async () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} loading>
        Save
      </Button>
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should accept a custom className', () => {
    render(<Button className="my-custom-class">Custom</Button>)
    expect(screen.getByRole('button', { name: 'Custom' })).toHaveClass('my-custom-class')
  })

  it('should have the correct type attribute', () => {
    const { rerender } = render(<Button type="submit">Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'submit')

    rerender(<Button type="reset">Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'reset')

    rerender(<Button>Go</Button>)
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button')
  })

  it('should render with fullWidth prop without error', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button', { name: 'Full Width' })).toBeInTheDocument()
  })
})
