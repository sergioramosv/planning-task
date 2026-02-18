'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { User } from '@/types'
import Spinner from '@/components/ui/Spinner'
import { Users, AlertCircle } from 'lucide-react'
import styles from './page.module.css'

export default function TeamPage() {
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user || !projects.length) {
        setLoading(false)
        return
      }

      // Collect all unique members from user's projects
      const memberIds = new Set<string>()
      projects.forEach((project) => {
        if (project.members) {
          Object.keys(project.members).forEach((id) => memberIds.add(id))
        }
      })

      // TODO: Fetch user details from database
      // For now, show member count
      setLoading(false)
    }

    if (!authLoading) {
      fetchTeamMembers()
    }
  }, [user, authLoading, projects])

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>Por favor inicia sesión para ver el equipo</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión del Equipo</h1>
        <p className={styles.subtitle}>
          Administra los miembros de tu equipo y sus proyectos
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Proyectos</div>
          <div className={styles.cardContent}>
            <p className={styles.stat}>
              <span className={styles.statValue}>{projects.length}</span>
              <span className={styles.statLabel}>proyectos activos</span>
            </p>

            <div className={styles.projectsList}>
              {projects.length === 0 ? (
                <p className={styles.emptyText}>No tienes proyectos aún</p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className={styles.projectItem}>
                    <div className={styles.projectName}>{project.name}</div>
                    <div className={styles.projectMembers}>
                      {project.members ? Object.keys(project.members).length : 0} miembros
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Miembros del Equipo</div>
          <div className={styles.cardContent}>
            <div className={styles.noteContainer}>
              <AlertCircle size={16} />
              <p className={styles.note}>
                Próximamente: Vista detallada de miembros, gestión de roles y permisos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
