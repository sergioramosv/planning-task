import { useCallback, useEffect, useState } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, push, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { Epic } from '@/types/epic'
import { getUserFriendlyError } from '@/lib/utils/errorHandler'

export function useEpics(projectId: string | null) {
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setEpics([])
      setLoading(false)
      return
    }

    const epicsRef = ref(database, 'epics')
    const epicsQuery = query(epicsRef, orderByChild('projectId'), equalTo(projectId))

    const unsubscribe = onValue(
      epicsQuery,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const epicsList = Object.entries(data).map(([id, epicData]: [string, any]) => ({
            id,
            ...epicData,
            taskIds: epicData.taskIds || [],
          }))
          setEpics(epicsList.sort((a, b) => b.createdAt - a.createdAt))
        } else {
          setEpics([])
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching epics:', err)
        setError(getUserFriendlyError(err, 'useEpics'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [projectId])

  const createEpic = useCallback(
    async (epicData: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        const newRef = push(ref(database, 'epics'))
        const epicId = newRef.key

        await update(ref(database), {
          [`epics/${epicId}`]: {
            ...epicData,
            projectId,
            taskIds: epicData.taskIds || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        })

        return epicId!
      } catch (err) {
        setError(getUserFriendlyError(err, 'useEpics'))
        throw err
      }
    },
    [projectId]
  )

  const updateEpic = useCallback(
    async (epicId: string, updates: Partial<Epic>): Promise<void> => {
      try {
        await update(ref(database, `epics/${epicId}`), {
          ...updates,
          updatedAt: Date.now(),
        })
      } catch (err) {
        setError(getUserFriendlyError(err, 'useEpics'))
        throw err
      }
    },
    []
  )

  const deleteEpic = useCallback(
    async (epicId: string): Promise<void> => {
      try {
        await remove(ref(database, `epics/${epicId}`))
      } catch (err) {
        setError(getUserFriendlyError(err, 'useEpics'))
        throw err
      }
    },
    []
  )

  const addTaskToEpic = useCallback(
    async (epicId: string, taskId: string): Promise<void> => {
      const epic = epics.find(e => e.id === epicId)
      if (!epic) return
      const taskIds = [...(epic.taskIds || []), taskId]
      await updateEpic(epicId, { taskIds })
    },
    [epics, updateEpic]
  )

  const removeTaskFromEpic = useCallback(
    async (epicId: string, taskId: string): Promise<void> => {
      const epic = epics.find(e => e.id === epicId)
      if (!epic) return
      const taskIds = (epic.taskIds || []).filter(id => id !== taskId)
      await updateEpic(epicId, { taskIds })
    },
    [epics, updateEpic]
  )

  return {
    epics,
    loading,
    error,
    createEpic,
    updateEpic,
    deleteEpic,
    addTaskToEpic,
    removeTaskFromEpic,
  }
}
