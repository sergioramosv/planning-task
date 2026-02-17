'use client'

import { useState, useMemo } from 'react'
import { Project, Sprint, Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './SprintChart.module.css'
import { ChevronDown } from 'lucide-react'

interface SprintChartProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
}

export default function SprintChart({ projects, sprints, tasks }: SprintChartProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>(projects.length > 0 ? [projects[0].id] : [])
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all')
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false)

  // Get unique developers
  const developers = useMemo(() => {
    const devSet = new Set(tasks.map(t => t.developer).filter(Boolean))
    return Array.from(devSet)
  }, [tasks])

  // Calculate chart data
  const chartData = useMemo(() => {
    // Filter sprints by selected projects
    const filteredSprints = sprints.filter(s => selectedProjects.includes(s.projectId))

    // Sort by start date
    const sortedSprints = [...filteredSprints].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    // For each sprint, calculate business and dev points
    return sortedSprints.map(sprint => {
      let sprintTasks = tasks.filter(t => t.sprintId === sprint.id)

      // Filter by developer if selected
      if (selectedDeveloper !== 'all') {
        sprintTasks = sprintTasks.filter(t => t.developer === selectedDeveloper)
      }

      const bizPoints = sprintTasks.reduce((sum, t) => sum + (t.bizPoints || 0), 0)
      const devPoints = sprintTasks.reduce((sum, t) => sum + (t.devPoints || 0), 0)

      return {
        name: sprint.name,
        'Pts Negocio': bizPoints,
        'Pts Desarrollo': devPoints,
        total: bizPoints + devPoints
      }
    })
  }, [selectedProjects, selectedDeveloper, sprints, tasks])

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.length > 1 ? prev.filter(id => id !== projectId) : prev
      }
      return [...prev, projectId]
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfica de Puntos por Sprint</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Proyectos:</label>
            <div className={styles.dropdownContainer}>
              <button
                className={styles.dropdownBtn}
                onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
              >
                <span className={styles.dropdownText}>
                  {selectedProjects.length === 1
                    ? projects.find(p => p.id === selectedProjects[0])?.name
                    : `${selectedProjects.length} proyectos`}
                </span>
                <ChevronDown size={18} />
              </button>
              {projectsDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {projects.map(project => (
                    <label key={project.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => toggleProjectSelection(project.id)}
                        className={styles.checkbox}
                      />
                      {project.name}
                    </label>
                  ))}
                </div>
              )}
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
              {developers.map(dev => (
                <option key={dev} value={dev}>
                  {dev}
                </option>
              ))}
            </select>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className={styles.emptyMessage}>
            No hay sprints con datos para mostrar
          </div>
        ) : (
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
        )}

        {selectedProjects.length > 0 && chartData.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  )
}
