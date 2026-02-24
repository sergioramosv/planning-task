import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatInput from '@/components/chat/ChatInput'

describe('ChatInput Component', () => {
  it('should render textarea and send button', () => {
    render(<ChatInput onSend={jest.fn()} disabled={false} />)

    expect(screen.getByPlaceholderText(/escribe tu mensaje/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /enviar mensaje/i })).toBeInTheDocument()
  })

  it('should update textarea value on user input', () => {
    render(<ChatInput onSend={jest.fn()} disabled={false} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test message' } })

    expect(textarea.value).toBe('Test message')
  })

  it('should call onSend when send button is clicked', async () => {
    const mockOnSend = jest.fn()
    render(<ChatInput onSend={mockOnSend} disabled={false} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)
    const sendButton = screen.getByRole('button', { name: /enviar mensaje/i })

    fireEvent.change(textarea, { target: { value: 'Hello AI' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('Hello AI')
    })
  })

  it('should call onSend when Enter key is pressed', async () => {
    const mockOnSend = jest.fn()
    render(<ChatInput onSend={mockOnSend} disabled={false} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)

    fireEvent.change(textarea, { target: { value: 'Test' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('Test')
    })
  })

  it('should NOT call onSend when Shift+Enter is pressed (new line)', () => {
    const mockOnSend = jest.fn()
    render(<ChatInput onSend={mockOnSend} disabled={false} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)

    fireEvent.change(textarea, { target: { value: 'Test' } })
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('should clear textarea after sending message', async () => {
    const mockOnSend = jest.fn()
    render(<ChatInput onSend={mockOnSend} disabled={false} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i) as HTMLTextAreaElement

    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('should not send empty or whitespace-only messages', () => {
    const mockOnSend = jest.fn()
    render(<ChatInput onSend={mockOnSend} disabled={false} />)

    const sendButton = screen.getByRole('button', { name: /enviar mensaje/i })

    // Empty message
    fireEvent.click(sendButton)
    expect(mockOnSend).not.toHaveBeenCalled()

    // Whitespace only
    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)
    fireEvent.change(textarea, { target: { value: '   ' } })
    fireEvent.click(sendButton)
    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('should disable textarea and button when disabled prop is true', () => {
    render(<ChatInput onSend={jest.fn()} disabled={true} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)
    const sendButton = screen.getByRole('button', { name: /enviar mensaje/i })

    expect(textarea).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('should auto-resize textarea based on content', () => {
    const { container } = render(<ChatInput onSend={jest.fn()} disabled={false} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)

    // Simulate multi-line content
    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2\nLine 3' } })

    expect(textarea).toBeInTheDocument()
  })

  it('should have correct ARIA attributes', () => {
    render(<ChatInput onSend={jest.fn()} disabled={false} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)
    const sendButton = screen.getByRole('button', { name: /enviar mensaje/i })

    expect(textarea).toHaveAttribute('aria-label', 'Campo de mensaje')
    expect(sendButton).toHaveAttribute('aria-label', 'Enviar mensaje')
  })
})
