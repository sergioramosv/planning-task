'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Search } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { UserService } from '@/lib/services/user.service'
import { NotificationService } from '@/lib/services/notification.service'
import { ProjectRole } from '@/types/project'
import styles from './MembersManager.module.css'

interface Member {
  uid: string
  displayName: string
  email: string
  photoURL?: string
}

const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Miembro',
  viewer: 'Visor',
}

const ASSIGNABLE_ROLES: ProjectRole[] = ['admin', 'member', 'viewer']

interface MembersManagerProps {
  members: Record<string, boolean | { role?: ProjectRole }>
  projectCreatorId: string
  projectId: string
  projectName: string
  projectCreatorName: string
  onInviteMember: (uid: string, email: string, role: ProjectRole) => Promise<void>
  onRemoveMember: (uid: string) => Promise<void>
}

export default function MembersManager({
  members,
  projectCreatorId,
  projectId,
  projectName,
  projectCreatorName,
  onInviteMember,
  onRemoveMember,
}: MembersManagerProps) {
  const { user: currentUser } = useAuth()
  const [allUsers, setAllUsers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localMembers, setLocalMembers] = useState<Record<string, boolean | { role?: ProjectRole }>>(members)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, ProjectRole>>({})

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

  useEffect(() => {
    setLocalMembers(members)
  }, [members])

  const getMemberRole = (memberId: string): ProjectRole => {
    const memberData = localMembers[memberId]
    if (memberId === projectCreatorId) return 'owner'
    if (typeof memberData === 'object' && memberData?.role) return memberData.role
    return 'member'
  }

  const membersList = Object.keys(localMembers).filter((uid) => {
    const val = localMembers[uid]
    return val === true || (typeof val === 'object' && val !== null)
  })

  const filteredUsers = allUsers.filter(
    (user) =>
      !membersList.includes(user.uid) &&
      (user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleInviteMember = async (uid: string, email: string) => {
    try {
      setLoading(true)
      setError(null)
      const role = selectedRoles[uid] || 'member'
      await onInviteMember(uid, email, role)
      setSearchTerm('')
      setSelectedRoles(prev => {
        const next = { ...prev }
        delete next[uid]
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar invitación')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (uid: string) => {
    try {
      setLoading(true)
      setError(null)

      await onRemoveMember(uid)
      setLocalMembers(prev => ({
        ...prev,
        [uid]: false,
      }))

      try {
        await NotificationService.notifyMemberRemoval(
          uid,
          projectName,
          projectCreatorName
        )
      } catch (notifErr) {
        console.error('Error sending member removal notification:', notifErr)
      }
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
              const role = getMemberRole(memberId)
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
                        <span className={styles.roleBadge} data-role={role}>
                          {ROLE_LABELS[role]}
                        </span>
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
                      <div className={styles.inviteActions}>
                        <select
                          className={styles.roleSelect}
                          value={selectedRoles[user.uid] || 'member'}
                          onChange={(e) => setSelectedRoles(prev => ({
                            ...prev,
                            [user.uid]: e.target.value as ProjectRole,
                          }))}
                        >
                          {ASSIGNABLE_ROLES.map(r => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleInviteMember(user.uid, user.email)}
                          disabled={loading}
                        >
                          <Plus size={16} />
                          Invitar
                        </Button>
                      </div>
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
