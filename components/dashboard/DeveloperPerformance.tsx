'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Task, User } from '@/types'
import styles from './DeveloperPerformance.module.css'

interface DeveloperPerformanceProps {
  tasks: Task[]
  users: User[]
  selectedProjectIds?: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function DeveloperPerformance({ tasks, users, selectedProjectIds }: DeveloperPerformanceProps) {
  const data = useMemo(() => {
    // Map developer IDs to names
    const userMap = users.reduce((acc, user) => {
      acc[user.uid] = user.displayName
      return acc
    }, {} as Record<string, string>)

    // Filter tasks by selected projects if provided
    const filteredTasks = selectedProjectIds && selectedProjectIds.length > 0
      ? tasks.filter(t => selectedProjectIds.includes(t.projectId))
      : tasks

    // Calculate stats per developer
    const stats: Record<string, { name: string; assigned: number; completed: number; pending: number }> = {}

    filteredTasks.forEach(task => {
      // Skip unassigned tasks if necessary, or label them 'Unassigned'
      const devId = task.developer || 'unassigned'
      const devName = userMap[devId] || (devId === 'unassigned' ? 'Sin Asignar' : 'Desconocido')

      if (!stats[devId]) {
        stats[devId] = {
          name: devName,
          assigned: 0,
          completed: 0,
          pending: 0
        }
      }

      stats[devId].assigned += 1

      if (task.status === 'done') {
        stats[devId].completed += 1
      } else {
        stats[devId].pending += 1
      }
    })

    return Object.values(stats).filter(s => s.assigned > 0)
  }, [tasks, users, selectedProjectIds])

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento del Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No hay datos suficientes para mostrar métricas.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={styles.grid}>
      <Card className={styles.chartCard}>
        <CardHeader>
          <CardTitle>Tareas por Desarrollador</CardTitle>
        </CardHeader>
        <CardContent className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="Completadas" fill="#10B981" />
              <Bar dataKey="pending" name="Pendientes" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className={styles.chartCard}>
        <CardHeader>
          <CardTitle>Distribución de Carga</CardTitle>
        </CardHeader>
        <CardContent className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="assigned"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
