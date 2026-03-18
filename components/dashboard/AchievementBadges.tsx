'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import {
  AchievementCategory,
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_CATEGORY_LABELS,
  ACHIEVEMENT_CATEGORY_COLORS,
  UserAchievement,
} from '@/types/achievement'
import styles from './AchievementBadges.module.css'

interface AchievementBadgesProps {
  achievements: Record<string, UserAchievement>
  loading?: boolean
}

export default function AchievementBadges({ achievements, loading }: AchievementBadgesProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all')

  const totalUnlocked = Object.keys(achievements).length
  const totalAvailable = ACHIEVEMENT_DEFINITIONS.length
  const progressPercent = totalAvailable > 0 ? (totalUnlocked / totalAvailable) * 100 : 0

  const filteredDefinitions = useMemo(() => {
    if (selectedCategory === 'all') return ACHIEVEMENT_DEFINITIONS
    return ACHIEVEMENT_DEFINITIONS.filter(d => d.category === selectedCategory)
  }, [selectedCategory])

  if (loading) return null

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const isNew = (timestamp: number) => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000
    return timestamp > dayAgo
  }

  const categories: (AchievementCategory | 'all')[] = ['all', 'productivity', 'quality', 'collaboration', 'consistency']

  return (
    <Card>
      <CardContent>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.title}>Logros</span>
            <span className={styles.counter}>
              {totalUnlocked}/{totalAvailable}
            </span>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
          </div>

          <div className={styles.categoryTabs}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryTab} ${selectedCategory === cat ? styles.categoryTabActive : ''}`}
                style={
                  selectedCategory === cat && cat !== 'all'
                    ? { background: ACHIEVEMENT_CATEGORY_COLORS[cat as AchievementCategory] }
                    : selectedCategory === cat && cat === 'all'
                    ? { background: '#6b7280', color: 'white' }
                    : {}
                }
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'Todos' : ACHIEVEMENT_CATEGORY_LABELS[cat as AchievementCategory]}
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {filteredDefinitions.map(def => {
              const unlocked = achievements[def.id]
              return (
                <div
                  key={def.id}
                  className={`${styles.badge} ${!unlocked ? styles.badgeLocked : ''}`}
                  title={unlocked ? `Desbloqueado: ${formatDate(unlocked.unlockedAt)}` : def.description}
                >
                  {unlocked && isNew(unlocked.unlockedAt) && <div className={styles.newBadge} />}
                  <span className={styles.badgeIcon}>{def.icon}</span>
                  <span className={styles.badgeTitle}>{def.title}</span>
                  <span className={styles.badgeDesc}>{def.description}</span>
                  {unlocked && (
                    <span className={styles.unlockedDate}>{formatDate(unlocked.unlockedAt)}</span>
                  )}
                </div>
              )
            })}
          </div>

          {filteredDefinitions.length === 0 && (
            <div className={styles.empty}>No hay logros en esta categoria</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
