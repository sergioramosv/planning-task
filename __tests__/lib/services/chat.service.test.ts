// Mock Firebase Admin before any imports to avoid jose/jwks-rsa ESM issues
jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    ref: jest.fn().mockReturnValue({
      once: jest.fn(),
    }),
  },
  adminAuth: {},
}))

// Mock OpenAI before importing the service
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  }
})

import { buildSystemPrompt, executeFunctionCall, createChatModel } from '@/lib/services/chat.service'
import * as AiTools from '@/lib/services/ai-tools.service'

// Mock AI Tools service
jest.mock('@/lib/services/ai-tools.service')

describe('Chat Service', () => {
  describe('buildSystemPrompt', () => {
    it('should build system prompt with project info', () => {
      const project = {
        id: 'project-123',
        name: 'Test Project',
        description: 'A test project',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }

      const userName = 'Test User'
      const members = [
        { uid: 'user-1', displayName: 'Member 1', role: 'admin' },
        { uid: 'user-2', displayName: 'Member 2', role: 'member' },
      ]

      const prompt = buildSystemPrompt(project, userName, members)

      expect(prompt).toContain('Test Project')
      expect(prompt).toContain('A test project')
      expect(prompt).toContain('Test User')
      expect(prompt).toContain('Member 1')
      expect(prompt).toContain('Member 2')
    })

    it('should include project dates in prompt', () => {
      const project = {
        id: 'project-123',
        name: 'Project',
        description: 'Desc',
        startDate: '2026-01-15',
        endDate: '2026-06-30',
      }

      const prompt = buildSystemPrompt(project, 'User', [])

      expect(prompt).toContain('2026-01-15')
      expect(prompt).toContain('2026-06-30')
    })

    it('should list all team members', () => {
      const project = {
        id: 'p1',
        name: 'P',
        description: 'D',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      }

      const members = [
        { uid: 'u1', displayName: 'Alice', role: 'owner' },
        { uid: 'u2', displayName: 'Bob', role: 'admin' },
        { uid: 'u3', displayName: 'Charlie', role: 'member' },
      ]

      const prompt = buildSystemPrompt(project, 'Alice', members)

      expect(prompt).toContain('Alice')
      expect(prompt).toContain('Bob')
      expect(prompt).toContain('Charlie')
    })
  })

  describe('executeFunctionCall', () => {
    const mockContext = {
      projectId: 'project-123',
      uid: 'user-456',
      userName: 'Test User',
    }

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should execute list_projects', async () => {
      const mockProjects = [{ id: 'p1', name: 'Project 1' }]
      ;(AiTools.listProjects as jest.Mock).mockResolvedValueOnce(mockProjects)

      const result = await executeFunctionCall('list_projects', {}, mockContext)

      expect(result).toEqual(mockProjects)
      expect(AiTools.listProjects).toHaveBeenCalledWith(mockContext.uid)
    })

    it('should execute get_project with projectId from context', async () => {
      const mockProject = { id: 'project-123', name: 'Test Project' }
      ;(AiTools.getProject as jest.Mock).mockResolvedValueOnce(mockProject)

      const result = await executeFunctionCall('get_project', {}, mockContext)

      expect(result).toEqual(mockProject)
      expect(AiTools.getProject).toHaveBeenCalledWith('project-123')
    })

    it('should execute list_tasks with filters', async () => {
      const mockTasks = [{ id: 't1', title: 'Task 1' }]
      ;(AiTools.listTasks as jest.Mock).mockResolvedValueOnce(mockTasks)

      const args = { status: 'in-progress', developer: 'dev-123' }
      const result = await executeFunctionCall('list_tasks', args, mockContext)

      expect(result).toEqual(mockTasks)
      expect(AiTools.listTasks).toHaveBeenCalledWith('project-123', args)
    })

    it('should execute create_task with all parameters', async () => {
      const mockTask = { id: 't-new', title: 'New Task' }
      ;(AiTools.createTask as jest.Mock).mockResolvedValueOnce(mockTask)

      const args = {
        title: 'New Task',
        userStoryWho: 'As a user',
        userStoryWhat: 'I want to do something',
        userStoryWhy: 'So that I can achieve something',
        acceptanceCriteria: ['Criteria 1', 'Criteria 2'],
        bizPoints: 50,
        devPoints: 5,
      }

      const result = await executeFunctionCall('create_task', args, mockContext)

      expect(result).toEqual(mockTask)
      expect(AiTools.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          projectId: 'project-123',
          userStory: {
            who: 'As a user',
            what: 'I want to do something',
            why: 'So that I can achieve something',
          },
          acceptanceCriteria: ['Criteria 1', 'Criteria 2'],
          bizPoints: 50,
          devPoints: 5,
        }),
        mockContext.uid,
        mockContext.userName
      )
    })

    it('should execute create_sprint with required fields', async () => {
      const mockSprint = { id: 's-new', name: 'Sprint 1' }
      ;(AiTools.createSprint as jest.Mock).mockResolvedValueOnce(mockSprint)

      const args = {
        name: 'Sprint 1',
        startDate: '2026-03-01',
        endDate: '2026-03-14',
      }

      const result = await executeFunctionCall('create_sprint', args, mockContext)

      expect(result).toEqual(mockSprint)
      expect(AiTools.createSprint).toHaveBeenCalledWith(
        {
          name: 'Sprint 1',
          projectId: 'project-123',
          startDate: '2026-03-01',
          endDate: '2026-03-14',
          status: undefined,
        },
        mockContext.uid
      )
    })

    it('should execute update_task', async () => {
      const mockUpdated = { id: 't1', title: 'Updated Task' }
      ;(AiTools.updateTask as jest.Mock).mockResolvedValueOnce(mockUpdated)

      const args = {
        taskId: 't1',
        title: 'Updated Task',
        status: 'done',
      }

      const result = await executeFunctionCall('update_task', args, mockContext)

      expect(result).toEqual(mockUpdated)
      expect(AiTools.updateTask).toHaveBeenCalledWith('t1', args, mockContext.uid, mockContext.userName)
    })

    it('should execute change_task_status', async () => {
      const mockResult = { success: true }
      ;(AiTools.changeTaskStatus as jest.Mock).mockResolvedValueOnce(mockResult)

      const args = { taskId: 't1', newStatus: 'in-progress' }
      const result = await executeFunctionCall('change_task_status', args, mockContext)

      expect(result).toEqual(mockResult)
      expect(AiTools.changeTaskStatus).toHaveBeenCalledWith('t1', 'in-progress', mockContext.uid, mockContext.userName)
    })

    it('should execute assign_task', async () => {
      const mockResult = { success: true }
      ;(AiTools.assignTask as jest.Mock).mockResolvedValueOnce(mockResult)

      const args = { taskId: 't1', developerId: 'dev-123' }
      const result = await executeFunctionCall('assign_task', args, mockContext)

      expect(result).toEqual(mockResult)
      expect(AiTools.assignTask).toHaveBeenCalledWith('t1', 'dev-123', mockContext.uid, mockContext.userName)
    })

    it('should execute project_dashboard', async () => {
      const mockDashboard = { totalTasks: 10, completedTasks: 5 }
      ;(AiTools.projectDashboard as jest.Mock).mockResolvedValueOnce(mockDashboard)

      const result = await executeFunctionCall('project_dashboard', {}, mockContext)

      expect(result).toEqual(mockDashboard)
      expect(AiTools.projectDashboard).toHaveBeenCalledWith('project-123')
    })

    it('should execute sprint_burndown', async () => {
      const mockBurndown = { totalPoints: 50, completedPoints: 30 }
      ;(AiTools.sprintBurndown as jest.Mock).mockResolvedValueOnce(mockBurndown)

      const args = { sprintId: 's1' }
      const result = await executeFunctionCall('sprint_burndown', args, mockContext)

      expect(result).toEqual(mockBurndown)
      expect(AiTools.sprintBurndown).toHaveBeenCalledWith('s1')
    })

    it('should execute search_tasks', async () => {
      const mockResults = [{ id: 't1', title: 'Found Task' }]
      ;(AiTools.searchTasks as jest.Mock).mockResolvedValueOnce(mockResults)

      const args = { query: 'authentication', minPriority: 5 }
      const result = await executeFunctionCall('search_tasks', args, mockContext)

      expect(result).toEqual(mockResults)
      expect(AiTools.searchTasks).toHaveBeenCalledWith('project-123', args)
    })

    it('should return error object for unknown function name', async () => {
      const result = await executeFunctionCall('unknown_function', {}, mockContext)

      expect(result).toEqual({ error: 'Función desconocida: unknown_function' })
    })

    it('should use projectId from args if provided', async () => {
      ;(AiTools.getProject as jest.Mock).mockResolvedValueOnce({ id: 'other-project' })

      await executeFunctionCall('get_project', { projectId: 'other-project' }, mockContext)

      expect(AiTools.getProject).toHaveBeenCalledWith('other-project')
    })

  })

  describe('createChatModel', () => {
    it('should create a Gemini model instance', () => {
      const model = createChatModel()

      expect(model).toBeDefined()
      // The model should have a startChat method (Gemini API)
      expect(typeof model.startChat).toBe('function')
    })
  })
})
