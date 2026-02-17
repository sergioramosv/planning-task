import { ref, get, child } from 'firebase/database'
import { database } from '@/lib/firebase/config'
import { Project } from '@/types'

export const ProjectService = {
  getAllProjects: async (): Promise<Project[]> => {
    try {
      const dbRef = ref(database)
      const snapshot = await get(child(dbRef, 'projects'))

      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.values(data) as Project[]
      }

      return []
    } catch (error) {
      console.error('Error fetching all projects:', error)
      return []
    }
  },

  getProjectsForUser: async (userId: string): Promise<Project[]> => {
    try {
      const projects = await ProjectService.getAllProjects()
      return projects.filter(p => p.members && p.members[userId])
    } catch (error) {
      console.error('Error fetching projects for user:', error)
      return []
    }
  }
}
