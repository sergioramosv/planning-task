'use client'

import { useMemo } from 'react'
import { Project, Sprint, Task, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './SprintChart.module.css'

interface SprintChartProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  users: User[]
  currentUserId?: string
  selectedProjectIds: string[]
  onSelectedProjectsChange: (projectIds: string[]) => void
}

export default function SprintChart({
  projects,
  sprints,
  tasks,
  users,
  currentUserId,
  selectedProjectIds,
  onSelectedProjectsChange
}: SprintChartProps) {
  // Get unique developers with their names
  const developers = useMemo(() => {
    const devMap = new Map<string, string>()
    tasks.forEach(t => {
      if (t.developer && !devMap.has(t.developer)) {
        const user = users.find(u => u.id === t.developer)
        devMap.set(t.developer, user?.displayName || t.developer)
      }
    })
    return Array.from(devMap.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [tasks, users])

  // Filter by selected developer (default 'all')
  const selectedDeveloper = 'all'

  // Calculate filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => selectedProjectIds.includes(t.projectId))
    if (selectedDeveloper !== 'all') {
      filtered = filtered.filter(t => t.developer === selectedDeveloper)
    }
    return filtered
  }, [selectedProjectIds, selectedDeveloper, tasks])

  // Calculate global stats
  const globalStats = useMemo(() => {
    const selectedProjectsList = projects.filter(p => selectedProjectIds.includes(p.id))
    const totalTasks = filteredTasks.length
    const myCompletedTasks = currentUserId
      ? filteredTasks.filter(t => t.developer === currentUserId && t.status === 'done').length
      : 0

    return {
      totalProjects: selectedProjectsList.length,
      totalTasks,
      myCompletedTasks
    }
  }, [selectedProjectIds, filteredTasks, currentUserId, projects])

  // Calculate chart data
  const chartData = useMemo(() => {
    const filteredSprints = sprints.filter(s => selectedProjectIds.includes(s.projectId))

    const sortedSprints = [...filteredSprints].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    return sortedSprints.map(sprint => {
      let sprintTasks = filteredTasks.filter(t => t.sprintId === sprint.id && t.status === 'done')

      const bizPoints = sprintTasks.reduce((sum, t) => sum + (t.bizPoints || 0), 0)
      const devPoints = sprintTasks.reduce((sum, t) => sum + (t.devPoints || 0), 0)

      return {
        name: sprint.name,
        'Pts Negocio': bizPoints,
        'Pts Desarrollo': devPoints
      }
    })
  }, [selectedProjectIds, filteredTasks, sprints])

  const toggleProjectSelection = (projectId: string) => {
    if (selectedProjectIds.includes(projectId)) {
      if (selectedProjectIds.length > 1) {
        onSelectedProjectsChange(selectedProjectIds.filter(id => id !== projectId))
      }
    } else {
      onSelectedProjectsChange([...selectedProjectIds, projectId])
    }
  }

  const hasData = selectedProjectIds.length > 0

  return (
    <>
      <div className={styles.filtersContainer}>
        <div className={styles.label}>Proyectos:</div>
        <div className={styles.projectCards}>
          {projects.map(project => (
            <button
              key={project.id}
              className={`${styles.projectCard} ${selectedProjectIds.includes(project.id) ? styles.projectCardActive : ''}`}
              onClick={() => toggleProjectSelection(project.id)}
            >
              <input
                type="checkbox"
                checked={selectedProjectIds.includes(project.id)}
                onChange={() => {}}
                className={styles.checkbox}
                style={{ pointerEvents: 'none' }}
              />
              <span>{project.name}</span>
            </button>
          ))}
        </div>
      </div>

      {hasData && (
        <div className={styles.statsGrid}>
          <Card>
            <CardContent className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#3B82F6' }}>
                {globalStats.totalProjects}
              </div>
              <p className={styles.statLabel}>Proyectos Seleccionados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#10B981' }}>
                {globalStats.totalTasks}
              </div>
              <p className={styles.statLabel}>Tareas Totales</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className={styles.statCard}>
              <div className={styles.statValue} style={{ color: '#10B981' }}>
                {globalStats.myCompletedTasks}
              </div>
              <p className={styles.statLabel}>Mis Tareas Completadas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {hasData && (
        <div className={styles.filterGroup}>
          <label className={styles.label}>Developer:</label>
          <select className={styles.select} disabled>
            <option value="all">Todos los Developers</option>
            {developers.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gráfica de Puntos por Sprint</CardTitle>
        </CardHeader>
        <CardContent className={styles.content}>
          {!hasData ? (
            <div className={styles.emptyMessage}>
              Selecciona al menos 1 proyecto para ver las estadísticas
            </div>
          ) : chartData.length === 0 ? (
            <div className={styles.emptyMessage}>
              No hay sprints con datos para mostrar
            </div>
          ) : (
            <>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Pts Negocio"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ fill: '#8B5CF6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Pts Desarrollo"
                      stroke="#06B6D4"
                      strokeWidth={2}
                      dot={{ fill: '#06B6D4', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className={styles.summary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Total Pts Negocio:</span>
                  <span className={styles.summaryValue} style={{ color: '#8B5CF6' }}>
                    {chartData.reduce((sum, d) => sum + (d['Pts Negocio'] || 0), 0)}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Total Pts Desarrollo:</span>
                  <span className={styles.summaryValue} style={{ color: '#06B6D4' }}>
                    {chartData.reduce((sum, d) => sum + (d['Pts Desarrollo'] || 0), 0)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
