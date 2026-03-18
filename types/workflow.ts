export type WorkflowTrigger =
  | 'task_status_change'
  | 'task_created'
  | 'task_assigned'
  | 'bug_created'
  | 'bug_status_change'

export type WorkflowConditionField =
  | 'status'
  | 'newStatus'
  | 'oldStatus'
  | 'developer'
  | 'severity'
  | 'priority'
  | 'sprintId'
  | 'bizPoints'
  | 'devPoints'

export type WorkflowConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty'

export type WorkflowActionType =
  | 'change_status'
  | 'assign_developer'
  | 'send_notification'
  | 'move_to_sprint'

export interface WorkflowCondition {
  field: WorkflowConditionField
  operator: WorkflowConditionOperator
  value: string
}

export interface WorkflowAction {
  type: WorkflowActionType
  params: Record<string, string>
}

export interface WorkflowRule {
  id: string
  projectId: string
  name: string
  description?: string
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  enabled: boolean
  createdAt: number
  createdBy: string
  updatedAt: number
}

export interface WorkflowExecution {
  id: string
  ruleId: string
  ruleName: string
  projectId: string
  trigger: WorkflowTrigger
  entityId: string
  entityType: 'task' | 'bug'
  executedAt: number
  actionsExecuted: {
    type: WorkflowActionType
    params: Record<string, string>
    success: boolean
    error?: string
  }[]
  success: boolean
}

export const WORKFLOW_TRIGGER_LABELS: Record<WorkflowTrigger, string> = {
  task_status_change: 'Cambio de estado de tarea',
  task_created: 'Tarea creada',
  task_assigned: 'Tarea asignada',
  bug_created: 'Bug reportado',
  bug_status_change: 'Cambio de estado de bug',
}

export const WORKFLOW_CONDITION_FIELD_LABELS: Record<WorkflowConditionField, string> = {
  status: 'Estado',
  newStatus: 'Nuevo estado',
  oldStatus: 'Estado anterior',
  developer: 'Desarrollador',
  severity: 'Severidad',
  priority: 'Prioridad',
  sprintId: 'Sprint',
  bizPoints: 'Puntos de negocio',
  devPoints: 'Puntos de desarrollo',
}

export const WORKFLOW_OPERATOR_LABELS: Record<WorkflowConditionOperator, string> = {
  equals: 'es igual a',
  not_equals: 'no es igual a',
  greater_than: 'mayor que',
  less_than: 'menor que',
  is_empty: 'esta vacio',
  is_not_empty: 'no esta vacio',
}

export const WORKFLOW_ACTION_LABELS: Record<WorkflowActionType, string> = {
  change_status: 'Cambiar estado',
  assign_developer: 'Asignar desarrollador',
  send_notification: 'Enviar notificacion',
  move_to_sprint: 'Mover a sprint',
}
