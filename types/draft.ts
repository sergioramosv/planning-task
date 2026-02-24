export interface TaskDraft {
  id: string
  title: string
  projectId: string
  formData: Record<string, any>
  createdAt: number
  updatedAt: number
}
