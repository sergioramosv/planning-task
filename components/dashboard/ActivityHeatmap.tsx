'use client'

import { useMemo } from 'react'
import { Project, Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import styles from './ActivityHeatmap.module.css'

interface ActivityHeatmapProps {
  projects: Project[]
  tasks: Task[]
  selectedProjectIds: string[]
}

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const WEEKS = 12 // Last 12 weeks

export default function ActivityHeatmap({
  projects,
  tasks,
  selectedProjectIds
}: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const selectedTasks = tasks.filter(t => selectedProjectIds.includes(t.projectId))

    // Create a map of date -> count
    const activityMap = new Map<string, number>()

    selectedTasks.forEach(task => {
      const date = new Date(task.updatedAt)
      const dateStr = date.toISOString().split('T')[0]
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1)
    })

    // Generate last 12 weeks of data
    const now = new Date()
    const weeks = []

    for (let w = WEEKS - 1; w >= 0; w--) {
      const week = []
      for (let d = 6; d >= 0; d--) {
        const date = new Date(now)
        date.setDate(date.getDate() - (w * 7 + d))
        const dateStr = date.toISOString().split('T')[0]
        const count = activityMap.get(dateStr) || 0
        week.push({
          date: dateStr,
          count,
          day: DAYS[date.getDay()],
          dayNum: date.getDate()
        })
      }
      weeks.push(week)
    }

    return weeks
  }, [tasks, selectedProjectIds])

  const hasData = selectedProjectIds.length > 0 && heatmapData.some(w => w.some(d => d.count > 0))

  const getIntensity = (count: number) => {
    if (count === 0) return 'empty'
    if (count <= 2) return 'low'
    if (count <= 5) return 'medium'
    return 'high'
  }

  if (!hasData) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor de Actividad (Últimas 12 Semanas)</CardTitle>
      </CardHeader>
      <CardContent className={styles.content}>
        <div className={styles.heatmap}>
          <div className={styles.dayLabels}>
            {DAYS.map(day => (
              <div key={day} className={styles.dayLabel}>{day}</div>
            ))}
          </div>
          <div className={styles.weeksContainer}>
            {heatmapData.map((week, weekIdx) => (
              <div key={weekIdx} className={styles.week}>
                {week.map((day, dayIdx) => (
                  <div
                    key={`${weekIdx}-${dayIdx}`}
                    className={`${styles.cell} ${styles[getIntensity(day.count)]}`}
                    title={`${day.date}: ${day.count} cambios`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.cell} ${styles.empty}`} />
            <span>Sin actividad</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.cell} ${styles.low}`} />
            <span>Baja</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.cell} ${styles.medium}`} />
            <span>Media</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.cell} ${styles.high}`} />
            <span>Alta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
