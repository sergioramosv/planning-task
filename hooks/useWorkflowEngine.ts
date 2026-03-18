import { useCallback } from 'react'
import { WorkflowRule } from '@/types/workflow'
import { WorkflowService, WorkflowEventContext } from '@/lib/services/workflow.service'
import { Task } from '@/types/task'
import { Bug } from '@/types/bug'

/**
 * Hook that provides methods to fire workflow events.
 * Should be used in the project detail page where task/bug mutations happen.
 */
export function useWorkflowEngine(
  rules: WorkflowRule[],
  projectId: string,
  projectName?: string,
  projectOwnerIds?: string[]
) {
  const fireTaskStatusChange = useCallback(
    async (task: Task, oldStatus: string, newStatus: string) => {
      if (rules.length === 0) return
      const context: WorkflowEventContext = {
        trigger: 'task_status_change',
        projectId,
        entityId: task.id,
        entityType: 'task',
        entityTitle: task.title,
        data: task,
        oldStatus,
        newStatus,
        developer: task.developer,
        projectName,
        projectOwnerIds,
      }
      await WorkflowService.evaluateAndExecute(rules, context)
    },
    [rules, projectId, projectName, projectOwnerIds]
  )

  const fireTaskCreated = useCallback(
    async (task: Task) => {
      if (rules.length === 0) return
      const context: WorkflowEventContext = {
        trigger: 'task_created',
        projectId,
        entityId: task.id,
        entityType: 'task',
        entityTitle: task.title,
        data: task,
        projectName,
        projectOwnerIds,
      }
      await WorkflowService.evaluateAndExecute(rules, context)
    },
    [rules, projectId, projectName, projectOwnerIds]
  )

  const fireTaskAssigned = useCallback(
    async (task: Task, developerId: string) => {
      if (rules.length === 0) return
      const context: WorkflowEventContext = {
        trigger: 'task_assigned',
        projectId,
        entityId: task.id,
        entityType: 'task',
        entityTitle: task.title,
        data: { ...task, developer: developerId },
        developer: developerId,
        projectName,
        projectOwnerIds,
      }
      await WorkflowService.evaluateAndExecute(rules, context)
    },
    [rules, projectId, projectName, projectOwnerIds]
  )

  const fireBugCreated = useCallback(
    async (bug: Bug) => {
      if (rules.length === 0) return
      const context: WorkflowEventContext = {
        trigger: 'bug_created',
        projectId,
        entityId: bug.id,
        entityType: 'bug',
        entityTitle: bug.title,
        data: bug,
        projectName,
        projectOwnerIds,
      }
      await WorkflowService.evaluateAndExecute(rules, context)
    },
    [rules, projectId, projectName, projectOwnerIds]
  )

  const fireBugStatusChange = useCallback(
    async (bug: Bug, oldStatus: string, newStatus: string) => {
      if (rules.length === 0) return
      const context: WorkflowEventContext = {
        trigger: 'bug_status_change',
        projectId,
        entityId: bug.id,
        entityType: 'bug',
        entityTitle: bug.title,
        data: bug,
        oldStatus,
        newStatus,
        projectName,
        projectOwnerIds,
      }
      await WorkflowService.evaluateAndExecute(rules, context)
    },
    [rules, projectId, projectName, projectOwnerIds]
  )

  return {
    fireTaskStatusChange,
    fireTaskCreated,
    fireTaskAssigned,
    fireBugCreated,
    fireBugStatusChange,
  }
}
