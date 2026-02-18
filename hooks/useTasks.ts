'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { Task, Filters } from '@/types'
import { calculatePriority } from '@/lib/utils/calculations'
import { NotificationService } from '@/lib/services/notification.service'

export function useTasks(projectId: string | null, sprintId?: string | null, filters?: Filters) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setTasks([])
      setLoading(false)
      return
    }

    const tasksRef = ref(database, 'tasks')
    const unsubscribe = onValue(
      tasksRef,
      snapshot => {
        try {
          const data = snapshot.val()
          if (data) {
            let projectTasks = Object.values(data).filter((t: any) => t.projectId === projectId)

            if (sprintId) {
              projectTasks = projectTasks.filter((t: any) => t.sprintId === sprintId)
            }

            setTasks((projectTasks as Task[]).sort((a, b) => b.createdAt - a.createdAt))
          } else {
            setTasks([])
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
  }, [projectId, sprintId])

  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    if (filters) {
      if (filters.developers.length > 0) {
        result = result.filter(t => filters.developers.includes(t.developer))
      }
      if (filters.statuses.length > 0) {
        result = result.filter(t => filters.statuses.includes(t.status))
      }
      if (filters.searchText) {
        result = result.filter(t => t.title.toLowerCase().includes(filters.searchText.toLowerCase()))
      }
    }

    return result.sort((a, b) => b.priority - a.priority)
  }, [tasks, filters])

  const createTask = useCallback(
    async (
      taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'priority' | 'history'>,
      options?: { projectName?: string; creatorName?: string }
    ) => {
      try {
        const newTaskRef = push(ref(database, 'tasks'))
        const taskId = newTaskRef.key
        const priority = calculatePriority(taskData.bizPoints, taskData.devPoints)
        const task: Task = {
          ...taskData,
          id: taskId!,
          priority,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          history: {},
        }
        await update(ref(database), {
          [`tasks/${taskId}`]: task,
        })

        // Send notification to assigned developer
        try {
          if (options?.projectName && options?.creatorName) {
            await NotificationService.notifyTaskAssignment(
              taskData.developer,
              taskData.title,
              options.projectName,
              options.creatorName
            )
          }
        } catch (notifErr) {
          console.error('Error sending task notification:', notifErr)
          // Don't throw, task was created successfully
        }

        return taskId
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    []
  )

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedData = {
        ...updates,
        updatedAt: Date.now(),
      }
      if (updates.bizPoints || updates.devPoints) {
        const task = tasks.find(t => t.id === taskId)
        if (task) {
          updatedData.priority = calculatePriority(
            updates.bizPoints || task.bizPoints,
            updates.devPoints || task.devPoints
          )
        }
      }
      await update(ref(database, `tasks/${taskId}`), updatedData)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [tasks])

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await remove(ref(database, `tasks/${taskId}`))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const addTaskHistory = useCallback(
    async (taskId: string, historyEntry: Omit<Task['history'][string], 'id'>) => {
      try {
        const historyId = push(ref(database, 'dummy')).key
        await update(ref(database, `tasks/${taskId}/history`), {
          [historyId!]: historyEntry,
        })
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    []
  )

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    addTaskHistory,
  }
}
