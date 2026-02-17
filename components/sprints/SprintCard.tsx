'use client'

import { Sprint } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Calendar, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import styles from './SprintCard.module.css'

interface SprintCardProps {
  sprint: Sprint
  projectId: string
  taskCount?: number
  onEdit?: (sprint: Sprint) => void
  onDelete?: (sprintId: string) => void
}

export default function SprintCard({
  sprint,
  projectId,
  taskCount = 0,
  onEdit,
  onDelete,
}: SprintCardProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive
      case 'planned':
        return styles.statusPlanned
      default:
        return styles.statusCompleted
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'planned':
        return 'Planeado'
      default:
        return 'Completado'
    }
  }

  return (
    <Link href={`/projects/${projectId}/tasks?sprint=${sprint.id}`} className={styles.link}>
      <Card className={styles.card}>
        <CardHeader>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <CardTitle className={styles.title}>
                <TrendingUp size={20} className={styles.titleIcon} />
                {sprint.name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.content}>
          <div className={styles.dateInfo}>
            <Calendar size={16} />
            <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
          </div>
          <div className={styles.statusRow}>
            <span className={cn(styles.statusBadge, getStatusClass(sprint.status))}>
              {getStatusLabel(sprint.status)}
            </span>
            <span className={styles.taskCount}>{taskCount} tareas</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
