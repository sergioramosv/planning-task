import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage - View Mode Persistence', () => {
  const STORAGE_KEY = 'tasks-view-mode'

  beforeEach(() => {
    localStorage.clear()
  })

  it('should return the initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    expect(result.current[0]).toBe('kanban')
  })

  it('should read existing value from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify('list'))

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    expect(result.current[0]).toBe('list')
  })

  it('should persist changes to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    act(() => {
      result.current[1]('list')
    })

    expect(result.current[0]).toBe('list')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify('list'))
  })

  it('should update state when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    expect(result.current[0]).toBe('kanban')

    act(() => {
      result.current[1]('table')
    })

    expect(result.current[0]).toBe('table')
  })

  it('should persist multiple value changes', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    act(() => {
      result.current[1]('list')
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify('list'))

    act(() => {
      result.current[1]('table')
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify('table'))

    act(() => {
      result.current[1]('kanban')
    })
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify('kanban'))
  })

  it('should accept a function updater', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    act(() => {
      result.current[1]((prev) => (prev === 'kanban' ? 'list' : 'kanban'))
    })

    expect(result.current[0]).toBe('list')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify('list'))
  })

  it('should handle JSON parse errors and return initial value', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    localStorage.setItem(STORAGE_KEY, 'invalid-json{{{')

    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    expect(result.current[0]).toBe('kanban')

    consoleSpy.mockRestore()
  })

  it('should work with different initial values', () => {
    const { result: result1 } = renderHook(() => useLocalStorage(STORAGE_KEY, 'list'))
    expect(result1.current[0]).toBe('list')

    localStorage.clear()

    const { result: result2 } = renderHook(() => useLocalStorage(STORAGE_KEY, 'table'))
    expect(result2.current[0]).toBe('table')
  })

  it('should store values as JSON in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage(STORAGE_KEY, 'kanban'))

    act(() => {
      result.current[1]('list')
    })

    const raw = localStorage.getItem(STORAGE_KEY)
    expect(raw).toBe('"list"')
    expect(JSON.parse(raw!)).toBe('list')
  })
})
