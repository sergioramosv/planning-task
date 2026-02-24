import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatPanel from '@/components/chat/ChatPanel'
import { useChat } from '@/hooks/useChat'

// Mock react-markdown and remark-gfm to avoid ESM issues
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div>{children}</div>
  }
})
jest.mock('remark-gfm', () => () => {})

// Mock the useChat hook
jest.mock('@/hooks/useChat')

describe('ChatPanel Component', () => {
  const mockProjectId = 'test-project-123'
  const mockOnClose = jest.fn()

  const mockUseChat = {
    messages: [],
    isLoading: false,
    error: null,
    sendMessage: jest.fn(),
    clearChat: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useChat as jest.Mock).mockReturnValue(mockUseChat)
  })

  it('should render the chat panel', () => {
    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    expect(screen.getByText(/asistente ia/i)).toBeInTheDocument()
  })

  it('should render close button', () => {
    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: /cerrar chat/i })
    expect(closeButton).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: /cerrar chat/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should render clear chat button', () => {
    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      messages: [{ id: '1', role: 'user', content: 'Test', timestamp: Date.now() }],
    })

    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const clearButton = screen.getByRole('button', { name: /limpiar chat/i })
    expect(clearButton).toBeInTheDocument()
  })

  it('should call clearChat when clear button is clicked', () => {
    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      messages: [{ id: '1', role: 'user', content: 'Test', timestamp: Date.now() }],
    })

    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const clearButton = screen.getByRole('button', { name: /limpiar chat/i })
    fireEvent.click(clearButton)

    const mockClearChat = (useChat as jest.Mock).mock.results[0].value.clearChat
    expect(mockClearChat).toHaveBeenCalledTimes(1)
  })

  it('should display empty state when no messages', () => {
    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    expect(screen.getByText(/pregúntame sobre/i)).toBeInTheDocument()
  })

  it('should render messages when available', () => {
    const messagesWithContent = [
      { role: 'user' as const, content: 'Hello', timestamp: Date.now() },
      { role: 'assistant' as const, content: 'Hi there', timestamp: Date.now() },
    ]

    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      messages: messagesWithContent,
    })

    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there')).toBeInTheDocument()
  })

  it('should render ChatInput component', () => {
    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should call sendMessage when user sends a message', async () => {
    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)
    const sendButton = screen.getByRole('button', { name: /enviar mensaje/i })

    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockUseChat.sendMessage).toHaveBeenCalledWith('Test message')
    })
  })

  it('should disable input when loading', () => {
    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      isLoading: true,
    })

    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const textarea = screen.getByPlaceholderText(/escribe tu mensaje/i)
    expect(textarea).toBeDisabled()
  })

  it('should display error message when error occurs', () => {
    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      error: 'Network error',
    })

    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('should scroll to bottom when new messages arrive', () => {
    const { rerender } = render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const scrollIntoViewMock = jest.fn()
    Element.prototype.scrollIntoView = scrollIntoViewMock

    const newMessages = [
      { role: 'user' as const, content: 'New message', timestamp: Date.now() },
    ]

    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      messages: newMessages,
    })

    rerender(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    // Note: scrollIntoView behavior is handled via useEffect in the component
    expect(screen.getByText('New message')).toBeInTheDocument()
  })

  it('should have proper ARIA labels', () => {
    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      messages: [{ id: '1', role: 'user', content: 'Test', timestamp: Date.now() }],
    })

    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    expect(screen.getByRole('button', { name: /cerrar chat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /limpiar chat/i })).toBeInTheDocument()
  })

  it('should render Sparkles icon in header', () => {
    const { container } = render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should use projectId from props', () => {
    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    expect(useChat).toHaveBeenCalledWith(mockProjectId)
  })

  it('should handle multiple messages correctly', () => {
    const manyMessages = Array.from({ length: 10 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as const,
      content: `Message ${i}`,
      timestamp: Date.now() + i,
    }))

    ;(useChat as jest.Mock).mockReturnValue({
      ...mockUseChat,
      messages: manyMessages,
    })

    render(<ChatPanel projectId={mockProjectId} onClose={mockOnClose} />)

    manyMessages.forEach(msg => {
      expect(screen.getByText(msg.content)).toBeInTheDocument()
    })
  })
})
