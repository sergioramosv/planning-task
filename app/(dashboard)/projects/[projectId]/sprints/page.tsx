'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useSprints } from '@/hooks/useSprints'
import { useTasks } from '@/hooks/useTasks'
import { Sprint, Task } from '@/types'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import SprintCard from '@/components/sprints/SprintCard'
import SprintForm from '@/components/sprints/SprintForm'
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import styles from './page.module.css'

export default function SprintsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const { sprints, loading: sprintsLoading, createSprint, deleteSprint, updateSprint } = useSprints(projectId)
  const { tasks, loading: tasksLoading } = useTasks(projectId)
  const project = projects.find(p => p.id === projectId)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (authLoading || sprintsLoading || tasksLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  const getSprintStats = (sprint: Sprint) => {
    const sprintTasks = tasks.filter(t => t.sprintId === sprint.id)
    const totalBizPoints = sprintTasks.reduce((sum, t) => sum + (t.bizPoints || 0), 0)
    const totalDevPoints = sprintTasks.reduce((sum, t) => sum + (t.devPoints || 0), 0)
    return { taskCount: sprintTasks.length, totalBizPoints, totalDevPoints }
  }

  const getTotalStats = () => {
    let totalTasks = 0
    let totalBizPoints = 0
    let totalDevPoints = 0

    sprints.forEach(sprint => {
      const { taskCount, totalBizPoints: bizPts, totalDevPoints: devPts } = getSprintStats(sprint)
      totalTasks += taskCount
      totalBizPoints += bizPts
      totalDevPoints += devPts
    })

    return { totalTasks, totalBizPoints, totalDevPoints }
  }

  const handleEditSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint)
    setIsModalOpen(true)
  }

  const handleDeleteSprint = (sprint: Sprint) => {
    setSprintToDelete(sprint)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (deleteConfirmText !== 'ELIMINAR' || !sprintToDelete) return

    try {
      await deleteSprint(sprintToDelete.id)
      setDeleteConfirmOpen(false)
      setSprintToDelete(null)
      setDeleteConfirmText('')
    } catch (error) {
      console.error('Error deleting sprint:', error)
    }
  }

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (selectedSprint) {
        await updateSprint(selectedSprint.id, data)
      } else {
        await createSprint(data)
      }
      setIsModalOpen(false)
      setSelectedSprint(null)
      setIsSubmitting(false)
    } catch (error: any) {
      console.error('Error saving sprint:', error)
      setSubmitError(error.message || 'Error al guardar el sprint')
      setIsSubmitting(false)
    }
  }

  const { totalTasks, totalBizPoints, totalDevPoints } = getTotalStats()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.backBtn}
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <div>
          <h1 className={styles.title}>Sprints</h1>
          <p className={styles.subtitle}>{project?.name}</p>
        </div>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Tareas</span>
          <span className={styles.summaryValue}>{totalTasks}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Puntos Negocio</span>
          <span className={styles.summaryValue}>{totalBizPoints}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Puntos Desarrollo</span>
          <span className={styles.summaryValue}>{totalDevPoints}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          onClick={() => {
            setSelectedSprint(null)
            setIsModalOpen(true)
          }}
          variant="primary"
        >
          <Plus size={20} />
          Nuevo Sprint
        </Button>
      </div>

      <div className={styles.grid}>
        {[...sprints].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(sprint => {
          const { taskCount, totalBizPoints: bizPts, totalDevPoints: devPts } = getSprintStats(sprint)
          return (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              taskCount={taskCount}
              totalBizPoints={bizPts}
              totalDevPoints={devPts}
              onEdit={handleEditSprint}
              onDelete={handleDeleteSprint}
            />
          )
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedSprint(null)
          setSubmitError(null)
        }}
        title={selectedSprint ? 'Editar Sprint' : 'Crear Sprint'}
      >
        {submitError && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            color: '#DC2626',
            fontSize: '14px'
          }}>
            {submitError}
          </div>
        )}
        <SprintForm
          sprint={selectedSprint || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setSelectedSprint(null)
            setSubmitError(null)
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setSprintToDelete(null)
          setDeleteConfirmText('')
        }}
        title="Eliminar Sprint"
      >
        <div className={styles.deleteConfirm}>
          <div className={styles.deleteWarningContainer}>
            <AlertTriangle size={20} style={{ color: '#EF4444' }} />
            <p className={styles.deleteWarning}>
              Esta acción eliminará el sprint "{sprintToDelete?.name}" y todas sus tareas.
            </p>
          </div>
          <p className={styles.deleteInstruction}>
            Escribe <strong>ELIMINAR</strong> para confirmar:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="ELIMINAR"
            className={styles.confirmInput}
            autoFocus
          />
          <div className={styles.deleteActions}>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setSprintToDelete(null)
                setDeleteConfirmText('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteConfirmText !== 'ELIMINAR'}
            >
              Eliminar Sprint
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
