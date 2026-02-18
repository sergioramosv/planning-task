'use client'

import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { Project, ProjectRole, ROLE_PERMISSIONS, ProjectMember } from '@/types/project'

export function usePermissions(project: Project | null | undefined) {
  const { user } = useAuth()

  const { role, permissions } = useMemo(() => {
    if (!project || !user?.uid) {
      return {
        role: null,
        permissions: Object.keys(ROLE_PERMISSIONS.viewer).reduce(
          (acc, key) => ({ ...acc, [key]: false }),
          {} as typeof ROLE_PERMISSIONS.viewer
        ),
      }
    }

    // Determine user role in project
    const memberData = project.members[user.uid]

    // Support both old boolean format and new ProjectMember format
    let userRole: ProjectRole = 'viewer'

    if (typeof memberData === 'object' && memberData !== null) {
      userRole = (memberData as ProjectMember).role
    } else if (memberData === true) {
      // Old format: determine role based on createdBy
      userRole = project.createdBy === user.uid ? 'owner' : 'member'
    }

    return {
      role: userRole,
      permissions: ROLE_PERMISSIONS[userRole],
    }
  }, [project, user?.uid])

  return {
    role,
    permissions,
    canEditProject: permissions.canEditProject,
    canDeleteProject: permissions.canDeleteProject,
    canManageMembers: permissions.canManageMembers,
    canCreateSprint: permissions.canCreateSprint,
    canEditSprint: permissions.canEditSprint,
    canDeleteSprint: permissions.canDeleteSprint,
    canCreateTask: permissions.canCreateTask,
    canEditTask: permissions.canEditTask,
    canDeleteTask: permissions.canDeleteTask,
    canCreateBug: permissions.canCreateBug,
    canEditBug: permissions.canEditBug,
    canDeleteBug: permissions.canDeleteBug,
    canCreateProposal: permissions.canCreateProposal,
    canApproveProposal: permissions.canApproveProposal,
    canRejectProposal: permissions.canRejectProposal,
    canAccessDashboard: permissions.canAccessDashboard,
    canAccessTeam: permissions.canAccessTeam,
  }
}
