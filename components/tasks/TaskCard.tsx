'use client'

import { Task } from '@/types'
import { calculatePriority } from '@/lib/utils/calculations'
import { cn } from '@/lib/utils/cn'
import { Trash2, AlertTriangle, Clock } from 'lucide-react'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onDelete?: () => void
  isDragging?: boolean
  developerName?: string
  coDeveloperName?: string
  sprintName?: string
  subtaskProgress?: { completed: number; total: number }
  isBlocked?: boolean
  isTimerActive?: boolean
  totalTimeMs?: number
}

export default function TaskCard({ task, onClick, onDelete, isDragging = false, developerName, coDeveloperName, sprintName, subtaskProgress, isBlocked, isTimerActive, totalTimeMs }: TaskCardProps) {
  const priority = calculatePriority(task.bizPoints, task.devPoints)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div
      className={cn(styles.card, isDragging && styles.cardDragging)}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.title}>
          {isBlocked && <AlertTriangle size={13} className={styles.blockedIcon} />}
          {task.title}
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className={styles.deleteButton}
            aria-label="Eliminar tarea"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className={styles.meta}>
        {(developerName || task.developer) && (
          <span className={styles.tag}>{developerName || task.developer}</span>
        )}
        {sprintName && (
          <span className={styles.tagSprint}>{sprintName}</span>
        )}
      </div>

      {subtaskProgress && subtaskProgress.total > 0 && (
        <div className={styles.subtaskBar}>
          <div className={styles.subtaskBarFill} style={{ width: `${Math.round((subtaskProgress.completed / subtaskProgress.total) * 100)}%` }} />
          <span className={styles.subtaskCount}>{subtaskProgress.completed}/{subtaskProgress.total}</span>
        </div>
      )}

      <div className={styles.footer}>
        <span className={styles.priority}>P{priority}</span>
        <span className={styles.points}>{task.bizPoints}/{task.devPoints}pts</span>
        {(isTimerActive || (totalTimeMs && totalTimeMs > 0)) && (
          <span className={`${styles.timeTag} ${isTimerActive ? styles.timeTagActive : ''}`}>
            <Clock size={10} />
            {totalTimeMs && totalTimeMs > 60000
              ? `${Math.floor(totalTimeMs / 3600000)}h${Math.floor((totalTimeMs % 3600000) / 60000)}m`
              : isTimerActive ? '' : '< 1m'}
          </span>
        )}
        {task.startDate && (
          <span className={styles.date}>{task.startDate}</span>
        )}
      </div>
    </div>
  )
}
