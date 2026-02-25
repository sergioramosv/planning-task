'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useInvitations } from '@/hooks/useInvitations'
import Button from '@/components/ui/Button'
import ProjectList from '@/components/projects/ProjectList'
import ProjectModal from '@/components/projects/ProjectModal'
import ProjectEditModal from '@/components/projects/ProjectEditModal'
import Spinner from '@/components/ui/Spinner'
import { Project } from '@/types/project'
import { ProjectFormData } from '@/lib/utils/validators'
import toast, { Toaster } from 'react-hot-toast'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import styles from './page.module.css'

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects(user?.uid || null)
  const { sendInvitation } = useInvitations(user?.uid || null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
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

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project)
    setIsEditModalOpen(true)
  }

  const handleSaveProjectEdit = async (updates: Partial<Project>) => {
    if (!projectToEdit) return

    setIsLoading(true)
    try {
      await updateProject(projectToEdit.id, updates)
      toast.success('Proyecto actualizado exitosamente')
      setIsEditModalOpen(false)
      setProjectToEdit(null)
    } catch (err) {
      toast.error('Error al actualizar el proyecto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (projectId: string, uid: string, email: string, role: string = 'member') => {
    try {
      const project = projects.find(p => p.id === projectId)
      if (project && user) {
        await sendInvitation({
          projectId,
          projectName: project.name,
          projectCreatorId: user.uid,
          projectCreatorName: user.displayName || 'Usuario',
          invitedUserId: uid,
          invitedUserEmail: email,
          role: role as any,
          status: 'pending',
        })
        toast.success('Invitación enviada exitosamente')
      }
    } catch (err) {
      toast.error('Error al enviar invitación')
    }
  }

  const handleRemoveMember = async (projectId: string, uid: string) => {
    try {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        const newMembers = { ...project.members }
        delete newMembers[uid]
        await updateProject(projectId, {
          members: newMembers,
        })
        toast.success('Miembro removido exitosamente')
      }
    } catch (err) {
      toast.error('Error al remover miembro')
    }
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
          onEdit={handleEditProject}
          onDelete={confirmDeleteProject}
        />
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {projectToEdit && (
        <ProjectEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setProjectToEdit(null)
          }}
          project={projectToEdit}
          onSave={handleSaveProjectEdit}
          onInviteMember={handleInviteMember}
          onRemoveMember={handleRemoveMember}
        />
      )}

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
