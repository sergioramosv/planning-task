import { FIBONACCI_POINTS, FIBONACCI_LABELS } from '@/lib/constants/fibonacciPoints'
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants/taskStates'

describe('Constants', () => {
  describe('FIBONACCI_POINTS', () => {
    it('should have correct Fibonacci sequence', () => {
      expect(FIBONACCI_POINTS).toEqual([1, 2, 3, 5, 8, 13])
    })

    it('should have 6 points', () => {
      expect(FIBONACCI_POINTS).toHaveLength(6)
    })
  })

  describe('FIBONACCI_LABELS', () => {
    it('should have labels for all Fibonacci points', () => {
      expect(FIBONACCI_LABELS[1]).toBe('1 (Muy Simple)')
      expect(FIBONACCI_LABELS[2]).toBe('2 (Simple)')
      expect(FIBONACCI_LABELS[3]).toBe('3 (Medio)')
      expect(FIBONACCI_LABELS[5]).toBe('5 (Moderado)')
      expect(FIBONACCI_LABELS[8]).toBe('8 (Complejo)')
      expect(FIBONACCI_LABELS[13]).toBe('13 (Muy Complejo)')
    })
  })

  describe('TASK_STATUSES', () => {
    it('should have all required statuses', () => {
      expect(TASK_STATUSES).toContain('to-do')
      expect(TASK_STATUSES).toContain('in-progress')
      expect(TASK_STATUSES).toContain('to-validate')
      expect(TASK_STATUSES).toContain('validated')
      expect(TASK_STATUSES).toContain('done')
    })

    it('should have 5 statuses', () => {
      expect(TASK_STATUSES).toHaveLength(5)
    })
  })

  describe('TASK_STATUS_LABELS', () => {
    it('should have English labels for all statuses', () => {
      expect(TASK_STATUS_LABELS['to-do']).toBe('to-do')
      expect(TASK_STATUS_LABELS['in-progress']).toBe('in-progress')
      expect(TASK_STATUS_LABELS['to-validate']).toBe('to-validate')
      expect(TASK_STATUS_LABELS['validated']).toBe('validated')
      expect(TASK_STATUS_LABELS['done']).toBe('done & validated')
    })
  })

  describe('TASK_STATUS_COLORS', () => {
    it('should have color objects for all statuses', () => {
      expect(TASK_STATUS_COLORS['to-do']).toBeDefined()
      expect(TASK_STATUS_COLORS['in-progress']).toBeDefined()
      expect(TASK_STATUS_COLORS['to-validate']).toBeDefined()
      expect(TASK_STATUS_COLORS['validated']).toBeDefined()
      expect(TASK_STATUS_COLORS['done']).toBeDefined()
    })

    it('should have correct color structure', () => {
      const color = TASK_STATUS_COLORS['to-do']
      expect(color).toHaveProperty('bg')
      expect(color).toHaveProperty('text')
      expect(color).toHaveProperty('border')
    })

    it('should have consistent color naming', () => {
      Object.entries(TASK_STATUS_COLORS).forEach(([status, colors]) => {
        expect(colors.bg).toMatch(/^bg-/)
        expect(colors.text).toMatch(/^text-/)
        expect(colors.border).toMatch(/^border-/)
      })
    })
  })
})
