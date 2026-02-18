'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import TaskForm from './TaskForm'
import SprintForm from '../sprints/SprintForm'
import TaskActivityPanel from './TaskActivityPanel'
import { Task, Sprint } from '@/types'
import { User } from '@/types/user'
import styles from './TaskModal.module.css'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
  onCreateSprint?: (data: any) => Promise<void>
  currentUser?: User | null
  projectMembers?: Array<{ uid: string; displayName: string }>
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  sprints,
  developers,
  onSubmit,
  onCreateSprint,
  currentUser,
  projectMembers = [],
}: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details')

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      onClose()
    } finally {
      setIsLoading(false)
    }
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={task ? 'Editar Tarea' : 'Crear Nueva Tarea'}
        className={modalStyles.contentLg}
      >
        {task && (
          <div className={styles.tabsContainer}>
            <div className={styles.tabsBar}>
              <button
                className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Detalles
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'activity' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('activity')}
              >
                Actividad
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === 'details' && (
                <TaskForm
                  task={task}
                  sprints={sprints}
                  developers={developers}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  onCreateSprint={handleCreateSprint}
                />
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
          </div>
        )}

        {!task && (
          <TaskForm
            sprints={sprints}
            developers={developers}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onCreateSprint={handleCreateSprint}
          />
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
    </>
  )
}
