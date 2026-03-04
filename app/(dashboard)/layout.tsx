'use client'

import { useAuth } from '@/hooks/useAuth'
import { useVersionCheck } from '@/hooks/useVersionCheck'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Spinner from '@/components/ui/Spinner'
import Header from '@/components/dashboard/Header'
import NotificationPush from '@/components/dashboard/NotificationPush'
import UpdateNotification from '@/components/common/UpdateNotification'
import { Providers } from '@/components/Providers'
import styles from './layout.module.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { isUpdateAvailable, currentVersion, latestVersion, forceUpdate } = useVersionCheck(60)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Providers>
      <div className={styles.wrapper}>
        <Header />
        <NotificationPush />
        <main className={styles.main}>
          {children}
        </main>
        <UpdateNotification
          isOpen={isUpdateAvailable}
          currentVersion={currentVersion}
          latestVersion={latestVersion}
          onUpdate={forceUpdate}
        />
      </div>
    </Providers>
  )
}
