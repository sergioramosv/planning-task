/**
 * Maps known technical error patterns to user-friendly messages.
 * Unknown errors get a generic message while the original is logged to console.
 */

const ERROR_MAP: Array<{ pattern: RegExp; message: string }> = [
  // Auth-specific errors (must be before generic patterns)
  { pattern: /auth\/email-already-in-use/i, message: 'El email ya está registrado.' },
  { pattern: /auth\/user-not-found/i, message: 'Usuario no encontrado.' },
  { pattern: /auth\/wrong-password/i, message: 'Contraseña incorrecta.' },
  { pattern: /auth\/weak-password/i, message: 'La contraseña es demasiado débil.' },
  { pattern: /auth\/invalid-email/i, message: 'El email no es válido.' },
  // Firebase/Firestore (before quota/validation)
  { pattern: /firebase|firestore|database/i, message: 'Error al acceder a los datos. Inténtalo de nuevo.' },
  // Generic errors
  { pattern: /network|fetch|failed to fetch|net::err/i, message: 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.' },
  { pattern: /timeout|timed out|aborted/i, message: 'La operación tardó demasiado. Inténtalo de nuevo.' },
  { pattern: /permission|denied|forbidden|403/i, message: 'No tienes permisos para realizar esta acción.' },
  { pattern: /not found|404/i, message: 'El recurso solicitado no fue encontrado.' },
  { pattern: /unauthorized|401|no autenticado/i, message: 'Tu sesión ha expirado. Inicia sesión de nuevo.' },
  { pattern: /rate.?limit|429|too many|ocupado/i, message: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.' },
  { pattern: /quota|limit exceeded/i, message: 'Se ha alcanzado el límite de uso. Inténtalo más tarde.' },
  { pattern: /duplicate|already exists|ya existe/i, message: 'Este elemento ya existe.' },
  { pattern: /validation|invalid|inválido/i, message: 'Los datos proporcionados no son válidos. Revisa el formulario.' },
]

const GENERIC_ERROR = 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'

/**
 * Converts a technical error into a user-friendly message.
 * Logs the original error to console for debugging.
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
  const message = error instanceof Error ? error.message : String(error)

  // Log technical details for developers
  if (context) {
    console.error(`[${context}]`, error)
  }

  // Check for known patterns
  for (const { pattern, message: friendlyMessage } of ERROR_MAP) {
    if (pattern.test(message)) {
      return friendlyMessage
    }
  }

  // If the error message is already user-friendly (short, in Spanish, no stack trace)
  if (
    message.length < 100 &&
    !message.includes('at ') &&
    !message.includes('Error:') &&
    !message.includes('undefined') &&
    !message.includes('null')
  ) {
    return message
  }

  return GENERIC_ERROR
}

/**
 * Sanitizes an error for API responses.
 * Returns a safe message that doesn't expose internals.
 */
export function getSafeApiError(error: unknown, fallback?: string): string {
  const message = error instanceof Error ? error.message : String(error)

  for (const { pattern, message: friendlyMessage } of ERROR_MAP) {
    if (pattern.test(message)) {
      return friendlyMessage
    }
  }

  return fallback || 'Error interno del servidor'
}
