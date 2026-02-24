import { render, screen, fireEvent } from '@testing-library/react'
import ChatFab from '@/components/chat/ChatFab'

describe('ChatFab Component', () => {
  it('should render the floating action button', () => {
    render(<ChatFab onClick={jest.fn()} />)

    const button = screen.getByRole('button', { name: /abrir chat/i })
    expect(button).toBeInTheDocument()
  })

  it('should call onClick handler when clicked', () => {
    const mockOnClick = jest.fn()
    render(<ChatFab onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('should render the MessageSquare icon', () => {
    const { container } = render(<ChatFab onClick={jest.fn()} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should have correct accessibility attributes', () => {
    render(<ChatFab onClick={jest.fn()} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Abrir chat con IA')
  })

  it('should be keyboard accessible', () => {
    const mockOnClick = jest.fn()
    render(<ChatFab onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    button.focus()

    expect(document.activeElement).toBe(button)

    fireEvent.keyDown(button, { key: 'Enter' })
    expect(mockOnClick).toHaveBeenCalled()
  })
})
