export interface Comment {
  id: string
  taskId: string
  userId: string
  userName: string
  userPhotoURL?: string
  text: string
  mentions: string[] // Array of userId mentioned
  createdAt: number
  updatedAt: number
  edited: boolean
}

export interface ActivityItem {
  type: 'comment' | 'history'
  data: Comment | any // TaskHistory
  timestamp: number
}
