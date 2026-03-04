'use client'

import { Project, Sprint, Task } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Calendar, User, Folder, Trash2, Copy, Edit2, CheckSquare, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import styles from './ProjectCard.module.css'
import { getProjectColor } from '@/lib/utils/colors'
import { toast } from 'react-hot-toast'

interface ProjectCardProps {
  project: Project
  sprints?: Sprint[]
  tasks?: Task[]
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
}

export default function ProjectCard({ project, sprints = [], tasks = [], onEdit, onDelete }: ProjectCardProps) {
  const { t } = useLanguage()
  const theme = getProjectColor(project.id)

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(project.id)
    toast.success(t('projects.idCopied'))
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive
      case 'planned':
        return styles.statusPlanned
      case 'completed':
        return styles.statusCompleted
      default:
        return styles.statusArchived
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('projects.active')
      case 'planned':
        return t('projects.planned')
      case 'completed':
        return t('projects.completed')
      default:
        return t('projects.archived')
    }
  }

  // Calculate project statistics
  const totalSprints = sprints.length
  const currentSprint = sprints.find(s => {
    const today = new Date()
    const startDate = new Date(s.startDate)
    const endDate = new Date(s.endDate)
    return today >= startDate && today <= endDate
  })

  const totalTasks = tasks.length
  const incompleteTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'validated').length

  return (
    <Link href={`/projects/${project.id}`} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.buttonGroup}>
          {onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(project)
              }}
              className={styles.editButton}
              title={t('projects.editButton')}
            >
              <Edit2 size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(project.id)
              }}
              className={styles.deleteButton}
              title={t('projects.deleteButton')}
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <CardHeader style={{ backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <CardTitle className={styles.title} style={{ color: theme.text }}>
                <Folder size={20} className={styles.titleIcon} style={{ color: theme.icon }} />
                {project.name}
              </CardTitle>
              <div className={styles.idContainer}>
                <p className={styles.projectId}>{project.id}</p>
                <button
                  onClick={handleCopyId}
                  className={styles.copyButton}
                  title={t('projects.copyIdButton')}
                  style={{ color: theme.text }}
                >
                  <Copy size={14} />
                </button>
              </div>
              <p className={styles.description} style={{ color: theme.text, opacity: 0.8 }}>{project.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className={styles.content}>
          <div className={styles.dateInfo}>
            <Calendar size={16} />
            <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
          </div>
          <div className={styles.statusBadgeContainer}>
            <span className={cn(styles.statusBadge, getStatusClass(project.status))}>
              {getStatusLabel(project.status)}
            </span>
          </div>
          <div className={styles.memberInfo}>
            <User size={16} />
            <span>{project.members ? Object.keys(project.members).length : 0} {t('projects.membersCount')}</span>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <Clock size={16} style={{ color: theme.icon }} />
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{t('projects.sprints')}</span>
                <span className={styles.statValue}>{totalSprints}</span>
              </div>
            </div>

            {currentSprint && (
              <div className={styles.statItem}>
                <CheckSquare size={16} style={{ color: theme.icon }} />
                <div className={styles.statContent}>
                  <span className={styles.statLabel}>{t('projects.currentSprint')}</span>
                  <span className={styles.statValue}>{currentSprint.name}</span>
                </div>
              </div>
            )}

            <div className={styles.statItem}>
              <CheckSquare size={16} style={{ color: theme.icon }} />
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{t('projects.tasks')}</span>
                <span className={styles.statValue}>{totalTasks}</span>
              </div>
            </div>

            <div className={styles.statItem}>
              <Clock size={16} style={{ color: '#EF4444' }} />
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{t('projects.pending')}</span>
                <span className={styles.statValue} style={{ color: '#EF4444' }}>{incompleteTasks}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
