import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Select from '@/components/ui/Select'

describe('Select Component', () => {
  const options = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3' },
  ]

  it('should render select element', () => {
    render(<Select options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('should render with label', () => {
    render(<Select label="Choose" options={options} />)
    expect(screen.getByText('Choose')).toBeInTheDocument()
  })

  it('should render all options', () => {
    render(<Select options={options} />)
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('should render placeholder option', () => {
    render(<Select options={options} placeholder="Select one" />)
    expect(screen.getByText('Select one')).toBeInTheDocument()
  })

  it('should show error message', () => {
    render(<Select options={options} error="Field is required" />)
    expect(screen.getByText('Field is required')).toBeInTheDocument()
  })

  it('should show required asterisk when required', () => {
    render(<Select label="Field" options={options} required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Select options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('should allow user to change selection', async () => {
    render(<Select options={options} />)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'opt2')
    expect(select).toHaveValue('opt2')
  })

  it('should accept custom className', () => {
    render(<Select options={options} className="custom-class" />)
    const select = screen.getByRole('combobox')
    expect(select.className).toContain('custom-class')
  })
})
