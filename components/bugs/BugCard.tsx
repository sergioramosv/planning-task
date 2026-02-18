'use client'

import { Bug } from '@/types/bug'
import { X, Download } from 'lucide-react'
import Button from '@/components/ui/Button'
import styles from './BugCard.module.css'

interface BugCardProps {
  bug: Bug
  onDelete?: (id: string) => void | Promise<void>
  onStatusChange?: (id: string, status: Bug['status']) => Promise<void>
  isLoading?: boolean
}

const severityColors: Record<Bug['severity'], string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

const statusLabels: Record<Bug['status'], string> = {
  open: 'Abierto',
  'in-progress': 'En Progreso',
  resolved: 'Resuelto',
  closed: 'Cerrado',
}

export default function BugCard({ bug, onDelete, onStatusChange, isLoading = false }: BugCardProps) {
  const handleStatusChange = async (newStatus: Bug['status']) => {
    if (onStatusChange) {
      await onStatusChange(bug.id, newStatus)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <span
            className={styles.severity}
            style={{ backgroundColor: severityColors[bug.severity] }}
            title={`Severidad: ${bug.severity}`}
          />
          <h3 className={styles.title}>{bug.title}</h3>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(bug.id)}
            className={styles.deleteButton}
            title="Eliminar bug"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <p className={styles.description}>{bug.description}</p>

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <strong>Estado:</strong> {statusLabels[bug.status]}
        </span>
        <span className={styles.metaItem}>
          <strong>Creado:</strong> {new Date(bug.createdAt).toLocaleDateString('es-ES')}
        </span>
      </div>

      {bug.attachments && bug.attachments.length > 0 && (
        <div className={styles.attachments}>
          <strong className={styles.attachmentsTitle}>Archivos ({bug.attachments.length})</strong>
          <div className={styles.attachmentsList}>
            {bug.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.attachmentLink}
              >
                <Download size={14} />
                {attachment.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {onStatusChange && (
        <div className={styles.statusSelect}>
          <select
            value={bug.status}
            onChange={(e) => handleStatusChange(e.target.value as Bug['status'])}
            className={styles.select}
            disabled={isLoading}
          >
            <option value="open">Abierto</option>
            <option value="in-progress">En Progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
      )}
    </div>
  )
}
