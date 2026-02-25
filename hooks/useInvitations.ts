'use client'

import { useState, useEffect, useCallback } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, push, update, get } from 'firebase/database'
import { Invitation } from '@/types/invitation'
import { NotificationService } from '@/lib/services/notification.service'

export function useInvitations(userId: string | null) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setInvitations([])
      setLoading(false)
      return
    }

    const invitationsRef = ref(database, 'invitations')
    const unsubscribe = onValue(
      invitationsRef,
      snapshot => {
        try {
          const data = snapshot.val()
          if (data) {
            const userInvitations = Object.values(data).filter(
              (inv: any) => inv.invitedUserId === userId && inv.status === 'pending'
            ) as Invitation[]
            setInvitations(userInvitations.sort((a, b) => b.createdAt - a.createdAt))
          } else {
            setInvitations([])
          }
          setError(null)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      error => {
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const sendInvitation = useCallback(
    async (invitation: Omit<Invitation, 'id' | 'createdAt'>) => {
      try {
        const newInvitationRef = push(ref(database, 'invitations'))
        const invitationId = newInvitationRef.key
        const invitationData: Invitation = {
          ...invitation,
          id: invitationId!,
          createdAt: Date.now(),
        }
        await update(ref(database), {
          [`invitations/${invitationId}`]: invitationData,
        })

        // Send notification to invited user
        try {
          await NotificationService.notifyProjectInvitation(
            invitation.invitedUserId,
            invitation.projectName,
            invitation.projectCreatorName
          )
        } catch (notifErr) {
          console.error('Error sending notification:', notifErr)
        }

        return invitationId
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    []
  )

  const acceptInvitation = useCallback(async (invitationId: string, projectId: string) => {
    try {
      if (!userId) {
        throw new Error('No user logged in')
      }

      // Read invitation to get the assigned role
      const invSnap = await get(ref(database, `invitations/${invitationId}`))
      const invitation = invSnap.val() as Invitation | null
      const role = invitation?.role || 'member'

      // Update invitation to accepted
      await update(ref(database, `invitations/${invitationId}`), {
        status: 'accepted',
        respondedAt: Date.now(),
      })

      // Add user to project members with role as ProjectMember
      await update(ref(database, `projects/${projectId}/members`), {
        [userId]: {
          userId,
          role,
          addedAt: Date.now(),
          addedBy: invitation?.projectCreatorId || '',
        },
      })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [userId])

  const rejectInvitation = useCallback(async (invitationId: string) => {
    try {
      await update(ref(database, `invitations/${invitationId}`), {
        status: 'rejected',
        respondedAt: Date.now(),
      })
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    invitations,
    loading,
    error,
    sendInvitation,
    acceptInvitation,
    rejectInvitation,
  }
}
