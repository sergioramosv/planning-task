'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ChangelogEntry } from '@/lib/utils/parseChangelog'

interface ChangelogResponse {
  exists: boolean
  content: string
  versions: ChangelogEntry[]
  message?: string
  error?: string
}

interface UseChangelogReturn {
  versions: ChangelogEntry[]
  loading: boolean
  error: Error | null
  exists: boolean
  refresh: () => Promise<void>
}

/**
 * Custom hook para cargar y cachear el changelog
 * Hace fetch a /api/changelog y retorna versiones parseadas
 */
export function useChangelog(): UseChangelogReturn {
  const [versions, setVersions] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [exists, setExists] = useState(false)

  const fetchChangelog = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/changelog', {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch changelog: ${response.statusText}`)
      }

      const data: ChangelogResponse = await response.json()

      setVersions(data.versions || [])
      setExists(data.exists)

      if (data.error) {
        console.warn('Changelog error:', data.error)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching changelog')
      setError(error)
      console.error('useChangelog error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChangelog()
  }, [fetchChangelog])

  return {
    versions,
    loading,
    error,
    exists,
    refresh: fetchChangelog,
  }
}
