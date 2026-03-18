'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useSprints } from '@/hooks/useSprints'
import { Task } from '@/types'
import { UserService } from '@/lib/services/user.service'
import Spinner from '@/components/ui/Spinner'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react'
import styles from './page.module.css'

const STANDUP_DURATION = 15 * 60 // 15 minutes in seconds

interface DeveloperData {
  id: string
  name: string
  yesterday: Task[]
  today: Task[]
  blocked: Task[]
}

export default function StandupPage() {
  const { t } = useLanguage()
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const project = projects.find(p => p.id === projectId)
  const { tasks, loading: tasksLoading } = useTasks(projectId)
  const { sprints } = useSprints(projectId)
  const activeSprint = sprints.find(s => s.status === 'active')

  const [developers, setDevelopers] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [activeDev, setActiveDev] = useState(0)
  const [timeLeft, setTimeLeft] = useState(STANDUP_DURATION)
  const [isRunning, setIsRunning] = useState(false)

  // Fetch developers
  useEffect(() => {
    const fetchDevs = async () => {
      if (!project) return
      try {
        const memberIds = Object.keys(project.members || {})
        if (memberIds.length > 0) {
          const members = await UserService.getUsersByIds(memberIds)
          setDevelopers(members.map(m => ({ id: m.uid, name: m.displayName || m.email })))
        }
      } catch (error) {
        console.error('Error fetching developers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDevs()
  }, [project])

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const resetTimer = () => {
    setTimeLeft(STANDUP_DURATION)
    setIsRunning(false)
  }

  // Classify tasks per developer
  const getDevData = useCallback((): DeveloperData[] => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime()

    return developers.map(dev => {
      const devTasks = tasks.filter(t => t.developer === dev.id)

      // Yesterday: tasks completed recently (done/validated, updated in last 48h)
      const yesterdayTasks = devTasks.filter(t =>
        (t.status === 'done' || t.status === 'validated') &&
        t.updatedAt >= yesterdayStart
      )

      // Today: tasks currently in-progress or to-validate
      const todayTasks = devTasks.filter(t =>
        t.status === 'in-progress' || t.status === 'to-validate'
      )

      // Blocked: tasks that have blockedBy with pending tasks, or tasks explicitly blocked
      const blockedTasks = devTasks.filter(t => {
        if (t.status === 'done' || t.status === 'validated') return false
        if (t.blockedBy && t.blockedBy.length > 0) {
          return t.blockedBy.some(blockId => {
            const blocker = tasks.find(bt => bt.id === blockId)
            return blocker && blocker.status !== 'done' && blocker.status !== 'validated'
          })
        }
        return false
      })

      return {
        id: dev.id,
        name: dev.name,
        yesterday: yesterdayTasks,
        today: todayTasks,
        blocked: blockedTasks,
      }
    })
  }, [developers, tasks])

  const devData = getDevData()

  const goNext = () => {
    if (activeDev < devData.length - 1) setActiveDev(activeDev + 1)
  }

  const goPrev = () => {
    if (activeDev > 0) setActiveDev(activeDev - 1)
  }

  const getSprintName = (sprintId?: string) => {
    if (!sprintId) return ''
    const sprint = sprints.find(s => s.id === sprintId)
    return sprint ? sprint.name : ''
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  }

  if (authLoading || tasksLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push(`/projects/${projectId}`)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>
            {t('standup.title')} {activeSprint ? `- ${activeSprint.name}` : ''}
          </h1>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.timer}>
            <Clock size={18} className={styles.timerIcon} />
            <span className={`${styles.timerTime} ${timeLeft < 60 ? styles.timerWarning : ''}`}>
              {formatTime(timeLeft)}
            </span>
            <button className={styles.timerBtn} onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button className={styles.timerBtn} onClick={resetTimer}>
              <RotateCcw size={14} />
            </button>
          </div>

          <div className={styles.devNav}>
            <button className={styles.navBtn} onClick={goPrev} disabled={activeDev === 0}>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.devIndicator}>
              {activeDev + 1} / {devData.length}
            </span>
            <button className={styles.navBtn} onClick={goNext} disabled={activeDev >= devData.length - 1}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.columnsContainer}>
        {devData.map((dev, index) => (
          <div
            key={dev.id}
            className={`${styles.devColumn} ${index === activeDev ? styles.devColumnActive : ''}`}
          >
            <div className={styles.devHeader}>
              <div className={styles.devAvatar}>{getInitials(dev.name)}</div>
              <span className={styles.devName}>{dev.name}</span>
            </div>

            <div className={styles.devSections}>
              {/* Yesterday */}
              <div className={styles.section}>
                <div className={`${styles.sectionHeader} ${styles.sectionYesterday}`}>
                  <CheckCircle size={14} />
                  {t('standup.yesterday')}
                  <span className={styles.sectionCount}>{dev.yesterday.length}</span>
                </div>
                {dev.yesterday.length > 0 ? (
                  dev.yesterday.map(task => (
                    <div key={task.id} className={`${styles.taskItem} ${styles.taskYesterday}`}>
                      <CheckCircle size={14} className={styles.taskIcon} style={{ color: 'var(--color-green-500)' }} />
                      <div className={styles.taskInfo}>
                        <div className={styles.taskTitle}>{task.title}</div>
                        <div className={styles.taskMeta}>
                          P{task.priority} {getSprintName(task.sprintId)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className={styles.emptySection}>{t('standup.noCompleted')}</span>
                )}
              </div>

              {/* Today */}
              <div className={styles.section}>
                <div className={`${styles.sectionHeader} ${styles.sectionToday}`}>
                  <Clock size={14} />
                  {t('standup.today')}
                  <span className={styles.sectionCount}>{dev.today.length}</span>
                </div>
                {dev.today.length > 0 ? (
                  dev.today.map(task => (
                    <div key={task.id} className={`${styles.taskItem} ${styles.taskToday}`}>
                      <AlertCircle size={14} className={styles.taskIcon} style={{ color: 'var(--color-blue-500)' }} />
                      <div className={styles.taskInfo}>
                        <div className={styles.taskTitle}>{task.title}</div>
                        <div className={styles.taskMeta}>
                          P{task.priority} {getSprintName(task.sprintId)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className={styles.emptySection}>{t('standup.noInProgress')}</span>
                )}
              </div>

              {/* Blocked */}
              <div className={styles.section}>
                <div className={`${styles.sectionHeader} ${styles.sectionBlocked}`}>
                  <AlertTriangle size={14} />
                  {t('standup.blocked')}
                  <span className={styles.sectionCount}>{dev.blocked.length}</span>
                </div>
                {dev.blocked.length > 0 ? (
                  dev.blocked.map(task => (
                    <div key={task.id} className={`${styles.taskItem} ${styles.taskBlocked}`}>
                      <AlertTriangle size={14} className={styles.taskIcon} style={{ color: 'var(--color-red-500)' }} />
                      <div className={styles.taskInfo}>
                        <div className={styles.taskTitle}>{task.title}</div>
                        <div className={styles.taskMeta}>
                          {t('standup.blockedBy')}: {task.blockedBy?.map(id => {
                            const blocker = tasks.find(t => t.id === id)
                            return blocker?.title || id
                          }).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className={styles.emptySection}>{t('standup.noBlocks')}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
