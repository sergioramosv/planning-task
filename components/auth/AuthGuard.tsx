'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'
import styles from './AuthGuard.module.css'

export default function AuthGuard() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/projects')
    }
  }, [user, loading, router])

  if (loading || user) {
    return (
      <div className={styles.container}>
        <Spinner />
        <p className={styles.text}>Redirigiendo...</p>
      </div>
    )
  }

  return null
}
