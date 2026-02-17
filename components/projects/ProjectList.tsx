'use client'

import { Project, Sprint, Task } from '@/types'
import ProjectCard from './ProjectCard'
import Spinner from '@/components/ui/Spinner'
import styles from './ProjectList.module.css'
import { useState, useEffect } from 'react'
import { SprintService } from '@/lib/services/sprint.service'
import { TaskService } from '@/lib/services/task.service'
import { Folder } from 'lucide-react'

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
  const [allSprints, setAllSprints] = useState<Sprint[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sprints, tasks] = await Promise.all([
          SprintService.getAllSprints(),
          TaskService.getAllTasks(),
        ])
        setAllSprints(sprints)
        setAllTasks(tasks)
      } catch (error) {
        console.error('Error loading project data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading || dataLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Folder className={styles.emptyIcon} size={48} />
        <h3 className={styles.emptyTitle}>No hay proyectos</h3>
        <p className={styles.emptyMessage}>Crea tu primer proyecto para comenzar</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {projects.map(project => {
        const projectSprints = allSprints.filter(s => s.projectId === project.id)
        const projectTasks = allTasks.filter(t => t.projectId === project.id)

        return (
          <ProjectCard
            key={project.id}
            project={project}
            sprints={projectSprints}
            tasks={projectTasks}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}
