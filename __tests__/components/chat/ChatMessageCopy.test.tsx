import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
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
  id: `test-${Date.now()}-${Math.random()}`,
  role,
  content,
  timestamp: Date.now(),
})

describe('ChatMessage - Copy Button', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should show copy button on user message with content', () => {
    render(<ChatMessage message={createMessage('user', 'Hello world')} />)

    const copyButton = screen.getByLabelText('Copiar mensaje')
    expect(copyButton).toBeInTheDocument()
  })

  it('should show copy button on assistant message with content', () => {
    render(<ChatMessage message={createMessage('assistant', 'Hello from AI')} />)

    const copyButton = screen.getByLabelText('Copiar mensaje')
    expect(copyButton).toBeInTheDocument()
  })

  it('should not show copy button on assistant message with empty content (loading state)', () => {
    render(<ChatMessage message={createMessage('assistant', '')} />)

    const copyButton = screen.queryByLabelText('Copiar mensaje')
    expect(copyButton).not.toBeInTheDocument()
  })

  it('should call navigator.clipboard.writeText when copy button is clicked', async () => {
    const messageContent = 'Text to copy'
    render(<ChatMessage message={createMessage('user', messageContent)} />)

    const copyButton = screen.getByLabelText('Copiar mensaje')

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(messageContent)
  })

  it('should copy assistant message content to clipboard', async () => {
    const messageContent = 'Assistant response to copy'
    render(<ChatMessage message={createMessage('assistant', messageContent)} />)

    const copyButton = screen.getByLabelText('Copiar mensaje')

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(messageContent)
  })

  it('should change button label to "Copiado" after clicking', async () => {
    render(<ChatMessage message={createMessage('user', 'Copy me')} />)

    const copyButton = screen.getByLabelText('Copiar mensaje')

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(screen.getByLabelText('Copiado')).toBeInTheDocument()
  })

  it('should revert button label back to "Copiar mensaje" after 2 seconds', async () => {
    render(<ChatMessage message={createMessage('user', 'Copy me')} />)

    const copyButton = screen.getByLabelText('Copiar mensaje')

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(screen.getByLabelText('Copiado')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(screen.getByLabelText('Copiar mensaje')).toBeInTheDocument()
  })

  it('should change title attribute to "Copiado" after copy', async () => {
    render(<ChatMessage message={createMessage('user', 'Copy me')} />)

    const copyButton = screen.getByTitle('Copiar mensaje')

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(screen.getByTitle('Copiado')).toBeInTheDocument()
  })

  it('should use fallback copy method when clipboard API fails', async () => {
    // Make clipboard.writeText fail
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard not available')),
      },
    })

    // Mock document.execCommand for fallback
    const execCommandMock = jest.fn()
    document.execCommand = execCommandMock

    render(<ChatMessage message={createMessage('user', 'Fallback copy')} />)

    const copyButton = screen.getByLabelText('Copiar mensaje')

    await act(async () => {
      fireEvent.click(copyButton)
    })

    // Fallback should have been called
    expect(execCommandMock).toHaveBeenCalledWith('copy')

    // Should still show "Copiado" state
    expect(screen.getByLabelText('Copiado')).toBeInTheDocument()
  })
})
