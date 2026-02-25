import { useCallback, useEffect, useState } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, push, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { Bug, BugStatus, BugSeverity } from '@/types/bug'
import { NotificationService } from '@/lib/services/notification.service'
import { getUserFriendlyError } from '@/lib/utils/errorHandler'

export function useBugs(projectId: string | null) {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!projectId) {
      setBugs([])
      setLoading(false)
      return
    }

    const bugsRef = ref(database, `bugs`)
    const bugsQuery = query(bugsRef, orderByChild('projectId'), equalTo(projectId))

    const unsubscribe = onValue(
      bugsQuery,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const bugsList = Object.entries(data).map(([id, bugData]: [string, any]) => ({
            id,
            ...bugData,
          }))
          setBugs(bugsList)
        } else {
          setBugs([])
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching bugs:', err)
        setError(getUserFriendlyError(err, 'useBugs'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [projectId])

  // Crear bug
  const createBug = useCallback(
    async (
      bugData: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>,
      options?: { projectName?: string; creatorName?: string }
    ): Promise<string> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        const newBugRef = push(ref(database, 'bugs'))
        const bugId = newBugRef.key

        await update(newBugRef, {
          ...bugData,
          projectId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        return bugId!
      } catch (err) {
        setError(getUserFriendlyError(err, 'useBugs'))
        throw err
      }
    },
    [projectId]
  )

  // Actualizar bug
  const updateBug = useCallback(
    async (bugId: string, updates: Partial<Bug>): Promise<void> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        await update(ref(database, `bugs/${bugId}`), {
          ...updates,
          updatedAt: Date.now(),
        })
      } catch (err) {
        setError(getUserFriendlyError(err, 'useBugs'))
        throw err
      }
    },
    [projectId]
  )

  // Eliminar bug
  const deleteBug = useCallback(
    async (bugId: string): Promise<void> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        await remove(ref(database, `bugs/${bugId}`))
      } catch (err) {
        setError(getUserFriendlyError(err, 'useBugs'))
        throw err
      }
    },
    [projectId]
  )

  return {
    bugs,
    loading,
    error,
    createBug,
    updateBug,
    deleteBug,
  }
}
