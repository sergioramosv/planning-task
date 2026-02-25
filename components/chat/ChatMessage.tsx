'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/hooks/useChat'
import styles from './ChatPanel.module.css'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = message.content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={`${styles.message} ${isUser ? styles.messageUser : styles.messageAssistant}`}>
      <div className={`${styles.messageBubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
        {isUser ? (
          <p className={styles.messageText}>{message.content}</p>
        ) : message.content ? (
          <div className={styles.markdownContent}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {message.content && (
          <button
            className={`${styles.copyButton} ${isUser ? styles.copyButtonUser : ''}`}
            onClick={handleCopy}
            title={copied ? 'Copiado' : 'Copiar mensaje'}
            aria-label={copied ? 'Copiado' : 'Copiar mensaje'}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  )
}
