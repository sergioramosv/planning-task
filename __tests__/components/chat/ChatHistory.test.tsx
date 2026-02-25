import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatHistory from '@/components/chat/ChatHistory'
import type { ConversationSummary } from '@/hooks/useChat'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: (props: any) => <svg data-testid="icon-search" {...props} />,
  Trash2: (props: any) => <svg data-testid="icon-trash" {...props} />,
  MessageSquare: (props: any) => <svg data-testid="icon-message" {...props} />,
  Plus: (props: any) => <svg data-testid="icon-plus" {...props} />,
  ArrowLeft: (props: any) => <svg data-testid="icon-arrow-left" {...props} />,
}))

// Mock CSS module
jest.mock('@/components/chat/ChatHistory.module.css', () => ({
  container: 'container',
  header: 'header',
  backButton: 'backButton',
  title: 'title',
  newButton: 'newButton',
  searchContainer: 'searchContainer',
  searchIcon: 'searchIcon',
  searchInput: 'searchInput',
  list: 'list',
  emptyState: 'emptyState',
  item: 'item',
  itemActive: 'itemActive',
  itemContent: 'itemContent',
  itemTitle: 'itemTitle',
  itemPreview: 'itemPreview',
  itemMeta: 'itemMeta',
  itemDate: 'itemDate',
  itemCount: 'itemCount',
  deleteButton: 'deleteButton',
}))

describe('ChatHistory Component', () => {
  const mockConversations: ConversationSummary[] = [
    {
      id: 'conv-1',
      projectId: 'proj-1',
      userId: 'user-1',
      userName: 'Test User',
      title: 'First Conversation',
      firstMessage: 'Hello, this is the first message',
      messageCount: 5,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
    },
    {
      id: 'conv-2',
      projectId: 'proj-1',
      userId: 'user-1',
      userName: 'Test User',
      title: 'Second Conversation',
      firstMessage: 'Another conversation here',
      messageCount: 3,
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 3600000,
    },
    {
      id: 'conv-3',
      projectId: 'proj-1',
      userId: 'user-1',
      userName: 'Test User',
      title: 'Third Conversation',
      firstMessage: 'Yet another chat',
      messageCount: 10,
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000,
    },
  ]

  const defaultProps = {
    conversations: mockConversations,
    loading: false,
    activeConversationId: null,
    onLoad: jest.fn(),
    onSelect: jest.fn(),
    onDelete: jest.fn(),
    onNewChat: jest.fn(),
    onBack: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render conversations list', () => {
    render(<ChatHistory {...defaultProps} />)

    expect(screen.getByText('First Conversation')).toBeInTheDocument()
    expect(screen.getByText('Second Conversation')).toBeInTheDocument()
    expect(screen.getByText('Third Conversation')).toBeInTheDocument()
  })

  it('should display first message preview for each conversation', () => {
    render(<ChatHistory {...defaultProps} />)

    expect(screen.getByText('Hello, this is the first message')).toBeInTheDocument()
    expect(screen.getByText('Another conversation here')).toBeInTheDocument()
    expect(screen.getByText('Yet another chat')).toBeInTheDocument()
  })

  it('should display message count for each conversation', () => {
    render(<ChatHistory {...defaultProps} />)

    expect(screen.getByText('5 msgs')).toBeInTheDocument()
    expect(screen.getByText('3 msgs')).toBeInTheDocument()
    expect(screen.getByText('10 msgs')).toBeInTheDocument()
  })

  it('should show empty state when no conversations exist', () => {
    render(<ChatHistory {...defaultProps} conversations={[]} />)

    expect(screen.getByText('No hay conversaciones')).toBeInTheDocument()
  })

  it('should show "Sin resultados" when search yields no results', () => {
    render(<ChatHistory {...defaultProps} conversations={[]} />)

    const searchInput = screen.getByPlaceholderText('Buscar conversaciones...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    // After changing search, the component re-renders with empty conversations
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<ChatHistory {...defaultProps} loading={true} conversations={[]} />)

    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('should call onSelect when clicking a conversation', () => {
    render(<ChatHistory {...defaultProps} />)

    fireEvent.click(screen.getByText('First Conversation'))

    expect(defaultProps.onSelect).toHaveBeenCalledWith('conv-1')
  })

  it('should call onSelect with correct conversation id', () => {
    render(<ChatHistory {...defaultProps} />)

    fireEvent.click(screen.getByText('Second Conversation'))

    expect(defaultProps.onSelect).toHaveBeenCalledWith('conv-2')
  })

  it('should call onDelete when clicking delete button', () => {
    render(<ChatHistory {...defaultProps} />)

    const deleteButtons = screen.getAllByTitle('Eliminar conversaci\u00f3n')
    fireEvent.click(deleteButtons[0])

    expect(defaultProps.onDelete).toHaveBeenCalledWith('conv-1')
  })

  it('should not trigger onSelect when clicking delete button (stopPropagation)', () => {
    render(<ChatHistory {...defaultProps} />)

    const deleteButtons = screen.getAllByTitle('Eliminar conversaci\u00f3n')
    fireEvent.click(deleteButtons[0])

    // onDelete should be called but onSelect should NOT be called
    expect(defaultProps.onDelete).toHaveBeenCalledWith('conv-1')
    expect(defaultProps.onSelect).not.toHaveBeenCalled()
  })

  it('should render search input', () => {
    render(<ChatHistory {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Buscar conversaciones...')
    expect(searchInput).toBeInTheDocument()
  })

  it('should call onLoad on mount', () => {
    render(<ChatHistory {...defaultProps} />)

    expect(defaultProps.onLoad).toHaveBeenCalled()
  })

  it('should debounce search and call onLoad with search text', () => {
    render(<ChatHistory {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Buscar conversaciones...')
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Before debounce timer fires
    // onLoad was already called on mount, but not yet with the search text
    const callCountBeforeDebounce = defaultProps.onLoad.mock.calls.length

    // Fast-forward the 300ms debounce
    jest.advanceTimersByTime(300)

    expect(defaultProps.onLoad).toHaveBeenCalledWith('test')
    expect(defaultProps.onLoad.mock.calls.length).toBeGreaterThan(callCountBeforeDebounce)
  })

  it('should render the header with title "Historial"', () => {
    render(<ChatHistory {...defaultProps} />)

    expect(screen.getByText('Historial')).toBeInTheDocument()
  })

  it('should call onNewChat when clicking new chat button', () => {
    render(<ChatHistory {...defaultProps} />)

    const newButton = screen.getByTitle('Nueva conversaci\u00f3n')
    fireEvent.click(newButton)

    expect(defaultProps.onNewChat).toHaveBeenCalledTimes(1)
  })

  it('should call onBack when clicking back button', () => {
    render(<ChatHistory {...defaultProps} />)

    const backButton = screen.getByTitle('Volver al chat')
    fireEvent.click(backButton)

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
  })

  it('should highlight active conversation', () => {
    const { container } = render(
      <ChatHistory {...defaultProps} activeConversationId="conv-2" />
    )

    // The active item should have the itemActive class
    const items = container.querySelectorAll('.item')
    expect(items[1].className).toContain('itemActive')
  })

  it('should not highlight non-active conversations', () => {
    const { container } = render(
      <ChatHistory {...defaultProps} activeConversationId="conv-2" />
    )

    const items = container.querySelectorAll('.item')
    expect(items[0].className).not.toContain('itemActive')
    expect(items[2].className).not.toContain('itemActive')
  })

  it('should render MessageSquare icon in empty state', () => {
    render(<ChatHistory {...defaultProps} conversations={[]} />)

    expect(screen.getByTestId('icon-message')).toBeInTheDocument()
  })

  it('should render search icon', () => {
    render(<ChatHistory {...defaultProps} />)

    expect(screen.getByTestId('icon-search')).toBeInTheDocument()
  })

  it('should call onLoad with undefined when search is cleared', () => {
    render(<ChatHistory {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText('Buscar conversaciones...')

    // Type something first
    fireEvent.change(searchInput, { target: { value: 'test' } })
    jest.advanceTimersByTime(300)

    // Clear the search
    fireEvent.change(searchInput, { target: { value: '' } })
    jest.advanceTimersByTime(300)

    // The last call should have undefined (empty string evaluates to undefined)
    const lastCall = defaultProps.onLoad.mock.calls[defaultProps.onLoad.mock.calls.length - 1]
    expect(lastCall[0]).toBeUndefined()
  })
})
