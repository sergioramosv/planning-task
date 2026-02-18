'use client'

import { useMemo } from 'react'
import { Project, Sprint, Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './TeamVelocity.module.css'

interface TeamVelocityProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  selectedProjectIds: string[]
}

export default function TeamVelocity({
  projects,
  sprints,
  tasks,
  selectedProjectIds
}: TeamVelocityProps) {
  const chartData = useMemo(() => {
    const selectedSprints = sprints
      .filter(s => selectedProjectIds.includes(s.projectId))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return selectedSprints.map(sprint => {
      const sprintTasks = tasks.filter(t => t.sprintId === sprint.id && selectedProjectIds.includes(t.projectId))
      const completedTasks = sprintTasks.filter(t => t.status === 'done')

      const plannedPoints = sprintTasks.reduce((sum, t) => sum + (t.devPoints || 0), 0)
      const completedPoints = completedTasks.reduce((sum, t) => sum + (t.devPoints || 0), 0)

      return {
        name: sprint.name,
        'Puntos Planeados': plannedPoints,
        'Puntos Completados': completedPoints
      }
    })
  }, [sprints, tasks, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0 && chartData.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Velocidad del Equipo</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {!hasData ? (
          <div className={styles.emptyMessage}>
            {selectedProjectIds.length === 0
              ? 'Selecciona al menos 1 proyecto para ver las estadísticas'
              : 'No hay sprints con datos para mostrar'}
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Puntos Planeados"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Puntos Completados"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
