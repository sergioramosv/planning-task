'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const router = useRouter()
  const { login, loginWithGoogle, register, loading, error, resetError } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    resetError()

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        if (!firstName.trim()) {
          setFormError('El nombre es requerido')
          return
        }
        if (!lastName.trim()) {
          setFormError('El apellido es requerido')
          return
        }
        const displayName = `${firstName} ${lastName}`
        await register(email, password, displayName)
      }
      router.push('/projects')
    } catch (err) {
      setFormError(error || 'Error al procesar la solicitud')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.headerDecor}>
              <div className={styles.headerDeco1}></div>
              <div className={styles.headerDeco2}></div>
            </div>

            <div className={styles.headerContent}>
              <h1 className={styles.headerTitle}>
                {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
              </h1>
              <p className={styles.headerSubtitle}>
                {isLogin
                  ? 'Inicia sesión para continuar'
                  : 'Únete a nuestro equipo hoy'}
              </p>
            </div>
          </div>

          <div className={styles.formContent}>
            {(formError || error) && (
              <div className={styles.errorAlert}>
                <AlertCircle className={styles.errorIcon} />
                <p className={styles.errorText}>{formError || error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                setFormError('')
                resetError()
                try {
                  await loginWithGoogle()
                  router.push('/projects')
                } catch (err) {
                  // Error already set in hook state, just prevent navigation
                }
              }}
              disabled={loading}
              className={styles.googleButton}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuar con Google
            </button>

            <div className={styles.dividerRow}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerText}>o</span>
              <span className={styles.dividerLine}></span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>

              {!isLogin && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <div className={styles.labelContent}>
                        <User className={styles.labelIcon} />
                        Nombre
                      </div>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Tu nombre"
                      disabled={loading}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <div className={styles.labelContent}>
                        <User className={styles.labelIcon} />
                        Apellidos
                      </div>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Tus apellidos"
                      disabled={loading}
                      className={styles.input}
                    />
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <div className={styles.labelContent}>
                    <Mail className={styles.labelIcon} />
                    Correo Electrónico
                  </div>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={loading}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <div className={styles.labelContent}>
                    <Lock className={styles.labelIcon} />
                    Contraseña
                  </div>
                </label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    required
                    className={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Procesando...
                  </>
                ) : (
                  isLogin ? 'Iniciar sesión' : 'Crear cuenta'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setFormError('')
                  resetError()
                  setEmail('')
                  setPassword('')
                  setFirstName('')
                  setLastName('')
                  setShowPassword(false)
                }}
                className={styles.toggleMode}
              >
                {isLogin
                  ? '¿No tienes cuenta? Regístrate aquí'
                  : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
