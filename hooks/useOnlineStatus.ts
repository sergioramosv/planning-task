import { useState, useEffect, useRef } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue } from 'firebase/database'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const prevOnline = useRef(true)

  useEffect(() => {
    // Listen to Firebase connection state
    const connectedRef = ref(database, '.info/connected')
    const unsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true
      setIsOnline(connected)

      // Detect reconnection (was offline, now online)
      if (connected && !prevOnline.current) {
        setWasOffline(true)
      }
      prevOnline.current = connected
    })

    // Also listen to browser online/offline events as fallback
    const handleOnline = () => {
      // Firebase will handle the actual reconnection
    }
    const handleOffline = () => {
      setIsOnline(false)
      prevOnline.current = false
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      unsubscribe()
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const clearReconnected = () => setWasOffline(false)

  return { isOnline, wasOffline, clearReconnected }
}
