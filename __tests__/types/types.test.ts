import { Project, Sprint, Task, User } from '@/types'

describe('Type Definitions', () => {
  describe('Project Type', () => {
    it('should create a valid project object', () => {
      const project: Project = {
        id: 'proj1',
        name: 'Test Project',
        description: 'Test Description',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        status: 'active',
        createdAt: Date.now(),
        createdBy: 'user1',
        members: { user1: true, user2: true },
      }
      expect(project.id).toBe('proj1')
      expect(project.name).toBe('Test Project')
      expect(project.status).toBe('active')
    })

    it('should support all project statuses', () => {
      const statuses: Array<Project['status']> = ['planned', 'active', 'completed', 'archived']
      expect(statuses).toHaveLength(4)
    })
  })

  describe('Sprint Type', () => {
    it('should create a valid sprint object', () => {
      const sprint: Sprint = {
        id: 'sprint1',
        name: 'Sprint 1',
        projectId: 'proj1',
        startDate: '2024-02-01',
        endDate: '2024-02-14',
        status: 'active',
        createdAt: Date.now(),
        createdBy: 'user1',
      }
      expect(sprint.id).toBe('sprint1')
      expect(sprint.projectId).toBe('proj1')
      expect(sprint.status).toBe('active')
    })

    it('should support all sprint statuses', () => {
      const statuses: Array<Sprint['status']> = ['planned', 'active', 'completed']
      expect(statuses).toHaveLength(3)
    })
  })

  describe('Task Type', () => {
    it('should create a valid task object', () => {
      const task: Task = {
        id: 'task1',
        title: 'Test Task',
        projectId: 'proj1',
        sprintId: 'sprint1',
        epic: 'Features',
        acceptanceCriteria: ['Should work', 'Should be fast'],
        userStory: {
          who: 'As a user',
          what: 'I want',
          why: 'To achieve',
        },
        developer: 'user1',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        bizPoints: 50,
        devPoints: 5,
        priority: 10,
        status: 'to-do',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user1',
        history: {},
      }
      expect(task.id).toBe('task1')
      expect(task.title).toBe('Test Task')
      expect(task.priority).toBe(10)
    })

    it('should support all task statuses', () => {
      const statuses: Array<Task['status']> = ['to-do', 'in-progress', 'to-validate', 'validated', 'done']
      expect(statuses).toHaveLength(5)
    })

    it('should support Fibonacci dev points', () => {
      const points: Array<Task['devPoints']> = [1, 2, 3, 5, 8, 13]
      expect(points).toHaveLength(6)
    })
  })

  describe('User Type', () => {
    it('should create a valid user object', () => {
      const user: User = {
        uid: 'user1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'developer',
        createdAt: Date.now(),
      }
      expect(user.uid).toBe('user1')
      expect(user.email).toBe('test@example.com')
      expect(user.role).toBe('developer')
    })

    it('should support user roles', () => {
      const roles: Array<User['role']> = ['admin', 'developer']
      expect(roles).toHaveLength(2)
    })
  })

  describe('Task History Type', () => {
    it('should create a valid task history entry', () => {
      const task: Task = {
        id: 'task1',
        title: 'Test',
        projectId: 'proj1',
        sprintId: 'sprint1',
        epic: 'Features',
        acceptanceCriteria: [],
        userStory: { who: '', what: '', why: '' },
        developer: 'dev1',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        bizPoints: 50,
        devPoints: 5,
        priority: 10,
        status: 'to-do',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'user1',
        history: {
          hist1: {
            id: 'hist1',
            timestamp: Date.now(),
            userId: 'user1',
            userName: 'Test User',
            field: 'status',
            oldValue: 'to-do',
            newValue: 'in-progress',
            action: 'update',
          },
        },
      }
      expect(task.history.hist1.field).toBe('status')
      expect(task.history.hist1.action).toBe('update')
    })
  })
})
