'use client'

import { useEffect, useState } from 'react'
import { AchievementDefinition } from '@/types/achievement'
import styles from './AchievementToast.module.css'

interface AchievementToastProps {
  achievement: AchievementDefinition | null
  onDone: () => void
}

export default function AchievementToast({ achievement, onDone }: AchievementToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onDone()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [achievement, onDone])

  if (!visible || !achievement) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.toast}>
        <span className={styles.label}>Logro desbloqueado</span>
        <span className={styles.icon}>{achievement.icon}</span>
        <span className={styles.achievementTitle}>{achievement.title}</span>
        <span className={styles.description}>{achievement.description}</span>
      </div>
    </div>
  )
}
