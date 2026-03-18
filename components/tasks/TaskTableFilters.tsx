'use client'

import { Task, Sprint, SavedView, SavedViewFilters } from '@/types'
import { Epic } from '@/types/epic'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import SavedViewsPicker from './SavedViewsPicker'
import { X } from 'lucide-react'
import styles from './TaskTableFilters.module.css'

export default function TaskTableFilters({
  tasks,
  sprints,
  developers,
  epics = [],
  filters,
  onSearchChange,
  onDeveloperChange,
  onStatusChange,
  onSprintChange,
  onEpicChange,
  onClearFilters,
  savedViews = [],
  onSaveView,
  onDeleteView,
  onLoadView,
}: {
  tasks: Task[]
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  epics?: Epic[]
  filters: {
    searchText: string
    selectedDeveloper: string
    selectedStatus: string
    selectedSprint: string
    selectedEpic?: string
  }
  onSearchChange: (value: string) => void
  onDeveloperChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSprintChange: (value: string) => void
  onEpicChange?: (value: string) => void
  onClearFilters: () => void
  savedViews?: SavedView[]
  onSaveView?: (name: string, shared: boolean) => void
  onDeleteView?: (viewId: string) => void
  onLoadView?: (filters: SavedViewFilters) => void
}) {
  // Guard against undefined filters
  if (!filters) {
    return null
  }

  const hasActiveFilters = !!(filters.searchText || filters.selectedDeveloper || filters.selectedStatus || filters.selectedSprint || filters.selectedEpic)

  return (
    <div className={styles.container}>
      <div className={styles.filtersRow}>
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

          {epics.length > 0 && onEpicChange && (
            <Select
              value={filters.selectedEpic || ''}
              onChange={(e: any) => onEpicChange(e.target.value)}
              options={[
                { value: '', label: 'Todos los epics' },
                ...epics.map(e => ({ value: e.id, label: e.title }))
              ]}
            />
          )}
        </div>

        {onSaveView && onDeleteView && onLoadView && (
          <SavedViewsPicker
            views={savedViews}
            currentFilters={filters}
            onLoadView={onLoadView}
            onSaveView={onSaveView}
            onDeleteView={onDeleteView}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>

      {hasActiveFilters && (
        <button className={styles.clearButton} onClick={onClearFilters}>
          <X size={16} />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
