'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useInvitations } from '@/hooks/useInvitations'
import { LogOut, Bell, User as UserIcon, Mail, BarChart3, Users, Calendar, Sun, Moon, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import NotificationModal from './NotificationModal'
import ChangelogModal from './ChangelogModal'
import InvitationsModal from './InvitationsModal'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import Link from 'next/link'
import { APP_VERSION } from '@/lib/constants/appVersion'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './Header.module.css'

export default function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { unreadCount, notifications } = useNotifications(user?.uid || null)
  const { invitations, acceptInvitation, rejectInvitation } = useInvitations(user?.uid || null)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isInvitationsOpen, setIsInvitationsOpen] = useState(false)
  const [isChangelogOpen, setIsChangelogOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { t } = useLanguage()

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
              <div title={t('nav.dashboard')}>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                >
                  <BarChart3 size={16} style={{ marginRight: '0.25rem' }} />
                  {t('nav.dashboard')}
                </Button>
              </div>

              <div title={t('nav.calendar')}>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => router.push('/calendar')}
                >
                  <Calendar size={16} style={{ marginRight: '0.25rem' }} />
                  {t('nav.calendar')}
                </Button>
              </div>

              <div title={t('nav.team')}>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => router.push('/team')}
                >
                  <Users size={16} style={{ marginRight: '0.25rem' }} />
                  {t('nav.team')}
                </Button>
              </div>

              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                className={styles.notificationButton}
                aria-label={t('commandPalette.search')}
                title={`${t('commandPalette.search')} (Ctrl+K)`}
              >
                <Search size={20} />
              </button>

              <button
                onClick={toggleTheme}
                className={styles.notificationButton}
                aria-label={theme === 'light' ? t('common.settings') : t('common.settings')}
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <LanguageSwitcher />

              <button
                onClick={() => setIsInvitationsOpen(true)}
                className={styles.notificationButton}
                aria-label={t('invitations.title')}
                title={invitations.length > 0 ? `${invitations.length} ${t('invitations.title').toLowerCase()}` : t('invitations.noInvitations')}
              >
                <Mail size={20} />
                {invitations.length > 0 && (
                  <span className={styles.notificationBadge}>{invitations.length}</span>
                )}
              </button>

              <button
                onClick={() => setIsNotificationsOpen(true)}
                className={styles.notificationButton}
                aria-label={t('notifications.title')}
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
                    {user?.displayName || t('common.profile')}
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

      <InvitationsModal
        isOpen={isInvitationsOpen}
        onClose={() => setIsInvitationsOpen(false)}
        invitations={invitations}
        onAccept={acceptInvitation}
        onReject={rejectInvitation}
      />

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
