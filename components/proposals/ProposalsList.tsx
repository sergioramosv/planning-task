'use client'

import { Proposal } from '@/types/proposal'
import ProposalCard from './ProposalCard'
import styles from './ProposalsList.module.css'

interface ProposalsListProps {
  proposals: Proposal[]
  sprints: Array<{ id: string; name: string }>
  onAccept: (proposalId: string, sprintId: string) => Promise<void>
  onReject: (proposalId: string) => Promise<void>
  isLoading?: boolean
}

export default function ProposalsList({
  proposals,
  sprints,
  onAccept,
  onReject,
  isLoading = false,
}: ProposalsListProps) {
  if (proposals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay propuestas pendientes</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.proposalsList}>
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            sprints={sprints}
            onAccept={onAccept}
            onReject={onReject}
            isLoading={isLoading}
          />
        ))}
      </div>

      <div className={styles.stats}>
        <span className={styles.statItem}>
          Total pendiente: <strong>{proposals.length}</strong>
        </span>
      </div>
    </div>
  )
}
