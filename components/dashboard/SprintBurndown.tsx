'use client'

import { useMemo } from 'react'
import { Project, Sprint, Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './SprintBurndown.module.css'

interface SprintBurndownProps {
  projects: Project[]
  sprints: Sprint[]
  tasks: Task[]
  selectedProjectIds: string[]
}

export default function SprintBurndown({
  projects,
  sprints,
  tasks,
  selectedProjectIds
}: SprintBurndownProps) {
  const chartData = useMemo(() => {
    const selectedSprints = sprints
      .filter(s => selectedProjectIds.includes(s.projectId))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return selectedSprints.map(sprint => {
      const sprintTasks = tasks.filter(t => t.sprintId === sprint.id && selectedProjectIds.includes(t.projectId))
      const pendingTasks = sprintTasks.filter(t => t.status !== 'done').length
      const completedTasks = sprintTasks.filter(t => t.status === 'done').length
      const project = projects.find(p => p.id === sprint.projectId)

      return {
        name: sprint.name,
        'Proyecto': project?.name || 'Unknown',
        'Pendientes': pendingTasks,
        'Completadas': completedTasks
      }
    })
  }, [sprints, tasks, projects, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0 && chartData.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Burndown por Sprint</CardTitle>
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
              <BarChart data={chartData} margin={{ bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={0}
                  textAnchor="middle"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Pendientes" fill="#EF4444" />
                <Bar dataKey="Completadas" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
