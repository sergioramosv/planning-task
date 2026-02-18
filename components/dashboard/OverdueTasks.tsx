'use client'

import { useMemo } from 'react'
import { Project, Task, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import styles from './OverdueTasks.module.css'

interface OverdueTasksProps {
  projects: Project[]
  tasks: Task[]
  users: User[]
  selectedProjectIds: string[]
}

export default function OverdueTasks({
  projects,
  tasks,
  users,
  selectedProjectIds
}: OverdueTasksProps) {
  const overdueList = useMemo(() => {
    const now = new Date()
    const selectedTasks = tasks.filter(t => selectedProjectIds.includes(t.projectId))

    return selectedTasks
      .filter(t => {
        if (!t.endDate || t.status === 'done') return false
        return new Date(t.endDate) < now
      })
      .sort((a, b) => new Date(a.endDate || '').getTime() - new Date(b.endDate || '').getTime())
      .slice(0, 5)
  }, [tasks, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0

  const getDaysOverdue = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = Math.floor((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getDeveloperName = (developerId: string) => {
    return users.find(u => u.uid === developerId)?.displayName || 'Sin asignar'
  }

  if (!hasData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas Vencidas</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {overdueList.length === 0 ? (
          <div className={styles.emptyMessage}>
            ✓ No hay tareas vencidas
          </div>
        ) : (
          <div className={styles.tasksList}>
            {overdueList.map(task => {
              const daysOverdue = getDaysOverdue(task.endDate || '')
              const project = projects.find(p => p.id === task.projectId)

              return (
                <div key={task.id} className={styles.taskItem}>
                  <div className={styles.taskHeader}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    <Badge variant="danger" size="sm">
                      {daysOverdue}d vencido
                    </Badge>
                  </div>
                  <div className={styles.taskMeta}>
                    <span className={styles.metaItem}>
                      <strong>Proyecto:</strong> {project?.name || 'Unknown'}
                    </span>
                    <span className={styles.metaItem}>
                      <strong>Asignado:</strong> {getDeveloperName(task.developer || '')}
                    </span>
                    <span className={styles.metaItem}>
                      <strong>Fecha vencimiento:</strong> {new Date(task.endDate || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
