'use client'

import { useState, useEffect, useRef } from 'react'
import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import Button from '@/components/ui/Button'
import TaskForm, { TaskFormRef } from './TaskForm'
import SprintForm from '../sprints/SprintForm'
import TaskActivityPanel from './TaskActivityPanel'
import SubtaskList from './SubtaskList'
import ReviewChecklist from './ReviewChecklist'
import DependencySelector from './DependencySelector'
import TimeTracker from './TimeTracker'
import GitHubLink from './GitHubLink'
import { Task, Sprint, TaskTemplate, TaskStatus, ReviewChecklistItem, TimeEntry, LinkedPR } from '@/types'
import { Epic } from '@/types/epic'
import { User } from '@/types/user'
import EpicSelector from '@/components/epics/EpicSelector'
import { Trash2, FileText, Save, ArrowLeft, ListTodo, Link, Clock, GitPullRequest, Shield, MessageSquare, FileEdit } from 'lucide-react'
import styles from './TaskModal.module.css'

type ModalTab = 'general' | 'subtasks' | 'dependencies' | 'time' | 'github' | 'review' | 'activity'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  onCreateSprint?: (data: any) => Promise<void>
  currentUser?: User | null
  projectMembers?: Array<{ uid: string; displayName: string }>
  initialTab?: 'general' | 'activity'
  projectId?: string
  initialFormData?: Record<string, any>
  onDraftSave?: (data: Record<string, any>) => void
  templates?: TaskTemplate[]
  onApplyTemplate?: (template: TaskTemplate) => void
  onSaveAsTemplate?: (name: string) => void
  subtasks?: Task[]
  onCreateSubtask?: (title: string) => void
  onSubtaskStatusChange?: (taskId: string, status: TaskStatus) => void
  onSubtaskClick?: (task: Task) => void
  parentTaskTitle?: string
  onGoToParent?: () => void
  onReviewChecklistChange?: (checklist: ReviewChecklistItem[]) => void
  allTasks?: Task[]
  onDependencyUpdate?: (blockedBy: string[], blocks: string[]) => void
  onTimeEntrySave?: (entry: Omit<TimeEntry, 'id'>) => void
  onTimeEntryDelete?: (entryId: string) => void
  onAddPR?: (pr: Omit<LinkedPR, 'id'>) => void
  onRemovePR?: (prId: string) => void
  onUpdatePRStatus?: (prId: string, status: LinkedPR['status']) => void
  epics?: Epic[]
  onEpicChange?: (epicId: string | undefined) => void
}

const EDIT_TABS: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General', icon: <FileEdit size={14} /> },
  { id: 'subtasks', label: 'Subtareas', icon: <ListTodo size={14} /> },
  { id: 'dependencies', label: 'Deps', icon: <Link size={14} /> },
  { id: 'time', label: 'Tiempo', icon: <Clock size={14} /> },
  { id: 'github', label: 'GitHub', icon: <GitPullRequest size={14} /> },
  { id: 'review', label: 'Review', icon: <Shield size={14} /> },
  { id: 'activity', label: 'Actividad', icon: <MessageSquare size={14} /> },
]

export default function TaskModal({
  isOpen,
  onClose,
  task,
  sprints,
  developers,
  onSubmit,
  onDelete,
  onCreateSprint,
  currentUser,
  projectMembers = [],
  initialTab = 'general',
  projectId,
  initialFormData,
  onDraftSave,
  templates = [],
  onApplyTemplate,
  onSaveAsTemplate,
  subtasks = [],
  onCreateSubtask,
  onSubtaskStatusChange,
  onSubtaskClick,
  parentTaskTitle,
  onGoToParent,
  onReviewChecklistChange,
  allTasks = [],
  onDependencyUpdate,
  onTimeEntrySave,
  onTimeEntryDelete,
  onAddPR,
  onRemovePR,
  onUpdatePRStatus,
  epics = [],
  onEpicChange,
}: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [saveTemplateName, setSaveTemplateName] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const taskFormRef = useRef<TaskFormRef>(null)

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])


  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!task && onDraftSave && taskFormRef.current) {
      const currentValues = taskFormRef.current.getFormValues()
      onDraftSave(currentValues)
    }
    onClose()
  }

  const handleCreateSprint = () => {
    setIsSprintModalOpen(true)
  }

  const handleSprintSubmit = async (data: any) => {
    if (onCreateSprint) {
      await onCreateSprint(data)
      setIsSprintModalOpen(false)
    }
  }

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (task && onDelete) {
      setIsLoading(true)
      try {
        await onDelete(task.id)
        setIsDeleteModalOpen(false)
        onClose()
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Badge counts for tabs
  const subtaskCount = subtasks.length
  const depCount = (task?.blockedBy?.length || 0) + (task?.blocks?.length || 0)
  const timeEntryCount = task?.timeEntries?.length || 0
  const prCount = task?.linkedPRs?.length || 0
  const reviewCount = task?.reviewChecklist?.length || 0

  const getModalTitle = () => {
    if (!task) return 'Crear Nueva Tarea'
    return 'Editar Tarea'
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={getModalTitle()}
        className={modalStyles.contentXl}
        headerActions={
          activeTab === 'general' ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {task && onSaveAsTemplate && !showSaveTemplate && (
                <button
                  onClick={() => setShowSaveTemplate(true)}
                  className={styles.saveTemplateButton}
                  title="Guardar como template"
                >
                  <Save size={16} />
                </button>
              )}
              {showSaveTemplate && onSaveAsTemplate && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Nombre del template..."
                    value={saveTemplateName}
                    onChange={e => setSaveTemplateName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && saveTemplateName.trim()) {
                        onSaveAsTemplate(saveTemplateName.trim())
                        setSaveTemplateName('')
                        setShowSaveTemplate(false)
                      }
                      if (e.key === 'Escape') setShowSaveTemplate(false)
                    }}
                    className={styles.templateNameInput}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (saveTemplateName.trim()) {
                        onSaveAsTemplate(saveTemplateName.trim())
                        setSaveTemplateName('')
                        setShowSaveTemplate(false)
                      }
                    }}
                    className={styles.saveTemplateConfirm}
                    disabled={!saveTemplateName.trim()}
                  >
                    OK
                  </button>
                </div>
              )}
              {task && onDelete && (
                <button
                  onClick={handleDeleteClick}
                  disabled={isLoading}
                  className={styles.deleteIconButton}
                  aria-label="Eliminar tarea"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ) : undefined
        }
      >
        {task ? (
          <>
            {/* Tab bar for editing */}
            <div className={styles.tabsBar}>
              {EDIT_TABS.map(tab => {
                let badge: number | null = null
                if (tab.id === 'subtasks' && subtaskCount > 0) badge = subtaskCount
                if (tab.id === 'dependencies' && depCount > 0) badge = depCount
                if (tab.id === 'time' && timeEntryCount > 0) badge = timeEntryCount
                if (tab.id === 'github' && prCount > 0) badge = prCount
                if (tab.id === 'review' && reviewCount > 0) badge = reviewCount

                return (
                  <button
                    key={tab.id}
                    className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span className={styles.tabLabel}>{tab.label}</span>
                    {badge !== null && <span className={styles.tabBadge}>{badge}</span>}
                  </button>
                )
              })}
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'general' && (
                <>
                  {task.parentTaskId && parentTaskTitle && onGoToParent && (
                    <button className={styles.parentBreadcrumb} onClick={onGoToParent}>
                      <ArrowLeft size={14} />
                      <span>{parentTaskTitle}</span>
                    </button>
                  )}
                  {epics.length > 0 && onEpicChange && (
                    <div style={{ marginBottom: 'var(--spacing-3)' }}>
                      <EpicSelector
                        epics={epics}
                        selectedEpicId={task.epicId}
                        onChange={onEpicChange}
                      />
                    </div>
                  )}
                  <TaskForm
                    task={task}
                    sprints={sprints}
                    developers={developers}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onCreateSprint={handleCreateSprint}
                    projectId={projectId}
                    currentUserId={currentUser?.uid}
                  />
                </>
              )}

              {activeTab === 'subtasks' && onCreateSubtask && onSubtaskStatusChange && onSubtaskClick && (
                <SubtaskList
                  parentTask={task}
                  subtasks={subtasks}
                  onCreateSubtask={onCreateSubtask}
                  onStatusChange={onSubtaskStatusChange}
                  onSubtaskClick={onSubtaskClick}
                />
              )}

              {activeTab === 'dependencies' && onDependencyUpdate && (
                <DependencySelector
                  task={task}
                  allTasks={allTasks}
                  onUpdate={onDependencyUpdate}
                />
              )}

              {activeTab === 'time' && onTimeEntrySave && currentUser && projectId && (
                <TimeTracker
                  taskId={task.id}
                  taskTitle={task.title}
                  projectId={projectId}
                  userId={currentUser.uid}
                  userName={currentUser.displayName || 'User'}
                  timeEntries={task.timeEntries || []}
                  onSaveEntry={onTimeEntrySave}
                  onDeleteEntry={onTimeEntryDelete}
                />
              )}

              {activeTab === 'github' && onAddPR && onRemovePR && onUpdatePRStatus && currentUser && (
                <GitHubLink
                  linkedPRs={task.linkedPRs || []}
                  onAddPR={onAddPR}
                  onRemovePR={onRemovePR}
                  onUpdatePRStatus={onUpdatePRStatus}
                  userId={currentUser.uid}
                />
              )}

              {activeTab === 'review' && onReviewChecklistChange && currentUser && (
                (task.status === 'to-validate' || task.status === 'validated' || task.status === 'done') ? (
                  <ReviewChecklist
                    checklist={task.reviewChecklist || []}
                    onChange={onReviewChecklistChange}
                    currentUserId={currentUser.uid}
                    currentUserName={currentUser.displayName || 'User'}
                    readOnly={task.status === 'done'}
                  />
                ) : (
                  <div className={styles.tabEmptyState}>
                    <Shield size={32} />
                    <p>El checklist de Code Review estara disponible cuando la tarea pase a estado <strong>To Validate</strong>.</p>
                  </div>
                )
              )}

              {activeTab === 'activity' && currentUser && (
                <TaskActivityPanel
                  task={task}
                  currentUserId={currentUser.uid}
                  currentUserName={currentUser.displayName || 'Usuario'}
                  currentUserPhotoURL={currentUser.photoURL || undefined}
                  projectMembers={projectMembers}
                />
              )}
            </div>
          </>
        ) : (
          <>
            {templates.length > 0 && onApplyTemplate && !showTemplatePicker && (
              <button className={styles.templateToggle} onClick={() => setShowTemplatePicker(true)}>
                <FileText size={14} /> Usar template
              </button>
            )}
            {showTemplatePicker && (
              <div className={styles.templatePicker}>
                <div className={styles.templatePickerHeader}>
                  <span>Seleccionar template</span>
                  <button onClick={() => setShowTemplatePicker(false)} className={styles.templatePickerClose}>&times;</button>
                </div>
                {templates.map(tmpl => (
                  <button
                    key={tmpl.id}
                    className={styles.templateItem}
                    onClick={() => {
                      onApplyTemplate?.(tmpl)
                      setShowTemplatePicker(false)
                    }}
                  >
                    <FileText size={14} />
                    <div>
                      <span className={styles.templateName}>{tmpl.name}</span>
                      <span className={styles.templateMeta}>{tmpl.titlePattern}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <TaskForm
              ref={taskFormRef}
              sprints={sprints}
              developers={developers}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onCreateSprint={handleCreateSprint}
              projectId={projectId}
              currentUserId={currentUser?.uid}
              initialFormData={initialFormData}
            />
          </>
        )}
      </Modal>

      {sprints.length === 0 && (
        <Modal
          isOpen={isSprintModalOpen}
          onClose={() => setIsSprintModalOpen(false)}
          title="Crear Nuevo Sprint"
          className={modalStyles.contentMd}
        >
          <SprintForm
            onSubmit={handleSprintSubmit}
            isLoading={false}
          />
        </Modal>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Tarea"
        message="¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  )
}
