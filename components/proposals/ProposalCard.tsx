'use client'

import { Proposal } from '@/types/proposal'
import { X, Check, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import styles from './ProposalCard.module.css'

interface ProposalCardProps {
  proposal: Proposal
  sprints: Array<{ id: string; name: string }>
  onAccept: (proposalId: string, sprintId: string) => Promise<void>
  onReject: (proposalId: string) => Promise<void>
  isLoading?: boolean
}

export default function ProposalCard({
  proposal,
  sprints,
  onAccept,
  onReject,
  isLoading = false,
}: ProposalCardProps) {
  const [showSprintSelect, setShowSprintSelect] = useState(false)
  const [selectedSprint, setSelectedSprint] = useState<string>('')

  const handleAccept = async () => {
    if (!selectedSprint) {
      alert('Selecciona un sprint')
      return
    }
    await onAccept(proposal.id, selectedSprint)
    setShowSprintSelect(false)
    setSelectedSprint('')
  }

  const handleReject = async () => {
    if (confirm('¿Rechazar esta propuesta?')) {
      await onReject(proposal.id)
    }
  }

  const priority = parseFloat(((proposal.bizPoints / proposal.devPoints) * 10).toFixed(1))

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{proposal.title}</h3>
          <span className={styles.priority} title="Prioridad">{priority}</span>
        </div>
      </div>

      <div className={styles.userStory}>
        <p className={styles.storyText}>
          <strong>Como</strong> {proposal.userStory.who}
        </p>
        <p className={styles.storyText}>
          <strong>Quiero</strong> {proposal.userStory.what}
        </p>
        <p className={styles.storyText}>
          <strong>Para</strong> {proposal.userStory.why}
        </p>
      </div>

      {proposal.acceptanceCriteria.length > 0 && (
        <div className={styles.criteria}>
          <strong className={styles.criteriaTitle}>Criterios de Aceptación:</strong>
          <ul className={styles.criteriaList}>
            {proposal.acceptanceCriteria.map((criterion, idx) => (
              <li key={idx}>{criterion}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <strong>Inicio:</strong> {new Date(proposal.startDate).toLocaleDateString('es-ES')}
        </span>
        <span className={styles.metaItem}>
          <strong>Negocio:</strong> {proposal.bizPoints}
        </span>
        <span className={styles.metaItem}>
          <strong>Desarrollo:</strong> {proposal.devPoints}
        </span>
      </div>

      <div className={styles.actions}>
        {!showSprintSelect ? (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowSprintSelect(true)}
              disabled={isLoading}
            >
              <Check size={16} />
              Aceptar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleReject}
              disabled={isLoading}
            >
              <X size={16} />
              Rechazar
            </Button>
          </>
        ) : (
          <div className={styles.sprintSelector}>
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              className={styles.sprintSelect}
              disabled={isLoading}
            >
              <option value="">Selecciona un sprint...</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="primary"
              onClick={handleAccept}
              disabled={!selectedSprint || isLoading}
            >
              Confirmar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setShowSprintSelect(false)
                setSelectedSprint('')
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
