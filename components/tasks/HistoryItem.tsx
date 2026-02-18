'use client'

import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit3, User, CheckCircle, Calendar } from 'lucide-react'
import styles from './HistoryItem.module.css'

interface HistoryItemProps {
  history: {
    id?: string
    timestamp: number
    userId?: string
    userName: string
    field: string
    oldValue: any
    newValue: any
    action: string
  }
}

export default function HistoryItem({ history }: HistoryItemProps) {
  const timeAgo = formatDistanceToNow(new Date(history.timestamp), {
    addSuffix: true,
    locale: es,
  })

  // Map field names to user-friendly labels
  const fieldLabels: Record<string, string> = {
    status: 'Estado',
    developer: 'Developer',
    sprintId: 'Sprint',
    bizPoints: 'Puntos de Negocio',
    devPoints: 'Puntos de Desarrollo',
    title: 'Título',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    description: 'Descripción',
    priority: 'Prioridad',
  }

  // Map status values to user-friendly labels
  const statusLabels: Record<string, string> = {
    'to-do': 'Por Hacer',
    'in-progress': 'En Progreso',
    'to-validate': 'Validación',
    'validated': 'Validado',
    'done': 'Completada',
  }

  const getIcon = () => {
    switch (history.field) {
      case 'status':
        return <CheckCircle size={16} />
      case 'developer':
        return <User size={16} />
      case 'startDate':
      case 'endDate':
        return <Calendar size={16} />
      default:
        return <Edit3 size={16} />
    }
  }

  const formatValue = (value: any, field: string) => {
    if (value === null || value === undefined) return 'Vacío'

    if (field === 'status' && statusLabels[value]) {
      return statusLabels[value]
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No'
    }

    if (typeof value === 'number' && (field === 'startDate' || field === 'endDate')) {
      return new Date(value).toLocaleDateString('es-ES')
    }

    return String(value).substring(0, 50)
  }

  return (
    <div className={styles.container}>
      <div className={styles.timeline}>
        <div className={styles.dot}>{getIcon()}</div>
        <div className={styles.line} />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.userName}>{history.userName}</span>
          <span className={styles.timestamp}>{timeAgo}</span>
        </div>

        <div className={styles.change}>
          <span className={styles.action}>cambió</span>
          <span className={styles.field}>{fieldLabels[history.field] || history.field}</span>
          <span className={styles.action}>de</span>
          <span className={styles.oldValue}>{formatValue(history.oldValue, history.field)}</span>
          <span className={styles.action}>a</span>
          <span className={styles.newValue}>{formatValue(history.newValue, history.field)}</span>
        </div>
      </div>
    </div>
  )
}
