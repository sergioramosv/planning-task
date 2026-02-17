export type ProjectStatus = 'planned' | 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: ProjectStatus
  createdAt: number
  createdBy: string
  members: Record<string, boolean>
}
