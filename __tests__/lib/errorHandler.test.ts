import { getUserFriendlyError } from '@/lib/utils/errorHandler'

describe('getUserFriendlyError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('network errors', () => {
    it('should return connection error for "Network error"', () => {
      const result = getUserFriendlyError(new Error('Network error'))
      expect(result).toBe('Error de conexi\u00f3n. Verifica tu conexi\u00f3n a internet e int\u00e9ntalo de nuevo.')
    })

    it('should return connection error for "Failed to fetch"', () => {
      const result = getUserFriendlyError(new Error('Failed to fetch'))
      expect(result).toBe('Error de conexi\u00f3n. Verifica tu conexi\u00f3n a internet e int\u00e9ntalo de nuevo.')
    })

    it('should return connection error for "net::ERR_CONNECTION_REFUSED"', () => {
      const result = getUserFriendlyError(new Error('net::ERR_CONNECTION_REFUSED'))
      expect(result).toBe('Error de conexi\u00f3n. Verifica tu conexi\u00f3n a internet e int\u00e9ntalo de nuevo.')
    })
  })

  describe('timeout errors', () => {
    it('should return timeout message for "timeout"', () => {
      const result = getUserFriendlyError(new Error('Request timeout'))
      expect(result).toBe('La operaci\u00f3n tard\u00f3 demasiado. Int\u00e9ntalo de nuevo.')
    })

    it('should return timeout message for "timed out"', () => {
      const result = getUserFriendlyError(new Error('Connection timed out'))
      expect(result).toBe('La operaci\u00f3n tard\u00f3 demasiado. Int\u00e9ntalo de nuevo.')
    })
  })

  describe('permission errors', () => {
    it('should return permission error for "permission denied"', () => {
      const result = getUserFriendlyError(new Error('Permission denied'))
      expect(result).toBe('No tienes permisos para realizar esta acci\u00f3n.')
    })

    it('should return permission error for "forbidden"', () => {
      const result = getUserFriendlyError(new Error('Forbidden'))
      expect(result).toBe('No tienes permisos para realizar esta acci\u00f3n.')
    })

    it('should return permission error for 403 status', () => {
      const result = getUserFriendlyError(new Error('Error 403'))
      expect(result).toBe('No tienes permisos para realizar esta acci\u00f3n.')
    })
  })

  describe('not found errors', () => {
    it('should return not found message for "not found"', () => {
      const result = getUserFriendlyError(new Error('Resource not found'))
      expect(result).toBe('El recurso solicitado no fue encontrado.')
    })

    it('should return not found message for 404 status', () => {
      const result = getUserFriendlyError(new Error('Error 404'))
      expect(result).toBe('El recurso solicitado no fue encontrado.')
    })
  })

  describe('authentication errors', () => {
    it('should return session expired for "unauthorized"', () => {
      const result = getUserFriendlyError(new Error('Unauthorized'))
      expect(result).toBe('Tu sesi\u00f3n ha expirado. Inicia sesi\u00f3n de nuevo.')
    })

    it('should return session expired for 401 status', () => {
      const result = getUserFriendlyError(new Error('Error 401'))
      expect(result).toBe('Tu sesi\u00f3n ha expirado. Inicia sesi\u00f3n de nuevo.')
    })
  })

  describe('rate limit errors', () => {
    it('should return rate limit message for "429"', () => {
      const result = getUserFriendlyError(new Error('Error 429'))
      expect(result).toBe('Demasiadas solicitudes. Espera un momento e int\u00e9ntalo de nuevo.')
    })

    it('should return rate limit message for "too many"', () => {
      const result = getUserFriendlyError(new Error('Too many requests'))
      expect(result).toBe('Demasiadas solicitudes. Espera un momento e int\u00e9ntalo de nuevo.')
    })
  })

  describe('firebase errors', () => {
    it('should return database error for "firebase" errors', () => {
      const result = getUserFriendlyError(new Error('Firebase: Error (auth/something)'))
      expect(result).toBe('Error al acceder a los datos. Int\u00e9ntalo de nuevo.')
    })

    it('should return database error for "firestore" errors', () => {
      const result = getUserFriendlyError(new Error('Firestore error: quota exceeded'))
      expect(result).toBe('Error al acceder a los datos. Int\u00e9ntalo de nuevo.')
    })

    it('should return database error for "database" errors', () => {
      const result = getUserFriendlyError(new Error('Database connection failed'))
      expect(result).toBe('Error al acceder a los datos. Int\u00e9ntalo de nuevo.')
    })
  })

  describe('firebase auth-specific errors', () => {
    it('should return email already in use message', () => {
      const result = getUserFriendlyError(new Error('auth/email-already-in-use'))
      expect(result).toBe('El email ya est\u00e1 registrado.')
    })

    it('should return user not found message', () => {
      const result = getUserFriendlyError(new Error('auth/user-not-found'))
      expect(result).toBe('Usuario no encontrado.')
    })

    it('should return wrong password message', () => {
      const result = getUserFriendlyError(new Error('auth/wrong-password'))
      expect(result).toBe('Contrase\u00f1a incorrecta.')
    })

    it('should return weak password message', () => {
      const result = getUserFriendlyError(new Error('auth/weak-password'))
      expect(result).toBe('La contrase\u00f1a es demasiado d\u00e9bil.')
    })

    it('should return invalid email message', () => {
      const result = getUserFriendlyError(new Error('auth/invalid-email'))
      expect(result).toBe('El email no es v\u00e1lido.')
    })
  })

  describe('duplicate errors', () => {
    it('should return already exists message', () => {
      const result = getUserFriendlyError(new Error('Document already exists'))
      expect(result).toBe('Este elemento ya existe.')
    })
  })

  describe('validation errors', () => {
    it('should return validation error message', () => {
      const result = getUserFriendlyError(new Error('Validation failed for field'))
      expect(result).toBe('Los datos proporcionados no son v\u00e1lidos. Revisa el formulario.')
    })
  })

  describe('unknown errors', () => {
    it('should pass through short user-friendly messages', () => {
      const result = getUserFriendlyError(new Error('Algo sali\u00f3 mal'))
      expect(result).toBe('Algo sali\u00f3 mal')
    })

    it('should return generic message for long technical errors', () => {
      const longError = 'TypeError: Cannot read properties of undefined (reading something) at Module._compile (internal/modules/cjs/loader.js:1085:14) at Object...'
      const result = getUserFriendlyError(new Error(longError))
      expect(result).toBe('Ha ocurrido un error inesperado. Int\u00e9ntalo de nuevo.')
    })

    it('should return generic message for errors containing "Error:"', () => {
      const result = getUserFriendlyError(new Error('Error: something broke'))
      expect(result).toBe('Ha ocurrido un error inesperado. Int\u00e9ntalo de nuevo.')
    })

    it('should return generic message for errors containing "undefined"', () => {
      const result = getUserFriendlyError(new Error('Cannot read undefined'))
      expect(result).toBe('Ha ocurrido un error inesperado. Int\u00e9ntalo de nuevo.')
    })

    it('should return generic message for errors containing "null"', () => {
      const result = getUserFriendlyError(new Error('null is not an object'))
      expect(result).toBe('Ha ocurrido un error inesperado. Int\u00e9ntalo de nuevo.')
    })

    it('should return generic message for errors containing stack traces', () => {
      const result = getUserFriendlyError(new Error('Something failed at line 42'))
      expect(result).toBe('Ha ocurrido un error inesperado. Int\u00e9ntalo de nuevo.')
    })
  })

  describe('non-Error inputs', () => {
    it('should handle string errors', () => {
      const result = getUserFriendlyError('Network error')
      expect(result).toBe('Error de conexi\u00f3n. Verifica tu conexi\u00f3n a internet e int\u00e9ntalo de nuevo.')
    })

    it('should handle string as unknown error', () => {
      const result = getUserFriendlyError('Algo raro')
      expect(result).toBe('Algo raro')
    })
  })

  describe('context logging', () => {
    it('should log error with context when context is provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('Test error')

      getUserFriendlyError(error, 'TestComponent')

      expect(consoleSpy).toHaveBeenCalledWith('[TestComponent]', error)
    })

    it('should not log context when context is not provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      getUserFriendlyError(new Error('Test error'))

      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })
})
