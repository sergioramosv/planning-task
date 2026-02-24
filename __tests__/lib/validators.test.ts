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

    it('should fail with short description', () => {
      const invalidData = {
        name: 'Test Project',
        description: 'Hi',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        status: 'active' as const,
      }
      const result = projectSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept all valid statuses', () => {
      const statuses = ['planned', 'active', 'completed', 'archived'] as const
      statuses.forEach(status => {
        const result = projectSchema.safeParse({
          name: 'Test Project',
          description: 'Valid description',
          startDate: '2024-02-01',
          endDate: '2024-12-31',
          status,
        })
        expect(result.success).toBe(true)
      })
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

    it('should fail when endDate is before startDate', () => {
      const invalidData = {
        name: 'Sprint 1',
        startDate: '2024-02-14',
        endDate: '2024-02-01',
        status: 'active' as const,
      }
      const result = sprintSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept all valid sprint statuses', () => {
      const statuses = ['planned', 'active', 'completed'] as const
      statuses.forEach(status => {
        const result = sprintSchema.safeParse({
          name: 'Sprint 1',
          startDate: '2024-02-01',
          endDate: '2024-02-14',
          status,
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('taskSchema', () => {
    const validTaskData = {
      title: 'Implement Feature',
      acceptanceCriteria: ['Should work', 'Should be fast'],
      userStory: {
        who: 'As a user',
        what: 'I want this',
        why: 'to achieve goal',
      },
      bizPoints: 50,
      devPoints: '5' as const,
      status: 'to-do' as const,
    }

    it('should validate correct task data with all fields', () => {
      const fullData = {
        ...validTaskData,
        sprint: 'sprint1',
        developer: 'dev-id',
        coDeveloper: 'codev-id',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
      }
      const result = taskSchema.safeParse(fullData)
      expect(result.success).toBe(true)
    })

    it('should validate task data with minimal fields (no developer, no dates)', () => {
      const result = taskSchema.safeParse(validTaskData)
      expect(result.success).toBe(true)
    })

    it('should validate task without developer', () => {
      const data = { ...validTaskData }
      const result = taskSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate task without startDate', () => {
      const data = { ...validTaskData }
      const result = taskSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate task with empty string developer', () => {
      const data = { ...validTaskData, developer: '' }
      const result = taskSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should validate task with empty string coDeveloper', () => {
      const data = { ...validTaskData, coDeveloper: '' }
      const result = taskSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should fail with short title', () => {
      const invalidData = { ...validTaskData, title: 'ab' }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid bizPoints (over 100)', () => {
      const invalidData = { ...validTaskData, bizPoints: 150 }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid bizPoints (under 1)', () => {
      const invalidData = { ...validTaskData, bizPoints: 0 }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with invalid devPoints', () => {
      const invalidData = { ...validTaskData, devPoints: '7' }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with empty acceptance criteria', () => {
      const invalidData = { ...validTaskData, acceptanceCriteria: [] }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should fail with only whitespace acceptance criteria', () => {
      const invalidData = { ...validTaskData, acceptanceCriteria: ['  ', ''] }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept all valid task statuses', () => {
      const statuses = ['to-do', 'in-progress', 'to-validate', 'validated', 'done'] as const
      statuses.forEach(status => {
        const result = taskSchema.safeParse({ ...validTaskData, status })
        expect(result.success).toBe(true)
      })
    })

    it('should fail with invalid status', () => {
      const result = taskSchema.safeParse({ ...validTaskData, status: 'cancelled' })
      expect(result.success).toBe(false)
    })

    it('should accept all valid fibonacci devPoints', () => {
      const points = ['1', '2', '3', '5', '8', '13'] as const
      points.forEach(devPoints => {
        const result = taskSchema.safeParse({ ...validTaskData, devPoints })
        expect(result.success).toBe(true)
      })
    })

    it('should fail with short user story fields', () => {
      const invalidData = {
        ...validTaskData,
        userStory: { who: 'ab', what: 'cd', why: 'ef' },
      }
      const result = taskSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
