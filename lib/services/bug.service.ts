import { ref, get, child } from 'firebase/database'
import { database } from '@/lib/firebase/config'
import { Bug } from '@/types/bug'

export const BugService = {
  getAllBugs: async (): Promise<Bug[]> => {
    try {
      const dbRef = ref(database)
      const snapshot = await get(child(dbRef, 'bugs'))

      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.values(data) as Bug[]
      }

      return []
    } catch (error) {
      console.error('Error fetching all bugs:', error)
      return []
    }
  },

  getBugsByProject: async (projectId: string): Promise<Bug[]> => {
    try {
      const allBugs = await BugService.getAllBugs()
      return allBugs.filter(b => b.projectId === projectId)
    } catch (error) {
      console.error('Error fetching bugs by project:', error)
      return []
    }
  }
}
