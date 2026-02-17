'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import MembersManager from './MembersManager'
import { Project } from '@/types/project'
import { useAuth } from '@/hooks/useAuth'
import styles from './ProjectEditModal.module.css'

interface ProjectEditModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onSave: (updates: Partial<Project>) => Promise<void>
  onAddMember: (projectId: string, uid: string) => Promise<void>
  onRemoveMember: (projectId: string, uid: string) => Promise<void>
}

const statusOptions = [
  { value: 'planned', label: 'Planeado' },
  { value: 'active', label: 'Activo' },
  { value: 'completed', label: 'Completado' },
  { value: 'archived', label: 'Archivado' },
]

export default function ProjectEditModal({
  isOpen,
  onClose,
  project,
  onSave,
  onAddMember,
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'members'>('info')

  const isCreator = user?.uid === project.createdBy
  const canEdit = isCreator

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validaciones básicas
      if (!formData.name.trim()) {
        setError('El nombre del proyecto es requerido')
        return
      }
      if (!formData.description.trim()) {
        setError('La descripción es requerida')
        return
      }

      const updates: Partial<Project> = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status as Project['status'],
      }

      await onSave(updates)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (uid: string) => {
    try {
      setLoading(true)
      await onAddMember(project.id, uid)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar miembro')
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

        {/* Tab: Miembros */}
        {activeTab === 'members' && (
          <div className={styles.content}>
            <MembersManager
              members={project.members}
              projectCreatorId={project.createdBy}
              onAddMember={handleAddMember}
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
          {canEdit && activeTab === 'info' && (
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
