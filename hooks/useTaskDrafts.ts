import { useLocalStorage } from './useLocalStorage'
import { TaskDraft } from '@/types/draft'

const MAX_DRAFTS = 10

export function useTaskDrafts(projectId: string) {
  const [drafts, setDrafts] = useLocalStorage<TaskDraft[]>(`task-drafts-${projectId}`, [])

  const saveDraft = (formData: Record<string, any>, existingDraftId?: string) => {
    const sanitized = { ...formData }
    delete sanitized.attachments

    const now = Date.now()

    if (existingDraftId) {
      setDrafts(prev => prev.map(d =>
        d.id === existingDraftId
          ? { ...d, formData: sanitized, title: sanitized.title?.trim() || 'Borrador sin título', updatedAt: now }
          : d
      ))
    } else {
      const newDraft: TaskDraft = {
        id: `draft-${now}`,
        title: sanitized.title?.trim() || 'Borrador sin título',
        projectId,
        formData: sanitized,
        createdAt: now,
        updatedAt: now,
      }
      setDrafts(prev => {
        const updated = [...prev, newDraft]
        if (updated.length > MAX_DRAFTS) {
          return updated.slice(updated.length - MAX_DRAFTS)
        }
        return updated
      })
    }
  }

  const deleteDraft = (draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId))
  }

  const sortedDrafts = [...drafts].sort((a, b) => b.updatedAt - a.updatedAt)

  return { drafts: sortedDrafts, saveDraft, deleteDraft, hasDrafts: drafts.length > 0 }
}
