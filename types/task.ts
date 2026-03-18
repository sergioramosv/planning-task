export type TaskStatus = 'to-do' | 'in-progress' | 'to-validate' | 'validated' | 'done'
export type FibonacciPoint = 1 | 2 | 3 | 5 | 8 | 13
export type ImplementationPlanStatus = 'pending' | 'in-progress' | 'done'

export interface UserStory {
  who: string
  what: string
  why: string
}

export interface ImplementationPlan {
  status: ImplementationPlanStatus
  approach: string
  steps: string[]
  dataModelChanges: string
  apiChanges: string
  risks: string
  outOfScope: string
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  storagePath: string
  uploadedAt: number
  uploadedBy: string
}

export interface TaskHistory {
  id: string
  timestamp: number
  userId: string
  userName: string
  field: string
  oldValue: any
  newValue: any
  action: 'create' | 'update' | 'delete'
}

export interface Task {
  id: string
  title: string
  projectId: string
  sprintId?: string
  acceptanceCriteria: string[]
  userStory: UserStory
  developer?: string
  coDeveloper?: string
  startDate?: string
  endDate?: string
  bizPoints: number
  devPoints: FibonacciPoint
  priority: number
  status: TaskStatus
  createdAt: number
  updatedAt: number
  createdBy: string
  createdByName?: string
  history: Record<string, TaskHistory>
  implementationPlan?: ImplementationPlan
  attachments?: TaskAttachment[]
  parentTaskId?: string
  subtaskIds?: string[]
}
