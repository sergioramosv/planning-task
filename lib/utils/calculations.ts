import { Task } from '@/types'

export const calculatePriority = (bizPoints: number, devPoints: number): number => {
  return Math.round((bizPoints / (devPoints || 1)) * 10) / 10
}

export const calculateSprintProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0
  const completed = tasks.filter(t => t.status === 'done').length
  return (completed / tasks.length) * 100
}

export const calculateDeveloperLoad = (tasks: Task[], developerId: string): number => {
  return tasks
    .filter(t => t.developer === developerId && t.status !== 'done')
    .reduce((sum, t) => sum + t.devPoints, 0)
}

export const calculateProjectMetrics = (tasks: Task[]) => {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const pending = tasks.filter(t => t.status === 'to-do').length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const toValidate = tasks.filter(t => t.status === 'to-validate').length
  const validated = tasks.filter(t => t.status === 'validated').length

  return {
    total,
    completed,
    pending,
    inProgress,
    toValidate,
    validated,
    completionPercentage: total > 0 ? (completed / total) * 100 : 0,
  }
}

export const getDeveloperMetrics = (tasks: Task[]) => {
  const developerMap: Record<string, { load: number; completed: number; pending: number }> = {}

  tasks.forEach(task => {
    if (!task.developer) return
    if (!developerMap[task.developer]) {
      developerMap[task.developer] = { load: 0, completed: 0, pending: 0 }
    }

    if (task.status === 'done') {
      developerMap[task.developer].completed += 1
    } else if (task.status === 'to-do') {
      developerMap[task.developer].pending += 1
    }

    if (task.status !== 'done') {
      developerMap[task.developer].load += task.devPoints
    }
  })

  return developerMap
}
