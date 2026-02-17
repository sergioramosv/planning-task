export type SprintStatus = 'planned' | 'active' | 'completed'

export interface Sprint {
  id: string
  name: string
  projectId: string
  startDate: string
  endDate: string
  status: SprintStatus
  createdAt: number
  createdBy: string
}
