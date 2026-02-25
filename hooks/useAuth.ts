'use client'

import { useState, useEffect, useCallback } from 'react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, updatePassword as firebaseUpdatePassword, reauthenticateWithCredential, EmailAuthProvider, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth, database } from '@/lib/firebase/config'
import { User } from '@/types'
import { ref, set, update, get } from 'firebase/database'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Usuario',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'developer',
          createdAt: Date.now(),
        }
        setAuthUser(firebaseUser)
        setUser(userData)
        document.cookie = `session=${firebaseUser.uid}; path=/; max-age=604800`
      } else {
        setUser(null)
        setAuthUser(null)
        document.cookie = 'session=; path=/; max-age=0'
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        role: 'developer',
        createdAt: Date.now(),
      }
      await set(ref(database, `users/${firebaseUser.uid}`), userData)
      setAuthUser(firebaseUser)
      setUser(userData)
      document.cookie = `session=${firebaseUser.uid}; path=/; max-age=604800`
    } catch (err: any) {
      const message = err.code === 'auth/email-already-in-use' ? 'El email ya existe' : err.message
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      setAuthUser(firebaseUser)
      document.cookie = `session=${firebaseUser.uid}; path=/; max-age=604800`
    } catch (err: any) {
      const message = err.code === 'auth/user-not-found' ? 'Usuario no encontrado' : 'Email o contraseña incorrectos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      const { user: firebaseUser } = await signInWithPopup(auth, provider)

      // Check if user exists in database, create if not
      const userRef = ref(database, `users/${firebaseUser.uid}`)
      const snapshot = await get(userRef)

      if (!snapshot.exists()) {
        const userData: Record<string, any> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Usuario',
          role: 'developer',
          createdAt: Date.now(),
        }
        if (firebaseUser.photoURL) {
          userData.photoURL = firebaseUser.photoURL
        }
        await set(userRef, userData)
      } else {
        // Update displayName and photoURL from Google profile
        const updates: Record<string, any> = {
          displayName: firebaseUser.displayName || snapshot.val().displayName,
        }
        if (firebaseUser.photoURL) {
          updates.photoURL = firebaseUser.photoURL
        }
        await update(userRef, updates)
      }

      setAuthUser(firebaseUser)
      document.cookie = `session=${firebaseUser.uid}; path=/; max-age=604800`
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, not an error
        return
      }
      const message =
        err.code === 'auth/account-exists-with-different-credential'
          ? 'Ya existe una cuenta con ese email usando otro método de inicio de sesión'
          : err.code === 'auth/popup-blocked'
          ? 'El navegador bloqueó la ventana emergente. Permite popups para este sitio'
          : err.message || 'Error al iniciar sesión con Google'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
      setAuthUser(null)
      document.cookie = 'session=; path=/; max-age=0'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const updateUserProfile = useCallback(async (displayName: string) => {
    setError(null)
    if (!authUser) return
    try {
      await updateProfile(authUser, { displayName })
      const userData: User = {
        uid: authUser.uid,
        email: authUser.email || '',
        displayName,
        photoURL: authUser.photoURL || undefined,
        role: 'developer',
        createdAt: Date.now(),
      }
      await update(ref(database, `users/${authUser.uid}`), { displayName })
      setUser(userData)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [authUser])

  const updateUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setError(null)
    if (!authUser || !authUser.email) return
    try {
      const credential = EmailAuthProvider.credential(authUser.email, currentPassword)
      await reauthenticateWithCredential(authUser, credential)
      await firebaseUpdatePassword(authUser, newPassword)
    } catch (err: any) {
      const message = err.code === 'auth/wrong-password' ? 'Contraseña actual incorrecta' : err.message
      setError(message)
      throw err
    }
  }, [authUser])

  return {
    user,
    authUser,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    resetError,
    updateProfile: updateUserProfile,
    updatePassword: updateUserPassword,
    isAuthenticated: !!user,
  }
}
