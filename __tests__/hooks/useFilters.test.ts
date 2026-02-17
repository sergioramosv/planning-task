import { renderHook, act } from '@testing-library/react'
import { useFilters } from '@/hooks/useFilters'

describe('useFilters Hook', () => {
  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.filters.developers).toEqual([])
    expect(result.current.filters.sprints).toEqual([])
    expect(result.current.filters.statuses).toEqual([])
    expect(result.current.filters.searchText).toBe('')
  })

  it('should set developers', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setDevelopers(['dev1', 'dev2'])
    })
    expect(result.current.filters.developers).toEqual(['dev1', 'dev2'])
  })

  it('should set sprints', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setSprints(['sprint1'])
    })
    expect(result.current.filters.sprints).toEqual(['sprint1'])
  })

  it('should set statuses', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setStatuses(['to-do', 'in-progress'])
    })
    expect(result.current.filters.statuses).toEqual(['to-do', 'in-progress'])
  })

  it('should set search text', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setSearchText('test search')
    })
    expect(result.current.filters.searchText).toBe('test search')
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setDevelopers(['dev1'])
      result.current.setSprints(['sprint1'])
      result.current.setStatuses(['to-do'])
      result.current.setSearchText('search')
    })
    act(() => {
      result.current.clearFilters()
    })
    expect(result.current.filters.developers).toEqual([])
    expect(result.current.filters.sprints).toEqual([])
    expect(result.current.filters.statuses).toEqual([])
    expect(result.current.filters.searchText).toBe('')
  })

  it('should count active filters correctly', () => {
    const { result } = renderHook(() => useFilters())
    expect(result.current.activeCount).toBe(0)

    act(() => {
      result.current.setDevelopers(['dev1'])
    })
    expect(result.current.activeCount).toBe(1)

    act(() => {
      result.current.setSprints(['sprint1'])
    })
    expect(result.current.activeCount).toBe(2)

    act(() => {
      result.current.setStatuses(['to-do'])
    })
    expect(result.current.activeCount).toBe(3)

    act(() => {
      result.current.setSearchText('search')
    })
    expect(result.current.activeCount).toBe(4)
  })

  it('should handle clearing individual filters', () => {
    const { result } = renderHook(() => useFilters())
    act(() => {
      result.current.setDevelopers(['dev1', 'dev2'])
      result.current.setSprints(['sprint1'])
    })
    act(() => {
      result.current.setDevelopers([])
    })
    expect(result.current.filters.developers).toEqual([])
    expect(result.current.filters.sprints).toEqual(['sprint1'])
  })
})
