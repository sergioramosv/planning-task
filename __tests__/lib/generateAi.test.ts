// Mock next/server before importing the route (Request not available in jsdom)
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: any, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status || 200,
    }),
  },
}))

import { POST } from '@/app/api/tasks/generate-ai/route'

// Mock validateSession
const mockValidateSession = jest.fn()
jest.mock('@/lib/auth/validateSession', () => ({
  validateSession: (req: any) => mockValidateSession(req),
}))

// Mock validateProjectAccess
const mockValidateProjectAccess = jest.fn()
jest.mock('@/lib/auth/validateProjectAccess', () => ({
  validateProjectAccess: (uid: string, projectId: string) =>
    mockValidateProjectAccess(uid, projectId),
}))

// Mock model-pool
const mockGetAvailableModelConfig = jest.fn()
const mockTrackModelRequest = jest.fn()
jest.mock('@/lib/services/model-pool', () => ({
  getAvailableModelConfig: () => mockGetAvailableModelConfig(),
  trackModelRequest: (id: string) => mockTrackModelRequest(id),
}))

// Mock chat.service
const mockSendMessage = jest.fn()
const mockStartChat = jest.fn()
const mockCreateChatModel = jest.fn()
jest.mock('@/lib/services/chat.service', () => ({
  createChatModel: (apiKey: string, modelName: string) =>
    mockCreateChatModel(apiKey, modelName),
}))

// Mock NextRequest
function createMockRequest(body: any): any {
  return {
    json: jest.fn().mockResolvedValue(body),
  }
}

function createBadJsonRequest(): any {
  return {
    json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
  }
}

describe('AI Task Generation API - POST /api/tasks/generate-ai', () => {
  const mockSessionUser = {
    uid: 'user-123',
    displayName: 'Test User',
    email: 'test@example.com',
  }

  const mockModelConfig = {
    id: 'model-1',
    apiKey: 'test-api-key',
    modelName: 'gemini-2.5-flash',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateSession.mockResolvedValue(mockSessionUser)
    mockValidateProjectAccess.mockResolvedValue({ role: 'member', canWrite: true })
    mockGetAvailableModelConfig.mockReturnValue(mockModelConfig)
    mockTrackModelRequest.mockReturnValue(undefined)

    // Setup chat model mock chain
    mockSendMessage.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            userStory: {
              who: 'Como desarrollador',
              what: 'quiero implementar autenticacion',
              why: 'para proteger las rutas',
            },
            bizPoints: 5,
            devPoints: 8,
            acceptanceCriteria: [
              'El usuario puede iniciar sesion',
              'El usuario puede cerrar sesion',
              'Las rutas protegidas redirigen al login',
            ],
          }),
      },
    })

    mockStartChat.mockReturnValue({
      sendMessage: mockSendMessage,
    })

    mockCreateChatModel.mockReturnValue({
      startChat: mockStartChat,
    })
  })

  it('should return 401 if user is not authenticated', async () => {
    mockValidateSession.mockResolvedValue(null)

    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('No autenticado')
  })

  it('should return 400 if body is invalid JSON', async () => {
    const request = createBadJsonRequest()
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Body inv\u00e1lido')
  })

  it('should return 400 if title is missing', async () => {
    const request = createMockRequest({ projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('title')
  })

  it('should return 400 if projectId is missing', async () => {
    const request = createMockRequest({ title: 'Test task' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('projectId')
  })

  it('should return 400 if both title and projectId are missing', async () => {
    const request = createMockRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
  })

  it('should return 403 if user has no access to the project', async () => {
    mockValidateProjectAccess.mockResolvedValue(null)

    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('acceso')
  })

  it('should return 429 if no model is available', async () => {
    mockGetAvailableModelConfig.mockReturnValue(null)

    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toContain('ocupado')
  })

  it('should return 200 with proper data structure on success', async () => {
    const request = createMockRequest({ title: 'Implementar autenticacion', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('userStory')
    expect(data.userStory).toHaveProperty('who')
    expect(data.userStory).toHaveProperty('what')
    expect(data.userStory).toHaveProperty('why')
    expect(data).toHaveProperty('bizPoints')
    expect(data).toHaveProperty('devPoints')
    expect(data).toHaveProperty('acceptanceCriteria')
    expect(Array.isArray(data.acceptanceCriteria)).toBe(true)
  })

  it('should return Fibonacci-valid bizPoints and devPoints', async () => {
    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    const validFib = [1, 2, 3, 5, 8, 13]
    expect(validFib).toContain(data.bizPoints)
    expect(validFib).toContain(data.devPoints)
  })

  it('should default to 3 for non-Fibonacci bizPoints from AI', async () => {
    mockSendMessage.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            userStory: { who: 'user', what: 'feature', why: 'benefit' },
            bizPoints: 7, // Not a valid Fibonacci number
            devPoints: 5,
            acceptanceCriteria: ['Criterion 1'],
          }),
      },
    })

    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(data.bizPoints).toBe(3) // Defaults to 3
    expect(data.devPoints).toBe(5) // Valid, stays as-is
  })

  it('should call trackModelRequest with the model config id', async () => {
    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    await POST(request)

    expect(mockTrackModelRequest).toHaveBeenCalledWith('model-1')
  })

  it('should call createChatModel with correct apiKey and modelName', async () => {
    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    await POST(request)

    expect(mockCreateChatModel).toHaveBeenCalledWith('test-api-key', 'gemini-2.5-flash')
  })

  it('should call validateProjectAccess with correct uid and projectId', async () => {
    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    await POST(request)

    expect(mockValidateProjectAccess).toHaveBeenCalledWith('user-123', 'proj-1')
  })

  it('should include context in the message when provided', async () => {
    const request = createMockRequest({
      title: 'Test task',
      projectId: 'proj-1',
      context: 'This is a React project with Next.js',
    })
    await POST(request)

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.stringContaining('Contexto adicional')
    )
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.stringContaining('This is a React project with Next.js')
    )
  })

  it('should not include context text when context is not provided', async () => {
    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    await POST(request)

    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.not.stringContaining('Contexto adicional')
    )
  })

  it('should return 500 when AI model throws an error', async () => {
    mockSendMessage.mockRejectedValue(new Error('Model error'))

    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Error al generar con IA')
  })

  it('should handle markdown code blocks in AI response', async () => {
    mockSendMessage.mockResolvedValue({
      response: {
        text: () =>
          '```json\n' +
          JSON.stringify({
            userStory: { who: 'dev', what: 'feature', why: 'reason' },
            bizPoints: 3,
            devPoints: 5,
            acceptanceCriteria: ['Criterion A'],
          }) +
          '\n```',
      },
    })

    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.userStory.who).toBe('dev')
  })

  it('should filter out empty acceptance criteria strings', async () => {
    mockSendMessage.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            userStory: { who: 'user', what: 'feature', why: 'reason' },
            bizPoints: 3,
            devPoints: 3,
            acceptanceCriteria: ['Valid criterion', '', '  ', 'Another valid'],
          }),
      },
    })

    const request = createMockRequest({ title: 'Test task', projectId: 'proj-1' })
    const response = await POST(request)
    const data = await response.json()

    expect(data.acceptanceCriteria).toEqual(['Valid criterion', 'Another valid'])
  })
})
