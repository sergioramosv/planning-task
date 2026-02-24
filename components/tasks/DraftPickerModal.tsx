'use client'

import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { TaskDraft } from '@/types/draft'
import { FileText, Trash2, Plus } from 'lucide-react'
import styles from './DraftPickerModal.module.css'

interface DraftPickerModalProps {
  isOpen: boolean
  onClose: () => void
  drafts: TaskDraft[]
  onSelectDraft: (draft: TaskDraft) => void
  onCreateNew: () => void
  onDeleteDraft: (draftId: string) => void
}

export default function DraftPickerModal({
  isOpen,
  onClose,
  drafts,
  onSelectDraft,
  onCreateNew,
  onDeleteDraft,
}: DraftPickerModalProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Borradores pendientes">
      <div className={styles.content}>
        <p className={styles.description}>
          Tienes borradores pendientes para este proyecto.
          Puedes continuar con uno de ellos o crear una tarea nueva.
        </p>

        <div className={styles.draftList}>
          {drafts.map(draft => (
            <div
              key={draft.id}
              className={styles.draftItem}
              onClick={() => onSelectDraft(draft)}
            >
              <FileText size={18} className={styles.draftIcon} />
              <div className={styles.draftInfo}>
                <span className={styles.draftTitle}>{draft.title}</span>
                <span className={styles.draftDate}>{formatDate(draft.updatedAt)}</span>
              </div>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteDraft(draft.id)
                }}
                title="Eliminar borrador"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <Button fullWidth variant="secondary" type="button" onClick={onCreateNew}>
          <Plus size={16} style={{ marginRight: '0.25rem' }} /> Crear nueva tarea
        </Button>
      </div>
    </Modal>
  )
}
