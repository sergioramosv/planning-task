'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Task, User } from '@/types'
import { Bug } from '@/types/bug'
import { UserAchievement } from '@/types/achievement'
import styles from './Leaderboard.module.css'

interface LeaderboardProps {
  tasks: Task[]
  bugs: Bug[]
  users: User[]
  selectedProjectIds: string[]
  currentUserId?: string
  allAchievements: Record<string, Record<string, UserAchievement>>
}

type Period = 'monthly' | 'quarterly' | 'all'

export default function Leaderboard({
  tasks,
  bugs,
  users,
  selectedProjectIds,
  currentUserId,
  allAchievements,
}: LeaderboardProps) {
  const [period, setPeriod] = useState<Period>('monthly')

  const leaderboard = useMemo(() => {
    const now = new Date()
    let startDate: number

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1).getTime()
        break
      default:
        startDate = 0
    }

    const filteredTasks = tasks.filter(
      t =>
        selectedProjectIds.includes(t.projectId) &&
        t.status === 'done' &&
        (t.updatedAt || 0) >= startDate
    )

    const filteredBugs = bugs.filter(
      b =>
        selectedProjectIds.includes(b.projectId) &&
        b.status === 'closed' &&
        (b.updatedAt || 0) >= startDate
    )

    // Aggregate per developer
    const devMap = new Map<
      string,
      { tasksCompleted: number; bugsResolved: number; totalDevPoints: number }
    >()

    filteredTasks.forEach(t => {
      if (!t.developer) return
      const entry = devMap.get(t.developer) || { tasksCompleted: 0, bugsResolved: 0, totalDevPoints: 0 }
      entry.tasksCompleted++
      entry.totalDevPoints += t.devPoints || 0
      devMap.set(t.developer, entry)
    })

    filteredBugs.forEach(b => {
      if (!b.assignedTo) return
      const entry = devMap.get(b.assignedTo) || { tasksCompleted: 0, bugsResolved: 0, totalDevPoints: 0 }
      entry.bugsResolved++
      devMap.set(b.assignedTo, entry)
    })

    return Array.from(devMap.entries())
      .map(([userId, data]) => {
        const user = users.find(u => u.uid === userId)
        const achievementCount = allAchievements[userId]
          ? Object.keys(allAchievements[userId]).length
          : 0
        const totalPoints = data.totalDevPoints + data.bugsResolved * 3 + achievementCount * 5
        return {
          userId,
          displayName: user?.displayName || 'Sin nombre',
          photoURL: user?.photoURL,
          tasksCompleted: data.tasksCompleted,
          bugsResolved: data.bugsResolved,
          totalPoints,
          achievementCount,
        }
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
  }, [tasks, bugs, users, selectedProjectIds, period, allAchievements])

  if (selectedProjectIds.length === 0) return null

  const getRankClass = (index: number) => {
    if (index === 0) return styles.rankGold
    if (index === 1) return styles.rankSilver
    if (index === 2) return styles.rankBronze
    return styles.rankDefault
  }

  const getEntryClass = (index: number, userId: string) => {
    const classes = [styles.entry]
    if (index === 0) classes.push(styles.entryTop1)
    else if (index === 1) classes.push(styles.entryTop2)
    else if (index === 2) classes.push(styles.entryTop3)
    if (userId === currentUserId) classes.push(styles.entryCurrent)
    return classes.join(' ')
  }

  return (
    <Card>
      <CardContent>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.title}>Leaderboard</span>
            <div className={styles.periodTabs}>
              {(['monthly', 'quarterly', 'all'] as Period[]).map(p => (
                <button
                  key={p}
                  className={`${styles.periodTab} ${period === p ? styles.periodTabActive : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === 'monthly' ? 'Mes' : p === 'quarterly' ? 'Trimestre' : 'Total'}
                </button>
              ))}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className={styles.empty}>No hay datos para el periodo seleccionado</div>
          ) : (
            <div className={styles.list}>
              {leaderboard.map((entry, index) => (
                <div key={entry.userId} className={getEntryClass(index, entry.userId)}>
                  <div className={`${styles.rank} ${getRankClass(index)}`}>{index + 1}</div>

                  {entry.photoURL ? (
                    <img src={entry.photoURL} alt={entry.displayName} className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={styles.info}>
                    <div className={styles.name}>{entry.displayName}</div>
                    <div className={styles.details}>
                      {entry.tasksCompleted} tareas &middot; {entry.bugsResolved} bugs &middot;{' '}
                      {entry.achievementCount} logros
                    </div>
                  </div>

                  <div>
                    <div className={styles.points}>{entry.totalPoints}</div>
                    <span className={styles.pointsLabel}>puntos</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
