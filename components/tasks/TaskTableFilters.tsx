'use client'

import { Task, Sprint } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { X } from 'lucide-react'
import styles from './TaskTableFilters.module.css'

export default function TaskTableFilters({
  tasks,
  sprints,
  developers,
  filters,
  onSearchChange,
  onDeveloperChange,
  onStatusChange,
  onSprintChange,
  onClearFilters,
}: {
  tasks: Task[]
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  filters: {
    searchText: string
    selectedDeveloper: string
    selectedStatus: string
    selectedSprint: string
  }
  onSearchChange: (value: string) => void
  onDeveloperChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSprintChange: (value: string) => void
  onClearFilters: () => void
}) {
  // Guard against undefined filters
  if (!filters) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.filtersGrid}>
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.searchText || ''}
          onChange={(e: any) => onSearchChange(e.target.value)}
        />

        <Select
          placeholder="Filtrar por Developer"
          value={filters.selectedDeveloper || ''}
          onChange={(e: any) => onDeveloperChange(e.target.value)}
          options={[
            { value: '', label: 'Todos los developers' },
            ...developers.map(d => ({ value: d.id, label: d.name }))
          ]}
        />

        <Select
          value={filters.selectedStatus || ''}
          onChange={(e: any) => onStatusChange(e.target.value)}
          options={[
            { value: '', label: 'Todos los estados' },
            { value: 'to-do', label: 'to-do' },
            { value: 'in-progress', label: 'in-progress' },
            { value: 'to-validate', label: 'to-validate' },
            { value: 'validated', label: 'validated' },
            { value: 'done', label: 'done' },
          ]}
        />

        <Select
          value={filters.selectedSprint || ''}
          onChange={(e: any) => onSprintChange(e.target.value)}
          options={[
            { value: '', label: 'Todos los sprints' },
            ...sprints.map(s => ({ value: s.id, label: s.name }))
          ]}
        />
      </div>

      {(filters.searchText || filters.selectedDeveloper || filters.selectedStatus || filters.selectedSprint) && (
        <button className={styles.clearButton} onClick={onClearFilters}>
          <X size={16} />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
