'use client'

import { useState, useEffect, useCallback } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, update, remove, push } from 'firebase/database'
import { Notification } from '@/types'
import { getUserFriendlyError } from '@/lib/utils/errorHandler'

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setLoading(false)
      return
    }

    const notificationsRef = ref(database, `notifications/${userId}`)
    const unsubscribe = onValue(
      notificationsRef,
      snapshot => {
        try {
          const data = snapshot.val()
          if (data) {
            const notificationsList = Object.entries(data).map(([key, value]: [string, any]) => ({
              ...value,
              id: key,
            })).sort((a, b) => b.date - a.date) // Sort by date descending
            setNotifications(notificationsList)
          } else {
            setNotifications([])
          }
          setError(null)
        } catch (err: any) {
          setError(getUserFriendlyError(err, 'useNotifications'))
        } finally {
          setLoading(false)
        }
      },
      error => {
        setError(getUserFriendlyError(error, 'useNotifications'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!userId) return

    try {
      await update(ref(database, `notifications/${userId}/${notificationId}`), {
        read: true,
      })
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'useNotifications'))
      throw err
    }
  }, [userId])

  const markAllAsRead = useCallback(async () => {
    if (!userId || notifications.length === 0) return

    try {
      const updates: { [key: string]: boolean } = {}
      notifications.forEach(n => {
        if (!n.read) {
          updates[`notifications/${userId}/${n.id}/read`] = true
        }
      })
      
      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates)
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'useNotifications'))
      throw err
    }
  }, [userId, notifications])

  const clearNotifications = useCallback(async () => {
    if (!userId) return

    try {
      await remove(ref(database, `notifications/${userId}`))
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'useNotifications'))
      throw err
    }
  }, [userId])

  // Helper to add a notification (can be used for testing or internal events)
  const addNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'userId' | 'date'>) => {
    if (!userId) return

    try {
      const newNotificationRef = push(ref(database, `notifications/${userId}`))
      await update(newNotificationRef, {
        ...notificationData,
        userId,
        date: Date.now(),
      })
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'useNotifications'))
      throw err
    }
  }, [userId])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    addNotification,
  }
}
