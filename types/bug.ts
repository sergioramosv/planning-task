export type BugStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
export type BugSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface BugAttachment {
  id: string
  name: string
  url: string
  uploadedAt: number
  uploadedBy: string
}

export interface Bug {
  id: string
  title: string
  description: string
  projectId: string
  attachments: BugAttachment[]
  severity: BugSeverity
  status: BugStatus
  assignedTo?: string
  createdAt: number
  updatedAt: number
  createdBy: string
  createdByName?: string
}
