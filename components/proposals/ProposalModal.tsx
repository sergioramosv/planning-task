'use client'

import Modal from '@/components/ui/Modal'
import ProposalForm from './ProposalForm'
import { Proposal } from '@/types/proposal'

interface ProposalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  initialData?: Partial<Proposal>
  isLoading?: boolean
}

export default function ProposalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: ProposalModalProps) {
  const handleFormSubmit = async (data: any) => {
    const proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'> = {
      title: data.title,
      projectId: '',
      acceptanceCriteria: data.acceptanceCriteria.split('\n').filter((c: string) => c.trim()),
      userStory: {
        who: data.userStoryWho,
        what: data.userStoryWhat,
        why: data.userStoryWhy,
      },
      startDate: data.startDate,
      bizPoints: data.bizPoints,
      devPoints: parseInt(data.devPoints) as any,
      status: 'pending',
      createdBy: '',
      createdByName: '',
    }

    await onSubmit(proposalData)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Propuesta">
      <ProposalForm onSubmit={handleFormSubmit} isLoading={isLoading} initialData={initialData} />
    </Modal>
  )
}
