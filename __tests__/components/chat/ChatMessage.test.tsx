import { render, screen } from '@testing-library/react'
import ChatMessage from '@/components/chat/ChatMessage'

describe('ChatMessage Component', () => {
  it('should render user message with correct styling', () => {
    render(<ChatMessage role="user" content="Hello AI" />)

    const messageElement = screen.getByText('Hello AI')
    expect(messageElement).toBeInTheDocument()

    const container = messageElement.closest('div')
    expect(container).toHaveClass('userMessage')
  })

  it('should render assistant message with correct styling', () => {
    render(<ChatMessage role="assistant" content="Hello user" />)

    const messageElement = screen.getByText('Hello user')
    expect(messageElement).toBeInTheDocument()

    const container = messageElement.closest('div')
    expect(container).toHaveClass('assistantMessage')
  })

  it('should render plain text for user messages', () => {
    const userContent = 'This is a **markdown** text'
    const { container } = render(<ChatMessage role="user" content={userContent} />)

    // User messages should NOT render markdown, just plain text
    expect(container.textContent).toContain('This is a **markdown** text')
    expect(container.querySelector('strong')).not.toBeInTheDocument()
  })

  it('should render markdown for assistant messages', () => {
    const assistantContent = 'This is **bold** and *italic*'
    render(<ChatMessage role="assistant" content={assistantContent} />)

    // Assistant messages should render markdown
    const boldElement = screen.getByText('bold')
    expect(boldElement.tagName.toLowerCase()).toBe('strong')
  })

  it('should render code blocks in assistant messages', () => {
    const codeContent = '```javascript\nconst x = 10;\n```'
    const { container } = render(<ChatMessage role="assistant" content={codeContent} />)

    const codeBlock = container.querySelector('code')
    expect(codeBlock).toBeInTheDocument()
  })

  it('should render lists in assistant messages', () => {
    const listContent = '- Item 1\n- Item 2\n- Item 3'
    const { container } = render(<ChatMessage role="assistant" content={listContent} />)

    const listElement = container.querySelector('ul')
    expect(listElement).toBeInTheDocument()

    const listItems = container.querySelectorAll('li')
    expect(listItems).toHaveLength(3)
  })

  it('should render links in assistant messages', () => {
    const linkContent = 'Check [this link](https://example.com)'
    render(<ChatMessage role="assistant" content={linkContent} />)

    const linkElement = screen.getByRole('link', { name: /this link/i })
    expect(linkElement).toBeInTheDocument()
    expect(linkElement).toHaveAttribute('href', 'https://example.com')
  })

  it('should render loading state with typing indicator', () => {
    const { container } = render(<ChatMessage role="assistant" content="" isLoading={true} />)

    const typingIndicator = container.querySelector('[class*="typingIndicator"]')
    expect(typingIndicator).toBeInTheDocument()

    const dots = container.querySelectorAll('[class*="dot"]')
    expect(dots.length).toBeGreaterThan(0)
  })

  it('should not render content when loading', () => {
    render(<ChatMessage role="assistant" content="Some content" isLoading={true} />)

    // Content should not be visible while loading
    expect(screen.queryByText('Some content')).not.toBeInTheDocument()
  })

  it('should render tables in assistant messages', () => {
    const tableContent = `
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
`
    const { container } = render(<ChatMessage role="assistant" content={tableContent} />)

    const tableElement = container.querySelector('table')
    expect(tableElement).toBeInTheDocument()
  })

  it('should render headings in assistant messages', () => {
    const headingContent = '# Main Title\n## Subtitle'
    const { container } = render(<ChatMessage role="assistant" content={headingContent} />)

    const h1 = container.querySelector('h1')
    const h2 = container.querySelector('h2')

    expect(h1).toBeInTheDocument()
    expect(h2).toBeInTheDocument()
  })

  it('should handle empty content', () => {
    const { container } = render(<ChatMessage role="user" content="" />)
    expect(container.textContent?.trim()).toBe('')
  })

  it('should handle very long messages', () => {
    const longContent = 'A'.repeat(10000)
    render(<ChatMessage role="assistant" content={longContent} />)

    expect(screen.getByText(longContent)).toBeInTheDocument()
  })

  it('should render inline code in assistant messages', () => {
    const inlineCodeContent = 'Use `const` instead of `var`'
    const { container } = render(<ChatMessage role="assistant" content={inlineCodeContent} />)

    const codeElements = container.querySelectorAll('code')
    expect(codeElements.length).toBeGreaterThanOrEqual(2)
  })
})
