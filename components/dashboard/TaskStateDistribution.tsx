'use client'

import { useMemo } from 'react'
import { Project, Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './TaskStateDistribution.module.css'

interface TaskStateDistributionProps {
  projects: Project[]
  tasks: Task[]
  selectedProjectIds: string[]
}

const COLORS = {
  'to-do': '#94A3B8',
  'in-progress': '#F59E0B',
  'to-validate': '#8B5CF6',
  'done': '#10B981'
}

const LABELS = {
  'to-do': 'Por Hacer',
  'in-progress': 'En Progreso',
  'to-validate': 'Por Validar',
  'done': 'Completado'
}

export default function TaskStateDistribution({
  projects,
  tasks,
  selectedProjectIds
}: TaskStateDistributionProps) {
  const chartData = useMemo(() => {
    const selectedTasks = tasks.filter(t => selectedProjectIds.includes(t.projectId))

    const counts = {
      'to-do': selectedTasks.filter(t => t.status === 'to-do').length,
      'in-progress': selectedTasks.filter(t => t.status === 'in-progress').length,
      'to-validate': selectedTasks.filter(t => t.status === 'to-validate').length,
      'done': selectedTasks.filter(t => t.status === 'done').length
    }

    return Object.entries(counts).map(([status, count]) => ({
      name: LABELS[status as keyof typeof LABELS],
      value: count,
      fill: COLORS[status as keyof typeof COLORS]
    }))
  }, [tasks, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0 && chartData.some(d => d.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Tareas por Estado</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {!hasData ? (
          <div className={styles.emptyMessage}>
            {selectedProjectIds.length === 0
              ? 'Selecciona al menos 1 proyecto para ver las estadísticas'
              : 'No hay tareas con datos para mostrar'}
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
