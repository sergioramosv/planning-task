import { TaskStatus } from './task'

export interface Filters {
  developers: string[]
  sprints: string[]
  statuses: TaskStatus[]
  searchText: string
}
