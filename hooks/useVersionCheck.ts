'use client'

import { useState, useEffect, useCallback } from 'react'

interface VersionInfo {
  version: string
  name: string
  timestamp: string
}

export function useVersionCheck(intervalSeconds: number = 60) {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkVersion = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/version', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch version')
        return
      }

      const data: VersionInfo = await response.json()

      // Set current version from localStorage if not already set
      if (!currentVersion) {
        setCurrentVersion(data.version)
        localStorage.setItem('app-version', data.version)
      }

      // Compare versions
      const stored = localStorage.getItem('app-version')
      if (stored && data.version !== stored) {
        setLatestVersion(data.version)
        setIsUpdateAvailable(true)
      } else {
        setLatestVersion(data.version)
      }
    } catch (error) {
      console.error('Error checking version:', error)
    } finally {
      setLoading(false)
    }
  }, [currentVersion])

  // Initial check on mount
  useEffect(() => {
    checkVersion()
  }, [])

  // Periodic check
  useEffect(() => {
    const interval = setInterval(checkVersion, intervalSeconds * 1000)
    return () => clearInterval(interval)
  }, [checkVersion, intervalSeconds])

  const forceUpdate = useCallback(() => {
    window.location.reload()
  }, [])

  const dismissUpdate = useCallback(() => {
    if (currentVersion && latestVersion) {
      localStorage.setItem('app-version', latestVersion)
      setIsUpdateAvailable(false)
      setCurrentVersion(latestVersion)
    }
  }, [currentVersion, latestVersion])

  return {
    currentVersion,
    latestVersion,
    isUpdateAvailable,
    loading,
    checkVersion,
    forceUpdate,
    dismissUpdate,
  }
}
