'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import cardStyles from '@/components/ui/Card.module.css'
import styles from './page.module.css'
import { ProjectService } from '@/lib/services/project.service'
import { SprintService } from '@/lib/services/sprint.service'
import { TaskService } from '@/lib/services/task.service'
import { UserService } from '@/lib/services/user.service'
import DeveloperPerformance from '@/components/dashboard/DeveloperPerformance'
import SprintChart from '@/components/dashboard/SprintChart'
import { Project, Task, User, Sprint } from '@/types'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/formatters'
import Badge from '@/components/ui/Badge'
import badgeStyles from '@/components/ui/Badge.module.css'
import { TASK_STATUS_LABELS } from '@/lib/constants/taskStates'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeProjects: 0,
    activeSprints: 0,
    completedTasks: 0,
    pendingTasks: 0
  })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [allSprints, setAllSprints] = useState<Sprint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        const [projects, sprints, tasks, users] = await Promise.all([
          ProjectService.getAllProjects(),
          SprintService.getAllSprints(),
          TaskService.getAllTasks(),
          UserService.getAllUsers()
        ])

        // Filter projects for current user
        const userProjects = projects.filter(p => p.members && p.members[user.uid])
        
        // Calculate stats
        const activeProjectsCount = userProjects.filter(p => p.status === 'active').length
        
        // Sprints for user projects
        const userProjectIds = userProjects.map(p => p.id)
        const activeSprintsCount = sprints.filter(s => 
          userProjectIds.includes(s.projectId) && s.status === 'active'
        ).length

        // Tasks stats
        const userTasks = tasks.filter(t => t.developer === user.uid)
        const completedTasksCount = userTasks.filter(t => t.status === 'done').length
        const pendingTasksCount = userTasks.filter(t => t.status !== 'done').length

        setStats({
          activeProjects: activeProjectsCount,
          activeSprints: activeSprintsCount,
          completedTasks: completedTasksCount,
          pendingTasks: pendingTasksCount
        })

        // Recent Projects (sorted by creation date)
        const sortedProjects = [...userProjects].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
        setRecentProjects(sortedProjects)

        // Assigned Tasks (pending ones, sorted by priority/date)
        const myPendingTasks = userTasks
          .filter(t => t.status !== 'done')
          .sort((a, b) => b.priority - a.priority)
          .slice(0, 5)
        setAssignedTasks(myPendingTasks)

        setAllTasks(tasks)
        setAllUsers(users)
        setAllProjects(projects)
        setAllSprints(sprints)

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchData()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'done': return 'success'
      case 'in-progress': return 'info'
      case 'to-validate': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bienvenido, {user?.displayName}! 👋</h1>
        <p className={styles.subtitle}>Gestiona tus proyectos y tareas de forma eficiente</p>
      </div>

      <div className={styles.grid}>
        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValuePrimary}`}>{stats.activeProjects}</div>
              <p className={styles.statLabel}>Proyectos Activos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValueBlue}`}>{stats.activeSprints}</div>
              <p className={styles.statLabel}>Sprints en Progreso</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValueGreen}`}>{stats.completedTasks}</div>
              <p className={styles.statLabel}>Tareas Completadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValueYellow}`}>{stats.pendingTasks}</div>
              <p className={styles.statLabel}>Tareas Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.grid2}>
        <Card>
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className={styles.emptyMessage}>No hay proyectos aún. Crea uno para comenzar.</p>
            ) : (
              <div className={styles.list}>
                {recentProjects.map(project => (
                  <Link key={project.id} href={`/projects`} className={styles.listItem}>
                    <div className={styles.listItemContent}>
                      <span className={styles.itemName}>{project.name}</span>
                      <span className={styles.itemDate}>{formatDate(project.createdAt.toString())}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className={styles.viewMore}>
              <Link href="/projects" className={styles.link}>Ver todos los proyectos →</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mis Tareas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {assignedTasks.length === 0 ? (
              <p className={styles.emptyMessage}>No tienes tareas pendientes asignadas.</p>
            ) : (
              <div className={styles.list}>
                {assignedTasks.map(task => (
                  <Link key={task.id} href={`/tasks`} className={styles.listItem}>
                    <div className={styles.listItemContent}>
                      <span className={styles.itemName}>{task.title}</span>
                      <Badge variant={getStatusVariant(task.status)} className={badgeStyles.xs}>
                        {TASK_STATUS_LABELS[task.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className={styles.viewMore}>
              <Link href="/tasks" className={styles.link}>Ver todas mis tareas →</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <SprintChart projects={allProjects} sprints={allSprints} tasks={allTasks} />

      <DeveloperPerformance tasks={allTasks} users={allUsers} />
    </div>
  )
}
