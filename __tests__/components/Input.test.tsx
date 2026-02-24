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

  it('should show error message text', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should show helper text', () => {
    render(<Input helperText="Enter your email address" />)
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
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
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('should use placeholder', () => {
    render(<Input placeholder="Enter text here" />)
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  it('should have correct input name', () => {
    render(<Input name="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
  })

  it('should display error message when error prop is set', () => {
    const errorMessage = 'Invalid email format'
    render(<Input error={errorMessage} />)
    const errorElement = screen.getByText(errorMessage)
    expect(errorElement).toBeInTheDocument()
    expect(errorElement.textContent).toBe(errorMessage)
  })

  it('should hide helper text when error is present', () => {
    render(<Input error="Something went wrong" helperText="This should not appear" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText('This should not appear')).not.toBeInTheDocument()
  })

  it('should show required asterisk when required prop is set', () => {
    render(<Input label="Username" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })
})
