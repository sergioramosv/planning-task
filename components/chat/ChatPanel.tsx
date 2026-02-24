'use client'

import { useRef, useEffect } from 'react'
import { X, Trash2, Sparkles } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import styles from './ChatPanel.module.css'

interface ChatPanelProps {
  projectId: string
  onClose: () => void
}

export default function ChatPanel({ projectId, onClose }: ChatPanelProps) {
  const { messages, isLoading, error, quota, sendMessage, clearChat } = useChat(projectId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Sparkles size={18} />
          <span>Asistente IA</span>
        </div>
        <div className={styles.headerActions}>
          {messages.length > 0 && (
            <button
              className={styles.headerButton}
              onClick={clearChat}
              title="Limpiar chat"
              aria-label="Limpiar chat"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            className={styles.headerButton}
            onClick={onClose}
            title="Cerrar"
            aria-label="Cerrar chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {quota && (
        <div className={styles.quotaBar}>
          <div className={styles.quotaItem}>
            <span className={styles.quotaLabel}>Uso/min:</span>
            <span className={styles.quotaValue}>
              {quota.rpm.used}/{quota.rpm.limit}
            </span>
            {quota.rpm.remaining <= 3 && (
              <span className={styles.quotaWarning}>
                (resetea en {quota.rpm.resetIn}s)
              </span>
            )}
          </div>
          <div className={styles.quotaItem}>
            <span className={styles.quotaLabel}>Uso/día:</span>
            <span className={styles.quotaValue}>
              {quota.rpd.used}/{quota.rpd.limit}
            </span>
            {quota.rpd.remaining <= 100 && (
              <span className={styles.quotaWarning}>
                (resetea en {Math.floor(quota.rpd.resetIn / 3600)}h)
              </span>
            )}
          </div>
        </div>
      )}

      <div className={styles.body}>
        {error && (
          <div className={styles.error} role="alert">
            Error: {error}
          </div>
        )}
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <Sparkles size={32} />
            <p>Pregúntame sobre tu proyecto</p>
            <span>Puedo crear tareas, sprints, ver métricas y más</span>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.footer}>
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  )
}
