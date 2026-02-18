'use client'

import { useMemo } from 'react'
import { Project, Sprint, Task, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
// Component for displaying metrics
import styles from './DeveloperPerformanceMetrics.module.css'

interface DeveloperPerformanceMetricsProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  users: User[]
  selectedProjectIds: string[]
}

export default function DeveloperPerformanceMetrics({
  projects,
  sprints,
  tasks,
  users,
  selectedProjectIds
}: DeveloperPerformanceMetricsProps) {
  const performanceData = useMemo(() => {
    const selectedTasks = tasks.filter(t => selectedProjectIds.includes(t.projectId))
    const selectedSprints = sprints.filter(s => selectedProjectIds.includes(s.projectId))

    const developerStats = new Map<string, {
      name: string
      completedTasks: number
      totalTasks: number
      completedPoints: number
      totalPoints: number
      velocity: number
    }>()

    selectedTasks.forEach(task => {
      if (!task.developer) return

      const user = users.find(u => u.uid === task.developer)
      const name = user?.displayName || task.developer

      if (!developerStats.has(task.developer)) {
        developerStats.set(task.developer, {
          name,
          completedTasks: 0,
          totalTasks: 0,
          completedPoints: 0,
          totalPoints: 0,
          velocity: 0
        })
      }

      const stats = developerStats.get(task.developer)!
      stats.totalTasks++
      stats.totalPoints += task.devPoints || 0

      if (task.status === 'done') {
        stats.completedTasks++
        stats.completedPoints += task.devPoints || 0
      }
    })

    // Calculate velocity for each developer
    developerStats.forEach(stats => {
      stats.velocity = selectedSprints.length > 0 ? stats.completedPoints / selectedSprints.length : 0
    })

    return Array.from(developerStats.values())
      .sort((a, b) => b.completedTasks - a.completedTasks)
  }, [tasks, users, sprints, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0 && performanceData.length > 0
  const avgCompletionRate = performanceData.length > 0
    ? (performanceData.reduce((sum, d) => sum + (d.completedTasks / d.totalTasks || 0), 0) / performanceData.length * 100).toFixed(1)
    : 0

  const getPerformanceBadge = (completionRate: number) => {
    if (completionRate >= 0.8) return { variant: 'success' as const, label: 'Excelente' }
    if (completionRate >= 0.6) return { variant: 'info' as const, label: 'Bueno' }
    if (completionRate >= 0.4) return { variant: 'warning' as const, label: 'Regular' }
    return { variant: 'danger' as const, label: 'Bajo' }
  }

  if (!hasData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento del Developer - Detallado</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {performanceData.length === 0 ? (
          <div className={styles.emptyMessage}>
            No hay developers con tareas asignadas
          </div>
        ) : (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span>Tasa de Completación Promedio</span>
                <span className={styles.value}>{avgCompletionRate}%</span>
              </div>
            </div>
            <div className={styles.developersList}>
              {performanceData.map((dev) => {
                const completionRate = dev.totalTasks > 0 ? dev.completedTasks / dev.totalTasks : 0
                const badge = getPerformanceBadge(completionRate)

                return (
                  <div key={dev.name} className={styles.developerCard}>
                    <div className={styles.developerHeader}>
                      <div className={styles.developerName}>{dev.name}</div>
                      <Badge variant={badge.variant} size="sm">
                        {badge.label}
                      </Badge>
                    </div>

                    <div className={styles.metricsGrid}>
                      <div className={styles.metric}>
                        <div className={styles.metricLabel}>Tareas Completadas</div>
                        <div className={styles.metricValue}>
                          {dev.completedTasks} / {dev.totalTasks}
                        </div>
                        <div className={styles.metricProgress}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{ width: `${completionRate * 100}%` }}
                            />
                          </div>
                          <span>{(completionRate * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className={styles.metric}>
                        <div className={styles.metricLabel}>Puntos de Desarrollo</div>
                        <div className={styles.metricValue}>
                          {dev.completedPoints} / {dev.totalPoints}
                        </div>
                      </div>

                      <div className={styles.metric}>
                        <div className={styles.metricLabel}>Velocidad</div>
                        <div className={styles.metricValue}>
                          {dev.velocity.toFixed(1)} pts/sprint
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
