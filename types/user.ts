export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: 'admin' | 'developer'
  createdAt: number
}
