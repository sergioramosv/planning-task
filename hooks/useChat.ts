'use client'

import { useState, useCallback, useRef } from 'react'
import { getUserFriendlyError } from '@/lib/utils/errorHandler'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface QuotaInfo {
  rpm: { used: number; limit: number; remaining: number; resetIn: number }
  rpd: { used: number; limit: number; remaining: number; resetIn: number }
}

export interface ConversationSummary {
  id: string
  projectId: string
  userId: string
  userName: string
  title: string
  firstMessage: string
  messageCount: number
  createdAt: number
  updatedAt: number
}

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const saveConversation = useCallback(async (msgs: ChatMessage[], convId: string | null) => {
    if (msgs.length === 0) return

    try {
      if (convId) {
        await fetch(`/api/chat/conversations/${convId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: msgs }),
        })
      } else {
        const res = await fetch('/api/chat/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, messages: msgs }),
        })
        if (res.ok) {
          const data = await res.json()
          setConversationId(data.id)
          return data.id
        }
      }
    } catch (err) {
      console.error('Error saving conversation:', err)
    }
    return convId
  }, [projectId])

  const debouncedSave = useCallback((msgs: ChatMessage[], convId: string | null) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveConversation(msgs, convId)
    }, 2000)
  }, [saveConversation])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setError(null)

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
    }))

    try {
      abortRef.current = new AbortController()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          projectId,
          history,
        }),
        signal: abortRef.current.signal,
      })

      const rpmRemaining = parseInt(response.headers.get('X-RateLimit-RPM-Remaining') || '0')
      const rpmLimit = parseInt(response.headers.get('X-RateLimit-RPM-Limit') || '90')
      const rpmReset = parseInt(response.headers.get('X-RateLimit-RPM-Reset') || '0')
      const rpdRemaining = parseInt(response.headers.get('X-RateLimit-RPD-Remaining') || '0')
      const rpdLimit = parseInt(response.headers.get('X-RateLimit-RPD-Limit') || '4050')
      const rpdReset = parseInt(response.headers.get('X-RateLimit-RPD-Reset') || '0')

      setQuota({
        rpm: {
          used: rpmLimit - rpmRemaining,
          limit: rpmLimit,
          remaining: rpmRemaining,
          resetIn: rpmReset,
        },
        rpd: {
          used: rpdLimit - rpdRemaining,
          limit: rpdLimit,
          remaining: rpdRemaining,
          resetIn: rpdReset,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No se pudo leer la respuesta')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id ? { ...m, content: fullText } : m
          )
        )
      }

      if (!fullText.trim()) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id
              ? { ...m, content: 'No pude generar una respuesta. Intenta de nuevo.' }
              : m
          )
        )
      }

      // Save conversation after successful response
      const finalMessages = [...messages, userMsg, { ...assistantMsg, content: fullText || 'No pude generar una respuesta. Intenta de nuevo.' }]
      const newConvId = await saveConversation(finalMessages, conversationId)
      if (newConvId && !conversationId) {
        setConversationId(newConvId)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return

      setError(getUserFriendlyError(err, 'useChat'))
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: getUserFriendlyError(err, 'useChat') }
            : m
        )
      )
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [projectId, messages, isLoading, conversationId, saveConversation])

  const clearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setMessages([])
    setConversationId(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const loadConversations = useCallback(async (search?: string) => {
    setLoadingHistory(true)
    try {
      const params = new URLSearchParams({ projectId })
      if (search) params.set('search', search)

      const res = await fetch(`/api/chat/conversations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (err) {
      console.error('Error loading conversations:', err)
    } finally {
      setLoadingHistory(false)
    }
  }, [projectId])

  const loadConversation = useCallback(async (convId: string) => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setConversationId(convId)
        setError(null)
      }
    } catch (err) {
      console.error('Error loading conversation:', err)
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  const deleteConversation = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`, { method: 'DELETE' })
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== convId))
        if (conversationId === convId) {
          setMessages([])
          setConversationId(null)
        }
      }
    } catch (err) {
      console.error('Error deleting conversation:', err)
    }
  }, [conversationId])

  return {
    messages,
    isLoading,
    error,
    quota,
    sendMessage,
    clearChat,
    conversationId,
    conversations,
    loadingHistory,
    loadConversations,
    loadConversation,
    deleteConversation,
  }
}
