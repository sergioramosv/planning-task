'use client'

import Modal from '@/components/ui/Modal'
import BugForm from './BugForm'
import { Bug } from '@/types/bug'
import { useState } from 'react'

interface BugModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (bugData: Omit<Bug, 'id' | 'createdAt' | 'updatedAt' | 'createdByName'>, attachments: File[]) => Promise<void>
  initialData?: Partial<Bug>
  isLoading?: boolean
}

export default function BugModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: BugModalProps) {
  const handleFormSubmit = async (data: any, attachments: File[]) => {
    const bugData: Omit<Bug, 'id' | 'createdAt' | 'updatedAt' | 'createdByName'> = {
      title: data.title,
      description: data.description,
      severity: data.severity,
      projectId: '',
      attachments: [],
      status: 'open',
      createdBy: '',
    }

    await onSubmit(bugData, attachments)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reportar Bug">
      <BugForm onSubmit={handleFormSubmit} isLoading={isLoading} initialData={initialData} />
    </Modal>
  )
}
