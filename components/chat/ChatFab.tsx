'use client'

import { MessageSquare } from 'lucide-react'
import styles from './ChatPanel.module.css'

interface ChatFabProps {
  onClick: () => void
}

export default function ChatFab({ onClick }: ChatFabProps) {
  return (
    <button className={styles.fab} onClick={onClick} title="Abrir chat IA">
      <MessageSquare size={22} />
    </button>
  )
}
