import {
  calculatePriority,
  calculateSprintProgress,
  calculateDeveloperLoad,
  calculateProjectMetrics,
  getDeveloperMetrics,
} from '@/lib/utils/calculations'
import { Task } from '@/types'

describe('Calculations', () => {
  describe('calculatePriority', () => {
    it('should calculate priority correctly', () => {
      expect(calculatePriority(100, 10)).toBe(10)
      expect(calculatePriority(50, 5)).toBe(10)
      expect(calculatePriority(80, 5)).toBe(16)
    })

    it('should handle zero devPoints', () => {
      expect(calculatePriority(100, 0)).toBe(100)
    })

    it('should return decimal values rounded correctly', () => {
      expect(calculatePriority(75, 3)).toBe(25)
      expect(calculatePriority(33, 5)).toBe(6.6)
    })
  })

  describe('calculateSprintProgress', () => {
    it('should return 0 for empty tasks', () => {
      expect(calculateSprintProgress([])).toBe(0)
    })

    it('should calculate progress correctly', () => {
      const tasks: Task[] = [
        { status: 'done' } as Task,
        { status: 'done' } as Task,
        { status: 'to-do' } as Task,
        { status: 'to-do' } as Task,
      ]
      expect(calculateSprintProgress(tasks)).toBe(50)
    })

    it('should return 100 when all tasks are done', () => {
      const tasks: Task[] = [
        { status: 'done' } as Task,
        { status: 'done' } as Task,
      ]
      expect(calculateSprintProgress(tasks)).toBe(100)
    })
  })

  describe('calculateDeveloperLoad', () => {
    it('should calculate developer load correctly', () => {
      const tasks: Task[] = [
        { developer: 'dev1', devPoints: 5, status: 'to-do' } as Task,
        { developer: 'dev1', devPoints: 3, status: 'in-progress' } as Task,
        { developer: 'dev1', devPoints: 8, status: 'done' } as Task,
        { developer: 'dev2', devPoints: 5, status: 'to-do' } as Task,
      ]
      expect(calculateDeveloperLoad(tasks, 'dev1')).toBe(8)
      expect(calculateDeveloperLoad(tasks, 'dev2')).toBe(5)
    })

    it('should not count completed tasks', () => {
      const tasks: Task[] = [
        { developer: 'dev1', devPoints: 5, status: 'done' } as Task,
      ]
      expect(calculateDeveloperLoad(tasks, 'dev1')).toBe(0)
    })
  })

  describe('calculateProjectMetrics', () => {
    it('should calculate all metrics correctly', () => {
      const tasks: Task[] = [
        { status: 'done' } as Task,
        { status: 'done' } as Task,
        { status: 'to-do' } as Task,
        { status: 'in-progress' } as Task,
        { status: 'to-validate' } as Task,
        { status: 'validated' } as Task,
      ]
      const metrics = calculateProjectMetrics(tasks)
      expect(metrics.total).toBe(6)
      expect(metrics.completed).toBe(2)
      expect(metrics.pending).toBe(1)
      expect(metrics.inProgress).toBe(1)
      expect(metrics.toValidate).toBe(1)
      expect(metrics.validated).toBe(1)
      expect(metrics.completionPercentage).toBe(33.33333333333333)
    })

    it('should handle empty tasks', () => {
      const metrics = calculateProjectMetrics([])
      expect(metrics.total).toBe(0)
      expect(metrics.completed).toBe(0)
      expect(metrics.completionPercentage).toBe(0)
    })
  })

  describe('getDeveloperMetrics', () => {
    it('should group metrics by developer', () => {
      const tasks: Task[] = [
        { developer: 'dev1', status: 'done', devPoints: 5 } as Task,
        { developer: 'dev1', status: 'to-do', devPoints: 3 } as Task,
        { developer: 'dev2', status: 'done', devPoints: 8 } as Task,
        { developer: 'dev2', status: 'in-progress', devPoints: 5 } as Task,
      ]
      const metrics = getDeveloperMetrics(tasks)
      expect(metrics['dev1'].completed).toBe(1)
      expect(metrics['dev1'].pending).toBe(1)
      expect(metrics['dev1'].load).toBe(3)
      expect(metrics['dev2'].load).toBe(5)
    })
  })
})
