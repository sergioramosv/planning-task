'use client'

import { Bug } from '@/types/bug'
import BugCard from './BugCard'
import { useState } from 'react'
import styles from './BugsList.module.css'

interface BugsListProps {
  bugs: Bug[]
  onDelete?: (id: string) => Promise<void>
  onStatusChange?: (id: string, status: Bug['status']) => Promise<void>
  isLoading?: boolean
}

type FilterStatus = 'all' | Bug['status']

export default function BugsList({
  bugs,
  onDelete,
  onStatusChange,
  isLoading = false,
}: BugsListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterSeverity, setFilterSeverity] = useState<'all' | Bug['severity']>('all')

  const filteredBugs = bugs.filter((bug) => {
    const statusMatch = filterStatus === 'all' || bug.status === filterStatus
    const severityMatch = filterSeverity === 'all' || bug.severity === filterSeverity
    return statusMatch && severityMatch
  })

  if (bugs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay bugs reportados</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as FilterStatus)} className={styles.filterSelect}>
          <option value="all">Todos los estados</option>
          <option value="open">Abiertos</option>
          <option value="in-progress">En Progreso</option>
          <option value="resolved">Resueltos</option>
          <option value="closed">Cerrados</option>
        </select>

        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as any)} className={styles.filterSelect}>
          <option value="all">Todas las severidades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
      </div>

      {filteredBugs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay bugs con los filtros aplicados</p>
        </div>
      ) : (
        <div className={styles.bugsList}>
          {filteredBugs.map((bug) => (
            <BugCard
              key={bug.id}
              bug={bug}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}

      <div className={styles.stats}>
        <span className={styles.statItem}>
          Total: <strong>{filteredBugs.length}</strong>
        </span>
        <span className={styles.statItem}>
          Abiertos: <strong>{filteredBugs.filter((b) => b.status === 'open').length}</strong>
        </span>
        <span className={styles.statItem}>
          Críticos: <strong>{filteredBugs.filter((b) => b.severity === 'critical').length}</strong>
        </span>
      </div>
    </div>
  )
}
