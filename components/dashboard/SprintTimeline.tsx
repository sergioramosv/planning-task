'use client'

import { useMemo } from 'react'
import { Project, Sprint, Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import styles from './SprintTimeline.module.css'

interface SprintTimelineProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  selectedProjectIds: string[]
}

export default function SprintTimeline({
  projects,
  sprints,
  tasks,
  selectedProjectIds
}: SprintTimelineProps) {
  const sprintList = useMemo(() => {
    const selectedSprints = sprints
      .filter(s => selectedProjectIds.includes(s.projectId))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return selectedSprints.map(sprint => {
      const sprintTasks = tasks.filter(t => t.sprintId === sprint.id && selectedProjectIds.includes(t.projectId))
      const pendingTasks = sprintTasks.filter(t => t.status !== 'done').length
      const project = projects.find(p => p.id === sprint.projectId)

      const now = new Date()
      const start = new Date(sprint.startDate)
      const end = new Date(sprint.endDate)

      let sprintStatus = 'pending'
      if (now >= start && now <= end) {
        sprintStatus = 'active'
      } else if (now > end) {
        sprintStatus = 'completed'
      }

      return {
        ...sprint,
        project: project?.name || 'Unknown',
        pendingTasks,
        sprintStatus,
        daysRemaining: Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    })
  }, [sprints, tasks, projects, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'info'
      case 'completed':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'completed':
        return 'Completado'
      default:
        return 'Pendiente'
    }
  }

  if (!hasData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Sprints</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {sprintList.length === 0 ? (
          <div className={styles.emptyMessage}>
            No hay sprints para los proyectos seleccionados
          </div>
        ) : (
          <div className={styles.timeline}>
            {sprintList.map((sprint) => (
              <div key={sprint.id} className={styles.sprintItem}>
                <div className={styles.sprintHeader}>
                  <div>
                    <div className={styles.sprintName}>{sprint.name}</div>
                    <div className={styles.sprintProject}>{sprint.project}</div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(sprint.sprintStatus)} size="sm">
                    {getStatusLabel(sprint.sprintStatus)}
                  </Badge>
                </div>
                <div className={styles.sprintDates}>
                  <span>{new Date(sprint.startDate).toLocaleDateString()}</span>
                  <span>→</span>
                  <span>{new Date(sprint.endDate).toLocaleDateString()}</span>
                </div>
                <div className={styles.sprintStats}>
                  <span className={styles.statItem}>
                    Tareas pendientes: <strong>{sprint.pendingTasks}</strong>
                  </span>
                  {sprint.sprintStatus === 'active' && (
                    <span className={styles.statItem}>
                      Días restantes: <strong>{sprint.daysRemaining}</strong>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
