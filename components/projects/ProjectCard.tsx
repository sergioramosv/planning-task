'use client'

import { Project } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Calendar, User, Folder, Trash2, Copy, Edit2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import styles from './ProjectCard.module.css'
import { getProjectColor } from '@/lib/utils/colors'
import { toast } from 'react-hot-toast'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const theme = getProjectColor(project.id)

  const handleCopyId = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(project.id)
    toast.success('ID copiado al portapapeles')
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
        return 'Activo'
      case 'planned':
        return 'Planeado'
      case 'completed':
        return 'Completado'
      default:
        return 'Archivado'
    }
  }

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
              title="Editar proyecto"
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
              title="Eliminar proyecto"
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
                  title="Copiar ID"
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
            <span>{project.members ? Object.keys(project.members).length : 0} miembro(s)</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
