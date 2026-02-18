import { database } from '@/lib/firebase/config'
import { ref, push, update } from 'firebase/database'
import { Notification } from '@/types'

export const NotificationService = {
  /**
   * Send a notification to a user
   */
  async sendNotification(
    userId: string,
    data: Omit<Notification, 'id' | 'userId' | 'date'>
  ): Promise<string> {
    try {
      const newNotificationRef = push(ref(database, `notifications/${userId}`))
      const notificationId = newNotificationRef.key

      await update(newNotificationRef, {
        ...data,
        userId,
        date: Date.now(),
      })

      return notificationId!
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  },

  /**
   * Send task assignment notification
   */
  async notifyTaskAssignment(
    userId: string,
    taskTitle: string,
    projectName: string,
    assignedByName: string
  ): Promise<string> {
    return this.sendNotification(userId, {
      title: 'Nueva Tarea Asignada',
      message: `${assignedByName} te asignó la tarea "${taskTitle}" en el proyecto "${projectName}"`,
      type: 'info',
      read: false,
    })
  },

  /**
   * Send member removal notification
   */
  async notifyMemberRemoval(
    userId: string,
    projectName: string,
    removedByName: string
  ): Promise<string> {
    return this.sendNotification(userId, {
      title: 'Removido del Proyecto',
      message: `${removedByName} te removió del proyecto "${projectName}"`,
      type: 'warning',
      read: false,
    })
  },

  /**
   * Send invitation notification (alternative if not using invitations modal)
   */
  async notifyProjectInvitation(
    userId: string,
    projectName: string,
    invitedByName: string
  ): Promise<string> {
    return this.sendNotification(userId, {
      title: 'Invitación a Proyecto',
      message: `${invitedByName} te invitó a unirte al proyecto "${projectName}"`,
      type: 'info',
      read: false,
    })
  },
}
