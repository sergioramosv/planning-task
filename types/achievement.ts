export type AchievementCategory = 'productivity' | 'quality' | 'collaboration' | 'consistency'

export type AchievementId =
  | 'first_task'
  | 'task_10'
  | 'task_50'
  | 'task_100'
  | 'sprint_champion'
  | 'speed_demon'
  | 'bug_hunter'
  | 'bug_squasher_10'
  | 'reviewer'
  | 'team_player'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'early_bird'

export interface AchievementDefinition {
  id: AchievementId
  title: string
  description: string
  icon: string
  category: AchievementCategory
  condition: {
    type: 'tasks_completed' | 'bugs_resolved' | 'reviews_done' | 'sprint_top' | 'daily_streak' | 'tasks_in_sprint' | 'speed_complete'
    threshold: number
  }
}

export interface UserAchievement {
  achievementId: AchievementId
  unlockedAt: number
  projectId: string
}

export interface UserAchievements {
  [achievementId: string]: UserAchievement
}

export interface LeaderboardEntry {
  userId: string
  displayName: string
  photoURL?: string
  tasksCompleted: number
  bugsResolved: number
  totalPoints: number
  achievementCount: number
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Productivity
  {
    id: 'first_task',
    title: 'Primera tarea',
    description: 'Completa tu primera tarea',
    icon: '🎯',
    category: 'productivity',
    condition: { type: 'tasks_completed', threshold: 1 },
  },
  {
    id: 'task_10',
    title: 'Productivo',
    description: 'Completa 10 tareas',
    icon: '⚡',
    category: 'productivity',
    condition: { type: 'tasks_completed', threshold: 10 },
  },
  {
    id: 'task_50',
    title: 'Imparable',
    description: 'Completa 50 tareas',
    icon: '🔥',
    category: 'productivity',
    condition: { type: 'tasks_completed', threshold: 50 },
  },
  {
    id: 'task_100',
    title: 'Centurion',
    description: 'Completa 100 tareas',
    icon: '💎',
    category: 'productivity',
    condition: { type: 'tasks_completed', threshold: 100 },
  },
  {
    id: 'sprint_champion',
    title: 'Sprint Champion',
    description: 'Completa mas tareas que nadie en un sprint',
    icon: '🏆',
    category: 'productivity',
    condition: { type: 'sprint_top', threshold: 1 },
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Completa 5 tareas en un mismo dia',
    icon: '💨',
    category: 'productivity',
    condition: { type: 'speed_complete', threshold: 5 },
  },
  // Quality
  {
    id: 'bug_hunter',
    title: 'Bug Hunter',
    description: 'Reporta tu primer bug',
    icon: '🐛',
    category: 'quality',
    condition: { type: 'bugs_resolved', threshold: 1 },
  },
  {
    id: 'bug_squasher_10',
    title: 'Bug Squasher',
    description: 'Resuelve 10 bugs',
    icon: '🛡️',
    category: 'quality',
    condition: { type: 'bugs_resolved', threshold: 10 },
  },
  {
    id: 'reviewer',
    title: 'Code Reviewer',
    description: 'Completa 5 revisiones de codigo',
    icon: '🔍',
    category: 'quality',
    condition: { type: 'reviews_done', threshold: 5 },
  },
  // Collaboration
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Colabora como co-developer en 5 tareas',
    icon: '🤝',
    category: 'collaboration',
    condition: { type: 'tasks_completed', threshold: 5 },
  },
  // Consistency
  {
    id: 'streak_3',
    title: 'En racha',
    description: 'Completa tareas 3 dias seguidos',
    icon: '📈',
    category: 'consistency',
    condition: { type: 'daily_streak', threshold: 3 },
  },
  {
    id: 'streak_7',
    title: 'Semana perfecta',
    description: 'Completa tareas 7 dias seguidos',
    icon: '🌟',
    category: 'consistency',
    condition: { type: 'daily_streak', threshold: 7 },
  },
  {
    id: 'streak_14',
    title: 'Maquina imparable',
    description: 'Completa tareas 14 dias seguidos',
    icon: '👑',
    category: 'consistency',
    condition: { type: 'daily_streak', threshold: 14 },
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Completa 10 tareas en un sprint',
    icon: '🐦',
    category: 'consistency',
    condition: { type: 'tasks_in_sprint', threshold: 10 },
  },
]

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  productivity: 'Productividad',
  quality: 'Calidad',
  collaboration: 'Colaboracion',
  consistency: 'Constancia',
}

export const ACHIEVEMENT_CATEGORY_COLORS: Record<AchievementCategory, string> = {
  productivity: '#7c3aed',
  quality: '#059669',
  collaboration: '#2563eb',
  consistency: '#d97706',
}
