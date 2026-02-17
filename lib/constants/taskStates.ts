import { TaskStatus } from '@/types'

export const TASK_STATUSES: TaskStatus[] = ['to-do', 'in-progress', 'to-validate', 'validated', 'done']

export const TASK_STATUS_COLORS: Record<TaskStatus, { bg: string; text: string; border: string }> = {
  'to-do': { bg: 'bg-neutral-100', text: 'text-neutral-700', border: 'border-neutral-300' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'to-validate': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'validated': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'done': { bg: 'bg-primary-100', text: 'text-primary-700', border: 'border-primary-300' },
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  'to-do': 'to-do',
  'in-progress': 'in-progress',
  'to-validate': 'to-validate',
  'validated': 'validated',
  'done': 'done',
}
