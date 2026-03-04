'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Modal from '@/components/ui/Modal'
import ProjectForm from './ProjectForm'
import { Project } from '@/types'
import { ProjectFormData } from '@/lib/utils/validators'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: Project
  onSubmit: (data: ProjectFormData) => Promise<void>
}

export default function ProjectModal({
  isOpen,
  onClose,
  project,
  onSubmit,
}: ProjectModalProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? t('projects.editProject') : t('projects.createNewProject')}
    >
      <ProjectForm
        project={project}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </Modal>
  )
}
