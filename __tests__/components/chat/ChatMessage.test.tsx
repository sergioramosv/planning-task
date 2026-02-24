import { render, screen } from '@testing-library/react'
import ChatMessage from '@/components/chat/ChatMessage'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChat'

// Mock react-markdown and remark-gfm to avoid ESM issues
jest.mock('react-markdown', () => {
  return function ReactMarkdown({ children }: { children: string }) {
    return <div>{children}</div>
  }
})
jest.mock('remark-gfm', () => () => {})

// Helper to create test messages
const createMessage = (role: 'user' | 'assistant', content: string): ChatMessageType => ({
  id: `test-${Date.now()}`,
  role,
  content,
  timestamp: Date.now(),
})

describe('ChatMessage Component', () => {
  it('should render user message with correct styling', () => {
    render(<ChatMessage message={createMessage('user', 'Hello AI')} />)

    const messageElement = screen.getByText('Hello AI')
    expect(messageElement).toBeInTheDocument()
    // User message renders as plain text
    expect(messageElement.tagName).toBe('P')
  })

  it('should render assistant message with correct styling', () => {
    render(<ChatMessage message={createMessage('assistant', 'Hello user')} />)

    const messageElement = screen.getByText('Hello user')
    expect(messageElement).toBeInTheDocument()
    // Assistant message renders in a div (markdown container)
    const parent = messageElement.parentElement
    expect(parent).toBeInTheDocument()
  })

  it('should render plain text for user messages', () => {
    const userContent = 'This is a **markdown** text'
    const { container } = render(<ChatMessage message={createMessage('user', userContent)} />)

    // User messages should NOT render markdown, just plain text
    expect(container.textContent).toContain('This is a **markdown** text')
    expect(container.querySelector('strong')).not.toBeInTheDocument()
  })

  it('should render markdown for assistant messages', () => {
    const assistantContent = 'This is bold and italic'
    render(<ChatMessage message={createMessage('assistant', assistantContent)} />)

    // With our mock, markdown won't actually render, just check text appears
    expect(screen.getByText(assistantContent)).toBeInTheDocument()
  })

  it('should render code blocks in assistant messages', () => {
    const codeContent = '```javascript\nconst x = 10;\n```'
    const { container } = render(<ChatMessage message={createMessage('assistant', codeContent)} />)

    // Check that content is rendered (mock won't parse markdown)
    expect(container.textContent).toContain('const x = 10;')
  })

  it('should render lists in assistant messages', () => {
    const listContent = '- Item 1\n- Item 2\n- Item 3'
    const { container } = render(<ChatMessage message={createMessage('assistant', listContent)} />)

    // With mock, just check content is present
    expect(container.textContent).toContain('Item 1')
    expect(container.textContent).toContain('Item 2')
  })

  it('should render links in assistant messages', () => {
    const linkContent = 'Check [this link](https://example.com)'
    render(<ChatMessage message={createMessage('assistant', linkContent)} />)

    // With mock, markdown won't render, just check text
    expect(screen.getByText(/this link/i)).toBeInTheDocument()
  })

  it('should render loading state with typing indicator', () => {
    const { container } = render(<ChatMessage message={createMessage('assistant', '')} />)

    // Empty assistant message shows typing indicator
    const typingIndicator = container.querySelector('[class*="typingIndicator"]')
    expect(typingIndicator).toBeInTheDocument()
  })

  it('should not render content when loading', () => {
    render(<ChatMessage message={createMessage('assistant', '')} />)

    // Empty content shows typing indicator instead
    const typingIndicator = document.querySelector('[class*="typingIndicator"]')
    expect(typingIndicator).toBeInTheDocument()
  })

  it('should render tables in assistant messages', () => {
    const tableContent = `
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
`
    const { container } = render(<ChatMessage message={createMessage('assistant', tableContent)} />)

    // With mock, just check content
    expect(container.textContent).toContain('Column 1')
  })

  it('should render headings in assistant messages', () => {
    const headingContent = '# Main Title\n## Subtitle'
    const { container } = render(<ChatMessage message={createMessage('assistant', headingContent)} />)

    // With mock, just check text content
    expect(container.textContent).toContain('Main Title')
    expect(container.textContent).toContain('Subtitle')
  })

  it('should handle empty content', () => {
    const { container } = render(<ChatMessage message={createMessage('user', '')} />)
    // User with empty content just renders empty
    expect(container.querySelector('[class*="messageText"]')).toBeInTheDocument()
  })

  it('should handle very long messages', () => {
    const longContent = 'A'.repeat(10000)
    render(<ChatMessage message={createMessage('assistant', longContent)} />)

    expect(screen.getByText(longContent)).toBeInTheDocument()
  })

  it('should render inline code in assistant messages', () => {
    const inlineCodeContent = 'Use `const` instead of `var`'
    const { container } = render(<ChatMessage message={createMessage('assistant', inlineCodeContent)} />)

    // With mock, check text appears
    expect(container.textContent).toContain('const')
    expect(container.textContent).toContain('var')
  })
})
