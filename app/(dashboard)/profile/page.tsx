'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import cardStyles from '@/components/ui/Card.module.css'
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import styles from './page.module.css'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, error, updateProfile, updatePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.displayName?.split(' ')[0] || '')
  const [lastName, setLastName] = useState(user?.displayName?.split(' ').slice(1).join(' ') || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsLoadingUpdate(true)

    try {
      if (!firstName.trim()) {
        setErrorMessage('El nombre es requerido')
        setIsLoadingUpdate(false)
        return
      }
      if (!lastName.trim()) {
        setErrorMessage('El apellido es requerido')
        setIsLoadingUpdate(false)
        return
      }

      const displayName = `${firstName} ${lastName}`
      await updateProfile(displayName)
      setSuccessMessage('Perfil actualizado correctamente')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(error || 'Error al actualizar el perfil')
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!currentPassword) {
      setErrorMessage('Ingresa tu contraseña actual')
      return
    }
    if (!newPassword) {
      setErrorMessage('Ingresa una nueva contraseña')
      return
    }
    if (newPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden')
      return
    }

    setIsLoadingUpdate(true)
    try {
      await updatePassword(currentPassword, newPassword)
      setSuccessMessage('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsChangingPassword(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage(error || 'Error al cambiar la contraseña')
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  if (loading) {
    return <div className={styles.loadingContainer}>Cargando...</div>
  }

  if (!user) {
    return <div className={styles.loadingContainer}>Usuario no autenticado</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className={styles.title}>Mi Perfil</h1>
      </div>

      <div className={styles.content}>
        {(successMessage || errorMessage) && (
          <div className={`${styles.message} ${successMessage ? styles.success : styles.error}`}>
            {successMessage ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p>{successMessage || errorMessage}</p>
          </div>
        )}

        {/* Información de Perfil */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className={cardStyles.contentSpaced4}>
            {!isEditing ? (
              <>
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Nombre</label>
                  <p className={styles.infoValue}>{firstName}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Apellidos</label>
                  <p className={styles.infoValue}>{lastName}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label className={styles.infoLabel}>Correo Electrónico</label>
                  <p className={styles.infoValue}>{user.email}</p>
                  <p className={styles.infoSubtext}>No se puede cambiar el correo</p>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  className={styles.editButton}
                >
                  Editar Información
                </Button>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <Input
                  label="Nombre"
                  value={firstName}
                  onChange={(e: any) => setFirstName(e.target.value)}
                  disabled={isLoadingUpdate}
                  required
                />
                <Input
                  label="Apellidos"
                  value={lastName}
                  onChange={(e: any) => setLastName(e.target.value)}
                  disabled={isLoadingUpdate}
                  required
                />
                <div className={styles.buttonGroup}>
                  <Button
                    type="submit"
                    disabled={isLoadingUpdate}
                    loading={isLoadingUpdate}
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false)
                      setFirstName(user.displayName?.split(' ')[0] || '')
                      setLastName(user.displayName?.split(' ').slice(1).join(' ') || '')
                    }}
                    disabled={isLoadingUpdate}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Cambiar Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent className={cardStyles.contentSpaced4}>
            {!isChangingPassword ? (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="secondary"
              >
                Cambiar Contraseña
              </Button>
            ) : (
              <form onSubmit={handleChangePassword}>
                <Input
                  type="password"
                  label="Contraseña Actual"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e: any) => setCurrentPassword(e.target.value)}
                  disabled={isLoadingUpdate}
                  required
                />
                <Input
                  type="password"
                  label="Nueva Contraseña"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e: any) => setNewPassword(e.target.value)}
                  disabled={isLoadingUpdate}
                  required
                />
                <Input
                  type="password"
                  label="Confirmar Contraseña"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  disabled={isLoadingUpdate}
                  required
                />
                <div className={styles.buttonGroup}>
                  <Button
                    type="submit"
                    disabled={isLoadingUpdate}
                    loading={isLoadingUpdate}
                  >
                    Cambiar Contraseña
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsChangingPassword(false)
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    disabled={isLoadingUpdate}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
