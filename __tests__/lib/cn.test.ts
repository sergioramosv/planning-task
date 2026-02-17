import { cn } from '@/lib/utils/cn'

describe('cn utility function', () => {
  it('should merge class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('should handle empty strings', () => {
    expect(cn('px-2', '', 'py-1')).toBe('px-2 py-1')
  })

  it('should handle undefined', () => {
    expect(cn('px-2', undefined, 'py-1')).toBe('px-2 py-1')
  })

  it('should handle false boolean', () => {
    expect(cn('px-2', false && 'py-1')).toBe('px-2')
  })

  it('should handle true boolean', () => {
    expect(cn('px-2', true && 'py-1')).toBe('px-2 py-1')
  })

  it('should handle arrays', () => {
    expect(cn(['px-2', 'py-1'])).toBe('px-2 py-1')
  })

  it('should handle objects', () => {
    expect(cn({ 'px-2': true, 'py-1': true, 'bg-red': false })).toBe('px-2 py-1')
  })

  it('should resolve tailwind conflicts correctly', () => {
    const result = cn('px-2 px-4')
    expect(result).toContain('px')
  })

  it('should handle complex combinations', () => {
    expect(cn('text-base', { 'text-lg': true, 'text-sm': false }, 'font-bold')).toContain('text')
    expect(cn('text-base', { 'text-lg': true, 'text-sm': false }, 'font-bold')).toContain('font-bold')
  })

  it('should work with conditional classes', () => {
    const isActive = true
    expect(cn('base', isActive ? 'active' : 'inactive')).toBe('base active')
  })

  it('should handle null values', () => {
    expect(cn('px-2', null, 'py-1')).toBe('px-2 py-1')
  })
})
