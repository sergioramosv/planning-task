'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'
import styles from './UpdateNotification.module.css'

interface UpdateNotificationProps {
  isOpen: boolean
  currentVersion: string | null
  latestVersion: string | null
  onUpdate: () => void
}

export default function UpdateNotification({
  isOpen,
  currentVersion,
  latestVersion,
  onUpdate,
}: UpdateNotificationProps) {
  const [secondsLeft, setSecondsLeft] = useState(10)
  const [autoRefreshStarted, setAutoRefreshStarted] = useState(false)

  // Auto-refresh timer
  useEffect(() => {
    if (!isOpen || autoRefreshStarted) return

    const timer = setTimeout(() => {
      setAutoRefreshStarted(true)
      onUpdate()
    }, 10000)

    return () => clearTimeout(timer)
  }, [isOpen, autoRefreshStarted, onUpdate])

  // Countdown display
  useEffect(() => {
    if (!isOpen || autoRefreshStarted) return

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, autoRefreshStarted])

  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <AlertTriangle size={24} className={styles.icon} />
          <h2 className={styles.title}>Actualización Disponible</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>
            Una nueva versión de la aplicación está disponible.
          </p>

          <div className={styles.versions}>
            <div className={styles.versionItem}>
              <span className={styles.label}>Versión Actual:</span>
              <span className={styles.value}>{currentVersion}</span>
            </div>
            <div className={styles.arrow}>→</div>
            <div className={styles.versionItem}>
              <span className={styles.label}>Nueva Versión:</span>
              <span className={styles.valueNew}>{latestVersion}</span>
            </div>
          </div>

          <p className={styles.notice}>
            {autoRefreshStarted
              ? 'Actualizando...'
              : `Se actualizará automáticamente en ${secondsLeft} segundos`}
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            fullWidth
            onClick={onUpdate}
            disabled={autoRefreshStarted}
          >
            {autoRefreshStarted ? 'Actualizando...' : 'Actualizar Ahora'}
          </Button>
        </div>

        <div className={styles.timer}>
          <div
            className={styles.timerBar}
            style={{
              width: `${((10 - secondsLeft) / 10) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
