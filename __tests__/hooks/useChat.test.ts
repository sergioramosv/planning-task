import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'

// Mock global fetch
global.fetch = jest.fn()

describe('useChat Hook', () => {
  const mockProjectId = 'test-project-123'
  const mockReader = {
    read: jest.fn(),
    releaseLock: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with empty messages and no loading state', () => {
    const { result } = renderHook(() => useChat(mockProjectId))

    expect(result.current.messages).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should add user message when sending', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn((key: string) => {
          const headers: Record<string, string> = {
            'X-RateLimit-RPM-Remaining': '9',
            'X-RateLimit-RPM-Limit': '10',
            'X-RateLimit-RPM-Reset': '60',
            'X-RateLimit-RPD-Remaining': '240',
            'X-RateLimit-RPD-Limit': '250',
            'X-RateLimit-RPD-Reset': '3600',
          }
          return headers[key] || null
        }),
      },
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('Hola') })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn(),
        }),
      },
    })

    const { result } = renderHook(() => useChat(mockProjectId))

    await act(async () => {
      await result.current.sendMessage('Test message')
    })

    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      content: 'Test message',
    })
  })

  it('should handle streaming response from API', async () => {
    const mockResponse = 'Response chunk'
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      headers: {
        get: jest.fn((key: string) => {
          const headers: Record<string, string> = {
            'X-RateLimit-RPM-Remaining': '9',
            'X-RateLimit-RPM-Limit': '10',
            'X-RateLimit-RPM-Reset': '60',
            'X-RateLimit-RPD-Remaining': '240',
            'X-RateLimit-RPD-Limit': '250',
            'X-RateLimit-RPD-Reset': '3600',
          }
          return headers[key] || null
        }),
      },
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode(mockResponse)
            })
            .mockResolvedValueOnce({ done: true }),
          releaseLock: jest.fn(),
        }),
      },
    })

    const { result } = renderHook(() => useChat(mockProjectId))

    await act(async () => {
      await result.current.sendMessage('Hello AI')
    })

    await waitFor(() => {
      const assistantMessage = result.current.messages.find(m => m.role === 'assistant')
      expect(assistantMessage?.content).toContain(mockResponse)
    })
  })

  it('should set loading state during API call', async () => {
    let resolvePromise: any
    const promise = new Promise((resolve) => { resolvePromise = resolve })

    ;(global.fetch as jest.Mock).mockReturnValueOnce(promise)

    const { result } = renderHook(() => useChat(mockProjectId))

    act(() => {
      result.current.sendMessage('Test')
    })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      resolvePromise({
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn().mockResolvedValue({ done: true }),
            releaseLock: jest.fn(),
          }),
        },
      })
    })
  })

  it('should handle API errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    })

    const { result } = renderHook(() => useChat(mockProjectId))

    await act(async () => {
      await result.current.sendMessage('Test')
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle network errors', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useChat(mockProjectId))

    await act(async () => {
      await result.current.sendMessage('Test')
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.isLoading).toBe(false)
  })

  it('should clear chat messages', () => {
    const { result } = renderHook(() => useChat(mockProjectId))

    act(() => {
      result.current.clearChat()
    })

    expect(result.current.messages).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('should send correct API request with projectId and history', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      body: {
        getReader: () => ({
          read: jest.fn().mockResolvedValue({ done: true }),
          releaseLock: jest.fn(),
        }),
      },
    })

    const { result } = renderHook(() => useChat(mockProjectId))

    await act(async () => {
      await result.current.sendMessage('Hello')
    })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello',
          projectId: mockProjectId,
          history: [], // First message, so history is empty
        }),
      })
    )
  })

  it('should not send empty messages', async () => {
    const { result } = renderHook(() => useChat(mockProjectId))

    await act(async () => {
      await result.current.sendMessage('')
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should not send messages while already loading', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useChat(mockProjectId))

    act(() => {
      result.current.sendMessage('First message')
    })

    await act(async () => {
      await result.current.sendMessage('Second message')
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
