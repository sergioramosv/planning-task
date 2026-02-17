'use client'

import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useFilters } from '@/hooks/useFilters'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/lib/constants/taskStates'
import { X } from 'lucide-react'
import styles from './TaskFilters.module.css'

interface TaskFiltersProps {
  developers: Array<{ id: string; name: string }>
  sprints: Array<{ id: string; name: string }>
  onFiltersChange?: (filters: any) => void
}

export default function TaskFilters({
  developers,
  sprints,
  onFiltersChange,
}: TaskFiltersProps) {
  const { filters, setSearchText, setDevelopers, setStatuses, clearFilters, activeCount } = useFilters()

  const handleDeveloperChange = (developerIds: string[]) => {
    setDevelopers(developerIds)
    onFiltersChange?.({ ...filters, developers: developerIds })
  }

  const handleStatusChange = (statuses: any[]) => {
    setStatuses(statuses)
    onFiltersChange?.({ ...filters, statuses })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filtros</h3>
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className={styles.clearButton}
          >
            <X size={14} />
            Limpiar ({activeCount})
          </button>
        )}
      </div>

      <Input
        placeholder="Buscar por título..."
        value={filters.searchText}
        onChange={e => {
          setSearchText(e.target.value)
          onFiltersChange?.({ ...filters, searchText: e.target.value })
        }}
        type="text"
      />

      <div className={styles.filterSection}>
        <label className={styles.filterLabel}>Developers</label>
        <div className={styles.checkboxGroup}>
          {developers.map(dev => (
            <label key={dev.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.developers.includes(dev.id)}
                onChange={e => {
                  const newDevelopers = e.target.checked
                    ? [...filters.developers, dev.id]
                    : filters.developers.filter(id => id !== dev.id)
                  handleDeveloperChange(newDevelopers)
                }}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{dev.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.filterSection}>
        <label className={styles.filterLabel}>Estados</label>
        <div className={styles.checkboxGroup}>
          {TASK_STATUSES.map(status => (
            <label key={status} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={e => {
                  const newStatuses = e.target.checked
                    ? [...filters.statuses, status]
                    : filters.statuses.filter(s => s !== status)
                  handleStatusChange(newStatuses)
                }}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{TASK_STATUS_LABELS[status]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
