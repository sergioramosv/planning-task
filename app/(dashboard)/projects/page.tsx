'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import Button from '@/components/ui/Button'
import ProjectList from '@/components/projects/ProjectList'
import ProjectModal from '@/components/projects/ProjectModal'
import Spinner from '@/components/ui/Spinner'
import { ProjectFormData } from '@/lib/utils/validators'
import toast, { Toaster } from 'react-hot-toast'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import styles from './page.module.css'

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects(user?.uid || null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  const handleCreateProject = async (data: ProjectFormData) => {
    setIsLoading(true)
    try {
      await createProject({
        ...data,
        createdBy: user!.uid,
        members: { [user!.uid]: true },
      })
      toast.success('Proyecto creado exitosamente')
      setIsModalOpen(false)
    } catch (err) {
      toast.error('Error al crear el proyecto')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      await deleteProject(projectToDelete)
      toast.success('Proyecto eliminado correctamente', {
        style: {
          background: '#10B981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      })
    } catch (err) {
      toast.error('Error al eliminar el proyecto')
    } finally {
      setIsDeleteModalOpen(false)
      setProjectToDelete(null)
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Proyectos</h1>
            <p className={styles.subtitle}>Gestiona todos tus proyectos en un solo lugar</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>+ Crear Proyecto</Button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        <ProjectList
          projects={projects}
          loading={loading}
          onDelete={confirmDeleteProject}
        />
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Eliminar Proyecto"
        message={`¿Estás seguro de que deseas eliminar el proyecto "${projects.find(p => p.id === projectToDelete)?.name}"? Esta acción no se puede deshacer y borrará permanentemente todas las tareas y sprints asociados.`}
        confirmText="Eliminar Proyecto"
        variant="danger"
        confirmInput={projects.find(p => p.id === projectToDelete)?.name}
        inputLabel="Escribe el nombre del proyecto para confirmar:"
        inputPlaceholder={projects.find(p => p.id === projectToDelete)?.name}
      />
    </>
  )
}
