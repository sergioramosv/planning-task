'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import TaskForm from './TaskForm'
import SprintForm from '../sprints/SprintForm'
import { Task, Sprint } from '@/types'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
  onCreateSprint?: (data: any) => Promise<void>
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  sprints,
  developers,
  onSubmit,
  onCreateSprint,
}: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false)

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
        <TaskForm
          task={task}
          sprints={sprints}
          developers={developers}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCreateSprint={handleCreateSprint}
        />
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
