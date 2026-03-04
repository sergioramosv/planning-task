'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useTasks } from '@/hooks/useTasks'
import { useSprints } from '@/hooks/useSprints'
import { useBugs } from '@/hooks/useBugs'
import { useProposals } from '@/hooks/useProposals'
import { usePermissions } from '@/hooks/usePermissions'
import { useLanguage } from '@/contexts/LanguageContext'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { ArrowLeft, Plus, Calendar, MessageSquare, Edit2, Trash2, ChevronDown, FolderOpen } from 'lucide-react'
import TaskModal from '@/components/tasks/TaskModal'
import DraftPickerModal from '@/components/tasks/DraftPickerModal'
import TaskActivityPanel from '@/components/tasks/TaskActivityPanel'
import TaskKanban from '@/components/tasks/TaskKanban'
import TaskTableFilters from '@/components/tasks/TaskTableFilters'
import Modal from '@/components/ui/Modal'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import TabsBar from '@/components/layout/TabsBar'
import BugModal from '@/components/bugs/BugModal'
import BugsList from '@/components/bugs/BugsList'
import ProposalModal from '@/components/proposals/ProposalModal'
import ProposalsList from '@/components/proposals/ProposalsList'
import ChatPanel from '@/components/chat/ChatPanel'
import ChatFab from '@/components/chat/ChatFab'
import { Task, TaskStatus, TaskDraft } from '@/types'
import { useTaskDrafts } from '@/hooks/useTaskDrafts'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import toast, { Toaster } from 'react-hot-toast'
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants/taskStates'
import { UserService } from '@/lib/services/user.service'
import styles from './page.module.css'

export default function ProjectDetailsPage() {
  const { t } = useLanguage()
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(projectId)
  const { sprints, loading: sprintsLoading, createSprint } = useSprints(projectId)
  const { bugs, loading: bugsLoading, createBug, updateBug, deleteBug } = useBugs(projectId)
  const { proposals, loading: proposalsLoading, createProposal, updateProposalStatus, deleteProposal } = useProposals(projectId)
  const { projects } = useProjects(user?.uid || null)
  const project = projects.find(p => p.id === projectId)
  const { canCreateTask, canEditTask, canDeleteTask, canCreateSprint, canDeleteSprint, canCreateBug, canEditBug, canDeleteBug, canCreateProposal, canApproveProposal, canRejectProposal } = usePermissions(project)
  const [activeTab, setActiveTab] = useState<'tasks' | 'bugs' | 'proposals'>('tasks')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'details' | 'activity'>('details')
  const [isBugModalOpen, setIsBugModalOpen] = useState(false)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false)
  const [isDeleteBugConfirmOpen, setIsDeleteBugConfirmOpen] = useState(false)
  const [isDeleteTaskConfirmOpen, setIsDeleteTaskConfirmOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [bugToDelete, setBugToDelete] = useState<string | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined)
  const [viewMode, setViewMode] = useLocalStorage<'table' | 'kanban'>('tasks-view-mode', 'table')
  const [sortColumn, setSortColumn] = useState<'id' | 'title' | 'status' | 'priority' | 'developer' | 'startDate'>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [developers, setDevelopers] = useState<Array<{ id: string; name: string }>>([])
  const [loadingDevelopers, setLoadingDevelopers] = useState(true)
  const { drafts, saveDraft, deleteDraft, hasDrafts } = useTaskDrafts(projectId)
  const [isDraftPickerOpen, setIsDraftPickerOpen] = useState(false)
  const [activeDraft, setActiveDraft] = useState<TaskDraft | null>(null)
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const [filters, setFilters] = useState({
    searchText: '',
    selectedDeveloper: '',
    selectedStatus: '',
    selectedSprint: '',
  })

  // Auto-close draft picker when all drafts are deleted
  useEffect(() => {
    if (isDraftPickerOpen && drafts.length === 0) {
      setIsDraftPickerOpen(false)
      setActiveDraft(null)
      setIsModalOpen(true)
    }
  }, [drafts.length, isDraftPickerOpen])

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

  // Fetch project members as developers
  useEffect(() => {
    const fetchDevelopers = async () => {
      if (!project) return
      try {
        setLoadingDevelopers(true)
        const memberIds = Object.keys(project.members || {})
        if (memberIds.length > 0) {
          const members = await UserService.getUsersByIds(memberIds)
          setDevelopers(members.map(m => ({ id: m.uid, name: m.displayName || m.email })))
        } else {
          setDevelopers([])
        }
      } catch (error) {
        console.error('Error fetching developers:', error)
        setDevelopers([])
      } finally {
        setLoadingDevelopers(false)
      }
    }
    fetchDevelopers()
  }, [project])

  // Close chat when projectId changes
  useEffect(() => {
    setIsChatOpen(false)
  }, [projectId])

  // Close project dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false)
      }
    }
    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProjectDropdownOpen])

  if (authLoading || tasksLoading || sprintsLoading || loadingDevelopers || bugsLoading || proposalsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

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

  const handleSort = (column: 'id' | 'title' | 'status' | 'priority' | 'developer' | 'startDate') => {
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
        if (!selectedTask.id) {
          toast.error(t('projectDetail.taskInvalidId'))
          return
        }
        // Update existing task
        await updateTask(selectedTask.id, {
          title: data.title,
          sprintId: data.sprint || null,
          developer: data.developer || null,
          coDeveloper: data.coDeveloper || null,
          status: data.status,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          bizPoints: data.bizPoints,
          devPoints: data.devPoints,
          acceptanceCriteria: data.acceptanceCriteria,
          userStory: data.userStory,
          ...(data.implementationPlan ? { implementationPlan: data.implementationPlan } : {}),
          ...(data.attachments ? { attachments: data.attachments } : {}),
        })
        toast.success(t('projectDetail.taskUpdatedSuccess'))
      } else {
        // Create new task
        await createTask(
          {
            title: data.title,
            ...(data.sprint ? { sprintId: data.sprint } : {}),
            ...(data.developer ? { developer: data.developer } : {}),
            ...(data.coDeveloper ? { coDeveloper: data.coDeveloper } : {}),
            status: data.status,
            ...(data.startDate ? { startDate: data.startDate } : {}),
            ...(data.endDate ? { endDate: data.endDate } : {}),
            bizPoints: data.bizPoints,
            devPoints: data.devPoints,
            acceptanceCriteria: data.acceptanceCriteria,
            userStory: data.userStory,
            ...(data.implementationPlan ? { implementationPlan: data.implementationPlan } : {}),
            ...(data.attachments ? { attachments: data.attachments } : {}),
            projectId,
            createdBy: user.uid,
          },
          {
            projectName: project?.name,
            creatorName: user.displayName || t('projectDetail.user'),
          }
        )
        toast.success(t('projectDetail.taskCreatedSuccess'))
      }
      if (!selectedTask && activeDraft) {
        deleteDraft(activeDraft.id)
        setActiveDraft(null)
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error(t('projectDetail.taskSaveError'))
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
      toast.success(t('projectDetail.sprintCreatedSuccess'))
    } catch (error) {
      console.error('Error creating sprint:', error)
      toast.error(t('projectDetail.sprintCreateError'))
    }
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setModalTab('details')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedTask(undefined)
    setIsModalOpen(false)
    setActiveDraft(null)
  }

  const handleAddTaskClick = () => {
    setSelectedTask(undefined)
    if (hasDrafts) {
      setIsDraftPickerOpen(true)
    } else {
      setActiveDraft(null)
      setIsModalOpen(true)
    }
  }

  const handleSelectDraft = (draft: TaskDraft) => {
    setActiveDraft(draft)
    setIsDraftPickerOpen(false)
    setIsModalOpen(true)
  }

  const handleCreateNewFromPicker = () => {
    setActiveDraft(null)
    setIsDraftPickerOpen(false)
    setIsModalOpen(true)
  }

  const handleDeleteDraftFromPicker = (draftId: string) => {
    deleteDraft(draftId)
  }

  const handleDraftSave = (formData: Record<string, any>) => {
    const hasContent = formData.title?.trim() ||
      formData.userStory?.who?.trim() ||
      formData.userStory?.what?.trim() ||
      formData.acceptanceCriteria?.some((c: string) => c?.trim())
    if (hasContent) {
      saveDraft(formData, activeDraft?.id)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus })
      toast.success(`${t('projectDetail.statusChangedTo')} ${TASK_STATUS_LABELS[newStatus]}`)
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error(t('projectDetail.statusChangeError'))
    }
  }

  const handleDeleteTaskClick = (taskId: string) => {
    setTaskToDelete(taskId)
    setIsDeleteTaskConfirmOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      setIsDeleteTaskConfirmOpen(false)
      setTaskToDelete(null)
      toast.success(t('projectDetail.taskDeletedSuccess'))
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error(t('projectDetail.taskDeleteError'))
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

  const handleBugSubmit = async (data: any, attachments: File[]) => {
    try {
      if (!user) {
        console.error('No user logged in')
        return
      }

      await createBug(
        {
          title: data.title,
          description: data.description,
          severity: data.severity,
          projectId,
          attachments: [],
          status: 'open',
          createdBy: user.uid,
          createdByName: user.displayName || t('projectDetail.user'),
        },
        { projectName: project?.name, creatorName: user.displayName || t('projectDetail.user') }
      )
      setIsBugModalOpen(false)
      toast.success(t('projectDetail.bugReportedSuccess'))
    } catch (error) {
      console.error('Error saving bug:', error)
      toast.error(t('projectDetail.bugReportError'))
    }
  }

  const handleDeleteBug = async (bugId: string) => {
    setBugToDelete(bugId)
    setIsDeleteBugConfirmOpen(true)
  }

  const handleConfirmDeleteBug = async () => {
    if (!bugToDelete) return
    try {
      await deleteBug(bugToDelete)
      toast.success(t('projectDetail.bugDeletedSuccess'))
    } catch (error) {
      console.error('Error deleting bug:', error)
      toast.error(t('projectDetail.bugDeleteError'))
    } finally {
      setBugToDelete(null)
      setIsDeleteBugConfirmOpen(false)
    }
  }

  const handleBugStatusChange = async (bugId: string, newStatus: any) => {
    try {
      await updateBug(bugId, { status: newStatus })
      toast.success(t('projectDetail.bugStatusUpdated'))
    } catch (error) {
      console.error('Error updating bug status:', error)
      toast.error(t('projectDetail.bugStatusUpdateError'))
    }
  }

  const handleProposalSubmit = async (data: any) => {
    try {
      if (!user) {
        console.error('No user logged in')
        return
      }

      await createProposal({
        title: data.title,
        projectId,
        acceptanceCriteria: data.acceptanceCriteria,
        userStory: data.userStory,
        startDate: data.startDate,
        bizPoints: data.bizPoints,
        devPoints: data.devPoints,
        status: 'pending',
        createdBy: user.uid,
        createdByName: user.displayName || t('projectDetail.user'),
      })
      setIsProposalModalOpen(false)
      toast.success(t('projectDetail.proposalCreatedSuccess'))
    } catch (error) {
      console.error('Error saving proposal:', error)
      toast.error(t('projectDetail.proposalCreateError'))
    }
  }

  const handleProposalAccept = async (proposalId: string, sprintId: string) => {
    try {
      const proposal = proposals.find(p => p.id === proposalId)
      if (!proposal) return

      // Crear tarea a partir de la propuesta
      await createTask({
        title: proposal.title,
        sprintId,
        developer: user?.uid || '',
        status: 'to-do',
        startDate: proposal.startDate,
        endDate: undefined,
        bizPoints: proposal.bizPoints,
        devPoints: proposal.devPoints,
        acceptanceCriteria: proposal.acceptanceCriteria,
        userStory: proposal.userStory,
        projectId,
        createdBy: user?.uid || '',
      })

      // Marcar propuesta como aceptada
      await updateProposalStatus(proposalId, 'accepted')
      toast.success(t('projectDetail.proposalAccepted'))
    } catch (error) {
      console.error('Error accepting proposal:', error)
      toast.error(t('projectDetail.proposalAcceptError'))
    }
  }

  const handleProposalReject = async (proposalId: string) => {
    try {
      await updateProposalStatus(proposalId, 'rejected')
      toast.success(t('projectDetail.proposalRejected'))
    } catch (error) {
      console.error('Error rejecting proposal:', error)
      toast.error(t('projectDetail.proposalRejectError'))
    }
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />
      <div className={styles.header}>
        <Button variant="ghost" onClick={() => router.push('/projects')}>
          <ArrowLeft size={20} />
        </Button>
        <div className={styles.projectSwitcher} ref={projectDropdownRef}>
          <button
            className={styles.projectSwitcherButton}
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            title={t('projectDetail.changeProject')}
          >
            <h1 className={styles.title}>{project?.name}</h1>
            <ChevronDown size={16} className={isProjectDropdownOpen ? styles.chevronOpen : ''} />
          </button>

          {isProjectDropdownOpen && (
            <div className={styles.projectDropdown}>
              <div className={styles.projectDropdownHeader}>{t('projectDetail.myProjects')}</div>
              {projects
                .filter(p => p.status === 'active' || p.status === 'planned')
                .map(p => (
                <button
                  key={p.id}
                  className={`${styles.projectDropdownItem} ${p.id === projectId ? styles.projectDropdownItemActive : ''}`}
                  onClick={() => {
                    setIsProjectDropdownOpen(false)
                    router.push(`/projects/${p.id}`)
                  }}
                >
                  <FolderOpen size={14} />
                  <div className={styles.projectDropdownItemInfo}>
                    <span className={styles.projectDropdownItemName}>{p.name}</span>
                    <span className={styles.projectDropdownItemStatus}>{p.status}</span>
                  </div>
                </button>
              ))}
              <div className={styles.projectDropdownDivider} />
              <button
                className={styles.projectDropdownItem}
                onClick={() => {
                  setIsProjectDropdownOpen(false)
                  router.push('/projects')
                }}
              >
                <FolderOpen size={14} />
                <span className={styles.projectDropdownItemName}>{t('projectDetail.viewAllProjects')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <TabsBar
        tabs={[
          { id: 'tasks', label: t('projects.tasks'), badge: tasks.length },
          { id: 'bugs', label: t('projects.bugs'), badge: bugs.length },
          { id: 'proposals', label: t('projects.proposals'), badge: proposals.length },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'tasks' | 'bugs' | 'proposals')}
      />

      <div className={styles.card}>
        {activeTab === 'tasks' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
              <div className={styles.viewToggleContainer}>
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  {t('projectDetail.table')}
                </Button>
                <Button
                  variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                >
                  {t('projectDetail.kanban')}
                </Button>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <Button size="sm" onClick={() => router.push(`/projects/${projectId}/sprints`)}>
                  <Calendar size={16} style={{ marginRight: '0.25rem' }} /> {t('projectDetail.viewSprints')}
                </Button>
                {canCreateTask && (
                  <Button size="sm" onClick={handleAddTaskClick}>
                    <Plus size={16} style={{ marginRight: '0.25rem' }} /> {t('projectDetail.addTask')}
                  </Button>
                )}
              </div>
            </div>

            {tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-8) 0', color: 'var(--color-neutral-600)' }}>
                <p>{t('projectDetail.noTasksYet')}</p>
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
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('id')}>ID {sortColumn === 'id' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('title')}>{t('projectDetail.title')} {sortColumn === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('status')}>{t('projectDetail.status')} {sortColumn === 'status' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('priority')}>{t('projectDetail.priority')} {sortColumn === 'priority' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('developer')}>{t('projectDetail.developer')} {sortColumn === 'developer' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>{t('projectDetail.coDev')}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>{t('projectDetail.sprint')}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', cursor: 'pointer' }} onClick={() => handleSort('startDate')}>{t('projectDetail.dateStart')} {sortColumn === 'startDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'left', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>{t('projectDetail.dateEnd')}</th>
                      <th style={{ padding: 'var(--spacing-3) var(--spacing-6)', textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)' }}>{t('projectDetail.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ padding: 'var(--spacing-4)', textAlign: 'center', color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)' }}>
                          {t('projectDetail.noTasksFiltered')}
                        </td>
                      </tr>
                    ) : (
                      [...filteredTasks]
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
                        .map((task, index) => (
                      <tr key={task.id || index} style={{ borderBottom: '1px solid var(--color-neutral-200)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>{task.id}</td>
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
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{task.developer ? getDeveloperName(task.developer) : '-'}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{task.coDeveloper ? getDeveloperName(task.coDeveloper) : '-'}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{getSprintName(task.sprintId)}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{task.startDate || '-'}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: 'var(--text-sm)', color: 'var(--color-neutral-600)' }}>{task.endDate || '-'}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', textAlign: 'center', display: 'flex', gap: 'var(--spacing-2)', justifyContent: 'center' }}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => { setSelectedTask(task); setModalTab('activity'); setIsModalOpen(true); }}
                            aria-label={t('projectDetail.viewActivity')}
                          >
                            <MessageSquare size={16} />
                          </Button>
                          {canEditTask && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditTask(task)}
                              aria-label={t('projectDetail.editTask')}
                            >
                              <Edit2 size={16} />
                            </Button>
                          )}
                          {canDeleteTask && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteTaskClick(task.id)}
                              aria-label={t('projectDetail.deleteTask')}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
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
                onDelete={canDeleteTask ? handleDeleteTaskClick : undefined}
              />
            )}
              </>
            )}
          </>
        ) : activeTab === 'bugs' ? (
          <BugsList
            bugs={bugs}
            onDelete={handleDeleteBug}
            onStatusChange={handleBugStatusChange}
            isLoading={false}
            actionButton={
              canCreateBug && (
                <Button size="sm" onClick={() => setIsBugModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '0.25rem' }} /> {t('projectDetail.reportBug')}
                </Button>
              )
            }
          />
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-4)' }}>
              {canCreateProposal && (
                <Button size="sm" onClick={() => setIsProposalModalOpen(true)}>
                  <Plus size={16} style={{ marginRight: '0.25rem' }} /> {t('projectDetail.newProposal')}
                </Button>
              )}
            </div>
            <ProposalsList
              proposals={proposals}
              sprints={sprints}
              onAccept={handleProposalAccept}
              onReject={handleProposalReject}
              isLoading={false}
            />
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
        onDelete={canDeleteTask ? handleDeleteTask : undefined}
        onCreateSprint={handleCreateSprint}
        initialTab={modalTab}
        currentUser={user}
        projectId={projectId}
        projectMembers={project ? Object.keys(project.members || {}).map(uid => ({
          uid,
          displayName: developers.find(d => d.id === uid)?.name || t('projectDetail.user')
        })) : []}
        initialFormData={activeDraft?.formData}
        onDraftSave={handleDraftSave}
      />

      <DraftPickerModal
        isOpen={isDraftPickerOpen}
        onClose={() => setIsDraftPickerOpen(false)}
        drafts={drafts}
        onSelectDraft={handleSelectDraft}
        onCreateNew={handleCreateNewFromPicker}
        onDeleteDraft={handleDeleteDraftFromPicker}
      />

      <BugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        onSubmit={handleBugSubmit}
        isLoading={false}
      />

      <ConfirmationModal
        isOpen={isDeleteBugConfirmOpen}
        onClose={() => {
          setIsDeleteBugConfirmOpen(false)
          setBugToDelete(null)
        }}
        onConfirm={handleConfirmDeleteBug}
        title={t('projectDetail.deleteBugTitle')}
        message={t('projectDetail.deleteBugMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isDeleteTaskConfirmOpen}
        onClose={() => {
          setIsDeleteTaskConfirmOpen(false)
          setTaskToDelete(null)
        }}
        onConfirm={() => taskToDelete && handleDeleteTask(taskToDelete)}
        title={t('projectDetail.deleteTaskTitle')}
        message={t('projectDetail.deleteTaskMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />

      <ProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSubmit={handleProposalSubmit}
        isLoading={false}
      />

      {/* Chat FAB and Panel */}
      <ChatFab onClick={() => setIsChatOpen(true)} />

      {isChatOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 998,
            }}
            onClick={() => setIsChatOpen(false)}
          />
          <div style={{ position: 'fixed', zIndex: 1000 }}>
            <ChatPanel
              projectId={projectId}
              project={project}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  )
}
