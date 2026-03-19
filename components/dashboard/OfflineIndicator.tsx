'use client'

import { useEffect } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { WifiOff, Wifi } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './OfflineIndicator.module.css'

export default function OfflineIndicator() {
  const { isOnline, wasOffline, clearReconnected } = useOnlineStatus()

  useEffect(() => {
    if (wasOffline) {
      toast.success(
        (t) => (
          <span
            onClick={() => toast.dismiss(t.id)}
            style={{ cursor: 'pointer' }}
          >
            Conexion restaurada. Cambios sincronizados.
          </span>
        ),
        {
          icon: '🔄',
          duration: 4000,
        }
      )
      clearReconnected()
    }
  }, [wasOffline, clearReconnected])

  if (isOnline) return null

  return (
    <div className={styles.indicator} title="Sin conexion - Modo offline activo">
      <WifiOff size={16} />
      <span className={styles.label}>Offline</span>
    </div>
  )
}
