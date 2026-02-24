import { adminDb } from '@/lib/firebase/admin'

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer'

const WRITE_ROLES: ProjectRole[] = ['owner', 'admin', 'member']

export interface ProjectAccess {
  role: ProjectRole
  canWrite: boolean
}

/**
 * Valida que un usuario es miembro de un proyecto y retorna su rol.
 * Soporta formato legacy (boolean) y formato nuevo (ProjectMember object).
 * Retorna null si el usuario no es miembro.
 */
export async function validateProjectAccess(
  uid: string,
  projectId: string
): Promise<ProjectAccess | null> {
  try {
    const snapshot = await adminDb.ref(`projects/${projectId}/members/${uid}`).once('value')
    const memberData = snapshot.val()

    if (!memberData) {
      return null
    }

    // Legacy format: members[uid] = true (treat as member)
    if (memberData === true) {
      return { role: 'member', canWrite: true }
    }

    // New format: members[uid] = { role, ... }
    const role: ProjectRole = memberData.role || 'member'
    return {
      role,
      canWrite: WRITE_ROLES.includes(role),
    }
  } catch {
    return null
  }
}
