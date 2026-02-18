'use client'

import { useState, useEffect, useCallback } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { Invitation } from '@/types/invitation'

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

      // Actualizar invitación a aceptada
      await update(ref(database, `invitations/${invitationId}`), {
        status: 'accepted',
        respondedAt: Date.now(),
      })

      // Agregar usuario a miembros del proyecto
      await update(ref(database, `projects/${projectId}/members`), { [userId]: true })
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
