'use client'

import { useState, useEffect, useCallback } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, push, update, remove, get } from 'firebase/database'
import { Project } from '@/types'
import { getUserFriendlyError } from '@/lib/utils/errorHandler'

export function useProjects(userId: string | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setProjects([])
      setLoading(false)
      return
    }

    const projectsRef = ref(database, 'projects')
    const unsubscribe = onValue(
      projectsRef,
      snapshot => {
        try {
          const data = snapshot.val()
          if (data) {
            const userProjects = Object.values(data).filter((p: any) => p.members && p.members[userId])
            setProjects(userProjects as Project[])
          } else {
            setProjects([])
          }
          setError(null)
        } catch (err: any) {
          setError(getUserFriendlyError(err, 'useProjects'))
        } finally {
          setLoading(false)
        }
      },
      error => {
        setError(getUserFriendlyError(error, 'useProjects'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const createProject = useCallback(
    async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
      try {
        const newProjectRef = push(ref(database, 'projects'))
        const projectId = newProjectRef.key
        const project: Project = {
          ...projectData,
          id: projectId!,
          createdAt: Date.now(),
        }
        await update(ref(database), {
          [`projects/${projectId}`]: project,
        })
        return projectId
      } catch (err: any) {
        setError(getUserFriendlyError(err, 'useProjects'))
        throw err
      }
    },
    []
  )

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      await update(ref(database, `projects/${projectId}`), updates)
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'useProjects'))
      throw err
    }
  }, [])

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      // 1. Delete Project
      await remove(ref(database, `projects/${projectId}`))

      // 2. Delete Associated Tasks
      const tasksSnapshot = await get(ref(database, 'tasks'))
      if (tasksSnapshot.exists()) {
        const tasks = tasksSnapshot.val()
        const tasksToDelete = Object.keys(tasks).filter(key => tasks[key].projectId === projectId)
        
        const updates: { [key: string]: null } = {}
        tasksToDelete.forEach(taskId => {
          updates[`tasks/${taskId}`] = null
        })
        
        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates)
        }
      }

      // 3. Delete Associated Sprints
      const sprintsSnapshot = await get(ref(database, 'sprints'))
      if (sprintsSnapshot.exists()) {
        const sprints = sprintsSnapshot.val()
        const sprintsToDelete = Object.keys(sprints).filter(key => sprints[key].projectId === projectId)
        
        const updates: { [key: string]: null } = {}
        sprintsToDelete.forEach(sprintId => {
          updates[`sprints/${sprintId}`] = null
        })
        
        if (Object.keys(updates).length > 0) {
          await update(ref(database), updates)
        }
      }

    } catch (err: any) {
      setError(getUserFriendlyError(err, 'useProjects'))
      throw err
    }
  }, [])

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  }
}
