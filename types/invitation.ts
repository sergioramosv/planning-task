import { ProjectRole } from './project'

export type InvitationStatus = 'pending' | 'accepted' | 'rejected'

export interface Invitation {
  id: string
  projectId: string
  projectName: string
  projectCreatorId: string
  projectCreatorName: string
  invitedUserId: string
  invitedUserEmail: string
  role: ProjectRole
  status: InvitationStatus
  createdAt: number
  respondedAt?: number
}
