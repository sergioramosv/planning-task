'use client'

import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import styles from './NotificationModal.module.css'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { user } = useAuth()
  const { notifications, loading, markAsRead, markAllAsRead, clearNotifications } = useNotifications(user?.uid || null)

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await markAsRead(id)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notificaciones"
      className={modalStyles.contentMd}
    >
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loading}>
            <p>Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className={styles.empty}>
            <Bell className={styles.emptyIcon} />
            <p>No tienes notificaciones nuevas</p>
          </div>
        ) : (
          <>
            <div className={styles.actions}>
              <button
                onClick={() => markAllAsRead()}
                className={styles.actionButton}
              >
                <Check size={14} /> Marcar todas leídas
              </button>
              <button
                onClick={() => clearNotifications()}
                className={`${styles.actionButton} ${styles.actionButtonDelete}`}
              >
                <Trash2 size={14} /> Borrar todas
              </button>
            </div>

            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  className={`${styles.notification} ${
                    notification.read
                      ? styles.notificationRead
                      : styles.notificationUnread
                  }`}
                >
                  <div className={styles.notificationHeader}>
                    <h4
                      className={`${styles.notificationTitle} ${
                        !notification.read && styles.notificationTitleUnread
                      }`}
                    >
                      {notification.title}
                    </h4>
                    <span className={styles.notificationTime}>
                      {formatDistanceToNow(notification.date, { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  {!notification.read && (
                    <div className={styles.notificationAction}>
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className={styles.markAsReadButton}
                      >
                        Marcar como leída
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className={styles.footer}>
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          Cerrar
        </button>
      </div>
    </Modal>
  )
}
