import { useState, useEffect, useCallback } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, update } from 'firebase/database'
import {
  AchievementId,
  UserAchievement,
  ACHIEVEMENT_DEFINITIONS,
} from '@/types/achievement'

export function useAchievements(userId: string | null, projectId?: string | null) {
  const [achievements, setAchievements] = useState<Record<string, UserAchievement>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setAchievements({})
      setLoading(false)
      return
    }

    const achievementsRef = ref(database, `userAchievements/${userId}`)
    const unsubscribe = onValue(
      achievementsRef,
      (snapshot) => {
        const data = snapshot.val()
        setAchievements(data || {})
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const unlockAchievement = useCallback(
    async (achievementId: AchievementId, projId: string) => {
      if (!userId) return
      if (achievements[achievementId]) return // Already unlocked

      const achievement: UserAchievement = {
        achievementId,
        unlockedAt: Date.now(),
        projectId: projId,
      }

      await update(ref(database, `userAchievements/${userId}`), {
        [achievementId]: achievement,
      })
    },
    [userId, achievements]
  )

  const hasAchievement = useCallback(
    (achievementId: AchievementId) => {
      return !!achievements[achievementId]
    },
    [achievements]
  )

  const unlockedAchievements = Object.values(achievements)
  const totalUnlocked = unlockedAchievements.length
  const totalAvailable = ACHIEVEMENT_DEFINITIONS.length

  return {
    achievements,
    unlockedAchievements,
    totalUnlocked,
    totalAvailable,
    loading,
    unlockAchievement,
    hasAchievement,
  }
}
