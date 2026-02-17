'use client'

import { useState, useCallback, useMemo } from 'react'
import { Filters, TaskStatus } from '@/types'

const initialFilters: Filters = {
  developers: [],
  sprints: [],
  statuses: [],
  searchText: '',
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(initialFilters)

  const setDevelopers = useCallback((developers: string[]) => {
    setFilters(prev => ({ ...prev, developers }))
  }, [])

  const setSprints = useCallback((sprints: string[]) => {
    setFilters(prev => ({ ...prev, sprints }))
  }, [])

  const setStatuses = useCallback((statuses: TaskStatus[]) => {
    setFilters(prev => ({ ...prev, statuses }))
  }, [])

  const setSearchText = useCallback((searchText: string) => {
    setFilters(prev => ({ ...prev, searchText }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const activeCount = useMemo(() => {
    let count = 0
    if (filters.developers.length > 0) count++
    if (filters.sprints.length > 0) count++
    if (filters.statuses.length > 0) count++
    if (filters.searchText) count++
    return count
  }, [filters])

  return {
    filters,
    setDevelopers,
    setSprints,
    setStatuses,
    setSearchText,
    clearFilters,
    activeCount,
  }
}
