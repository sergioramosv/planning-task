import { renderHook, act, waitFor } from '@testing-library/react'
import { useInvitations } from '@/hooks/useInvitations'

// Mock firebase/database
const mockOnValue = jest.fn()
const mockPush = jest.fn()
const mockUpdate = jest.fn()
const mockGet = jest.fn()
const mockRef = jest.fn()

jest.mock('firebase/database', () => ({
  ref: (...args: any[]) => mockRef(...args),
  onValue: (...args: any[]) => mockOnValue(...args),
  push: (...args: any[]) => mockPush(...args),
  update: (...args: any[]) => mockUpdate(...args),
  get: (...args: any[]) => mockGet(...args),
}))

jest.mock('@/lib/firebase/config', () => ({
  database: {},
}))

jest.mock('@/lib/services/notification.service', () => ({
  NotificationService: {
    notifyProjectInvitation: jest.fn().mockResolvedValue('notif-id'),
  },
}))

describe('useInvitations - Role in Invitation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRef.mockReturnValue('mock-ref')
    // Default onValue: register callback, return unsubscribe
    mockOnValue.mockImplementation((_ref: any, callback: any) => {
      callback({ val: () => null })
      return jest.fn() // unsubscribe
    })
  })

  describe('sendInvitation', () => {
    it('should include role field when sending an invitation', async () => {
      mockPush.mockReturnValue({ key: 'inv-123' })
      mockUpdate.mockResolvedValue(undefined)

      const { result } = renderHook(() => useInvitations('user-1'))

      const invitationData = {
        projectId: 'project-1',
        projectName: 'Test Project',
        projectCreatorId: 'creator-1',
        projectCreatorName: 'Creator User',
        invitedUserId: 'invited-user-1',
        invitedUserEmail: 'invited@example.com',
        role: 'admin' as const,
        status: 'pending' as const,
      }

      await act(async () => {
        const invitationId = await result.current.sendInvitation(invitationData)
        expect(invitationId).toBe('inv-123')
      })

      // Verify update was called with data that includes the role field
      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-ref',
        expect.objectContaining({
          'invitations/inv-123': expect.objectContaining({
            role: 'admin',
            projectId: 'project-1',
            invitedUserId: 'invited-user-1',
            status: 'pending',
            id: 'inv-123',
          }),
        })
      )
    })

    it('should include role as member when sent with member role', async () => {
      mockPush.mockReturnValue({ key: 'inv-456' })
      mockUpdate.mockResolvedValue(undefined)

      const { result } = renderHook(() => useInvitations('user-1'))

      const invitationData = {
        projectId: 'project-2',
        projectName: 'Another Project',
        projectCreatorId: 'creator-2',
        projectCreatorName: 'Another Creator',
        invitedUserId: 'invited-user-2',
        invitedUserEmail: 'user2@example.com',
        role: 'member' as const,
        status: 'pending' as const,
      }

      await act(async () => {
        await result.current.sendInvitation(invitationData)
      })

      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-ref',
        expect.objectContaining({
          'invitations/inv-456': expect.objectContaining({
            role: 'member',
          }),
        })
      )
    })

    it('should set createdAt timestamp on the invitation', async () => {
      mockPush.mockReturnValue({ key: 'inv-789' })
      mockUpdate.mockResolvedValue(undefined)

      const beforeTimestamp = Date.now()

      const { result } = renderHook(() => useInvitations('user-1'))

      await act(async () => {
        await result.current.sendInvitation({
          projectId: 'project-3',
          projectName: 'Project 3',
          projectCreatorId: 'creator-3',
          projectCreatorName: 'Creator 3',
          invitedUserId: 'invited-user-3',
          invitedUserEmail: 'user3@example.com',
          role: 'viewer' as const,
          status: 'pending' as const,
        })
      })

      const updateCall = mockUpdate.mock.calls[0][1]
      const savedInvitation = updateCall['invitations/inv-789']
      expect(savedInvitation.createdAt).toBeGreaterThanOrEqual(beforeTimestamp)
      expect(savedInvitation.createdAt).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('acceptInvitation', () => {
    it('should read role from invitation and store ProjectMember with that role', async () => {
      mockUpdate.mockResolvedValue(undefined)
      mockGet.mockResolvedValue({
        val: () => ({
          id: 'inv-accept-1',
          projectId: 'project-1',
          projectName: 'Test Project',
          projectCreatorId: 'creator-1',
          projectCreatorName: 'Creator',
          invitedUserId: 'user-1',
          invitedUserEmail: 'user@example.com',
          role: 'admin',
          status: 'pending',
          createdAt: Date.now(),
        }),
      })

      const { result } = renderHook(() => useInvitations('user-1'))

      await act(async () => {
        await result.current.acceptInvitation('inv-accept-1', 'project-1')
      })

      // Should have read the invitation
      expect(mockGet).toHaveBeenCalledTimes(1)

      // Should update the invitation status to accepted
      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-ref',
        expect.objectContaining({
          status: 'accepted',
          respondedAt: expect.any(Number),
        })
      )

      // Should add user as project member with the role from the invitation
      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-ref',
        expect.objectContaining({
          'user-1': expect.objectContaining({
            userId: 'user-1',
            role: 'admin',
            addedAt: expect.any(Number),
            addedBy: 'creator-1',
          }),
        })
      )
    })

    it('should default to member role when invitation has no role', async () => {
      mockUpdate.mockResolvedValue(undefined)
      mockGet.mockResolvedValue({
        val: () => ({
          id: 'inv-no-role',
          projectId: 'project-2',
          projectName: 'Project 2',
          projectCreatorId: 'creator-2',
          projectCreatorName: 'Creator 2',
          invitedUserId: 'user-2',
          invitedUserEmail: 'user2@example.com',
          // No role field
          status: 'pending',
          createdAt: Date.now(),
        }),
      })

      const { result } = renderHook(() => useInvitations('user-2'))

      await act(async () => {
        await result.current.acceptInvitation('inv-no-role', 'project-2')
      })

      // Should add user with default 'member' role
      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-ref',
        expect.objectContaining({
          'user-2': expect.objectContaining({
            role: 'member',
          }),
        })
      )
    })

    it('should default to member role when invitation is null', async () => {
      mockUpdate.mockResolvedValue(undefined)
      mockGet.mockResolvedValue({
        val: () => null,
      })

      const { result } = renderHook(() => useInvitations('user-3'))

      await act(async () => {
        await result.current.acceptInvitation('inv-null', 'project-3')
      })

      // Should add user with default 'member' role and empty addedBy
      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-ref',
        expect.objectContaining({
          'user-3': expect.objectContaining({
            role: 'member',
            addedBy: '',
          }),
        })
      )
    })

    it('should throw error if no user is logged in', async () => {
      const { result } = renderHook(() => useInvitations(null))

      await expect(
        act(async () => {
          await result.current.acceptInvitation('inv-1', 'project-1')
        })
      ).rejects.toThrow('No user logged in')
    })

    it('should set addedBy from projectCreatorId of the invitation', async () => {
      mockUpdate.mockResolvedValue(undefined)
      mockGet.mockResolvedValue({
        val: () => ({
          id: 'inv-creator',
          projectId: 'project-4',
          projectName: 'Project 4',
          projectCreatorId: 'specific-creator-id',
          projectCreatorName: 'Specific Creator',
          invitedUserId: 'user-4',
          invitedUserEmail: 'user4@example.com',
          role: 'viewer',
          status: 'pending',
          createdAt: Date.now(),
        }),
      })

      const { result } = renderHook(() => useInvitations('user-4'))

      await act(async () => {
        await result.current.acceptInvitation('inv-creator', 'project-4')
      })

      expect(mockUpdate).toHaveBeenCalledWith(
        'mock-ref',
        expect.objectContaining({
          'user-4': expect.objectContaining({
            addedBy: 'specific-creator-id',
          }),
        })
      )
    })
  })

  describe('initialization', () => {
    it('should set invitations to empty and stop loading when userId is null', () => {
      const { result } = renderHook(() => useInvitations(null))

      expect(result.current.invitations).toEqual([])
      expect(result.current.loading).toBe(false)
    })

    it('should listen to invitations on mount when userId is provided', () => {
      renderHook(() => useInvitations('user-1'))

      expect(mockOnValue).toHaveBeenCalledTimes(1)
    })

    it('should filter invitations by userId and pending status', async () => {
      const mockData = {
        'inv-1': {
          id: 'inv-1',
          invitedUserId: 'user-1',
          status: 'pending',
          role: 'admin',
          createdAt: 1000,
        },
        'inv-2': {
          id: 'inv-2',
          invitedUserId: 'other-user',
          status: 'pending',
          role: 'member',
          createdAt: 2000,
        },
        'inv-3': {
          id: 'inv-3',
          invitedUserId: 'user-1',
          status: 'accepted',
          role: 'member',
          createdAt: 3000,
        },
      }

      mockOnValue.mockImplementation((_ref: any, callback: any) => {
        callback({ val: () => mockData })
        return jest.fn()
      })

      const { result } = renderHook(() => useInvitations('user-1'))

      await waitFor(() => {
        // Should only include inv-1 (matching userId and pending status)
        expect(result.current.invitations).toHaveLength(1)
        expect(result.current.invitations[0].id).toBe('inv-1')
      })
    })
  })
})
