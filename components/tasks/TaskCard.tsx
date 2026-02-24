'use client'

import { Task } from '@/types'
import { calculatePriority } from '@/lib/utils/calculations'
import { cn } from '@/lib/utils/cn'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
  developerName?: string
  coDeveloperName?: string
  sprintName?: string
}

export default function TaskCard({ task, onClick, isDragging = false, developerName, coDeveloperName, sprintName }: TaskCardProps) {
  const priority = calculatePriority(task.bizPoints, task.devPoints)

  return (
    <div
      className={cn(styles.card, isDragging && styles.cardDragging)}
      onClick={onClick}
    >
      <div className={styles.title}>{task.title}</div>

      <div className={styles.meta}>
        {(developerName || task.developer) && (
          <span className={styles.tag}>{developerName || task.developer}</span>
        )}
        {sprintName && (
          <span className={styles.tagSprint}>{sprintName}</span>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.priority}>P{priority}</span>
        <span className={styles.points}>{task.bizPoints}/{task.devPoints}pts</span>
        {task.startDate && (
          <span className={styles.date}>{task.startDate}</span>
        )}
      </div>
    </div>
  )
}
