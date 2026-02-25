'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '@/lib/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Task, Sprint, TaskAttachment } from '@/types'
import { FIBONACCI_LABELS } from '@/lib/constants/fibonacciPoints'
import { Plus, X, Upload, Paperclip, Download, Trash2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState, useRef, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import styles from './TaskForm.module.css'

type TabId = 'general' | 'userStory' | 'implementation' | 'attachments'

export interface TaskFormRef {
  getFormValues: () => any
}

interface TaskFormProps {
  task?: Task
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  onCreateSprint?: () => void
  projectId?: string
  currentUserId?: string
  initialFormData?: Record<string, any>
}

const TaskForm = forwardRef<TaskFormRef, TaskFormProps>(function TaskForm({
  task,
  sprints,
  developers,
  onSubmit,
  isLoading = false,
  onCreateSprint,
  projectId,
  currentUserId,
  initialFormData,
}, ref) {
  const [activeTab, setActiveTab] = useState<TabId>('general')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState<TaskAttachment[]>(
    task?.attachments || []
  )
  const [removedAttachments, setRemovedAttachments] = useState<TaskAttachment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploading, progress, uploadFiles, deleteFile } = useFileUpload()

  const toNearestFibonacci = (value: number, options: number[]): string => {
    const closest = options.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    )
    return String(closest)
  }

  const BIZ_FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 34]
  const DEV_FIBONACCI = [1, 2, 3, 5, 8, 13]

  const getDefaultValues = () => {
    if (task) {
      return {
        title: task.title,
        sprint: task.sprintId || '',
        devPoints: toNearestFibonacci(task.devPoints, DEV_FIBONACCI),
        bizPoints: toNearestFibonacci(task.bizPoints, BIZ_FIBONACCI),
        developer: task.developer || '',
        coDeveloper: task.coDeveloper || '',
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        status: task.status,
        acceptanceCriteria: task.acceptanceCriteria?.length ? task.acceptanceCriteria : [''],
        userStory: task.userStory || { who: '', what: '', why: '' },
        implementationPlan: task.implementationPlan || undefined,
      }
    }
    if (initialFormData) {
      return {
        title: initialFormData.title || '',
        sprint: initialFormData.sprint || '',
        status: initialFormData.status || 'to-do',
        developer: initialFormData.developer || '',
        coDeveloper: initialFormData.coDeveloper || '',
        startDate: initialFormData.startDate || '',
        endDate: initialFormData.endDate || '',
        bizPoints: initialFormData.bizPoints ? toNearestFibonacci(Number(initialFormData.bizPoints), BIZ_FIBONACCI) : undefined,
        devPoints: initialFormData.devPoints ? toNearestFibonacci(Number(initialFormData.devPoints), DEV_FIBONACCI) : undefined,
        acceptanceCriteria: initialFormData.acceptanceCriteria?.length
          ? initialFormData.acceptanceCriteria
          : [''],
        userStory: initialFormData.userStory || { who: '', what: '', why: '' },
        implementationPlan: initialFormData.implementationPlan || undefined,
      }
    }
    return {
      sprint: '',
      status: 'to-do',
      coDeveloper: '',
      acceptanceCriteria: [''],
      userStory: { who: '', what: '', why: '' },
    }
  }

  const [aiGenerating, setAiGenerating] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(taskSchema),
    defaultValues: getDefaultValues(),
  })

  const titleValue = watch('title')

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'acceptanceCriteria',
  })

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'implementationPlan.steps',
  })

  const handleAiGenerate = useCallback(async () => {
    const title = getValues('title')?.trim()
    if (!title || !projectId) return

    setAiGenerating(true)
    try {
      const res = await fetch('/api/tasks/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, projectId }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al generar')
      }

      const data = await res.json()

      // Populate form fields
      setValue('userStory.who', data.userStory.who)
      setValue('userStory.what', data.userStory.what)
      setValue('userStory.why', data.userStory.why)
      setValue('bizPoints', String(data.bizPoints))
      setValue('devPoints', String(data.devPoints))

      // Replace acceptance criteria
      if (data.acceptanceCriteria?.length > 0) {
        // Remove all existing criteria first
        while (criteriaFields.length > 0) {
          removeCriteria(0)
        }
        // Add generated ones
        data.acceptanceCriteria.forEach((c: string) => appendCriteria(c))
      }

      // Switch to User Story tab to show results
      setActiveTab('userStory')
    } catch (err: any) {
      console.error('AI generation error:', err)
    } finally {
      setAiGenerating(false)
    }
  }, [projectId, getValues, setValue, appendCriteria, removeCriteria, criteriaFields.length])

  useImperativeHandle(ref, () => ({
    getFormValues: () => getValues(),
  }))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemovePending = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExisting = (attachment: TaskAttachment) => {
    setExistingAttachments(prev => prev.filter(a => a.id !== attachment.id))
    setRemovedAttachments(prev => [...prev, attachment])
  }

  const onFormSubmit = async (data: any) => {
    let uploadedAttachments: TaskAttachment[] = []
    if (pendingFiles.length > 0 && projectId && currentUserId) {
      const taskPath = task?.id || 'new'
      uploadedAttachments = await uploadFiles(
        pendingFiles,
        `tasks/${taskPath}/attachments`,
        currentUserId
      )
    }

    for (const removed of removedAttachments) {
      try {
        await deleteFile(removed.storagePath)
      } catch {
        // File may not exist in storage, continue
      }
    }

    const finalAttachments = [...existingAttachments, ...uploadedAttachments]

    const hasImplementation = data.implementationPlan?.approach?.trim() ||
      data.implementationPlan?.steps?.some((s: string) => s?.trim()) ||
      data.implementationPlan?.dataModelChanges?.trim() ||
      data.implementationPlan?.apiChanges?.trim() ||
      data.implementationPlan?.risks?.trim() ||
      data.implementationPlan?.outOfScope?.trim()

    const formattedData = {
      ...data,
      devPoints: Number(data.devPoints),
      bizPoints: Number(data.bizPoints),
      ...(finalAttachments.length > 0 ? { attachments: finalAttachments } : {}),
      ...(hasImplementation ? { implementationPlan: data.implementationPlan } : {}),
    }

    if (!hasImplementation) {
      delete formattedData.implementationPlan
    }

    await onSubmit(formattedData)
    reset()
    setPendingFiles([])
    setExistingAttachments([])
    setRemovedAttachments([])
  }

  const onFormError = (errors: any) => {
    console.error('Task form validation errors:', errors)
    const errorMessages = Object.values(errors)
      .map((e: any) => e?.message || (e?.who?.message) || (e?.what?.message) || (e?.why?.message))
      .filter(Boolean)
    toast.error(errorMessages[0] as string || 'Error de validación en el formulario')
    if (errors.title || errors.sprint || errors.developer || errors.status ||
        errors.startDate || errors.endDate || errors.bizPoints || errors.devPoints) {
      setActiveTab('general')
    } else if (errors.userStory || errors.acceptanceCriteria) {
      setActiveTab('userStory')
    }
  }

  const totalAttachments = existingAttachments.length + pendingFiles.length

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className={styles.form}>
      {/* Chrome-like tabs */}
      <div className={styles.tabsBar}>
        <button type="button" className={`${styles.tab} ${activeTab === 'general' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('general')}>General</button>
        <button type="button" className={`${styles.tab} ${activeTab === 'userStory' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('userStory')}>User Story</button>
        <button type="button" className={`${styles.tab} ${activeTab === 'implementation' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('implementation')}>Implementación</button>
        <button type="button" className={`${styles.tab} ${activeTab === 'attachments' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('attachments')}>
          Adjuntos
          {totalAttachments > 0 && (
            <span className={styles.tabBadge}>{totalAttachments}</span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {/* TAB: General */}
        {activeTab === 'general' && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionContent}>
                <div className={styles.titleRow}>
                  <div className={styles.titleInput}>
                    <Input
                      label="Título"
                      placeholder="Ej: Implementar autenticación"
                      required
                      {...register('title')}
                      error={errors.title?.message as string}
                      disabled={isLoading}
                    />
                  </div>
                  {!task && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleAiGenerate}
                      disabled={isLoading || aiGenerating || !titleValue?.trim()}
                      loading={aiGenerating}
                      title="Generar User Story, puntos y criterios con IA"
                    >
                      <Sparkles size={16} />
                      {aiGenerating ? 'Generando...' : 'IA'}
                    </Button>
                  )}
                </div>

                <div className={styles.grid3}>
                  {sprints.length > 0 ? (
                    <Select
                      label="Sprint"
                      {...register('sprint')}
                      error={errors.sprint?.message as string}
                      disabled={isLoading}
                      placeholder="Sin asignar"
                      options={[
                        { value: '', label: 'Sin asignar' },
                        ...sprints.map(s => ({ value: s.id, label: s.name }))
                      ]}
                    />
                  ) : (
                    <div className={styles.noSprint}>
                      <span className={styles.noSprintLabel}>Sprint</span>
                      <Button size="sm" variant="secondary" type="button" onClick={onCreateSprint}>
                        Crear Sprint
                      </Button>
                    </div>
                  )}

                  <Select
                    label="Developer"
                    {...register('developer')}
                    disabled={isLoading}
                    placeholder="Sin asignar"
                    options={[
                      { value: '', label: 'Sin asignar' },
                      ...developers.map(d => ({ value: d.id, label: d.name })),
                    ]}
                  />

                  <Select
                    label="Co-Developer"
                    {...register('coDeveloper')}
                    disabled={isLoading}
                    placeholder="Sin co-developer"
                    options={[
                      { value: '', label: 'Sin co-developer' },
                      ...developers.map(d => ({ value: d.id, label: d.name })),
                    ]}
                  />
                </div>

                <Select
                  label="Estado"
                  required
                  {...register('status')}
                  disabled={isLoading}
                  options={[
                    { value: 'to-do', label: 'To Do' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'to-validate', label: 'To Validate' },
                    { value: 'validated', label: 'Validated' },
                    { value: 'done', label: 'Done' },
                  ]}
                />
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Fechas y Puntos</h3>
              <div className={styles.grid4}>
                <Input
                  label="Fecha Inicio"
                  type="date"
                  {...register('startDate')}
                  disabled={isLoading}
                />
                <Input
                  label="Fecha Fin"
                  type="date"
                  {...register('endDate')}
                  error={errors.endDate?.message as string}
                  disabled={isLoading}
                />
                <Select
                  label="Puntos Negocio"
                  required
                  {...register('bizPoints')}
                  error={errors.bizPoints?.message as string}
                  disabled={isLoading}
                  options={[
                    { value: '1', label: FIBONACCI_LABELS[1] },
                    { value: '2', label: FIBONACCI_LABELS[2] },
                    { value: '3', label: FIBONACCI_LABELS[3] },
                    { value: '5', label: FIBONACCI_LABELS[5] },
                    { value: '8', label: FIBONACCI_LABELS[8] },
                    { value: '13', label: FIBONACCI_LABELS[13] },
                    { value: '21', label: '21 — Muy complejo' },
                    { value: '34', label: '34 — Épico' },
                  ]}
                />
                <Select
                  label="Puntos Dev"
                  required
                  {...register('devPoints')}
                  error={errors.devPoints?.message as string}
                  disabled={isLoading}
                  options={[
                    { value: '1', label: FIBONACCI_LABELS[1] },
                    { value: '2', label: FIBONACCI_LABELS[2] },
                    { value: '3', label: FIBONACCI_LABELS[3] },
                    { value: '5', label: FIBONACCI_LABELS[5] },
                    { value: '8', label: FIBONACCI_LABELS[8] },
                    { value: '13', label: FIBONACCI_LABELS[13] },
                  ]}
                />
              </div>
            </div>
          </>
        )}

        {/* TAB: User Story */}
        {activeTab === 'userStory' && (
          <>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>User Story</h3>
              <div className={styles.grid3}>
                <Input
                  label="Quién (Como...)"
                  placeholder="Como usuario"
                  required
                  {...register('userStory.who')}
                  error={(errors.userStory as any)?.who?.message as string}
                  disabled={isLoading}
                />
                <Input
                  label="Qué (quiero...)"
                  placeholder="quiero poder iniciar sesión"
                  required
                  {...register('userStory.what')}
                  error={(errors.userStory as any)?.what?.message as string}
                  disabled={isLoading}
                />
                <Input
                  label="Para qué (para...)"
                  placeholder="para acceder a mis tareas"
                  required
                  {...register('userStory.why')}
                  error={(errors.userStory as any)?.why?.message as string}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Criterios de Aceptación</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => appendCriteria('')}
                  disabled={isLoading}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <div className={styles.criteriaContent}>
                {criteriaFields.map((field, index) => (
                  <div key={field.id} className={styles.criteriaRow}>
                    <div className={styles.criteriaInput}>
                      <Input
                        placeholder={`Criterio ${index + 1}`}
                        {...register(`acceptanceCriteria.${index}`)}
                        error={(errors.acceptanceCriteria as any)?.[index]?.message as string}
                        disabled={isLoading}
                      />
                    </div>
                    {criteriaFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCriteria(index)}
                        disabled={isLoading}
                        className={styles.removeButton}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {errors.acceptanceCriteria && (
                  <p className={styles.errorMessage}>{(errors.acceptanceCriteria as any)?.message}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB: Implementación */}
        {activeTab === 'implementation' && (
          <>
            <p className={styles.optionalHint}>
              Opcional — completa estos campos para tareas complejas que necesitan un plan técnico.
            </p>

            <div className={styles.section}>
              <div className={styles.grid2}>
                <Select
                  label="Estado del Plan"
                  {...register('implementationPlan.status')}
                  disabled={isLoading}
                  options={[
                    { value: 'pending', label: 'Pendiente' },
                    { value: 'in-progress', label: 'En Progreso' },
                    { value: 'done', label: 'Completado' },
                  ]}
                />
                <div />
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.textareaLabel}>Enfoque técnico</label>
              <textarea
                className={styles.textarea}
                placeholder="Describe el enfoque técnico para resolver esta tarea"
                {...register('implementationPlan.approach')}
                disabled={isLoading}
              />
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Pasos de implementación</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => appendStep('')}
                  disabled={isLoading}
                >
                  <Plus size={16} />
                </Button>
              </div>
              {stepFields.length === 0 && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No hay pasos definidos</p>
              )}
              <div className={styles.criteriaContent}>
                {stepFields.map((field, index) => (
                  <div key={field.id} className={styles.stepRow}>
                    <span className={styles.stepNumber}>{index + 1}</span>
                    <div className={styles.stepInput}>
                      <Input
                        placeholder={`Paso ${index + 1}`}
                        {...register(`implementationPlan.steps.${index}`)}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      disabled={isLoading}
                      className={styles.removeButton}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.textareaLabel}>Cambios en modelo de datos</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Campos nuevos, migraciones..."
                  {...register('implementationPlan.dataModelChanges')}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className={styles.textareaLabel}>Cambios en API</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Endpoints, Cloud Functions..."
                  {...register('implementationPlan.apiChanges')}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className={styles.grid2} style={{ marginTop: 'var(--spacing-3)' }}>
              <div>
                <label className={styles.textareaLabel}>Riesgos</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Riesgos identificados"
                  {...register('implementationPlan.risks')}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className={styles.textareaLabel}>Fuera de alcance</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Lo que NO se hará"
                  {...register('implementationPlan.outOfScope')}
                  disabled={isLoading}
                />
              </div>
            </div>
          </>
        )}

        {/* TAB: Adjuntos */}
        {activeTab === 'attachments' && (
          <>
            <div
              className={styles.fileDropzone}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} style={{ margin: '0 auto var(--spacing-2)' }} />
              <p>Haz clic para seleccionar archivos</p>
              <p style={{ fontSize: 'var(--text-xs)', marginTop: 'var(--spacing-1)' }}>
                Cualquier tipo de archivo
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className={styles.fileInput}
              disabled={isLoading || uploading}
            />

            {pendingFiles.length > 0 && (
              <div className={styles.attachmentsList}>
                <h4 className={styles.sectionTitle}>Archivos por subir</h4>
                {pendingFiles.map((file, index) => (
                  <div key={index} className={styles.attachmentRow}>
                    <Paperclip size={14} />
                    <span className={styles.attachmentName}>{file.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePending(index)}
                      className={styles.removeButton}
                      style={{ padding: 'var(--spacing-1)' }}
                    >
                      <X size={16} />
                    </button>
                    {uploading && progress[index] !== undefined && (
                      <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress[index]}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {existingAttachments.length > 0 && (
              <div className={styles.attachmentsList}>
                <h4 className={styles.sectionTitle}>Archivos adjuntos</h4>
                {existingAttachments.map((att) => (
                  <div key={att.id} className={styles.attachmentRow}>
                    <Paperclip size={14} />
                    <span className={styles.attachmentName}>{att.name}</span>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.attachmentLink}
                    >
                      <Download size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(att)}
                      className={styles.removeButton}
                      style={{ padding: 'var(--spacing-1)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalAttachments === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-3)' }}>
                No hay archivos adjuntos
              </p>
            )}
          </>
        )}
      </div>

      {/* Submit button - always visible */}
      <Button type="submit" fullWidth loading={isLoading || uploading} disabled={isLoading || uploading}>
        {uploading ? 'Subiendo archivos...' : task ? 'Actualizar Tarea' : 'Crear Tarea'}
      </Button>
    </form>
  )
})

export default TaskForm
