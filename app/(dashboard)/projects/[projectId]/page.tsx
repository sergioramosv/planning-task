'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useSprints } from '@/hooks/useSprints'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { ArrowLeft, Plus, Calendar } from 'lucide-react'
import TaskForm from '@/components/tasks/TaskForm'
import TaskModal from '@/components/tasks/TaskModal'
import TaskKanban from '@/components/tasks/TaskKanban'
import TaskTableFilters from '@/components/tasks/TaskTableFilters'
import Modal from '@/components/ui/Modal'
import { Task, TaskStatus } from '@/types'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants/taskStates'
import styles from './page.module.css'

export default function ProjectDetailsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(projectId)
  const { sprints, loading: sprintsLoading, createSprint } = useSprints(projectId)
  const { projects } = useProjects(user?.uid || null)
  const project = projects.find(p => p.id === projectId)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [sortColumn, setSortColumn] = useState<'title' | 'status' | 'priority' | 'developer' | 'startDate'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [filters, setFilters] = useState({
    searchText: '',
    selectedDeveloper: '',
    selectedStatus: '',
    selectedSprint: '',
  })

  // Initialize filtered tasks on load and apply filters
  useEffect(() => {
    let filtered = [...tasks]

    // Apply search filter
    if (filters.searchText) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(filters.searchText.toLowerCase())
      )
    }

    // Apply developer filter
    if (filters.selectedDeveloper) {
      filtered = filtered.filter(t => t.developer === filters.selectedDeveloper)
    }

    // Apply status filter
    if (filters.selectedStatus) {
      filtered = filtered.filter(t => t.status === filters.selectedStatus)
    }

    // Apply sprint filter
    if (filters.selectedSprint) {
      filtered = filtered.filter(t => t.sprintId === filters.selectedSprint)
    }

    setFilteredTasks(filtered)
  }, [tasks, filters])

  if (authLoading || tasksLoading || sprintsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  const developers = user ? [{ id: user.uid, name: user.displayName || 'Usuario' }] : []

  const getSprintName = (sprintId?: string) => {
    if (!sprintId) return '-'
    const sprint = sprints.find(s => s.id === sprintId)
    return sprint ? sprint.name : '-'
  }

  const getDeveloperName = (devId: string) => {
    const dev = developers.find(d => d.id === devId)
    return dev ? dev.name : devId
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    let aVal: any = a[sortColumn]
    let bVal: any = b[sortColumn]

    if (sortColumn === 'title') {
      aVal = a.title.toLowerCase()
      bVal = b.title.toLowerCase()
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (column: 'title' | 'status' | 'priority' | 'developer' | 'startDate') => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('desc')
    }
  }

  const handleTaskSubmit = async (data: any) => {
    try {
      if (!user) {
        console.error('No user logged in')
        return
      }

      if (selectedTask) {
        // Update existing task
        await updateTask(selectedTask.id, {
          title: data.title,
          sprintId: data.sprint || undefined,
          developer: data.developer,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          bizPoints: data.bizPoints,
          devPoints: data.devPoints,
          acceptanceCriteria: data.acceptanceCriteria,
          userStory: data.userStory,
        })
      } else {
        // Create new task
        await createTask({
          title: data.title,
          sprintId: data.sprint || undefined,
          developer: data.developer,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          bizPoints: data.bizPoints,
          devPoints: data.devPoints,
          acceptanceCriteria: data.acceptanceCriteria,
          userStory: data.userStory,
          projectId,
          createdBy: user.uid,
        })
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleCreateSprint = async (data: any) => {
    try {
      if (!user) {
        console.error('No user logged in')
        return
      }
      await createSprint({
        ...data,
        projectId,
        createdBy: user.uid,
      })
    } catch (error) {
      console.error('Error creating sprint:', error)
    }
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedTask(undefined)
    setIsModalOpen(false)
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Estás seguro de que quieres borrar esta tarea?')) {
      return
    }
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, searchText: value })
  }

  const handleDeveloperChange = (value: string) => {
    setFilters({ ...filters, selectedDeveloper: value })
  }

  const handleStatusFilterChange = (value: string) => {
    setFilters({ ...filters, selectedStatus: value })
  }

  const handleSprintChange = (value: string) => {
    setFilters({ ...filters, selectedSprint: value })
  }

  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      selectedDeveloper: '',
      selectedStatus: '',
      selectedSprint: '',
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className={styles.title}>{project?.name}</h1>
      </div>

      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
          <div className={styles.viewToggleContainer}>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Tabla
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <Button size="sm" onClick={() => router.push(`/projects/${projectId}/sprints`)}>
              <Calendar size={16} style={{ marginRight: '0.25rem' }} /> Ver Sprints
            </Button>
            <Button size="sm" onClick={() => { setSelectedTask(undefined); setIsModalOpen(true); }}>
              <Plus size={16} style={{ marginRight: '0.25rem' }} /> Agregar Tarea
            </Button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0', color: 'var(--color-neutral-600)' }}>
            <p>No hay tareas aún. Crea una para comenzar.</p>
          </div>
        ) : (
          <>
            <TaskTableFilters
              tasks={tasks}
              sprints={sprints}
              developers={developers}
              filters={filters}
              onSearchChange={handleSearchChange}
              onDeveloperChange={handleDeveloperChange}
              onStatusChange={handleStatusFilterChange}
              onSprintChange={handleSprintChange}
              onClearFilters={handleClearFilters}
            />

            {viewMode === 'table' ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-neutral-200)', backgroundColor: 'var(--color-neutral-50)' }}>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('title')}>Título {sortColumn === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('status')}>Estado {sortColumn === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('priority')}>Prioridad {sortColumn === 'priority' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('developer')}>Developer {sortColumn === 'developer' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>Sprint</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('startDate')}>Fecha Inicio {sortColumn === 'startDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>Fecha Fin</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)' }}>
                          No se encontraron tareas con los filtros aplicados
                        </td>
                      </tr>
                    ) : (
                      filteredTasks
                        .sort((a, b) => {
                          let aVal: any = a[sortColumn]
                          let bVal: any = b[sortColumn]

                          if (sortColumn === 'title') {
                            aVal = a.title.toLowerCase()
                            bVal = b.title.toLowerCase()
                          }

                          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
                          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
                          return 0
                        })
                        .map(task => (
                      <tr key={task.id} style={{ borderBottom: '1px solid var(--color-neutral-200)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>{task.title}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: 'var(--spacing-1) var(--spacing-3)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            backgroundColor: task.status === 'to-do' ? 'var(--color-neutral-100)' :
                                           task.status === 'in-progress' ? 'var(--color-blue-100)' :
                                           task.status === 'to-validate' ? 'var(--color-yellow-100)' :
                                           task.status === 'validated' ? 'var(--color-green-100)' :
                                           'var(--color-primary-100)',
                            color: task.status === 'to-do' ? 'var(--color-neutral-700)' :
                                   task.status === 'in-progress' ? 'var(--color-blue-700)' :
                                   task.status === 'to-validate' ? 'var(--color-yellow-700)' :
                                   task.status === 'validated' ? 'var(--color-green-700)' :
                                   'var(--color-primary-700)',
                            border: '1px solid ' + (task.status === 'to-do' ? 'var(--color-neutral-200)' :
                                                    task.status === 'in-progress' ? 'var(--color-blue-200)' :
                                                    task.status === 'to-validate' ? 'var(--color-yellow-200)' :
                                                    task.status === 'validated' ? 'var(--color-green-200)' :
                                                    'var(--color-primary-200)')
                          }}>
                            {task.status}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)' }}>{task.priority}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{getDeveloperName(task.developer)}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{getSprintName(task.sprintId)}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{task.startDate}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{task.endDate || '-'}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', textAlign: 'center', display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center' }}>
                          <Button size="sm" variant="secondary" onClick={() => handleEditTask(task)}>Editar</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteTask(task.id)}>Borrar</Button>
                        </td>
                      </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <TaskKanban
                tasks={tasks}
                filteredTasks={filteredTasks}
                sprints={sprints}
                developers={developers}
                onEdit={handleEditTask}
                onStatusChange={handleStatusChange}
              />
            )}
          </>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        sprints={sprints}
        developers={developers}
        onSubmit={handleTaskSubmit}
        onCreateSprint={handleCreateSprint}
      />
    </div>
  )
}
