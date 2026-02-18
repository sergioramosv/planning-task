'use client'

import { useMemo } from 'react'
import { Project, Task, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './DeveloperWorkload.module.css'

interface DeveloperWorkloadProps {
  projects: Project[]
  tasks: Task[]
  users: User[]
  selectedProjectIds: string[]
}

export default function DeveloperWorkload({
  projects,
  tasks,
  users,
  selectedProjectIds
}: DeveloperWorkloadProps) {
  const chartData = useMemo(() => {
    const selectedTasks = tasks.filter(t => selectedProjectIds.includes(t.projectId))

    const developerMap = new Map<string, { completed: number; pending: number; name: string }>()

    selectedTasks.forEach(task => {
      if (!task.developer) return

      const user = users.find(u => u.uid === task.developer)
      const name = user?.displayName || task.developer

      if (!developerMap.has(task.developer)) {
        developerMap.set(task.developer, { completed: 0, pending: 0, name })
      }

      const dev = developerMap.get(task.developer)!
      if (task.status === 'done') {
        dev.completed++
      } else {
        dev.pending++
      }
    })

    return Array.from(developerMap.entries())
      .map(([id, data]) => ({
        name: data.name,
        'Completadas': data.completed,
        'Pendientes': data.pending
      }))
      .sort((a, b) => (b['Completadas'] + b['Pendientes']) - (a['Completadas'] + a['Pendientes']))
  }, [tasks, users, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0 && chartData.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carga de Trabajo por Developer</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {!hasData ? (
          <div className={styles.emptyMessage}>
            {selectedProjectIds.length === 0
              ? 'Selecciona al menos 1 proyecto para ver las estadísticas'
              : 'No hay developers con tareas asignadas'}
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completadas" fill="#10B981" />
                <Bar dataKey="Pendientes" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
