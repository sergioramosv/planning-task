'use client'

import { Sprint } from '@/types'
import { Trash2, Edit2, Calendar, CheckCircle, Clock } from 'lucide-react'
import styles from './SprintCard.module.css'
import { getProjectColor } from '@/lib/utils/colors'

interface SprintCardProps {
  sprint: Sprint
  totalBizPoints: number
  totalDevPoints: number
  taskCount: number
  onEdit: (sprint: Sprint) => void
  onDelete: (sprint: Sprint) => void
}

export default function SprintCard({
  sprint,
  totalBizPoints,
  totalDevPoints,
  taskCount,
  onEdit,
  onDelete,
}: SprintCardProps) {
  const theme = getProjectColor(sprint.id)

  const getStatusIcon = () => {
    switch (sprint.status) {
      case 'active':
        return <Clock size={16} style={{ color: theme.icon }} />
      case 'completed':
        return <CheckCircle size={16} style={{ color: theme.icon }} />
      default:
        return <Calendar size={16} style={{ color: theme.icon }} />
    }
  }

  const getStatusLabel = () => {
    switch (sprint.status) {
      case 'active':
        return 'Activo'
      case 'completed':
        return 'Completado'
      default:
        return 'Planificado'
    }
  }

  return (
    <div className={styles.card} style={{ borderLeftColor: theme.border }}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{sprint.name}</h3>
          <span className={styles.status} style={{ borderColor: theme.border, color: theme.icon }}>
            {getStatusIcon()}
            {getStatusLabel()}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => onEdit(sprint)}
            className={styles.actionBtn}
            style={{ color: theme.icon }}
            title="Editar sprint"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(sprint)}
            className={`${styles.actionBtn} ${styles.delete}`}
            title="Eliminar sprint"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className={styles.dates}>
        <div className={styles.dateItem}>
          <Calendar size={16} style={{ color: theme.icon }} />
          <div>
            <span className={styles.label}>Inicio:</span>
            <span>{sprint.startDate}</span>
          </div>
        </div>
        <div className={styles.dateItem}>
          <Calendar size={16} style={{ color: theme.icon }} />
          <div>
            <span className={styles.label}>Fin:</span>
            <span>{sprint.endDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Tareas</span>
          <span className={styles.statValue}>{taskCount}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Pts Neg</span>
          <span className={styles.statValue}>{totalBizPoints}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Pts Dev</span>
          <span className={styles.statValue}>{totalDevPoints}</span>
        </div>
      </div>
    </div>
  )
}
