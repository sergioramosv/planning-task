import { adminDb } from '@/lib/firebase/admin'

/**
 * Server-side notification service using Firebase Admin SDK.
 * Mirrors the client-side NotificationService but uses adminDb.
 */
export const NotificationAdminService = {
  async sendNotification(
    userId: string,
    data: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; read: boolean; link?: string }
  ): Promise<string> {
    const notifRef = adminDb.ref(`notifications/${userId}`).push()
    await notifRef.set({
      ...data,
      userId,
      date: Date.now(),
    })
    return notifRef.key!
  },

  async notifyTaskAssignment(
    userId: string,
    taskTitle: string,
    projectName: string,
    assignedByName: string
  ): Promise<void> {
    await this.sendNotification(userId, {
      title: 'Nueva Tarea Asignada',
      message: `${assignedByName} te asignó la tarea "${taskTitle}" en el proyecto "${projectName}"`,
      type: 'info',
      read: false,
    })
  },

  async notifyTaskStatusChange(
    userId: string,
    taskTitle: string,
    oldStatus: string,
    newStatus: string,
    changedByName: string,
    projectName: string
  ): Promise<void> {
    const statusLabels: Record<string, string> = {
      'to-do': 'Por Hacer',
      'in-progress': 'En Progreso',
      'to-validate': 'Validación',
      'validated': 'Validado',
      'done': 'Completada',
    }
    await this.sendNotification(userId, {
      title: 'Estado de Tarea Cambió',
      message: `${changedByName} cambió la tarea "${taskTitle}" de ${statusLabels[oldStatus] || oldStatus} a ${statusLabels[newStatus] || newStatus} en "${projectName}"`,
      type: 'info',
      read: false,
    })
  },

  async notifyTaskReassignment(
    newDeveloperId: string,
    taskTitle: string,
    reassignedByName: string,
    projectName: string
  ): Promise<void> {
    await this.sendNotification(newDeveloperId, {
      title: 'Tarea Reasignada',
      message: `${reassignedByName} te reasignó la tarea "${taskTitle}" en "${projectName}"`,
      type: 'info',
      read: false,
    })
  },
}
