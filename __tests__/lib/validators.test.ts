import { projectSchema, sprintSchema, taskSchema } from '@/lib/utils/validators'

describe('Validators', () => {
  describe('projectSchema', () => {
    it('should validate correct project data', () => {
      const validData = {
        name: 'Test Project',
        description: 'This is a test project',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        status: 'active' as const,
      }
      const result = projectSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail with short name', () => {
      const invalidData = {
        name: 'ab',
        description: 'This is a test project',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        status: 'active' as const,
      }
      const result = projectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid status', () => {
      const invalidData = {
        name: 'Test Project',
        description: 'This is a test project',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        status: 'invalid' as any,
      }
      const result = projectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid date format', () => {
      const invalidData = {
        name: 'Test Project',
        description: 'This is a test project',
        startDate: '02-01-2024',
        endDate: '12-31-2024',
        status: 'active' as const,
      }
      const result = projectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('sprintSchema', () => {
    it('should validate correct sprint data', () => {
      const validData = {
        name: 'Sprint 1',
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        status: 'active' as const,
      }
      const result = sprintSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail with short name', () => {
      const invalidData = {
        name: 'ab',
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        status: 'active' as const,
      }
      const result = sprintSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('taskSchema', () => {
    it('should validate correct task data', () => {
      const validData = {
        title: 'Implement Feature',
        epic: 'Features',
        acceptanceCriteria: ['Should work', 'Should be fast'],
        userStory: {
          who: 'As a user',
          what: 'I want',
          why: 'to achieve',
        },
        developer: 'dev-id',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        bizPoints: 50,
        devPoints: '5',
        status: 'to-do' as const,
      }
      const result = taskSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should fail with short title', () => {
      const invalidData = {
        title: 'ab',
        epic: 'Features',
        acceptanceCriteria: ['Should work'],
        userStory: {
          who: 'As a user',
          what: 'I want',
          why: 'to achieve',
        },
        developer: 'dev-id',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        bizPoints: 50,
        devPoints: '5',
        status: 'to-do' as const,
      }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid bizPoints', () => {
      const invalidData = {
        title: 'Implement Feature',
        epic: 'Features',
        acceptanceCriteria: ['Should work'],
        userStory: {
          who: 'As a user',
          what: 'I want',
          why: 'to achieve',
        },
        developer: 'dev-id',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        bizPoints: 150,
        devPoints: '5',
        status: 'to-do' as const,
      }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid devPoints', () => {
      const invalidData = {
        title: 'Implement Feature',
        epic: 'Features',
        acceptanceCriteria: ['Should work'],
        userStory: {
          who: 'As a user',
          what: 'I want',
          why: 'to achieve',
        },
        developer: 'dev-id',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        bizPoints: 50,
        devPoints: '7',
        status: 'to-do' as const,
      }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with empty acceptance criteria', () => {
      const invalidData = {
        title: 'Implement Feature',
        epic: 'Features',
        acceptanceCriteria: [],
        userStory: {
          who: 'As a user',
          what: 'I want',
          why: 'to achieve',
        },
        developer: 'dev-id',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        bizPoints: 50,
        devPoints: '5',
        status: 'to-do' as const,
      }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
