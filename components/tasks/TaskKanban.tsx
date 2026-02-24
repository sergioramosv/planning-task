'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import TaskCard from './TaskCard'
import { TASK_STATUS_LABELS } from '@/lib/constants/taskStates'
import { Plus } from 'lucide-react'
import styles from './TaskKanban.module.css'

interface TaskKanbanProps {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onAddTask?: (status: TaskStatus) => void
  filteredTasks?: Task[]
  sprints?: any[]
  developers?: Array<{ id: string; name: string }>
}

const KANBAN_COLUMNS: TaskStatus[] = ['to-do', 'in-progress', 'to-validate', 'done']

export default function TaskKanban({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onAddTask,
  filteredTasks,
  sprints = [],
  developers = [],
}: TaskKanbanProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const getSprintName = (sprintId?: string) => {
    if (!sprintId) return undefined
    const sprint = sprints.find(s => s.id === sprintId)
    return sprint ? sprint.name : undefined
  }

  const getDeveloperName = (devId: string) => {
    const dev = developers.find(d => d.id === devId)
    return dev ? dev.name : undefined
  }

  // Use filteredTasks if provided, otherwise use all tasks
  const displayTasks = filteredTasks || tasks

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    'to-do': [],
    'in-progress': [],
    'to-validate': [],
    'validated': [],
    'done': [],
  }

  displayTasks.forEach(task => {
    // Merge validated into done column
    if (task.status === 'validated') {
      tasksByStatus['done'].push(task)
    } else {
      tasksByStatus[task.status].push(task)
    }
  })

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    if (!draggedTaskId) return

    const draggedTask = tasks.find(t => t.id === draggedTaskId)
    if (draggedTask && draggedTask.status !== targetStatus) {
      onStatusChange?.(draggedTaskId, targetStatus)
    }
    setDraggedTaskId(null)
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
  }

  return (
    <div className={styles.container}>
      {KANBAN_COLUMNS.map(status => (
        <div key={status} className={styles.column}>
          <div className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>
              {TASK_STATUS_LABELS[status]}
            </h3>
            <span className={styles.columnCount}>
              {tasksByStatus[status].length}
            </span>
          </div>

          <div
            className={styles.columnTasks}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            {tasksByStatus[status].map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                onClick={() => onEdit?.(task)}
                className={`${styles.taskItem} ${draggedTaskId === task.id ? styles.dragging : ''}`}
              >
                <TaskCard
                  task={task}
                  developerName={task.developer ? getDeveloperName(task.developer) : undefined}
                  coDeveloperName={task.coDeveloper ? getDeveloperName(task.coDeveloper) : undefined}
                  sprintName={getSprintName(task.sprintId)}
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => onAddTask?.(status)}
            className={styles.addTaskButton}
          >
            <Plus size={16} />
            <span className={styles.taskItemHidden}>Agregar</span>
          </button>
        </div>
      ))}
    </div>
  )
}
