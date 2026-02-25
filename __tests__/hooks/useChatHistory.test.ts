import { renderHook, act, waitFor } from '@testing-library/react'
import { useChat } from '@/hooks/useChat'

// Mock global fetch
global.fetch = jest.fn()

describe('useChat - Conversation History', () => {
  const mockProjectId = 'test-project-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadConversations', () => {
    it('should fetch conversations for the project', async () => {
      const mockConversations = [
        {
          id: 'conv1',
          projectId: mockProjectId,
          userId: 'user1',
          userName: 'Test User',
          title: 'First conversation',
          firstMessage: 'Hello',
          messageCount: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'conv2',
          projectId: mockProjectId,
          userId: 'user1',
          userName: 'Test User',
          title: 'Second conversation',
          firstMessage: 'Hi there',
          messageCount: 4,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversations,
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversations()
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat/conversations?')
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`projectId=${mockProjectId}`)
      )

      expect(result.current.conversations).toHaveLength(2)
      expect(result.current.conversations[0].title).toBe('First conversation')
      expect(result.current.conversations[1].title).toBe('Second conversation')
    })

    it('should pass search parameter when provided', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversations('search term')
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=search+term')
      )
    })

    it('should set loadingHistory while fetching conversations', async () => {
      let resolvePromise: any
      const promise = new Promise((resolve) => { resolvePromise = resolve })

      ;(global.fetch as jest.Mock).mockReturnValueOnce(promise)

      const { result } = renderHook(() => useChat(mockProjectId))

      act(() => {
        result.current.loadConversations()
      })

      expect(result.current.loadingHistory).toBe(true)

      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => [],
        })
      })

      expect(result.current.loadingHistory).toBe(false)
    })

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversations()
      })

      expect(result.current.loadingHistory).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should not update conversations on non-ok response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversations()
      })

      expect(result.current.conversations).toEqual([])
    })
  })

  describe('loadConversation', () => {
    it('should load a specific conversation and set messages', async () => {
      const mockMessages = [
        { id: 'msg1', role: 'user', content: 'Hello', timestamp: 1000 },
        { id: 'msg2', role: 'assistant', content: 'Hi there', timestamp: 1001 },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversation('conv-123')
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/chat/conversations/conv-123')
      expect(result.current.messages).toHaveLength(2)
      expect(result.current.messages[0].content).toBe('Hello')
      expect(result.current.messages[1].content).toBe('Hi there')
      expect(result.current.conversationId).toBe('conv-123')
    })

    it('should set loadingHistory while loading a conversation', async () => {
      let resolvePromise: any
      const promise = new Promise((resolve) => { resolvePromise = resolve })

      ;(global.fetch as jest.Mock).mockReturnValueOnce(promise)

      const { result } = renderHook(() => useChat(mockProjectId))

      act(() => {
        result.current.loadConversation('conv-123')
      })

      expect(result.current.loadingHistory).toBe(true)

      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => ({ messages: [] }),
        })
      })

      expect(result.current.loadingHistory).toBe(false)
    })

    it('should clear error when loading a conversation', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversation('conv-123')
      })

      expect(result.current.error).toBeNull()
    })

    it('should handle missing messages array gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversation('conv-123')
      })

      expect(result.current.messages).toEqual([])
    })

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversation('conv-123')
      })

      expect(result.current.loadingHistory).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('deleteConversation', () => {
    it('should delete a conversation and remove it from the list', async () => {
      const mockConversations = [
        { id: 'conv1', title: 'First' },
        { id: 'conv2', title: 'Second' },
      ]

      // First call: load conversations
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConversations,
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversations()
      })

      expect(result.current.conversations).toHaveLength(2)

      // Second call: delete conversation
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      })

      await act(async () => {
        await result.current.deleteConversation('conv1')
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat/conversations/conv1',
        { method: 'DELETE' }
      )
      expect(result.current.conversations).toHaveLength(1)
      expect(result.current.conversations[0].id).toBe('conv2')
    })

    it('should clear messages and conversationId when deleting the active conversation', async () => {
      // Load a conversation first
      const mockMessages = [
        { id: 'msg1', role: 'user', content: 'Hello', timestamp: 1000 },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversation('conv-active')
      })

      expect(result.current.conversationId).toBe('conv-active')
      expect(result.current.messages).toHaveLength(1)

      // Delete the active conversation
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      })

      await act(async () => {
        await result.current.deleteConversation('conv-active')
      })

      expect(result.current.messages).toEqual([])
      expect(result.current.conversationId).toBeNull()
    })

    it('should not clear messages when deleting a different conversation', async () => {
      // Load a conversation first
      const mockMessages = [
        { id: 'msg1', role: 'user', content: 'Hello', timestamp: 1000 },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversation('conv-active')
      })

      expect(result.current.conversationId).toBe('conv-active')

      // Delete a different conversation
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      })

      await act(async () => {
        await result.current.deleteConversation('conv-other')
      })

      // Active conversation should remain untouched
      expect(result.current.conversationId).toBe('conv-active')
      expect(result.current.messages).toHaveLength(1)
    })

    it('should handle delete errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'))

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.deleteConversation('conv1')
      })

      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('clearChat', () => {
    it('should reset conversationId to null', async () => {
      // Load a conversation to set the conversationId
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messages: [
            { id: 'msg1', role: 'user', content: 'Hello', timestamp: 1000 },
          ],
        }),
      })

      const { result } = renderHook(() => useChat(mockProjectId))

      await act(async () => {
        await result.current.loadConversation('conv-123')
      })

      expect(result.current.conversationId).toBe('conv-123')

      act(() => {
        result.current.clearChat()
      })

      expect(result.current.conversationId).toBeNull()
      expect(result.current.messages).toEqual([])
      expect(result.current.error).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should clear messages', () => {
      const { result } = renderHook(() => useChat(mockProjectId))

      act(() => {
        result.current.clearChat()
      })

      expect(result.current.messages).toEqual([])
    })

    it('should clear error state', () => {
      const { result } = renderHook(() => useChat(mockProjectId))

      act(() => {
        result.current.clearChat()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
