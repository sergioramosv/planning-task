'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import MembersManager from './MembersManager'
import { Project, ProjectRepository } from '@/types/project'
import { useAuth } from '@/hooks/useAuth'
import { Plus, X, Star } from 'lucide-react'
import styles from './ProjectEditModal.module.css'

interface ProjectEditModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onSave: (updates: Partial<Project>) => Promise<void>
  onInviteMember: (projectId: string, uid: string, email: string) => Promise<void>
  onRemoveMember: (projectId: string, uid: string) => Promise<void>
}

const statusOptions = [
  { value: 'planned', label: 'Planeado' },
  { value: 'active', label: 'Activo' },
  { value: 'completed', label: 'Completado' },
  { value: 'archived', label: 'Archivado' },
]

const repoTypeOptions = [
  { value: 'front', label: 'Frontend' },
  { value: 'back', label: 'Backend' },
  { value: 'api', label: 'API' },
  { value: 'fullstack', label: 'Full Stack' },
]

export default function ProjectEditModal({
  isOpen,
  onClose,
  project,
  onSave,
  onInviteMember,
  onRemoveMember,
}: ProjectEditModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
  })
  const [repositories, setRepositories] = useState<ProjectRepository[]>(project.repositories || [])
  const [languages, setLanguages] = useState(project.languages || '')
  const [frameworks, setFrameworks] = useState(project.frameworks || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'repos'>('info')

  const isCreator = user?.uid === project.createdBy
  const canEdit = isCreator

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddRepo = () => {
    setRepositories(prev => [
      ...prev,
      { url: '', type: 'fullstack' as const, isDefault: prev.length === 0 },
    ])
  }

  const handleRemoveRepo = (index: number) => {
    setRepositories(prev => {
      const next = prev.filter((_, i) => i !== index)
      if (prev[index]?.isDefault && next.length > 0) {
        next[0].isDefault = true
      }
      return next
    })
  }

  const handleRepoChange = (index: number, field: keyof ProjectRepository, value: any) => {
    setRepositories(prev => {
      const next = [...prev]
      if (field === 'isDefault' && value === true) {
        next.forEach((r, i) => { r.isDefault = i === index })
      } else {
        next[index] = { ...next[index], [field]: value }
      }
      return next
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!formData.name.trim()) {
        setError('El nombre del proyecto es requerido')
        return
      }
      if (!formData.description.trim()) {
        setError('La descripción es requerida')
        return
      }

      const validRepos = repositories.filter(r => r.url.trim())

      const updates: Partial<Project> = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status as Project['status'],
        repositories: validRepos.length > 0 ? validRepos : undefined,
        languages: languages.trim() || undefined,
        frameworks: frameworks.trim() || undefined,
      }

      await onSave(updates)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (uid: string, email: string) => {
    try {
      setLoading(true)
      await onInviteMember(project.id, uid, email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar invitación')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (uid: string) => {
    try {
      setLoading(true)
      await onRemoveMember(project.id, uid)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover miembro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Proyecto"
      className={modalStyles.contentLg}
    >
      <div className={styles.container}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'info' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Información
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'repos' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('repos')}
          >
            Repositorios
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Miembros
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Tab: Información */}
        {activeTab === 'info' && (
          <div className={styles.content}>
            <div className={styles.formGroup}>
              <Input
                label="Nombre del Proyecto"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!canEdit || loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!canEdit || loading}
                required
                className={styles.textarea}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  label="Fecha de Inicio"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  label="Fecha de Fin"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={!canEdit || loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <Select
                label="Estado"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statusOptions}
                disabled={!canEdit || loading}
              />
            </div>

            {!canEdit && (
              <div className={styles.info}>
                Solo el creador del proyecto puede editar esta información.
              </div>
            )}
          </div>
        )}

        {/* Tab: Repositorios */}
        {activeTab === 'repos' && (
          <div className={styles.content}>
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-3)' }}>
                <label style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>Repositorios del Proyecto</label>
                {canEdit && (
                  <Button type="button" size="sm" variant="secondary" onClick={handleAddRepo} disabled={loading}>
                    <Plus size={16} /> Añadir
                  </Button>
                )}
              </div>
              {repositories.map((repo, index) => (
                <div key={index} className={styles.formRow} style={{ marginBottom: 'var(--spacing-2)' }}>
                  <Input
                    placeholder="https://github.com/org/repo"
                    value={repo.url}
                    onChange={(e) => handleRepoChange(index, 'url', e.target.value)}
                    disabled={!canEdit || loading}
                  />
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                    <select
                      value={repo.type}
                      onChange={(e) => handleRepoChange(index, 'type', e.target.value)}
                      disabled={!canEdit || loading}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {repoTypeOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRepoChange(index, 'isDefault', true)}
                      disabled={!canEdit || loading}
                      style={{
                        padding: '8px',
                        border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-md)',
                        background: repo.isDefault ? 'var(--color-primary-50)' : 'transparent',
                        color: repo.isDefault ? 'var(--color-primary-700)' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      <Star size={14} />
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRepo(index)}
                        disabled={loading}
                        style={{
                          padding: '8px',
                          border: 'none',
                          background: 'none',
                          color: 'var(--color-red-600)',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {repositories.length > 0 && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  El repositorio con ★ es el &quot;por defecto&quot; para tareas sin etiqueta asignada.
                </p>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <Input
                  label="Lenguajes"
                  placeholder="TypeScript, CSS, HTML"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  disabled={!canEdit || loading}
                />
              </div>
              <div className={styles.formGroup}>
                <Input
                  label="Frameworks"
                  placeholder="Next, Tailwind"
                  value={frameworks}
                  onChange={(e) => setFrameworks(e.target.value)}
                  disabled={!canEdit || loading}
                />
              </div>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Separados por comas.
            </p>

            {!canEdit && (
              <div className={styles.info}>
                Solo el creador del proyecto puede editar esta información.
              </div>
            )}
          </div>
        )}

        {/* Tab: Miembros */}
        {activeTab === 'members' && (
          <div className={styles.content}>
            <MembersManager
              members={Object.fromEntries(
                Object.entries(project.members).map(([uid, value]) => [uid, typeof value === 'boolean' ? value : true])
              )}
              projectCreatorId={project.createdBy}
              projectId={project.id}
              projectName={project.name}
              projectCreatorName={user?.displayName || 'Usuario'}
              onInviteMember={handleInviteMember}
              onRemoveMember={handleRemoveMember}
            />
          </div>
        )}

        {/* Acciones */}
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          {canEdit && (activeTab === 'info' || activeTab === 'repos') && (
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
