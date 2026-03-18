import { database } from '@/lib/firebase/config'
import { ref, get, update } from 'firebase/database'
import {
  AchievementId,
  AchievementDefinition,
  ACHIEVEMENT_DEFINITIONS,
  UserAchievement,
} from '@/types/achievement'
import { NotificationService } from './notification.service'

interface EvalContext {
  userId: string
  projectId: string
  tasksCompleted: number
  bugsResolved: number
}

export class AchievementService {
  static async evaluateAndUnlock(context: EvalContext): Promise<AchievementId[]> {
    const { userId, projectId, tasksCompleted, bugsResolved } = context

    // Get current achievements
    const snap = await get(ref(database, `userAchievements/${userId}`))
    const current: Record<string, UserAchievement> = snap.val() || {}

    const newlyUnlocked: AchievementId[] = []

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (current[def.id]) continue // Already unlocked

      let shouldUnlock = false

      switch (def.condition.type) {
        case 'tasks_completed':
          shouldUnlock = tasksCompleted >= def.condition.threshold
          break
        case 'bugs_resolved':
          shouldUnlock = bugsResolved >= def.condition.threshold
          break
        default:
          // Other types (sprint_top, daily_streak, etc.) require more complex evaluation
          // which can be added later
          break
      }

      if (shouldUnlock) {
        const achievement: UserAchievement = {
          achievementId: def.id,
          unlockedAt: Date.now(),
          projectId,
        }

        await update(ref(database, `userAchievements/${userId}`), {
          [def.id]: achievement,
        })

        newlyUnlocked.push(def.id)

        // Send notification
        try {
          await NotificationService.sendNotification(userId, {
            type: 'success',
            title: `Logro desbloqueado: ${def.icon} ${def.title}`,
            message: def.description,
            read: false,
          })
        } catch {
          // Silent fail on notification
        }
      }
    }

    return newlyUnlocked
  }

  static getDefinition(id: AchievementId): AchievementDefinition | undefined {
    return ACHIEVEMENT_DEFINITIONS.find(d => d.id === id)
  }
}
