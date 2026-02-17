import { ref, get, child } from 'firebase/database'
import { database } from '@/lib/firebase/config'
import { User } from '@/types'

export const UserService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const dbRef = ref(database)
      const snapshot = await get(child(dbRef, 'users'))

      if (snapshot.exists()) {
        const usersData = snapshot.val()
        return Object.values(usersData) as User[]
      }

      return []
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  getUsersByIds: async (ids: string[]): Promise<User[]> => {
    try {
      // In a real app with many users, we might want to fetch individually
      // But for now, fetching all and filtering is efficiently enough for the scale
      const allUsers = await UserService.getAllUsers()
      return allUsers.filter(user => ids.includes(user.uid))
    } catch (error) {
      console.error('Error fetching users by ids:', error)
      throw error
    }
  }
}
