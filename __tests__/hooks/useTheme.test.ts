import { renderHook, act } from '@testing-library/react'
import { useTheme } from '@/hooks/useTheme'

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it('should default to light theme when no localStorage and no system preference', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('should read theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('should toggle from light to dark', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')
  })

  it('should toggle from dark to light', () => {
    localStorage.setItem('theme', 'dark')
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
  })

  it('should set data-theme attribute on document.documentElement', () => {
    const { result } = renderHook(() => useTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    act(() => {
      result.current.toggleTheme()
    })
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should save theme to localStorage when toggled', () => {
    const { result } = renderHook(() => useTheme())
    expect(localStorage.getItem('theme')).toBe('light')
    act(() => {
      result.current.toggleTheme()
    })
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
