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

export interface TimeEntry {
  id: string
  startTime: number
  endTime: number
  userId: string
  userName?: string
}

export interface LinkedPR {
  id: string
  number: number
  repo: string
  url: string
  title?: string
  status: 'open' | 'merged' | 'closed'
  branch?: string
  linkedAt: number
  linkedBy: string
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
  blockedBy?: string[]
  blocks?: string[]
  reviewChecklist?: ReviewChecklistItem[]
  timeEntries?: TimeEntry[]
  linkedPRs?: LinkedPR[]
  epicId?: string
}

export interface ReviewChecklistItem {
  id: string
  label: string
  checked: boolean
  checkedBy?: string
  checkedByName?: string
  checkedAt?: number
}

export type ReviewChecklistTemplate = 'frontend' | 'backend' | 'fullstack' | 'custom'

export const REVIEW_CHECKLIST_TEMPLATES: Record<Exclude<ReviewChecklistTemplate, 'custom'>, string[]> = {
  frontend: [
    'Code compiles without errors',
    'No console.log or debug statements',
    'Unit tests written and passing',
    'UI matches design / acceptance criteria',
    'Responsive design verified',
    'Accessibility basics checked (aria, alt, keyboard)',
    'No hardcoded strings (i18n ready)',
    'Peer review completed',
  ],
  backend: [
    'Code compiles without errors',
    'No console.log or debug statements',
    'Unit tests written and passing',
    'API endpoints documented',
    'Input validation implemented',
    'Error handling covers edge cases',
    'No security vulnerabilities (injection, auth)',
    'Database queries optimized',
    'Peer review completed',
  ],
  fullstack: [
    'Code compiles without errors',
    'No console.log or debug statements',
    'Unit tests written and passing',
    'UI matches acceptance criteria',
    'API endpoints working correctly',
    'Input validation on frontend and backend',
    'Error handling covers edge cases',
    'No security vulnerabilities',
    'Peer review completed',
  ],
}
