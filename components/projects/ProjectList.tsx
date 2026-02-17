'use client'

import { Project } from '@/types'
import ProjectCard from './ProjectCard'
import Spinner from '@/components/ui/Spinner'
import styles from './ProjectList.module.css'

interface ProjectListProps {
  projects: Project[]
  loading?: boolean
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
}

export default function ProjectList({
  projects,
  loading = false,
  onEdit,
  onDelete,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyEmoji}>📁</div>
        <h3 className={styles.emptyTitle}>No hay proyectos</h3>
        <p className={styles.emptyMessage}>Crea tu primer proyecto para comenzar</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
