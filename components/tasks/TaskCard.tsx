'use client'

import { Task } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { TASK_STATUS_LABELS } from '@/lib/constants/taskStates'
import { calculatePriority } from '@/lib/utils/calculations'
import { cn } from '@/lib/utils/cn'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onClick?: () => void
  isDragging?: boolean
}

export default function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
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
        <h4 className={styles.title}>
          {task.title}
        </h4>

        <div className={styles.metaInfo}>
          <Badge variant="info" className={styles.priorityBadge}>
            P: {priority}
          </Badge>
          <span className={styles.points}>
            {task.devPoints}pt
          </span>
        </div>

        <div className={styles.footer}>
          <span className={styles.developer}>{task.developer}</span>
          <Badge variant={getStatusVariant(task.status)} className={styles.statusBadge}>
            {TASK_STATUS_LABELS[task.status]}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
