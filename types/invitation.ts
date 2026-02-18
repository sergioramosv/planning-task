export type InvitationStatus = 'pending' | 'accepted' | 'rejected'

export interface Invitation {
  id: string
  projectId: string
  projectName: string
  projectCreatorId: string
  projectCreatorName: string
  invitedUserId: string
  invitedUserEmail: string
  status: InvitationStatus
  createdAt: number
  respondedAt?: number
}
