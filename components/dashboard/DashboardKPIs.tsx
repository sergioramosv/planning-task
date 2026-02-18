'use client'

import { useMemo } from 'react'
import { Project, Sprint, Task, User } from '@/types'
import { Bug } from '@/types/bug'
import { Card, CardContent } from '@/components/ui/Card'
import styles from './DashboardKPIs.module.css'

interface DashboardKPIsProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  bugs: Bug[]
  selectedProjectIds: string[]
}

export default function DashboardKPIs({
  projects,
  sprints,
  tasks,
  bugs,
  selectedProjectIds
}: DashboardKPIsProps) {
  const metrics = useMemo(() => {
    const selectedProjects = projects.filter(p => selectedProjectIds.includes(p.id))
    const selectedSprints = sprints.filter(s => selectedProjectIds.includes(s.projectId))
    const selectedTasks = tasks.filter(t => selectedProjectIds.includes(t.projectId))
    const selectedBugs = bugs.filter(b => selectedProjectIds.includes(b.projectId))

    // Calculate metrics
    const totalTasks = selectedTasks.length
    const completedTasks = selectedTasks.filter(t => t.status === 'done').length
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0

    const totalDevPoints = selectedTasks.reduce((sum, t) => sum + (t.devPoints || 0), 0)
    const completedDevPoints = selectedTasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.devPoints || 0), 0)
    const avgVelocity = selectedSprints.length > 0 ? (completedDevPoints / selectedSprints.length).toFixed(1) : 0

    const totalBugs = selectedBugs.length
    const resolvedBugs = selectedBugs.filter(b => b.status === 'closed').length
    const bugResolutionRate = totalBugs > 0 ? ((resolvedBugs / totalBugs) * 100).toFixed(1) : 0

    const activeSprints = selectedSprints.filter(s => s.status === 'active').length

    return {
      completionRate,
      avgVelocity,
      bugResolutionRate,
      activeSprints,
      totalTasks,
      completedTasks,
      totalBugs,
      resolvedBugs
    }
  }, [projects, sprints, tasks, bugs, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0

  if (!hasData) {
    return null
  }

  return (
    <div className={styles.grid}>
      <Card>
        <CardContent className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Tasa de Completación</div>
          <div className={styles.kpiValue} style={{ color: '#10B981' }}>
            {metrics.completionRate}%
          </div>
          <div className={styles.kpiDetail}>
            {metrics.completedTasks}/{metrics.totalTasks} tareas
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Velocidad Promedio</div>
          <div className={styles.kpiValue} style={{ color: '#06B6D4' }}>
            {metrics.avgVelocity}
          </div>
          <div className={styles.kpiDetail}>pts/sprint</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Resolución de Bugs</div>
          <div className={styles.kpiValue} style={{ color: '#F97316' }}>
            {metrics.bugResolutionRate}%
          </div>
          <div className={styles.kpiDetail}>
            {metrics.resolvedBugs}/{metrics.totalBugs} bugs
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Sprints Activos</div>
          <div className={styles.kpiValue} style={{ color: '#8B5CF6' }}>
            {metrics.activeSprints}
          </div>
          <div className={styles.kpiDetail}>en ejecución</div>
        </CardContent>
      </Card>
    </div>
  )
}
