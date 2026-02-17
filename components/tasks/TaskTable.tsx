'use client'

import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants/taskStates'
import { formatDate } from '@/lib/utils/formatters'
import { Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import badgeStyles from '@/components/ui/Badge.module.css'
import styles from './TaskTable.module.css'

interface TaskTableProps {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: string) => void
}

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className={styles.emptyMessage}>
          <p>No hay tareas que coincidan con los filtros</p>
        </CardContent>
      </Card>
    )
  }

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
    <Card className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>ID</th>
              <th className={styles.tableHeader}>Título</th>
              <th className={styles.tableHeader}>Épica</th>
              <th className={styles.tableHeader}>Developer</th>
              <th className={styles.tableHeader}>Inicio</th>
              <th className={styles.tableHeader}>Fin</th>
              <th className={cn(styles.tableHeader, styles.tableHeaderCenter)}>Puntos</th>
              <th className={cn(styles.tableHeader, styles.tableHeaderCenter)}>Prioridad</th>
              <th className={styles.tableHeader}>Estado</th>
              <th className={cn(styles.tableHeader, styles.tableHeaderCenter)}>Acciones</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {tasks.map(task => (
              <tr key={task.id} className={styles.tableRow}>
                <td className={cn(styles.tableCell, styles.tableCellMono)}>
                  {task.id}
                </td>
                <td className={cn(styles.tableCell, styles.tableCellMono)}>
                  {task.title}
                </td>
                <td className={cn(styles.tableCell, styles.tableCellGray)}>{task.epic}</td>
                <td className={cn(styles.tableCell, styles.tableCellGray)}>{task.developer}</td>
                <td className={cn(styles.tableCell, styles.tableCellGray)}>{formatDate(task.startDate)}</td>
                <td className={cn(styles.tableCell, styles.tableCellGray)}>{formatDate(task.endDate)}</td>
                <td className={cn(styles.tableCell, styles.tableCellGray, styles.tableCellCenter)}>
                  {task.bizPoints}/{task.devPoints}
                </td>
                <td className={cn(styles.tableCell, styles.tableCellCenter, styles.tablePriority)}>
                  {task.priority}
                </td>
                <td className={styles.tableCell}>
                  <Badge variant={getStatusVariant(task.status)} className={badgeStyles.sm}>
                    {TASK_STATUS_LABELS[task.status]}
                  </Badge>
                </td>
                <td className={cn(styles.tableCell, styles.tableCellCenter)}>
                  <div className={styles.tableActions}>
                    <button
                      onClick={() => onEdit?.(task)}
                      className={cn(styles.actionButton, styles.actionButtonEdit)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Eliminar esta tarea?')) {
                          onDelete?.(task.id)
                        }
                      }}
                      className={cn(styles.actionButton, styles.actionButtonDelete)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
