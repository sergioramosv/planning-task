'use client'

import { useState, useEffect } from 'react'
import { Task, TaskStatus, Sprint } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { X } from 'lucide-react'
import styles from './TaskTableFilters.module.css'

interface TaskTableFiltersProps {
  tasks: Task[]
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  onFilterChange: (filtered: Task[]) => void
}

export default function TaskTableFilters({
  tasks,
  sprints,
  developers,
  onFilterChange,
}: TaskTableFiltersProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedDeveloper, setSelectedDeveloper] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedSprint, setSelectedSprint] = useState('')

  // Apply filters whenever any filter changes
  useEffect(() => {
    let filtered = [...tasks]

    if (searchText.trim()) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    if (selectedDeveloper) {
      filtered = filtered.filter(t => t.developer === selectedDeveloper)
    }

    if (selectedStatus) {
      filtered = filtered.filter(t => t.status === selectedStatus)
    }

    if (selectedSprint) {
      filtered = filtered.filter(t => t.sprintId === selectedSprint)
    }

    onFilterChange(filtered)
  }, [searchText, selectedDeveloper, selectedStatus, selectedSprint, tasks, onFilterChange])

  const handleClearFilters = () => {
    setSearchText('')
    setSelectedDeveloper('')
    setSelectedStatus('')
    setSelectedSprint('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.filtersGrid}>
        <Input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchText}
          onChange={(e: any) => setSearchText(e.target.value)}
        />

        <Select
          placeholder="Filtrar por Developer"
          value={selectedDeveloper}
          onChange={(e: any) => setSelectedDeveloper(e.target.value)}
          options={[
            { value: '', label: 'Todos los developers' },
            ...developers.map(d => ({ value: d.id, label: d.name }))
          ]}
        />

        <Select
          value={selectedStatus}
          onChange={(e: any) => setSelectedStatus(e.target.value)}
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
          value={selectedSprint}
          onChange={(e: any) => setSelectedSprint(e.target.value)}
          options={[
            { value: '', label: 'Todos los sprints' },
            ...sprints.map(s => ({ value: s.id, label: s.name }))
          ]}
        />
      </div>

      {(searchText || selectedDeveloper || selectedStatus || selectedSprint) && (
        <button className={styles.clearButton} onClick={handleClearFilters}>
          <X size={16} />
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
