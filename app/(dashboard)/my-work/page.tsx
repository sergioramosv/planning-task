'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import Spinner from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { TaskService } from '@/lib/services/task.service'
import { BugService } from '@/lib/services/bug.service'
import { ProjectService } from '@/lib/services/project.service'
import { Task, Project } from '@/types'
import { Bug } from '@/types/bug'
import { TASK_STATUS_LABELS } from '@/lib/constants/taskStates'
import { Clock, AlertTriangle, CheckCircle, ArrowRight, Bug as BugIcon, FolderOpen } from 'lucide-react'
import styles from './page.module.css'

export default function MyWorkPage() {
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [myBugs, setMyBugs] = useState<Bug[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      try {
        const [allTasks, allBugs, allProjects] = await Promise.all([
          TaskService.getAllTasks(),
          BugService.getAllBugs(),
          ProjectService.getProjectsForUser(user.uid),
        ])

        const tasks = allTasks.filter(t => t.developer === user.uid)
        const bugs = allBugs.filter(b => b.assignedTo === user.uid && b.status !== 'closed')
        setMyTasks(tasks)
        setMyBugs(bugs)
        setProjects(allProjects)
      } catch (error) {
        console.error('Error fetching my work:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const inProgress = myTasks.filter(t => t.status === 'in-progress')
  const dueSoon = myTasks.filter(t => {
    if (!t.endDate || t.status === 'done' || t.status === 'validated') return false
    const diff = new Date(t.endDate).getTime() - now.getTime()
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000
  })
  const overdue = myTasks.filter(t => {
    if (!t.endDate || t.status === 'done' || t.status === 'validated') return false
    return new Date(t.endDate) < now
  })
  const toDo = myTasks.filter(t => t.status === 'to-do')
  const toValidate = myTasks.filter(t => t.status === 'to-validate')
  const completed = myTasks.filter(t => t.status === 'done' || t.status === 'validated')

  // Group tasks by project
  const tasksByProject: Record<string, Task[]> = {}
  myTasks.filter(t => t.status !== 'done' && t.status !== 'validated').forEach(task => {
    const pid = task.projectId
    if (!tasksByProject[pid]) tasksByProject[pid] = []
    tasksByProject[pid].push(task)
  })

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || projectId
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return 'var(--color-red-500)'
    if (priority >= 2) return 'var(--color-yellow-500)'
    return 'var(--color-primary-500)'
  }

  const statusColors: Record<string, string> = {
    'to-do': 'var(--color-neutral-500)',
    'in-progress': 'var(--color-blue-500)',
    'to-validate': 'var(--color-yellow-500)',
    'validated': 'var(--color-green-500)',
    'done': 'var(--color-primary-500)',
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Mi Trabajo</h1>
      <p className={styles.pageSubtitle}>Todo lo que necesitas en un solo lugar</p>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Clock size={20} style={{ color: 'var(--color-blue-500)' }} />
          <div>
            <span className={styles.statNumber}>{inProgress.length}</span>
            <span className={styles.statLabel}>En progreso</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <AlertTriangle size={20} style={{ color: 'var(--color-yellow-500)' }} />
          <div>
            <span className={styles.statNumber}>{dueSoon.length + overdue.length}</span>
            <span className={styles.statLabel}>Urgentes</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <BugIcon size={20} style={{ color: 'var(--color-red-500)' }} />
          <div>
            <span className={styles.statNumber}>{myBugs.length}</span>
            <span className={styles.statLabel}>Bugs asignados</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <CheckCircle size={20} style={{ color: 'var(--color-green-500)' }} />
          <div>
            <span className={styles.statNumber}>{completed.length}</span>
            <span className={styles.statLabel}>Completadas</span>
          </div>
        </div>
      </div>

      {/* Today Section - In Progress + Overdue */}
      {(inProgress.length > 0 || overdue.length > 0) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hoy</h2>
          <div className={styles.taskList}>
            {overdue.map(task => (
              <div key={task.id} className={`${styles.taskItem} ${styles.taskOverdue}`}>
                <div className={styles.taskLeft}>
                  <span className={styles.priorityDot} style={{ background: getPriorityColor(task.priority) }} />
                  <div>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskMeta}>
                      {getProjectName(task.projectId)} &middot; Vencida {task.endDate}
                    </span>
                  </div>
                </div>
                <div className={styles.taskRight}>
                  <span className={styles.statusBadge} style={{ color: statusColors[task.status] }}>
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                  <button className={styles.goButton} onClick={() => router.push(`/projects/${task.projectId}?task=${task.id}`)}>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
            {inProgress.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div className={styles.taskLeft}>
                  <span className={styles.priorityDot} style={{ background: getPriorityColor(task.priority) }} />
                  <div>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskMeta}>
                      {getProjectName(task.projectId)}{task.endDate ? ` · Vence ${task.endDate}` : ''}
                    </span>
                  </div>
                </div>
                <div className={styles.taskRight}>
                  <span className={styles.statusBadge} style={{ color: statusColors[task.status] }}>
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                  <button className={styles.goButton} onClick={() => router.push(`/projects/${task.projectId}?task=${task.id}`)}>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bugs Section */}
      {myBugs.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Bugs asignados</h2>
          <div className={styles.taskList}>
            {myBugs.map(bug => (
              <div key={bug.id} className={`${styles.taskItem} ${bug.severity === 'critical' ? styles.taskOverdue : ''}`}>
                <div className={styles.taskLeft}>
                  <BugIcon size={16} style={{ color: bug.severity === 'critical' ? 'var(--color-red-500)' : 'var(--color-yellow-500)' }} />
                  <div>
                    <span className={styles.taskTitle}>{bug.title}</span>
                    <span className={styles.taskMeta}>
                      {getProjectName(bug.projectId)} &middot; {bug.severity}
                    </span>
                  </div>
                </div>
                <div className={styles.taskRight}>
                  <span className={styles.statusBadge}>{bug.status}</span>
                  <button className={styles.goButton} onClick={() => router.push(`/projects/${bug.projectId}`)}>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tasks by Project */}
      {Object.keys(tasksByProject).length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Por proyecto</h2>
          {Object.entries(tasksByProject).map(([projectId, tasks]) => (
            <div key={projectId} className={styles.projectGroup}>
              <div className={styles.projectHeader}>
                <FolderOpen size={16} />
                <span className={styles.projectName}>{getProjectName(projectId)}</span>
                <span className={styles.projectCount}>{tasks.length} tareas</span>
              </div>
              <div className={styles.taskList}>
                {tasks.sort((a, b) => b.priority - a.priority).map(task => (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskLeft}>
                      <span className={styles.priorityDot} style={{ background: getPriorityColor(task.priority) }} />
                      <div>
                        <span className={styles.taskTitle}>{task.title}</span>
                        <span className={styles.taskMeta}>
                          Prioridad {task.priority.toFixed(1)} &middot; {task.bizPoints}biz / {task.devPoints}dev
                        </span>
                      </div>
                    </div>
                    <div className={styles.taskRight}>
                      <span className={styles.statusBadge} style={{ color: statusColors[task.status] }}>
                        {TASK_STATUS_LABELS[task.status]}
                      </span>
                      <button className={styles.goButton} onClick={() => router.push(`/projects/${task.projectId}?task=${task.id}`)}>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {myTasks.length === 0 && myBugs.length === 0 && (
        <div className={styles.emptyState}>
          <CheckCircle size={48} style={{ color: 'var(--color-neutral-300)' }} />
          <p>No tienes tareas ni bugs asignados</p>
        </div>
      )}
    </div>
  )
}
