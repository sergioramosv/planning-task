'use client'

import { useState, useMemo } from 'react'
import { Project, Sprint, Task, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './SprintChart.module.css'

interface DeveloperInfo {
  id: string
  name: string
}

interface SprintChartProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  users: User[]
  currentUserId?: string
}

export default function SprintChart({ projects, sprints, tasks, users, currentUserId }: SprintChartProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>(projects.length > 0 ? [projects[0].id] : [])
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all')

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

  // Calculate filtered tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(t => selectedProjects.includes(t.projectId))
    if (selectedDeveloper !== 'all') {
      filtered = filtered.filter(t => t.developer === selectedDeveloper)
    }
    return filtered
  }, [selectedProjects, selectedDeveloper, tasks])

  // Calculate global stats
  const globalStats = useMemo(() => {
    const selectedProjectsList = projects.filter(p => selectedProjects.includes(p.id))
    const totalTasks = filteredTasks.length
    const myCompletedTasks = currentUserId
      ? filteredTasks.filter(t => t.developer === currentUserId && t.status === 'done').length
      : 0

    return {
      totalProjects: selectedProjectsList.length,
      totalTasks,
      myCompletedTasks
    }
  }, [selectedProjects, filteredTasks, currentUserId, projects])

  // Calculate chart data
  const chartData = useMemo(() => {
    const filteredSprints = sprints.filter(s => selectedProjects.includes(s.projectId))

    const sortedSprints = [...filteredSprints].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    return sortedSprints.map(sprint => {
      let sprintTasks = filteredTasks.filter(t => t.sprintId === sprint.id)

      const bizPoints = sprintTasks.reduce((sum, t) => sum + (t.bizPoints || 0), 0)
      const devPoints = sprintTasks.reduce((sum, t) => sum + (t.devPoints || 0), 0)

      return {
        name: sprint.name,
        'Pts Negocio': bizPoints,
        'Pts Desarrollo': devPoints
      }
    })
  }, [selectedProjects, filteredTasks, sprints])

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.length > 1 ? prev.filter(id => id !== projectId) : prev
      }
      return [...prev, projectId]
    })
  }

  const hasData = selectedProjects.length > 0

  return (
    <>
      <div className={styles.filtersContainer}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Proyectos:</label>
            <div className={styles.projectsCheckboxes}>
              {projects.map(project => (
                <label key={project.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => toggleProjectSelection(project.id)}
                    className={styles.checkbox}
                  />
                  <span>{project.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Developer:</label>
            <select
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              className={styles.select}
            >
              <option value="all">Todos</option>
              {developers.map(([devId, devName]) => (
                <option key={devId} value={devId}>
                  {devName}
                </option>
              ))}
            </select>
          </div>
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
