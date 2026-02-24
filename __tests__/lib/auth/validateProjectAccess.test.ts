import { validateProjectAccess } from '@/lib/auth/validateProjectAccess'
import { adminDb } from '@/lib/firebase/admin'

// Mock Firebase Admin
jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    ref: jest.fn(),
  },
}))

describe('validateProjectAccess', () => {
  const mockRef = {
    once: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminDb.ref as jest.Mock).mockReturnValue(mockRef)
  })

  it('should return null when user is not a member of the project', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => null,
    })

    const result = await validateProjectAccess('user-123', 'project-456')

    expect(result).toBeNull()
    expect(adminDb.ref).toHaveBeenCalledWith('projects/project-456/members/user-123')
  })

  it('should return member role with canWrite=true for legacy format (true value)', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => true,
    })

    const result = await validateProjectAccess('user-123', 'project-456')

    expect(result).toEqual({
      role: 'member',
      canWrite: true,
    })
  })

  it('should return owner role with canWrite=true', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({ role: 'owner' }),
    })

    const result = await validateProjectAccess('owner-uid', 'project-789')

    expect(result).toEqual({
      role: 'owner',
      canWrite: true,
    })
  })

  it('should return admin role with canWrite=true', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({ role: 'admin' }),
    })

    const result = await validateProjectAccess('admin-uid', 'project-789')

    expect(result).toEqual({
      role: 'admin',
      canWrite: true,
    })
  })

  it('should return member role with canWrite=true', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({ role: 'member' }),
    })

    const result = await validateProjectAccess('member-uid', 'project-789')

    expect(result).toEqual({
      role: 'member',
      canWrite: true,
    })
  })

  it('should return viewer role with canWrite=false', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({ role: 'viewer' }),
    })

    const result = await validateProjectAccess('viewer-uid', 'project-789')

    expect(result).toEqual({
      role: 'viewer',
      canWrite: false,
    })
  })

  it('should default to member role when role is not specified', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({ someOtherField: 'value' }),
    })

    const result = await validateProjectAccess('user-uid', 'project-123')

    expect(result?.role).toBe('member')
    expect(result?.canWrite).toBe(true)
  })

  it('should handle Firebase database errors', async () => {
    mockRef.once.mockRejectedValueOnce(new Error('Database error'))

    const result = await validateProjectAccess('user-123', 'project-456')

    expect(result).toBeNull()
  })

  it('should query correct project member path', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({ role: 'member' }),
    })

    await validateProjectAccess('specific-user', 'specific-project')

    expect(adminDb.ref).toHaveBeenCalledWith('projects/specific-project/members/specific-user')
  })

  it('should correctly identify write permissions for all roles', async () => {
    const rolesWithWrite = ['owner', 'admin', 'member']
    const rolesWithoutWrite = ['viewer']

    for (const role of rolesWithWrite) {
      mockRef.once.mockResolvedValueOnce({
        val: () => ({ role }),
      })

      const result = await validateProjectAccess('user', 'project')
      expect(result?.canWrite).toBe(true)
    }

    for (const role of rolesWithoutWrite) {
      mockRef.once.mockResolvedValueOnce({
        val: () => ({ role }),
      })

      const result = await validateProjectAccess('user', 'project')
      expect(result?.canWrite).toBe(false)
    }
  })

  it('should handle member data with additional fields', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({
        role: 'admin',
        joinedAt: 1234567890,
        invitedBy: 'another-user',
      }),
    })

    const result = await validateProjectAccess('user-123', 'project-456')

    expect(result?.role).toBe('admin')
    expect(result?.canWrite).toBe(true)
  })

  it('should return null for empty object member data', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({}),
    })

    const result = await validateProjectAccess('user-123', 'project-456')

    // Empty object should be treated as member with default role
    expect(result?.role).toBe('member')
  })

  it('should handle case-sensitive role values', async () => {
    mockRef.once.mockResolvedValueOnce({
      val: () => ({ role: 'OWNER' }),
    })

    const result = await validateProjectAccess('user-123', 'project-456')

    // Role check is case-sensitive, OWNER != owner
    expect(result?.canWrite).toBe(false) // Not in the list of write roles
  })
})
