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
import { User } from '@/types/user'
import { Trash2, FileText, Save, ArrowLeft } from 'lucide-react'
import styles from './TaskModal.module.css'

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
  initialTab?: 'details' | 'activity'
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
}

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
  initialTab = 'details',
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
}: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>(initialTab)
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          task
            ? activeTab === 'activity'
              ? 'Actividad de la Tarea'
              : 'Editar Tarea'
            : 'Crear Nueva Tarea'
        }
        className={modalStyles.contentXl}
        headerActions={
          activeTab === 'details' ? (
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
            {activeTab === 'details' && (
              <>
                {task.parentTaskId && parentTaskTitle && onGoToParent && (
                  <button className={styles.parentBreadcrumb} onClick={onGoToParent}>
                    <ArrowLeft size={14} />
                    <span>{parentTaskTitle}</span>
                  </button>
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
                {onCreateSubtask && onSubtaskStatusChange && onSubtaskClick && (
                  <SubtaskList
                    parentTask={task}
                    subtasks={subtasks}
                    onCreateSubtask={onCreateSubtask}
                    onStatusChange={onSubtaskStatusChange}
                    onSubtaskClick={onSubtaskClick}
                  />
                )}
                {onDependencyUpdate && allTasks.length > 0 && (
                  <DependencySelector
                    task={task}
                    allTasks={allTasks}
                    onUpdate={onDependencyUpdate}
                  />
                )}
                {onTimeEntrySave && currentUser && projectId && (
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
                {onAddPR && onRemovePR && onUpdatePRStatus && currentUser && (
                  <GitHubLink
                    linkedPRs={task.linkedPRs || []}
                    onAddPR={onAddPR}
                    onRemovePR={onRemovePR}
                    onUpdatePRStatus={onUpdatePRStatus}
                    userId={currentUser.uid}
                  />
                )}
                {onReviewChecklistChange && currentUser &&
                  (task.status === 'to-validate' || task.status === 'validated' || task.status === 'done') && (
                  <ReviewChecklist
                    checklist={task.reviewChecklist || []}
                    onChange={onReviewChecklistChange}
                    currentUserId={currentUser.uid}
                    currentUserName={currentUser.displayName || 'User'}
                    readOnly={task.status === 'done'}
                  />
                )}
              </>
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
