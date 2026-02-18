'use client'

import { useMemo } from 'react'
import { Project } from '@/types'
import { Bug } from '@/types/bug'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import styles from './BugsSeverity.module.css'

interface BugsSeverityProps {
  projects: Project[]
  bugs: Bug[]
  selectedProjectIds: string[]
}

const SEVERITY_COLORS = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#FBBF24',
  low: '#10B981'
}

const SEVERITY_LABELS = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja'
}

export default function BugsSeverity({
  projects,
  bugs,
  selectedProjectIds
}: BugsSeverityProps) {
  const chartData = useMemo(() => {
    const selectedBugs = bugs.filter(b => selectedProjectIds.includes(b.projectId))

    const severities = ['critical', 'high', 'medium', 'low'] as const

    return severities.map(severity => {
      const openCount = selectedBugs.filter(b => b.severity === severity && b.status !== 'closed').length
      const closedCount = selectedBugs.filter(b => b.severity === severity && b.status === 'closed').length

      return {
        name: SEVERITY_LABELS[severity],
        'Abiertos': openCount,
        'Cerrados': closedCount,
        fill: SEVERITY_COLORS[severity]
      }
    }).filter(d => d['Abiertos'] > 0 || d['Cerrados'] > 0)
  }, [bugs, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0 && chartData.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bugs por Severidad</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        {!hasData ? (
          <div className={styles.emptyMessage}>
            {selectedProjectIds.length === 0
              ? 'Selecciona al menos 1 proyecto para ver las estadísticas'
              : 'No hay bugs para mostrar'}
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
                <Bar dataKey="Abiertos" fill="#EF4444" />
                <Bar dataKey="Cerrados" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
