'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Notification } from '@/types'
import styles from './NotificationPush.module.css'

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

export default function NotificationPush() {
  const { user } = useAuth()
  const { notifications, markAsRead } = useNotifications(user?.uid || null)
  const router = useRouter()
  const prevCountRef = useRef<number>(0)
  const prevIdsRef = useRef<Set<string>>(new Set())
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!user || notifications.length === 0) {
      // Initialize tracking on first load
      if (!initializedRef.current && notifications.length === 0) {
        initializedRef.current = true
      }
      return
    }

    // On first load, just track existing notifications without showing toasts
    if (!initializedRef.current) {
      prevIdsRef.current = new Set(notifications.map(n => n.id))
      prevCountRef.current = notifications.length
      initializedRef.current = true
      return
    }

    // Find new notifications that weren't in the previous set
    const currentIds = new Set(notifications.map(n => n.id))
    const newNotifications = notifications.filter(
      n => !prevIdsRef.current.has(n.id) && !n.read
    )

    // Show toast for each new notification
    newNotifications.forEach(notification => {
      showNotificationToast(notification)
    })

    prevIdsRef.current = currentIds
    prevCountRef.current = notifications.length
  }, [notifications, user])

  const showNotificationToast = (notification: Notification) => {
    const Icon = TYPE_ICONS[notification.type] || Bell
    const toastType = notification.type === 'error' ? 'error'
      : notification.type === 'warning' ? 'error'
      : 'success'

    toast.custom(
      (t) => (
        <div
          className={`${styles.toast} ${t.visible ? styles.toastVisible : styles.toastHidden}`}
          onClick={() => {
            markAsRead(notification.id)
            if (notification.link) {
              router.push(notification.link)
            }
            toast.dismiss(t.id)
          }}
        >
          <div className={`${styles.toastIcon} ${styles[`toastIcon${notification.type}`]}`}>
            <Icon size={18} />
          </div>
          <div className={styles.toastContent}>
            <strong className={styles.toastTitle}>{notification.title}</strong>
            <p className={styles.toastMessage}>{notification.message}</p>
          </div>
          <button
            className={styles.toastClose}
            onClick={(e) => {
              e.stopPropagation()
              toast.dismiss(t.id)
            }}
          >
            &times;
          </button>
        </div>
      ),
      {
        duration: 6000,
        position: 'top-right',
      }
    )
  }

  return <Toaster position="top-right" containerClassName={styles.toasterContainer} />
}
