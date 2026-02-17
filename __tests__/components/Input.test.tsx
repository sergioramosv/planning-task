import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '@/components/ui/Input'

describe('Input Component', () => {
  it('should render input field', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should accept user input', async () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'test@example.com')
    expect(input).toHaveValue('test@example.com')
  })

  it('should show error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should show helper text', () => {
    render(<Input helperText="This is a helper text" />)
    expect(screen.getByText('This is a helper text')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', async () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    await userEvent.type(input, 'text')
    expect(input).toHaveValue('')
  })

  it('should handle different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'number')
  })

  it('should use placeholder', () => {
    render(<Input placeholder="Enter text here" />)
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  it('should have correct input name', () => {
    render(<Input name="testInput" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'testInput')
  })

  it('should have error styling when error exists', () => {
    render(<Input error="Required" />)
    const input = screen.getByRole('textbox')
    expect(input.parentElement?.querySelector('.text-red-500')).toBeInTheDocument()
  })
})
