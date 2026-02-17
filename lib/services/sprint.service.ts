import { ref, get, child } from 'firebase/database'
import { database } from '@/lib/firebase/config'
import { Sprint } from '@/types'

export const SprintService = {
  getAllSprints: async (): Promise<Sprint[]> => {
    try {
      const dbRef = ref(database)
      const snapshot = await get(child(dbRef, 'sprints'))

      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.values(data) as Sprint[]
      }

      return []
    } catch (error) {
      console.error('Error fetching all sprints:', error)
      return []
    }
  },

  getSprintsForProject: async (projectId: string): Promise<Sprint[]> => {
    try {
      const dbRef = ref(database)
      const snapshot = await get(child(dbRef, 'sprints'))

      if (snapshot.exists()) {
        const data = snapshot.val()
        const sprints = Object.values(data) as Sprint[]
        return sprints.filter(s => s.projectId === projectId)
      }

      return []
    } catch (error) {
      console.error('Error fetching sprints for project:', error)
      return []
    }
  },

  getActiveSprints: async (): Promise<Sprint[]> => {
    try {
      const allSprints = await SprintService.getAllSprints()
      return allSprints.filter(s => s.status === 'active')
    } catch (error) {
      console.error('Error fetching active sprints:', error)
      return []
    }
  }
}
