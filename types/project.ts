export type ProjectStatus = 'planned' | 'active' | 'completed' | 'archived'
export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'
export type RepositoryType = 'front' | 'back' | 'api' | 'fullstack'

export interface ProjectMember {
  userId: string
  role: ProjectRole
  addedAt: number
  addedBy: string
}

export interface ProjectRepository {
  url: string
  type: RepositoryType
  isDefault: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: ProjectStatus
  createdAt: number
  createdBy: string
  members: Record<string, boolean | ProjectMember> // Support both old format and new
  repositories?: ProjectRepository[]
  languages?: string
  frameworks?: string
}

// Permission levels for different actions
export const ROLE_PERMISSIONS: Record<ProjectRole, {
  canEditProject: boolean
  canDeleteProject: boolean
  canManageMembers: boolean
  canCreateSprint: boolean
  canEditSprint: boolean
  canDeleteSprint: boolean
  canCreateTask: boolean
  canEditTask: boolean
  canDeleteTask: boolean
  canCreateBug: boolean
  canEditBug: boolean
  canDeleteBug: boolean
  canCreateProposal: boolean
  canApproveProposal: boolean
  canRejectProposal: boolean
  canAccessDashboard: boolean
  canAccessTeam: boolean
}> = {
  owner: {
    canEditProject: true,
    canDeleteProject: true,
    canManageMembers: true,
    canCreateSprint: true,
    canEditSprint: true,
    canDeleteSprint: true,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canCreateBug: true,
    canEditBug: true,
    canDeleteBug: true,
    canCreateProposal: true,
    canApproveProposal: true,
    canRejectProposal: true,
    canAccessDashboard: true,
    canAccessTeam: true,
  },
  admin: {
    canEditProject: true,
    canDeleteProject: false,
    canManageMembers: true,
    canCreateSprint: true,
    canEditSprint: true,
    canDeleteSprint: true,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canCreateBug: true,
    canEditBug: true,
    canDeleteBug: true,
    canCreateProposal: true,
    canApproveProposal: true,
    canRejectProposal: true,
    canAccessDashboard: true,
    canAccessTeam: true,
  },
  member: {
    canEditProject: false,
    canDeleteProject: false,
    canManageMembers: false,
    canCreateSprint: true,
    canEditSprint: true,
    canDeleteSprint: false,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canCreateBug: true,
    canEditBug: true,
    canDeleteBug: false,
    canCreateProposal: true,
    canApproveProposal: false,
    canRejectProposal: false,
    canAccessDashboard: true,
    canAccessTeam: true,
  },
  viewer: {
    canEditProject: false,
    canDeleteProject: false,
    canManageMembers: false,
    canCreateSprint: false,
    canEditSprint: false,
    canDeleteSprint: false,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canCreateBug: false,
    canEditBug: false,
    canDeleteBug: false,
    canCreateProposal: false,
    canApproveProposal: false,
    canRejectProposal: false,
    canAccessDashboard: true,
    canAccessTeam: false,
  },
}
