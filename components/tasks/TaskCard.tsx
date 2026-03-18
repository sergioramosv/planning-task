'use client'

import { Task } from '@/types'
import { calculatePriority } from '@/lib/utils/calculations'
import { cn } from '@/lib/utils/cn'
import { Trash2, AlertTriangle, Clock, GitPullRequest, GitMerge } from 'lucide-react'
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
  epicColor?: string
  epicName?: string
}

export default function TaskCard({ task, onClick, onDelete, isDragging = false, developerName, coDeveloperName, sprintName, subtaskProgress, isBlocked, isTimerActive, totalTimeMs, epicColor, epicName }: TaskCardProps) {
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
        {epicName && (
          <span className={styles.tagEpic} style={{ borderColor: epicColor }}>
            <span className={styles.epicDot} style={{ background: epicColor }} />
            {epicName}
          </span>
        )}
        {(developerName || task.developer) && (
          <span className={styles.tag}>{developerName || task.developer}</span>
        )}
        {sprintName && (
          <span className={styles.tagSprint}>{sprintName}</span>
        )}
        {task.linkedPRs && task.linkedPRs.length > 0 && (
          <span className={`${styles.tagPR} ${task.linkedPRs.some(pr => pr.status === 'merged') ? styles.tagPRMerged : ''}`}>
            {task.linkedPRs.some(pr => pr.status === 'merged') ? <GitMerge size={10} /> : <GitPullRequest size={10} />}
            PR
          </span>
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
