'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Search } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/lib/services/user.service'
import styles from './MembersManager.module.css'

interface Member {
  uid: string
  displayName: string
  email: string
  photoURL?: string
}

interface MembersManagerProps {
  members: Record<string, boolean>
  projectCreatorId: string
  onAddMember: (uid: string) => Promise<void>
  onRemoveMember: (uid: string) => Promise<void>
}

export default function MembersManager({
  members,
  projectCreatorId,
  onAddMember,
  onRemoveMember,
}: MembersManagerProps) {
  const { user: currentUser } = useAuth()
  const [allUsers, setAllUsers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await UserService.getAllUsers()
        setAllUsers(users)
      } catch (err) {
        setError('Error al cargar usuarios')
        console.error(err)
      }
    }
    fetchUsers()
  }, [])

  const membersList = Object.keys(members).filter((uid) => members[uid])

  const filteredUsers = allUsers.filter(
    (user) =>
      !membersList.includes(user.uid) &&
      (user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAddMember = async (uid: string) => {
    try {
      setLoading(true)
      await onAddMember(uid)
      setSearchTerm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar miembro')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (uid: string) => {
    try {
      setLoading(true)
      await onRemoveMember(uid)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover miembro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.section}>
      <h3 className={styles.title}>Miembros del Proyecto</h3>

        {error && <div className={styles.error}>{error}</div>}

        {/* Lista de miembros actuales */}
        <div className={styles.membersList}>
          {membersList.length === 0 ? (
            <p className={styles.emptyState}>No hay miembros agregados</p>
          ) : (
            membersList.map((memberId) => {
              const member = allUsers.find(u => u.uid === memberId)
              return (
                <div key={memberId} className={styles.memberItem}>
                  <div className={styles.memberInfo}>
                    {member?.photoURL && (
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className={styles.avatarSmall}
                      />
                    )}
                    <div>
                      <div className={styles.memberName}>
                        {member?.displayName || 'Usuario'}
                        {memberId === projectCreatorId && (
                          <span className={styles.creatorBadge}>Creador</span>
                        )}
                      </div>
                      <div className={styles.memberEmail}>{member?.email}</div>
                    </div>
                  </div>
                  {memberId !== projectCreatorId && currentUser?.uid === projectCreatorId && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className={styles.removeButton}
                      title="Remover miembro"
                      disabled={loading}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Agregar nuevo miembro */}
        {currentUser?.uid === projectCreatorId && (
          <div className={styles.addMemberSection}>
            <div className={styles.searchContainer}>
              <Search size={18} className={styles.searchIcon} />
              <Input
                type="text"
                placeholder="Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {searchTerm && (
              <div className={styles.searchResults}>
                {filteredUsers.length === 0 ? (
                  <p className={styles.noResults}>
                    {allUsers.length === 0
                      ? 'Cargando usuarios...'
                      : 'No se encontraron usuarios disponibles'}
                  </p>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user.uid} className={styles.userOption}>
                      <div className={styles.userInfo}>
                        {user.photoURL && (
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className={styles.avatar}
                          />
                        )}
                        <div>
                          <div className={styles.userName}>{user.displayName}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAddMember(user.uid)}
                        disabled={loading}
                      >
                        <Plus size={16} />
                        Agregar
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
