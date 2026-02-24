import { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export interface SessionUser {
  uid: string
  displayName: string
  email: string
}

/**
 * Valida la sesión del usuario leyendo la cookie 'session' y verificando
 * que el UID existe en la base de datos.
 * Retorna los datos del usuario o null si no es válida.
 */
export async function validateSession(request: NextRequest): Promise<SessionUser | null> {
  const sessionCookie = request.cookies.get('session')

  if (!sessionCookie?.value) {
    return null
  }

  const uid = sessionCookie.value

  try {
    const snapshot = await adminDb.ref(`users/${uid}`).once('value')
    const userData = snapshot.val()

    if (!userData) {
      return null
    }

    return {
      uid,
      displayName: userData.displayName || 'Usuario',
      email: userData.email || '',
    }
  } catch {
    return null
  }
}
