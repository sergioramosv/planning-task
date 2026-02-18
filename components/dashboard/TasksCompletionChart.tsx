'use client'

import { useMemo } from 'react'
import { Project, Sprint, Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import styles from './TasksCompletionChart.module.css'

interface TasksCompletionChartProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  selectedProjectIds: string[]
}

export default function TasksCompletionChart({
  projects,
  sprints,
  tasks,
  selectedProjectIds
}: TasksCompletionChartProps) {
  // Calculate chart data
  const chartData = useMemo(() => {
    const filteredSprints = sprints.filter(s => selectedProjectIds.includes(s.projectId))

    const sortedSprints = [...filteredSprints].sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    return sortedSprints.map(sprint => {
      const project = projects.find(p => p.id === sprint.projectId)
      const projectName = project?.name || 'Unknown'

      // Get all tasks for this sprint
      const sprintTasks = tasks.filter(t => t.sprintId === sprint.id && selectedProjectIds.includes(t.projectId))

      // Count total and done tasks
      const totalTasks = sprintTasks.length
      const doneTasks = sprintTasks.filter(t => t.status === 'done').length

      return {
        name: `${projectName} - ${sprint.name}`,
        'Tareas Totales': totalTasks,
        'Tareas Completadas': doneTasks
      }
    })
  }, [selectedProjectIds, tasks, sprints, projects])

  const hasData = selectedProjectIds.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas por Sprint y Proyecto</CardTitle>
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
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="Tareas Totales"
                  fill="#06B6D4"
                />
                <Bar
                  dataKey="Tareas Completadas"
                  fill="#10B981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
