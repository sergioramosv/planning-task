export type ProposalStatus = 'pending' | 'accepted' | 'rejected'
export type FibonacciPoint = 1 | 2 | 3 | 5 | 8 | 13

export interface UserStory {
  who: string
  what: string
  why: string
}

export interface Proposal {
  id: string
  title: string
  projectId: string
  acceptanceCriteria: string[]
  userStory: UserStory
  startDate: string
  bizPoints: number
  devPoints: FibonacciPoint
  status: ProposalStatus
  createdAt: number
  updatedAt: number
  createdBy: string
  createdByName?: string
}
