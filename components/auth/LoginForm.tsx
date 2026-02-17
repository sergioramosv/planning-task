'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const router = useRouter()
  const { login, register, loading, error, resetError } = useAuth()
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
            <form onSubmit={handleSubmit} className={styles.form}>

              {(formError || error) && (
                <div className={styles.errorAlert}>
                  <AlertCircle className={styles.errorIcon} />
                  <p className={styles.errorText}>{formError || error}</p>
                </div>
              )}

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

            <div className={styles.footer}>
              <p className={styles.footerText}>
                <span className={styles.footerHighlight}>Demo: </span>
                Usa cualquier email y contraseña
              </p>
            </div>
          </div>
        </div>

        <p className={styles.info}>
          Tu seguridad es nuestra prioridad
        </p>
      </div>
    </div>
  )
}
