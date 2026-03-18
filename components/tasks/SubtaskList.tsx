'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/types'
import { Plus, CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react'
import styles from './SubtaskList.module.css'

interface SubtaskListProps {
  parentTask: Task
  subtasks: Task[]
  onCreateSubtask: (title: string) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onSubtaskClick: (task: Task) => void
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  'to-do': <Circle size={16} />,
  'in-progress': <Clock size={16} />,
  'to-validate': <AlertCircle size={16} />,
  'validated': <CheckCircle size={16} />,
  'done': <CheckCircle size={16} />,
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  'to-do': 'var(--color-neutral-400)',
  'in-progress': 'var(--color-blue-500)',
  'to-validate': 'var(--color-yellow-500)',
  'validated': 'var(--color-green-500)',
  'done': 'var(--color-primary-500)',
}

export default function SubtaskList({
  parentTask,
  subtasks,
  onCreateSubtask,
  onStatusChange,
  onSubtaskClick,
}: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const completedCount = subtasks.filter(s => s.status === 'done' || s.status === 'validated').length
  const totalCount = subtasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleAdd = () => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    onCreateSubtask(trimmed)
    setNewTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setIsAdding(false); setNewTitle('') }
  }

  const toggleDone = (subtask: Task) => {
    const newStatus: TaskStatus = (subtask.status === 'done' || subtask.status === 'validated') ? 'to-do' : 'done'
    onStatusChange(subtask.id, newStatus)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Subtareas</span>
        <span className={styles.count}>{completedCount}/{totalCount}</span>
      </div>

      {totalCount > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className={styles.list}>
        {subtasks.map(subtask => (
          <div key={subtask.id} className={styles.subtaskItem}>
            <button
              className={styles.statusButton}
              style={{ color: STATUS_COLORS[subtask.status] }}
              onClick={() => toggleDone(subtask)}
              title={subtask.status}
            >
              {STATUS_ICONS[subtask.status]}
            </button>
            <span
              className={`${styles.subtaskTitle} ${subtask.status === 'done' || subtask.status === 'validated' ? styles.completed : ''}`}
              onClick={() => onSubtaskClick(subtask)}
            >
              {subtask.title}
            </span>
            {subtask.developer && (
              <span className={styles.assignee}>{subtask.developer.slice(0, 8)}</span>
            )}
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className={styles.addForm}>
          <input
            type="text"
            className={styles.addInput}
            placeholder="Titulo de la subtarea..."
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <div className={styles.addActions}>
            <button className={styles.cancelBtn} onClick={() => { setIsAdding(false); setNewTitle('') }}>
              Cancelar
            </button>
            <button className={styles.confirmBtn} onClick={handleAdd} disabled={!newTitle.trim()}>
              Crear
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.addButton} onClick={() => setIsAdding(true)}>
          <Plus size={14} /> Agregar subtarea
        </button>
      )}
    </div>
  )
}
