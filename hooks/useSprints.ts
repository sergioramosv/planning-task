'use client'

import { useState, useEffect, useCallback } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { Sprint } from '@/types'

export function useSprints(projectId: string | null) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setSprints([])
      setLoading(false)
      return
    }

    const sprintsRef = ref(database, 'sprints')
    const unsubscribe = onValue(
      sprintsRef,
      snapshot => {
        try {
          const data = snapshot.val()
          if (data) {
            const projectSprints = Object.values(data).filter((s: any) => s.projectId === projectId)
            setSprints((projectSprints as Sprint[]).sort((a, b) => b.createdAt - a.createdAt))
          } else {
            setSprints([])
          }
          setError(null)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      error => {
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [projectId])

  const createSprint = useCallback(
    async (sprintData: Omit<Sprint, 'id' | 'createdAt'>) => {
      try {
        const newSprintRef = push(ref(database, 'sprints'))
        const sprintId = newSprintRef.key
        const sprint: Sprint = {
          ...sprintData,
          id: sprintId!,
          createdAt: Date.now(),
        }
        await update(ref(database), {
          [`sprints/${sprintId}`]: sprint,
        })
        return sprintId
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    []
  )

  const updateSprint = useCallback(async (sprintId: string, updates: Partial<Sprint>) => {
    try {
      await update(ref(database, `sprints/${sprintId}`), updates)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const deleteSprint = useCallback(async (sprintId: string) => {
    try {
      await remove(ref(database, `sprints/${sprintId}`))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  return {
    sprints,
    loading,
    error,
    createSprint,
    updateSprint,
    deleteSprint,
  }
}
