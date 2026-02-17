import { ref, get, child } from 'firebase/database'
import { database } from '@/lib/firebase/config'
import { Task } from '@/types'

export const TaskService = {
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const dbRef = ref(database)
      const snapshot = await get(child(dbRef, 'tasks'))

      if (snapshot.exists()) {
        const data = snapshot.val()
        return Object.values(data) as Task[]
      }

      return []
    } catch (error) {
      console.error('Error fetching all tasks:', error)
      return []
    }
  },

  getTasksForUser: async (userId: string): Promise<Task[]> => {
    try {
      const allTasks = await TaskService.getAllTasks()
      // Filter tasks where the user is the developer
      // Note: In a real app we might want to filter by project membership too, 
      // but "Assigned Tasks" usually implies direct assignment.
      return allTasks.filter(t => t.developer === userId || t.developer === 'Unassigned') // Adjusted logic if needed, but usually strictly userId
    } catch (error) {
      console.error('Error fetching tasks for user:', error)
      return []
    }
  },
  
  getTasksByProject: async (projectId: string): Promise<Task[]> => {
      try {
          const allTasks = await TaskService.getAllTasks()
          return allTasks.filter(t => t.projectId === projectId)
      } catch (error) {
          console.error('Error fetching tasks by project:', error)
          return []
      }
  }
}
