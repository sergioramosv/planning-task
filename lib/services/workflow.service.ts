import { database } from '@/lib/firebase/config'
import { ref, update, push } from 'firebase/database'
import {
  WorkflowRule,
  WorkflowCondition,
  WorkflowAction,
  WorkflowTrigger,
  WorkflowExecution,
} from '@/types/workflow'
import { NotificationService } from './notification.service'

export interface WorkflowEventContext {
  trigger: WorkflowTrigger
  projectId: string
  entityId: string
  entityType: 'task' | 'bug'
  entityTitle: string
  // Current entity data
  data: Record<string, any>
  // For status changes
  oldStatus?: string
  newStatus?: string
  // For assignments
  developer?: string
  // Project context
  projectName?: string
  projectOwnerIds?: string[]
}

function evaluateCondition(condition: WorkflowCondition, context: WorkflowEventContext): boolean {
  let fieldValue: any

  switch (condition.field) {
    case 'newStatus':
      fieldValue = context.newStatus
      break
    case 'oldStatus':
      fieldValue = context.oldStatus
      break
    case 'status':
      fieldValue = context.data.status
      break
    case 'developer':
      fieldValue = context.data.developer
      break
    case 'severity':
      fieldValue = context.data.severity
      break
    case 'priority':
      fieldValue = context.data.priority
      break
    case 'sprintId':
      fieldValue = context.data.sprintId
      break
    case 'bizPoints':
      fieldValue = context.data.bizPoints
      break
    case 'devPoints':
      fieldValue = context.data.devPoints
      break
    default:
      fieldValue = context.data[condition.field]
  }

  switch (condition.operator) {
    case 'equals':
      return String(fieldValue) === String(condition.value)
    case 'not_equals':
      return String(fieldValue) !== String(condition.value)
    case 'greater_than':
      return Number(fieldValue) > Number(condition.value)
    case 'less_than':
      return Number(fieldValue) < Number(condition.value)
    case 'is_empty':
      return !fieldValue || fieldValue === ''
    case 'is_not_empty':
      return !!fieldValue && fieldValue !== ''
    default:
      return false
  }
}

function evaluateConditions(conditions: WorkflowCondition[], context: WorkflowEventContext): boolean {
  if (conditions.length === 0) return true
  return conditions.every(c => evaluateCondition(c, context))
}

async function executeAction(
  action: WorkflowAction,
  context: WorkflowEventContext
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (action.type) {
      case 'change_status': {
        const newStatus = action.params.status
        if (!newStatus) return { success: false, error: 'No status specified' }
        const entityPath = context.entityType === 'task' ? 'tasks' : 'bugs'
        await update(ref(database, `${entityPath}/${context.entityId}`), {
          status: newStatus,
          updatedAt: Date.now(),
        })
        return { success: true }
      }

      case 'assign_developer': {
        const devId = action.params.developerId
        if (!devId) return { success: false, error: 'No developer specified' }
        await update(ref(database, `tasks/${context.entityId}`), {
          developer: devId,
          updatedAt: Date.now(),
        })
        return { success: true }
      }

      case 'send_notification': {
        const targetUserIds: string[] = []
        const target = action.params.target

        if (target === 'owner' && context.projectOwnerIds) {
          targetUserIds.push(...context.projectOwnerIds)
        } else if (target === 'developer' && context.data.developer) {
          targetUserIds.push(context.data.developer)
        } else if (target) {
          targetUserIds.push(target)
        }

        const message = action.params.message || `Automatizacion ejecutada en: ${context.entityTitle}`

        for (const userId of targetUserIds) {
          await NotificationService.sendNotification(userId, {
            title: 'Workflow Automatizado',
            message,
            type: 'info',
            read: false,
          })
        }
        return { success: true }
      }

      case 'move_to_sprint': {
        const sprintId = action.params.sprintId
        if (!sprintId) return { success: false, error: 'No sprint specified' }
        await update(ref(database, `tasks/${context.entityId}`), {
          sprintId,
          updatedAt: Date.now(),
        })
        return { success: true }
      }

      default:
        return { success: false, error: `Unknown action type: ${action.type}` }
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' }
  }
}

export const WorkflowService = {
  /**
   * Evaluate all rules for a given event context and execute matching ones.
   * Returns the list of executions that were performed.
   */
  async evaluateAndExecute(
    rules: WorkflowRule[],
    context: WorkflowEventContext
  ): Promise<WorkflowExecution[]> {
    const enabledRules = rules.filter(r => r.enabled && r.trigger === context.trigger)
    const executionResults: WorkflowExecution[] = []

    for (const rule of enabledRules) {
      const conditionsMet = evaluateConditions(rule.conditions, context)
      if (!conditionsMet) continue

      const actionsExecuted: WorkflowExecution['actionsExecuted'] = []

      for (const action of rule.actions) {
        const result = await executeAction(action, context)
        actionsExecuted.push({
          type: action.type,
          params: action.params,
          success: result.success,
          error: result.error,
        })
      }

      const execution: WorkflowExecution = {
        id: '', // Will be assigned by Firebase
        ruleId: rule.id,
        ruleName: rule.name,
        projectId: context.projectId,
        trigger: context.trigger,
        entityId: context.entityId,
        entityType: context.entityType,
        executedAt: Date.now(),
        actionsExecuted,
        success: actionsExecuted.every(a => a.success),
      }

      // Log execution to Firebase
      try {
        const execRef = push(ref(database, 'workflowExecutions'))
        await update(execRef, { ...execution, id: execRef.key })
      } catch (err) {
        console.error('Error logging workflow execution:', err)
      }

      executionResults.push(execution)
    }

    return executionResults
  },
}
