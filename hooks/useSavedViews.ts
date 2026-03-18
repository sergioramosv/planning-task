'use client'

import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { database } from '@/lib/firebase/config'
import { SavedView, SavedViewFilters } from '@/types'

export function useSavedViews(projectId: string, userId: string | undefined) {
  const [views, setViews] = useState<SavedView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId || !userId) {
      setViews([])
      setLoading(false)
      return
    }

    const viewsRef = ref(database, 'saved-views')
    const unsubscribe = onValue(viewsRef, snapshot => {
      const data = snapshot.val()
      if (!data) {
        setViews([])
        setLoading(false)
        return
      }

      const allViews: SavedView[] = Object.values(data)
      const filtered = allViews.filter(
        v => v.projectId === projectId && (v.userId === userId || v.shared)
      )
      filtered.sort((a, b) => b.createdAt - a.createdAt)
      setViews(filtered)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [projectId, userId])

  const saveView = useCallback(
    async (name: string, filters: SavedViewFilters, shared: boolean = false) => {
      if (!userId || !projectId) return
      const viewsRef = ref(database, 'saved-views')
      const newRef = push(viewsRef)
      const id = newRef.key!
      const now = Date.now()
      const view: SavedView = {
        id,
        name,
        userId,
        projectId,
        filters,
        shared,
        createdAt: now,
        updatedAt: now,
      }
      await update(ref(database), { [`saved-views/${id}`]: view })
      return view
    },
    [userId, projectId]
  )

  const deleteView = useCallback(async (viewId: string) => {
    await remove(ref(database, `saved-views/${viewId}`))
  }, [])

  return { views, loading, saveView, deleteView }
}
