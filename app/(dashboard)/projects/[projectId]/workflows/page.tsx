'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useSprints } from '@/hooks/useSprints'
import { useWorkflowRules } from '@/hooks/useWorkflowRules'
import { usePermissions } from '@/hooks/usePermissions'
import { UserService } from '@/lib/services/user.service'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import ConfirmationModal from '@/components/ui/ConfirmationModal'
import {
  ArrowLeft,
  Plus,
  Zap,
  Edit2,
  Trash2,
  History,
  ChevronDown,
  X,
} from 'lucide-react'
import {
  WorkflowRule,
  WorkflowTrigger,
  WorkflowCondition,
  WorkflowConditionField,
  WorkflowConditionOperator,
  WorkflowAction,
  WorkflowActionType,
  WORKFLOW_TRIGGER_LABELS,
  WORKFLOW_CONDITION_FIELD_LABELS,
  WORKFLOW_OPERATOR_LABELS,
  WORKFLOW_ACTION_LABELS,
} from '@/types/workflow'
import { TASK_STATUS_LABELS } from '@/lib/constants/taskStates'
import toast, { Toaster } from 'react-hot-toast'
import styles from './page.module.css'
import { useEffect } from 'react'

const EMPTY_CONDITION: WorkflowCondition = { field: 'newStatus', operator: 'equals', value: '' }
const EMPTY_ACTION: WorkflowAction = { type: 'change_status', params: {} }

export default function WorkflowsPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const project = projects.find(p => p.id === projectId)
  const { canEditTask } = usePermissions(project)
  const { sprints } = useSprints(projectId)
  const { rules, executions, loading, createRule, updateRule, deleteRule, toggleRule } = useWorkflowRules(projectId)

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null)
  const [expandedRule, setExpandedRule] = useState<string | null>(null)

  // Editor state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState<WorkflowTrigger>('task_status_change')
  const [conditions, setConditions] = useState<WorkflowCondition[]>([{ ...EMPTY_CONDITION }])
  const [actions, setActions] = useState<WorkflowAction[]>([{ ...EMPTY_ACTION }])

  // Developers for dropdown
  const [developers, setDevelopers] = useState<Array<{ id: string; name: string }>>([])
  useEffect(() => {
    const fetchDevs = async () => {
      if (!project) return
      const memberIds = Object.keys(project.members || {})
      if (memberIds.length > 0) {
        const members = await UserService.getUsersByIds(memberIds)
        setDevelopers(members.map(m => ({ id: m.uid, name: m.displayName || m.email })))
      }
    }
    fetchDevs()
  }, [project])

  if (authLoading || loading) {
    return <div className={styles.container}><Spinner /></div>
  }

  const openEditor = (rule?: WorkflowRule) => {
    if (rule) {
      setEditingRule(rule)
      setName(rule.name)
      setDescription(rule.description || '')
      setTrigger(rule.trigger)
      setConditions(rule.conditions.length > 0 ? [...rule.conditions] : [{ ...EMPTY_CONDITION }])
      setActions(rule.actions.length > 0 ? [...rule.actions] : [{ ...EMPTY_ACTION }])
    } else {
      setEditingRule(null)
      setName('')
      setDescription('')
      setTrigger('task_status_change')
      setConditions([{ ...EMPTY_CONDITION }])
      setActions([{ ...EMPTY_ACTION }])
    }
    setIsEditorOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    if (!user) return

    try {
      const ruleData = {
        name: name.trim(),
        description: description.trim() || undefined,
        trigger,
        conditions: conditions.filter(c => c.value || c.operator === 'is_empty' || c.operator === 'is_not_empty'),
        actions: actions.filter(a => Object.keys(a.params).length > 0),
        enabled: editingRule ? editingRule.enabled : true,
        projectId,
        createdBy: editingRule ? editingRule.createdBy : user.uid,
      }

      if (editingRule) {
        await updateRule(editingRule.id, ruleData)
        toast.success('Regla actualizada')
      } else {
        await createRule(ruleData as any)
        toast.success('Regla creada')
      }
      setIsEditorOpen(false)
    } catch {
      toast.error('Error al guardar la regla')
    }
  }

  const handleDelete = async () => {
    if (!ruleToDelete) return
    try {
      await deleteRule(ruleToDelete)
      toast.success('Regla eliminada')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setRuleToDelete(null)
      setIsDeleteConfirmOpen(false)
    }
  }

  const updateCondition = (index: number, updates: Partial<WorkflowCondition>) => {
    setConditions(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c))
  }

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, updates: Partial<WorkflowAction>) => {
    setActions(prev => prev.map((a, i) => i === index ? { ...a, ...updates } : a))
  }

  const updateActionParam = (index: number, key: string, value: string) => {
    setActions(prev => prev.map((a, i) => i === index ? { ...a, params: { ...a.params, [key]: value } } : a))
  }

  const removeAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index))
  }

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft size={20} />
        </button>
        <h1>Automatizaciones</h1>
        {canEditTask && (
          <Button size="sm" onClick={() => openEditor()}>
            <Plus size={16} style={{ marginRight: 4 }} /> Nueva regla
          </Button>
        )}
      </div>

      {/* Rules list */}
      <div className={styles.rulesList}>
        {rules.length === 0 && (
          <div className={styles.emptyState}>
            <Zap size={40} />
            <p>No hay reglas de automatizacion configuradas.<br />Crea una para automatizar acciones en tu proyecto.</p>
          </div>
        )}

        {rules.map(rule => (
          <div key={rule.id} className={`${styles.ruleCard} ${!rule.enabled ? styles.ruleCardDisabled : ''}`}>
            <div className={styles.ruleHeader}>
              <div className={styles.ruleInfo}>
                <div className={styles.ruleName}>{rule.name}</div>
                {rule.description && <div className={styles.ruleDescription}>{rule.description}</div>}
              </div>
              <span className={styles.ruleTrigger}>{WORKFLOW_TRIGGER_LABELS[rule.trigger]}</span>
              <div className={styles.ruleActions}>
                <button
                  className={`${styles.toggleSwitch} ${rule.enabled ? styles.toggleSwitchOn : ''}`}
                  onClick={() => toggleRule(rule.id, !rule.enabled)}
                  title={rule.enabled ? 'Desactivar' : 'Activar'}
                />
                <button
                  className={styles.iconButton}
                  onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                  title="Ver detalles"
                >
                  <ChevronDown size={16} style={{ transform: expandedRule === rule.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {canEditTask && (
                  <>
                    <button className={styles.iconButton} onClick={() => openEditor(rule)} title="Editar">
                      <Edit2 size={14} />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                      onClick={() => { setRuleToDelete(rule.id); setIsDeleteConfirmOpen(true) }}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {expandedRule === rule.id && (
              <div className={styles.ruleDetails}>
                {rule.conditions.length > 0 && (
                  <div className={styles.detailGroup}>
                    <span className={styles.detailLabel}>Condiciones</span>
                    {rule.conditions.map((c, i) => (
                      <span key={i} className={styles.detailChip}>
                        {WORKFLOW_CONDITION_FIELD_LABELS[c.field]} {WORKFLOW_OPERATOR_LABELS[c.operator]} {c.value}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.detailGroup}>
                  <span className={styles.detailLabel}>Acciones</span>
                  {rule.actions.map((a, i) => (
                    <span key={i} className={styles.detailChip}>
                      {WORKFLOW_ACTION_LABELS[a.type]}: {Object.values(a.params).join(', ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Execution History */}
      {executions.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyTitle}>
            <History size={18} />
            Historial de ejecuciones
          </div>
          <div className={styles.historyList}>
            {executions.slice(0, 20).map(exec => (
              <div key={exec.id} className={styles.historyItem}>
                <div className={`${styles.historyDot} ${exec.success ? styles.historyDotSuccess : styles.historyDotFail}`} />
                <div className={styles.historyInfo}>
                  <span className={styles.historyRuleName}>{exec.ruleName}</span>
                  {' '}
                  <span className={styles.historyEntity}>({exec.entityType}: {exec.entityId?.slice(0, 8)}...)</span>
                </div>
                <span className={styles.historyTime}>{formatTime(exec.executedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rule Editor Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingRule ? 'Editar Regla' : 'Nueva Regla de Automatizacion'}
        className={modalStyles.contentLg}
      >
        <div className={styles.editorForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Nombre</label>
            <input
              className={styles.formInput}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Auto-asignar al sprint activo"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripcion (opcional)</label>
            <input
              className={styles.formInput}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripcion breve de lo que hace esta regla"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Trigger (cuando se dispara)</label>
            <select
              className={styles.formSelect}
              value={trigger}
              onChange={e => setTrigger(e.target.value as WorkflowTrigger)}
            >
              {Object.entries(WORKFLOW_TRIGGER_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Conditions */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Condiciones (todas deben cumplirse)</span>
              <button className={styles.addSmallButton} onClick={() => setConditions([...conditions, { ...EMPTY_CONDITION }])}>
                <Plus size={12} /> Condicion
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {conditions.map((cond, i) => (
                <div key={i} className={styles.conditionRow}>
                  <select value={cond.field} onChange={e => updateCondition(i, { field: e.target.value as WorkflowConditionField })}>
                    {Object.entries(WORKFLOW_CONDITION_FIELD_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <select value={cond.operator} onChange={e => updateCondition(i, { operator: e.target.value as WorkflowConditionOperator })}>
                    {Object.entries(WORKFLOW_OPERATOR_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  {cond.operator !== 'is_empty' && cond.operator !== 'is_not_empty' && (
                    <>
                      {(cond.field === 'status' || cond.field === 'newStatus' || cond.field === 'oldStatus') ? (
                        <select value={cond.value} onChange={e => updateCondition(i, { value: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      ) : cond.field === 'developer' ? (
                        <select value={cond.value} onChange={e => updateCondition(i, { value: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {developers.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      ) : cond.field === 'sprintId' ? (
                        <select value={cond.value} onChange={e => updateCondition(i, { value: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          {sprints.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      ) : cond.field === 'severity' ? (
                        <select value={cond.value} onChange={e => updateCondition(i, { value: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          <option value="critical">Critical</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      ) : (
                        <input
                          value={cond.value}
                          onChange={e => updateCondition(i, { value: e.target.value })}
                          placeholder="Valor"
                        />
                      )}
                    </>
                  )}
                  {conditions.length > 1 && (
                    <button className={styles.iconButton} onClick={() => removeCondition(i)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Acciones (se ejecutan en orden)</span>
              <button className={styles.addSmallButton} onClick={() => setActions([...actions, { ...EMPTY_ACTION }])}>
                <Plus size={12} /> Accion
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions.map((action, i) => (
                <div key={i} className={styles.actionRow}>
                  <select value={action.type} onChange={e => updateAction(i, { type: e.target.value as WorkflowActionType, params: {} })}>
                    {Object.entries(WORKFLOW_ACTION_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>

                  {action.type === 'change_status' && (
                    <select
                      value={action.params.status || ''}
                      onChange={e => updateActionParam(i, 'status', e.target.value)}
                    >
                      <option value="">Estado destino...</option>
                      {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  )}

                  {action.type === 'assign_developer' && (
                    <select
                      value={action.params.developerId || ''}
                      onChange={e => updateActionParam(i, 'developerId', e.target.value)}
                    >
                      <option value="">Desarrollador...</option>
                      {developers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  )}

                  {action.type === 'move_to_sprint' && (
                    <select
                      value={action.params.sprintId || ''}
                      onChange={e => updateActionParam(i, 'sprintId', e.target.value)}
                    >
                      <option value="">Sprint destino...</option>
                      {sprints.filter(s => s.status !== 'completed').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  )}

                  {action.type === 'send_notification' && (
                    <>
                      <select
                        value={action.params.target || ''}
                        onChange={e => updateActionParam(i, 'target', e.target.value)}
                      >
                        <option value="">Destino...</option>
                        <option value="owner">Owner del proyecto</option>
                        <option value="developer">Desarrollador asignado</option>
                        {developers.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                      <input
                        value={action.params.message || ''}
                        onChange={e => updateActionParam(i, 'message', e.target.value)}
                        placeholder="Mensaje..."
                        style={{ flex: 2 }}
                      />
                    </>
                  )}

                  {actions.length > 1 && (
                    <button className={styles.iconButton} onClick={() => removeAction(i)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formFooter}>
            <Button variant="secondary" size="sm" onClick={() => setIsEditorOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleSave}>
              {editingRule ? 'Guardar cambios' : 'Crear regla'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setRuleToDelete(null) }}
        onConfirm={handleDelete}
        title="Eliminar regla"
        message="¿Estas seguro? Esta accion no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
