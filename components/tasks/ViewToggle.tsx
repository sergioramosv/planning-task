'use client'

import { Grid3x3, List } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import styles from './ViewToggle.module.css'

interface ViewToggleProps {
  currentView: 'table' | 'kanban'
  onViewChange: (view: 'table' | 'kanban') => void
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className={styles.container}>
      <button
        onClick={() => onViewChange('table')}
        className={cn(
          styles.button,
          currentView === 'table' && styles.buttonActive
        )}
        title="Vista de tabla"
      >
        <List size={18} />
        <span className={styles.buttonText}>Tabla</span>
      </button>
      <button
        onClick={() => onViewChange('kanban')}
        className={cn(
          styles.button,
          currentView === 'kanban' && styles.buttonActive
        )}
        title="Vista Kanban"
      >
        <Grid3x3 size={18} />
        <span className={styles.buttonText}>Kanban</span>
      </button>
    </div>
  )
}
