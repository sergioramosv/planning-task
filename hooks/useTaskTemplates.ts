'use client'

import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { database } from '@/lib/firebase/config'
import { TaskTemplate } from '@/types'

export function useTaskTemplates(projectId: string) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setTemplates([])
      setLoading(false)
      return
    }

    const templatesRef = ref(database, 'task-templates')
    const unsubscribe = onValue(templatesRef, snapshot => {
      const data = snapshot.val()
      if (!data) {
        setTemplates([])
        setLoading(false)
        return
      }
      const all: TaskTemplate[] = Object.values(data)
      const filtered = all.filter(t => t.projectId === projectId)
      filtered.sort((a, b) => b.createdAt - a.createdAt)
      setTemplates(filtered)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [projectId])

  const createTemplate = useCallback(
    async (template: Omit<TaskTemplate, 'id' | 'createdAt'>) => {
      const templatesRef = ref(database, 'task-templates')
      const newRef = push(templatesRef)
      const id = newRef.key!
      const full: TaskTemplate = { ...template, id, createdAt: Date.now() }
      await update(ref(database), { [`task-templates/${id}`]: full })
      return full
    },
    []
  )

  const deleteTemplate = useCallback(async (templateId: string) => {
    await remove(ref(database, `task-templates/${templateId}`))
  }, [])

  return { templates, loading, createTemplate, deleteTemplate }
}
