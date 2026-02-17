export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  date: number // Timestamp
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
  link?: string // Optional link to navigate to
}
