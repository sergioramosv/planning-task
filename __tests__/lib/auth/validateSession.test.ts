import { validateSession } from '@/lib/auth/validateSession'
import { adminDb } from '@/lib/firebase/admin'
import { NextRequest } from 'next/server'

// Mock Firebase Admin
jest.mock('@/lib/firebase/admin', () => ({
  adminDb: {
    ref: jest.fn(),
  },
}))

describe('validateSession', () => {
  const mockRef = {
    once: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(adminDb.ref as jest.Mock).mockReturnValue(mockRef)
  })

  it('should return null when no session cookie is present', async () => {
    const request = new NextRequest('http://localhost:3000/api/test')

    const result = await validateSession(request)

    expect(result).toBeNull()
  })

  it('should return null when session cookie is empty', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: 'session=',
      },
    })

    const result = await validateSession(request)

    expect(result).toBeNull()
  })

  it('should return null when user data does not exist in database', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: 'session=test-uid-123',
      },
    })

    mockRef.once.mockResolvedValueOnce({
      val: () => null,
    })

    const result = await validateSession(request)

    expect(result).toBeNull()
    expect(adminDb.ref).toHaveBeenCalledWith('users/test-uid-123')
  })

  it('should return SessionUser when valid session exists', async () => {
    const mockUserData = {
      displayName: 'Test User',
      email: 'test@example.com',
    }

    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: 'session=valid-uid-456',
      },
    })

    mockRef.once.mockResolvedValueOnce({
      val: () => mockUserData,
    })

    const result = await validateSession(request)

    expect(result).toEqual({
      uid: 'valid-uid-456',
      displayName: 'Test User',
      email: 'test@example.com',
    })
  })

  it('should use default displayName when not provided', async () => {
    const mockUserData = {
      email: 'test@example.com',
    }

    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: 'session=uid-789',
      },
    })

    mockRef.once.mockResolvedValueOnce({
      val: () => mockUserData,
    })

    const result = await validateSession(request)

    expect(result?.displayName).toBe('Usuario')
  })

  it('should use empty email when not provided', async () => {
    const mockUserData = {
      displayName: 'Test User',
    }

    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: 'session=uid-999',
      },
    })

    mockRef.once.mockResolvedValueOnce({
      val: () => mockUserData,
    })

    const result = await validateSession(request)

    expect(result?.email).toBe('')
  })

  it('should handle Firebase database errors gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: 'session=error-uid',
      },
    })

    mockRef.once.mockRejectedValueOnce(new Error('Database connection failed'))

    await expect(validateSession(request)).rejects.toThrow('Database connection failed')
  })

  it('should query correct user path in database', async () => {
    const testUid = 'specific-test-uid'
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: `session=${testUid}`,
      },
    })

    mockRef.once.mockResolvedValueOnce({
      val: () => ({ displayName: 'User', email: 'user@test.com' }),
    })

    await validateSession(request)

    expect(adminDb.ref).toHaveBeenCalledWith(`users/${testUid}`)
  })

  it('should handle cookies with multiple values', async () => {
    const request = new NextRequest('http://localhost:3000/api/test', {
      headers: {
        cookie: 'other=value; session=multi-cookie-uid; another=data',
      },
    })

    mockRef.once.mockResolvedValueOnce({
      val: () => ({ displayName: 'Multi User', email: 'multi@test.com' }),
    })

    const result = await validateSession(request)

    expect(result?.uid).toBe('multi-cookie-uid')
  })
})
