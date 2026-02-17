'use client'

import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { TASK_STATUS_LABELS } from '@/lib/constants/taskStates'
import { calculatePriority } from '@/lib/utils/calculations'
import { formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
  developerName?: string
  sprintName?: string
}

export default function TaskCard({ task, onClick, isDragging = false, developerName, sprintName }: TaskCardProps) {
  const priority = calculatePriority(task.bizPoints, task.devPoints)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'done':
        return 'success'
      case 'in-progress':
        return 'info'
      case 'to-validate':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <Card
      className={cn(styles.card, isDragging && styles.cardDragging)}
      onClick={onClick}
    >
      <CardContent className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>
            {task.title}
          </h4>
          <span className={styles.taskId}>{task.id}</span>
        </div>

        <div className={styles.section}>
          <div className={styles.row}>
            <span className={styles.label}>Developer:</span>
            <span className={styles.value}>{developerName || task.developer}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Sprint:</span>
            <span className={styles.value}>{sprintName || '-'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Puntos:</span>
            <span className={styles.value}>{task.bizPoints}/{task.devPoints}</span>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.row}>
            <span className={styles.label}>Inicio:</span>
            <span className={styles.value}>{formatDate(task.startDate)}</span>
          </div>
          {task.endDate && (
            <div className={styles.row}>
              <span className={styles.label}>Fin:</span>
              <span className={styles.value}>{formatDate(task.endDate)}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.badges}>
            <Badge variant="info" className={styles.badge}>
              P: {priority}
            </Badge>
            <Badge variant={getStatusVariant(task.status)} className={styles.badge}>
              {TASK_STATUS_LABELS[task.status]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
