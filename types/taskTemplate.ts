import { UserStory, FibonacciPoint } from './task'

export interface TaskTemplate {
  id: string
  name: string
  projectId: string
  titlePattern: string
  userStory: UserStory
  acceptanceCriteria: string[]
  bizPoints: number
  devPoints: FibonacciPoint
  createdAt: number
  createdBy: string
}
