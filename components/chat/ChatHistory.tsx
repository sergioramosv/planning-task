'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, MessageSquare, Plus, ArrowLeft } from 'lucide-react'
import type { ConversationSummary } from '@/hooks/useChat'
import styles from './ChatHistory.module.css'

interface ChatHistoryProps {
  conversations: ConversationSummary[]
  loading: boolean
  activeConversationId: string | null
  onLoad: (search?: string) => void
  onSelect: (conversationId: string) => void
  onDelete: (conversationId: string) => void
  onNewChat: () => void
  onBack: () => void
}

export default function ChatHistory({
  conversations,
  loading,
  activeConversationId,
  onLoad,
  onSelect,
  onDelete,
  onNewChat,
  onBack,
}: ChatHistoryProps) {
  const [search, setSearch] = useState('')

  useEffect(() => {
    onLoad()
  }, [onLoad])

  useEffect(() => {
    const timer = setTimeout(() => {
      onLoad(search || undefined)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, onLoad])

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack} title="Volver al chat">
          <ArrowLeft size={18} />
        </button>
        <h3 className={styles.title}>Historial</h3>
        <button className={styles.newButton} onClick={onNewChat} title="Nueva conversación">
          <Plus size={18} />
        </button>
      </div>

      <div className={styles.searchContainer}>
        <Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar conversaciones..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.emptyState}>
            <span>Cargando...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className={styles.emptyState}>
            <MessageSquare size={24} />
            <span>{search ? 'Sin resultados' : 'No hay conversaciones'}</span>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`${styles.item} ${conv.id === activeConversationId ? styles.itemActive : ''}`}
              onClick={() => onSelect(conv.id)}
            >
              <div className={styles.itemContent}>
                <span className={styles.itemTitle}>{conv.title}</span>
                <span className={styles.itemPreview}>{conv.firstMessage}</span>
                <div className={styles.itemMeta}>
                  <span className={styles.itemDate}>{formatDate(conv.updatedAt)}</span>
                  <span className={styles.itemCount}>{conv.messageCount} msgs</span>
                </div>
              </div>
              <button
                className={styles.deleteButton}
                onClick={e => {
                  e.stopPropagation()
                  onDelete(conv.id)
                }}
                title="Eliminar conversación"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
