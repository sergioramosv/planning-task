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

  /**
   * Send task status change notification
   */
  async notifyTaskStatusChange(
    userId: string,
    taskTitle: string,
    oldStatus: string,
    newStatus: string,
    changedByName: string,
    projectName: string,
    taskLink?: string
  ): Promise<string> {
    const statusLabels: Record<string, string> = {
      'to-do': 'Por Hacer',
      'in-progress': 'En Progreso',
      'to-validate': 'Validación',
      'validated': 'Validado',
      'done': 'Completada',
    }

    return this.sendNotification(userId, {
      title: 'Estado de Tarea Cambió',
      message: `${changedByName} cambió la tarea "${taskTitle}" de ${statusLabels[oldStatus]} a ${statusLabels[newStatus]} en "${projectName}"`,
      type: 'info',
      read: false,
      link: taskLink,
    })
  },

  /**
   * Send task update notification (points, sprint, etc.)
   */
  async notifyTaskUpdate(
    userId: string,
    taskTitle: string,
    fieldName: string,
    oldValue: any,
    newValue: any,
    changedByName: string,
    projectName: string,
    taskLink?: string
  ): Promise<string> {
    return this.sendNotification(userId, {
      title: 'Tarea Actualizada',
      message: `${changedByName} cambió ${fieldName} de "${oldValue}" a "${newValue}" en la tarea "${taskTitle}" de "${projectName}"`,
      type: 'info',
      read: false,
      link: taskLink,
    })
  },

  /**
   * Send sprint status change notification to multiple users
   */
  async notifySprintStatusChange(
    userIds: string[],
    sprintName: string,
    newStatus: string,
    projectName: string,
    sprintLink?: string
  ): Promise<void> {
    const statusLabels: Record<string, string> = {
      'planned': 'Planificado',
      'active': 'Activo',
      'completed': 'Completado',
    }

    const message = `El sprint "${sprintName}" en "${projectName}" ahora está ${statusLabels[newStatus]}`

    for (const userId of userIds) {
      try {
        await this.sendNotification(userId, {
          title: 'Sprint Actualizado',
          message,
          type: newStatus === 'active' ? 'success' : 'info',
          read: false,
          link: sprintLink,
        })
      } catch (error) {
        console.error(`Error notifying user ${userId} about sprint change:`, error)
      }
    }
  },

  /**
   * Send sprint deadline approaching notification
   */
  async notifySprintDeadlineApproaching(
    userIds: string[],
    sprintName: string,
    daysRemaining: number,
    projectName: string,
    sprintLink?: string
  ): Promise<void> {
    const dayLabel = daysRemaining === 1 ? 'día' : 'días'
    const message = `El sprint "${sprintName}" en "${projectName}" vence en ${daysRemaining} ${dayLabel}`

    for (const userId of userIds) {
      try {
        await this.sendNotification(userId, {
          title: 'Sprint Próximo a Terminar',
          message,
          type: 'warning',
          read: false,
          link: sprintLink,
        })
      } catch (error) {
        console.error(`Error notifying user ${userId} about sprint deadline:`, error)
      }
    }
  },

  /**
   * Send task deleted notification
   */
  async notifyTaskDeleted(
    userId: string,
    taskTitle: string,
    deletedByName: string,
    projectName: string
  ): Promise<string> {
    return this.sendNotification(userId, {
      title: 'Tarea Eliminada',
      message: `${deletedByName} eliminó la tarea "${taskTitle}" del proyecto "${projectName}"`,
      type: 'warning',
      read: false,
    })
  },

  /**
   * Send task reassignment notification
   */
  async notifyTaskReassignment(
    newDeveloperId: string,
    oldDeveloperName: string,
    taskTitle: string,
    reassignedByName: string,
    projectName: string,
    taskLink?: string
  ): Promise<string> {
    return this.sendNotification(newDeveloperId, {
      title: 'Tarea Reasignada',
      message: `${reassignedByName} reasignó la tarea "${taskTitle}" de ${oldDeveloperName} a ti en "${projectName}"`,
      type: 'info',
      read: false,
      link: taskLink,
    })
  },

  /**
   * Send task comment notification
   */
  async notifyTaskComment(
    userId: string,
    taskTitle: string,
    commenterName: string,
    commentSnippet: string,
    taskLink?: string
  ): Promise<string> {
    return this.sendNotification(userId, {
      title: 'Nuevo Comentario',
      message: `${commenterName} comentó en la tarea "${taskTitle}": "${commentSnippet.substring(0, 50)}${commentSnippet.length > 50 ? '...' : ''}"`,
      type: 'info',
      read: false,
      link: taskLink,
    })
  },

  /**
   * Send task mention notification
   */
  async notifyTaskMention(
    userId: string,
    taskTitle: string,
    mentionerName: string,
    commentSnippet: string,
    taskLink?: string
  ): Promise<string> {
    return this.sendNotification(userId, {
      title: 'Te Mencionaron',
      message: `${mentionerName} te mencionó en la tarea "${taskTitle}": "${commentSnippet.substring(0, 50)}${commentSnippet.length > 50 ? '...' : ''}"`,
      type: 'success',
      read: false,
      link: taskLink,
    })
  },
}
