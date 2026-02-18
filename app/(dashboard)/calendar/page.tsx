'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import Spinner from '@/components/ui/Spinner'
import { Calendar, AlertCircle, CheckSquare } from 'lucide-react'
import { Task, Sprint } from '@/types'
import { database } from '@/lib/firebase/config'
import { ref, onValue } from 'firebase/database'
import styles from './page.module.css'

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [allSprints, setAllSprints] = useState<Sprint[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>Por favor inicia sesión para ver el calendario</div>
      </div>
    )
  }

  const userProjects = projects.filter(
    (p) => p.members && user.uid && p.members[user.uid]
  )

  const projectsToShow = selectedProjects.length > 0
    ? userProjects.filter((p) => selectedProjects.includes(p.id))
    : userProjects

  // Fetch data for selected projects
  useEffect(() => {
    if (projectsToShow.length === 0) {
      setAllTasks([])
      setAllSprints([])
      return
    }

    setDataLoading(true)
    const unsubscribers: (() => void)[] = []

    projectsToShow.forEach((project) => {
      // Subscribe to tasks
      const tasksRef = ref(database, `tasks/${project.id}`)
      const tasksUnsub = onValue(
        tasksRef,
        (snapshot) => {
          const data = snapshot.val() || {}
          const projectTasks = Object.entries(data).map(([id, value]: [string, any]) => ({
            ...value,
            id,
          })) as Task[]
          setAllTasks((prev) => [...prev.filter((t) => t.projectId !== project.id), ...projectTasks])
        }
      )
      unsubscribers.push(tasksUnsub)

      // Subscribe to sprints
      const sprintsRef = ref(database, `sprints/${project.id}`)
      const sprintsUnsub = onValue(
        sprintsRef,
        (snapshot) => {
          const data = snapshot.val() || {}
          const projectSprints = Object.entries(data).map(([id, value]: [string, any]) => ({
            ...value,
            id,
          })) as Sprint[]
          setAllSprints((prev) => [...prev.filter((s) => s.projectId !== project.id), ...projectSprints])
        }
      )
      unsubscribers.push(sprintsUnsub)
    })

    setDataLoading(false)

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [projectsToShow])

  const tasksToShow = allTasks
  const sprintsToShow = allSprints

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Calendario de Proyectos</h1>
        <p className={styles.subtitle}>Visualiza tus sprints y tareas en una vista calendario</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterSection}>
          <label className={styles.label}>Filtrar por Proyecto:</label>
          <div className={styles.projectGrid}>
            {userProjects.map((project) => (
              <button
                key={project.id}
                className={`${styles.projectBtn} ${
                  selectedProjects.length === 0 || selectedProjects.includes(project.id)
                    ? styles.active
                    : ''
                }`}
                onClick={() => {
                  setSelectedProjects((prev) =>
                    prev.includes(project.id)
                      ? prev.filter((id) => id !== project.id)
                      : [...prev, project.id]
                  )
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProjects.length === 0 || selectedProjects.includes(project.id)}
                  readOnly
                  className={styles.checkbox}
                />
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <Calendar size={18} style={{ marginRight: '8px' }} />
            Sprints
          </div>
          <div className={styles.cardBody}>
            {sprintsToShow.length === 0 ? (
              <p className={styles.emptyText}>No hay sprints en los proyectos seleccionados</p>
            ) : (
              <div className={styles.sprintsList}>
                {sprintsToShow.slice(0, 10).map((sprint) => (
                  <div key={sprint.id} className={styles.sprintItem}>
                    <div className={styles.sprintName}>{sprint.name}</div>
                    <div className={styles.sprintDates}>
                      <Calendar size={14} style={{ marginRight: '4px' }} />
                      {new Date(sprint.startDate).toLocaleDateString('es-ES')} -{' '}
                      {new Date(sprint.endDate).toLocaleDateString('es-ES')}
                    </div>
                    <div className={styles.sprintStatus}>
                      Status: <span className={styles.badge}>{sprint.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <CheckSquare size={18} style={{ marginRight: '8px' }} />
            Tareas
          </div>
          <div className={styles.cardBody}>
            {tasksToShow.length === 0 ? (
              <p className={styles.emptyText}>No hay tareas en los proyectos seleccionados</p>
            ) : (
              <div className={styles.tasksList}>
                {tasksToShow.slice(0, 10).map((task) => (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    <div className={styles.taskMeta}>
                      <span className={styles.status}>{task.status}</span>
                      <span className={styles.points}>{task.devPoints} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.note}>
        <AlertCircle size={16} style={{ marginRight: '8px' }} />
        <div>
          <strong>Próximamente:</strong> Vista calendario completa con react-big-calendar, drag-drop
          para reasignar tareas, y exportación a ICS/Google Calendar/Outlook
        </div>
      </div>
    </div>
  )
}
