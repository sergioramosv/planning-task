export interface SavedViewFilters {
  searchText: string
  selectedDeveloper: string
  selectedStatus: string
  selectedSprint: string
  selectedEpic?: string
}

export interface SavedView {
  id: string
  name: string
  userId: string
  projectId: string
  filters: SavedViewFilters
  shared: boolean
  createdAt: number
  updatedAt: number
}
