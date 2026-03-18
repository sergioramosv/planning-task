'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useEpics } from '@/hooks/useEpics'
import { useTasks } from '@/hooks/useTasks'
import { usePermissions } from '@/hooks/usePermissions'
import { Epic, EPIC_COLORS } from '@/types/epic'
import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { ArrowLeft, Plus, Pencil, Trash2, Layers } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import styles from './page.module.css'

export default function EpicsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const project = projects.find(p => p.id === projectId)
  const { canEditTask } = usePermissions(project)
  const { epics, loading: epicsLoading, createEpic, updateEpic, deleteEpic, addTaskToEpic, removeTaskFromEpic } = useEpics(projectId)
  const { tasks, loading: tasksLoading, updateTask } = useTasks(projectId)

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [epicToDelete, setEpicToDelete] = useState<string | null>(null)

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formColor, setFormColor] = useState(EPIC_COLORS[0])
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')

  if (authLoading || epicsLoading || tasksLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <Spinner />
      </div>
    )
  }

  const openEditor = (epic?: Epic) => {
    if (epic) {
      setEditingEpic(epic)
      setFormTitle(epic.title)
      setFormDescription(epic.description || '')
      setFormColor(epic.color)
      setFormStartDate(epic.startDate || '')
      setFormEndDate(epic.endDate || '')
    } else {
      setEditingEpic(null)
      setFormTitle('')
      setFormDescription('')
      setFormColor(EPIC_COLORS[0])
      setFormStartDate('')
      setFormEndDate('')
    }
    setIsEditorOpen(true)
  }

  const handleSubmit = async () => {
    if (!formTitle.trim() || !user) return
    try {
      if (editingEpic) {
        await updateEpic(editingEpic.id, {
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          color: formColor,
          startDate: formStartDate || undefined,
          endDate: formEndDate || undefined,
        })
        toast.success('Epic actualizado')
      } else {
        await createEpic({
          projectId,
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          color: formColor,
          taskIds: [],
          startDate: formStartDate || undefined,
          endDate: formEndDate || undefined,
          createdBy: user.uid,
        })
        toast.success('Epic creado')
      }
      setIsEditorOpen(false)
    } catch {
      toast.error('Error al guardar el epic')
    }
  }

  const handleDeleteClick = (epicId: string) => {
    setEpicToDelete(epicId)
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!epicToDelete) return
    try {
      // Unlink tasks from this epic
      const epic = epics.find(e => e.id === epicToDelete)
      if (epic) {
        for (const taskId of epic.taskIds) {
          await updateTask(taskId, { epicId: undefined })
        }
      }
      await deleteEpic(epicToDelete)
      toast.success('Epic eliminado')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setEpicToDelete(null)
      setIsDeleteConfirmOpen(false)
    }
  }

  const getEpicTasks = (epic: Epic) => {
    return tasks.filter(t => epic.taskIds.includes(t.id))
  }

  const getEpicProgress = (epic: Epic) => {
    const epicTasks = getEpicTasks(epic)
    if (epicTasks.length === 0) return 0
    const done = epicTasks.filter(t => t.status === 'done' || t.status === 'validated').length
    return Math.round((done / epicTasks.length) * 100)
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft size={20} />
        </button>
        <h1>Epics</h1>
        {canEditTask && (
          <Button size="sm" onClick={() => openEditor()}>
            <Plus size={16} style={{ marginRight: '0.25rem' }} /> Nuevo Epic
          </Button>
        )}
      </div>

      {epics.length === 0 ? (
        <div className={styles.emptyState}>
          <Layers size={40} />
          <p>No hay epics todavia. Crea uno para agrupar tus tareas por funcionalidad.</p>
        </div>
      ) : (
        <div className={styles.epicsList}>
          {epics.map(epic => {
            const epicTasks = getEpicTasks(epic)
            const progress = getEpicProgress(epic)
            const doneTasks = epicTasks.filter(t => t.status === 'done' || t.status === 'validated').length

            return (
              <div key={epic.id} className={styles.epicCard} style={{ borderLeftColor: epic.color }}>
                <div className={styles.epicHeader}>
                  <div className={styles.epicInfo}>
                    <div className={styles.epicTitle}>{epic.title}</div>
                    {epic.description && (
                      <div className={styles.epicDescription}>{epic.description}</div>
                    )}
                  </div>
                  <div className={styles.epicActions}>
                    {canEditTask && (
                      <>
                        <button className={styles.iconButton} onClick={() => openEditor(epic)}>
                          <Pencil size={14} />
                        </button>
                        <button className={`${styles.iconButton} ${styles.iconButtonDanger}`} onClick={() => handleDeleteClick(epic.id)}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%`, background: epic.color }} />
                  </div>
                  <div className={styles.progressLabel}>
                    <span>{doneTasks}/{epicTasks.length} tareas completadas</span>
                    <span>{progress}%</span>
                  </div>
                </div>

                {epicTasks.length > 0 && (
                  <div className={styles.taskChips}>
                    {epicTasks.map(t => (
                      <span
                        key={t.id}
                        className={`${styles.taskChip} ${(t.status === 'done' || t.status === 'validated') ? styles.taskChipDone : ''}`}
                      >
                        {t.title}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.epicMeta}>
                  {epic.startDate && <span>Inicio: {epic.startDate}</span>}
                  {epic.endDate && <span>Fin: {epic.endDate}</span>}
                  <span>{epicTasks.length} tareas</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Epic Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingEpic ? 'Editar Epic' : 'Nuevo Epic'}
        className={modalStyles.contentMd}
      >
        <div className={styles.editorForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Titulo</label>
            <input
              className={styles.formInput}
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="Nombre del epic..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripcion</label>
            <textarea
              className={styles.formTextarea}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="Descripcion opcional..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Color</label>
            <div className={styles.colorPicker}>
              {EPIC_COLORS.map(color => (
                <button
                  key={color}
                  className={`${styles.colorSwatch} ${formColor === color ? styles.colorSwatchActive : ''}`}
                  style={{ background: color }}
                  onClick={() => setFormColor(color)}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className={styles.dateRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha inicio</label>
              <input
                type="date"
                className={styles.formInput}
                value={formStartDate}
                onChange={e => setFormStartDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha fin</label>
              <input
                type="date"
                className={styles.formInput}
                value={formEndDate}
                onChange={e => setFormEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formFooter}>
            <Button variant="secondary" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!formTitle.trim()}>
              {editingEpic ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setEpicToDelete(null) }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Epic"
        message="Se eliminara el epic pero las tareas asociadas se mantendran. Deseas continuar?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
