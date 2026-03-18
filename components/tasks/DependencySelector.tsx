'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { Link, X, AlertTriangle } from 'lucide-react'
import styles from './DependencySelector.module.css'

interface DependencySelectorProps {
  task: Task
  allTasks: Task[]
  onUpdate: (blockedBy: string[], blocks: string[]) => void
}

export default function DependencySelector({ task, allTasks, onUpdate }: DependencySelectorProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [pickerMode, setPickerMode] = useState<'blockedBy' | 'blocks'>('blockedBy')
  const [search, setSearch] = useState('')

  const blockedBy = task.blockedBy || []
  const blocks = task.blocks || []

  // Available tasks to link (exclude self, subtasks, and already linked)
  const linkedIds = new Set([...blockedBy, ...blocks, task.id])
  const availableTasks = allTasks.filter(t =>
    !linkedIds.has(t.id) &&
    !t.parentTaskId &&
    t.projectId === task.projectId &&
    t.title.toLowerCase().includes(search.toLowerCase())
  )

  const getTaskById = (id: string) => allTasks.find(t => t.id === id)

  const isBlocked = blockedBy.some(id => {
    const blocker = getTaskById(id)
    return blocker && blocker.status !== 'done' && blocker.status !== 'validated'
  })

  const addDependency = (targetId: string) => {
    if (pickerMode === 'blockedBy') {
      onUpdate([...blockedBy, targetId], blocks)
    } else {
      onUpdate(blockedBy, [...blocks, targetId])
    }
    setShowPicker(false)
    setSearch('')
  }

  const removeDependency = (targetId: string, type: 'blockedBy' | 'blocks') => {
    if (type === 'blockedBy') {
      onUpdate(blockedBy.filter(id => id !== targetId), blocks)
    } else {
      onUpdate(blockedBy, blocks.filter(id => id !== targetId))
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link size={16} className={styles.headerIcon} />
        <span className={styles.title}>Dependencies</span>
        {isBlocked && (
          <span className={styles.blockedBadge}>
            <AlertTriangle size={12} /> Blocked
          </span>
        )}
      </div>

      {/* Blocked by */}
      {blockedBy.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Blocked by:</span>
          <div className={styles.chipList}>
            {blockedBy.map(id => {
              const t = getTaskById(id)
              const resolved = t && (t.status === 'done' || t.status === 'validated')
              return (
                <span key={id} className={`${styles.chip} ${resolved ? styles.chipResolved : styles.chipBlocking}`}>
                  {t?.title || id}
                  <button className={styles.chipRemove} onClick={() => removeDependency(id, 'blockedBy')}>
                    <X size={12} />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Blocks */}
      {blocks.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Blocks:</span>
          <div className={styles.chipList}>
            {blocks.map(id => {
              const t = getTaskById(id)
              return (
                <span key={id} className={`${styles.chip} ${styles.chipBlocks}`}>
                  {t?.title || id}
                  <button className={styles.chipRemove} onClick={() => removeDependency(id, 'blocks')}>
                    <X size={12} />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Add button */}
      {!showPicker ? (
        <div className={styles.addButtons}>
          <button className={styles.addBtn} onClick={() => { setPickerMode('blockedBy'); setShowPicker(true) }}>
            + Blocked by...
          </button>
          <button className={styles.addBtn} onClick={() => { setPickerMode('blocks'); setShowPicker(true) }}>
            + Blocks...
          </button>
        </div>
      ) : (
        <div className={styles.picker}>
          <input
            className={styles.pickerInput}
            placeholder={pickerMode === 'blockedBy' ? 'Search task that blocks this...' : 'Search task this blocks...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <div className={styles.pickerList}>
            {availableTasks.slice(0, 8).map(t => (
              <button key={t.id} className={styles.pickerItem} onClick={() => addDependency(t.id)}>
                <span className={styles.pickerTitle}>{t.title}</span>
                <span className={styles.pickerStatus}>{t.status}</span>
              </button>
            ))}
            {availableTasks.length === 0 && (
              <span className={styles.pickerEmpty}>No matching tasks</span>
            )}
          </div>
          <button className={styles.pickerCancel} onClick={() => { setShowPicker(false); setSearch('') }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
