export interface Epic {
  id: string
  projectId: string
  title: string
  description?: string
  color: string
  taskIds: string[]
  startDate?: string
  endDate?: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export const EPIC_COLORS = [
  '#7c3aed', // purple
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#db2777', // pink
  '#0891b2', // cyan
  '#4f46e5', // indigo
]
