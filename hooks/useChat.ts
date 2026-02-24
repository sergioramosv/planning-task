'use client'

import { useState, useCallback, useRef } from 'react'

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

export function useChat(projectId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setError(null)

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }

    // Add placeholder for assistant response
    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    // Build history for context (exclude the current messages)
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

      // Capture quota info from headers
      const rpmRemaining = parseInt(response.headers.get('X-RateLimit-RPM-Remaining') || '0')
      const rpmLimit = parseInt(response.headers.get('X-RateLimit-RPM-Limit') || '15')
      const rpmReset = parseInt(response.headers.get('X-RateLimit-RPM-Reset') || '0')
      const rpdRemaining = parseInt(response.headers.get('X-RateLimit-RPD-Remaining') || '0')
      const rpdLimit = parseInt(response.headers.get('X-RateLimit-RPD-Limit') || '1000')
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

      // Read streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No se pudo leer la respuesta')

      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk

        // Update the assistant message progressively
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id ? { ...m, content: fullText } : m
          )
        )
      }

      // If response was empty, show a fallback
      if (!fullText.trim()) {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsg.id
              ? { ...m, content: 'No pude generar una respuesta. Intenta de nuevo.' }
              : m
          )
        )
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return

      setError(err.message)
      // Update assistant message with error
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: `Error: ${err.message}` }
            : m
        )
      )
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [projectId, messages, isLoading])

  const clearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setMessages([])
    setError(null)
    setIsLoading(false)
  }, [])

  return { messages, isLoading, error, quota, sendMessage, clearChat }
}
