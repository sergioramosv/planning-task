'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useSprints } from '@/hooks/useSprints'
import { UserService } from '@/lib/services/user.service'
import { database } from '@/lib/firebase/config'
import { ref, onValue, set } from 'firebase/database'
import Spinner from '@/components/ui/Spinner'
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  Lightbulb,
} from 'lucide-react'
import styles from './page.module.css'

interface RetroNotes {
  wentWell: string
  toImprove: string
  updatedAt?: number
  updatedBy?: string
}

export default function RetroPage() {
  const { t } = useLanguage()
  const params = useParams()
  const projectId = params.projectId as string
  const sprintId = params.sprintId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const project = projects.find(p => p.id === projectId)
  const { tasks, loading: tasksLoading } = useTasks(projectId)
  const { sprints, loading: sprintsLoading } = useSprints(projectId)

  const [developers, setDevelopers] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<RetroNotes>({ wentWell: '', toImprove: '' })
  const [saving, setSaving] = useState(false)

  const sprint = sprints.find(s => s.id === sprintId)

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

  // Load retro notes from Firebase
  useEffect(() => {
    const notesRef = ref(database, `retro-notes/${sprintId}`)
    const unsub = onValue(notesRef, snapshot => {
      const data = snapshot.val()
      if (data) setNotes(data)
    })
    return () => unsub()
  }, [sprintId])

  const saveNotes = async () => {
    setSaving(true)
    try {
      await set(ref(database, `retro-notes/${sprintId}`), {
        ...notes,
        updatedAt: Date.now(),
        updatedBy: user?.uid,
      })
    } catch (error) {
      console.error('Error saving retro notes:', error)
    } finally {
      setSaving(false)
    }
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    const sprintTasks = tasks.filter(t => t.sprintId === sprintId)
    const completed = sprintTasks.filter(t => t.status === 'done' || t.status === 'validated')
    const carryOver = sprintTasks.filter(t => t.status !== 'done' && t.status !== 'validated')

    const totalDevPoints = sprintTasks.reduce((sum, t) => sum + t.devPoints, 0)
    const completedDevPoints = completed.reduce((sum, t) => sum + t.devPoints, 0)
    const totalBizPoints = sprintTasks.reduce((sum, t) => sum + t.bizPoints, 0)
    const completedBizPoints = completed.reduce((sum, t) => sum + t.bizPoints, 0)

    const completionRate = sprintTasks.length > 0
      ? Math.round((completed.length / sprintTasks.length) * 100)
      : 0

    // Developer breakdown
    const devBreakdown = developers.map(dev => {
      const devTasks = sprintTasks.filter(t => t.developer === dev.id)
      const devCompleted = devTasks.filter(t => t.status === 'done' || t.status === 'validated')
      const devPoints = devCompleted.reduce((sum, t) => sum + t.devPoints, 0)
      return {
        ...dev,
        total: devTasks.length,
        completed: devCompleted.length,
        points: devPoints,
      }
    }).filter(d => d.total > 0).sort((a, b) => b.points - a.points)

    // Previous sprint comparison
    const sortedSprints = [...sprints].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    const currentIdx = sortedSprints.findIndex(s => s.id === sprintId)
    let prevVelocity: number | null = null
    if (currentIdx > 0) {
      const prevSprint = sortedSprints[currentIdx - 1]
      const prevTasks = tasks.filter(t => t.sprintId === prevSprint.id)
      const prevCompleted = prevTasks.filter(t => t.status === 'done' || t.status === 'validated')
      prevVelocity = prevCompleted.reduce((sum, t) => sum + t.devPoints, 0)
    }

    return {
      total: sprintTasks.length,
      completed: completed.length,
      carryOver,
      totalDevPoints,
      completedDevPoints,
      totalBizPoints,
      completedBizPoints,
      completionRate,
      devBreakdown,
      prevVelocity,
    }
  }, [tasks, sprintId, developers, sprints])

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const velocityDelta = metrics.prevVelocity !== null
    ? metrics.completedDevPoints - metrics.prevVelocity
    : null

  if (authLoading || tasksLoading || sprintsLoading || loading) {
    return <div className={styles.loadingContainer}><Spinner /></div>
  }

  if (!sprint) {
    return <div className={styles.notAvailable}>Sprint not found</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push(`/projects/${projectId}/sprints`)}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{t('retro.title')} - {sprint.name}</h1>
          <p className={styles.subtitle}>{sprint.startDate} ~ {sprint.endDate}</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.completedDevPoints}</div>
          <div className={styles.metricLabel}>{t('retro.velocity')}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={`${styles.metricValue} ${metrics.completionRate >= 80 ? styles.metricGood : metrics.completionRate < 50 ? styles.metricBad : ''}`}>
            {metrics.completionRate}%
          </div>
          <div className={styles.metricLabel}>{t('retro.completionRate')}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.completed}/{metrics.total}</div>
          <div className={styles.metricLabel}>{t('retro.tasksCompleted')}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{metrics.completedBizPoints}</div>
          <div className={styles.metricLabel}>{t('retro.bizPointsDelivered')}</div>
        </div>
        {velocityDelta !== null && (
          <div className={styles.metricCard}>
            <div className={`${styles.metricValue} ${velocityDelta >= 0 ? styles.metricGood : styles.metricBad}`}>
              {velocityDelta >= 0 ? '+' : ''}{velocityDelta}
            </div>
            <div className={styles.metricLabel}>{t('retro.vsPrevSprint')}</div>
          </div>
        )}
      </div>

      {/* Developer breakdown */}
      {metrics.devBreakdown.length > 0 && (
        <div className={styles.devSection}>
          <h2 className={styles.sectionTitle}>
            <TrendingUp size={18} /> {t('retro.developerPerformance')}
          </h2>
          <div className={styles.devGrid}>
            {metrics.devBreakdown.map(dev => (
              <div key={dev.id} className={styles.devCard}>
                <div className={styles.devAvatar}>{getInitials(dev.name)}</div>
                <div className={styles.devInfo}>
                  <div className={styles.devName}>{dev.name}</div>
                  <div className={styles.devStats}>
                    {dev.completed}/{dev.total} {t('retro.tasks')}
                  </div>
                </div>
                <div className={styles.devPoints}>{dev.points}pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Carry-over tasks */}
      <div className={styles.carryOverSection}>
        <h2 className={styles.sectionTitle}>
          <AlertTriangle size={18} /> Carry-over ({metrics.carryOver.length})
        </h2>
        {metrics.carryOver.length > 0 ? (
          <div className={styles.carryOverList}>
            {metrics.carryOver.map(task => (
              <div key={task.id} className={styles.carryOverItem}>
                <span className={styles.carryOverTitle}>{task.title}</span>
                <span className={styles.carryOverMeta}>
                  {task.devPoints}pts - {developers.find(d => d.id === task.developer)?.name || t('retro.unassigned')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyCarryOver}>{t('retro.noCarryOver')}</p>
        )}
      </div>

      {/* Team notes */}
      <div className={styles.notesSection}>
        <h2 className={styles.sectionTitle}>{t('retro.teamNotes')}</h2>
        <div className={styles.notesGrid}>
          <div className={`${styles.notesCard} ${styles.notesCardGood}`}>
            <p className={`${styles.notesLabel} ${styles.notesLabelGood}`}>
              <ThumbsUp size={16} /> {t('retro.wentWell')}
            </p>
            <textarea
              className={styles.notesTextarea}
              value={notes.wentWell}
              onChange={e => setNotes({ ...notes, wentWell: e.target.value })}
              placeholder={t('retro.wentWellPlaceholder')}
            />
          </div>
          <div className={`${styles.notesCard} ${styles.notesCardImprove}`}>
            <p className={`${styles.notesLabel} ${styles.notesLabelImprove}`}>
              <Lightbulb size={16} /> {t('retro.toImprove')}
            </p>
            <textarea
              className={styles.notesTextarea}
              value={notes.toImprove}
              onChange={e => setNotes({ ...notes, toImprove: e.target.value })}
              placeholder={t('retro.toImprovePlaceholder')}
            />
          </div>
        </div>
        <button className={styles.notesSaveBtn} onClick={saveNotes} disabled={saving}>
          {saving ? t('retro.saving') : t('retro.saveNotes')}
        </button>
      </div>
    </div>
  )
}
