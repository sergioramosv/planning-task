'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { LogOut, Bell, User as UserIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import NotificationModal from './NotificationModal'
import ChangelogModal from './ChangelogModal'
import Link from 'next/link'
import { APP_VERSION } from '@/lib/constants/appVersion'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout } = useAuth()
  const { unreadCount, notifications } = useNotifications(user?.uid || null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.branding}>
              <Link href="/projects" className={styles.brandLink}>
                <img src="/remoduler-logo.svg" alt="Planning Task Logo" className={styles.logoImage} />
                <div>
                  <span className={styles.brandText}>Planning Task</span>
                  <button
                    onClick={() => setIsChangelogOpen(true)}
                    className={styles.versionButton}
                    title="Ver historial de cambios"
                  >
                    v{APP_VERSION}
                  </button>
                </div>
              </Link>
            </div>

            <div className={styles.actions}>
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className={styles.notificationButton}
                aria-label="Notificaciones"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}></span>
                )}
              </button>

              <div className={styles.divider}></div>

              <Link href="/profile" className={styles.profileLink}>
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>
                    {user?.displayName || 'Usuario'}
                  </span>
                  <span className={styles.profileEmail}>
                    {user?.email}
                  </span>
                </div>

                <div className={styles.avatar}>
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <UserIcon size={16} />
                  )}
                </div>
              </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  <LogOut size={18} />
                </Button>
              </div>
            </div>
          </div>
      </header>

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </>
  )
}
