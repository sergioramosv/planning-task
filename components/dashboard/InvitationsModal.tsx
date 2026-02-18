'use client'

import { useState } from 'react'
import { Invitation } from '@/types/invitation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Check, X } from 'lucide-react'
import styles from './InvitationsModal.module.css'

interface InvitationsModalProps {
  isOpen: boolean
  onClose: () => void
  invitations: Invitation[]
  onAccept: (invitationId: string, projectId: string) => Promise<void>
  onReject: (invitationId: string) => Promise<void>
  loading?: boolean
}

export default function InvitationsModal({
  isOpen,
  onClose,
  invitations,
  onAccept,
  onReject,
  loading = false,
}: InvitationsModalProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAccept = async (invitation: Invitation) => {
    try {
      setProcessingId(invitation.id)
      await onAccept(invitation.id, invitation.projectId)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (invitationId: string) => {
    try {
      setProcessingId(invitationId)
      await onReject(invitationId)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invitaciones de Proyectos">
      <div className={styles.container}>
        {invitations.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tienes invitaciones pendientes</p>
          </div>
        ) : (
          <div className={styles.invitationsList}>
            {invitations.map((invitation) => (
              <div key={invitation.id} className={styles.invitationItem}>
                <div className={styles.invitationContent}>
                  <h3 className={styles.projectName}>{invitation.projectName}</h3>
                  <p className={styles.invitedBy}>
                    Invitado por <strong>{invitation.projectCreatorName}</strong>
                  </p>
                  <p className={styles.timestamp}>
                    {new Date(invitation.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className={styles.actions}>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleAccept(invitation)}
                    disabled={loading || processingId === invitation.id}
                  >
                    <Check size={16} />
                    Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReject(invitation.id)}
                    disabled={loading || processingId === invitation.id}
                  >
                    <X size={16} />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
