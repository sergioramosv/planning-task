'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '@/lib/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Task, Sprint } from '@/types'
import { FIBONACCI_LABELS } from '@/lib/constants/fibonacciPoints'
import { Plus, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import styles from './TaskForm.module.css'

interface TaskFormProps {
  task?: Task
  sprints: Sprint[]
  developers: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  onCreateSprint?: () => void
}

export default function TaskForm({
  task,
  sprints,
  developers,
  onSubmit,
  isLoading = false,
  onCreateSprint,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<any>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      sprint: task.sprintId || '',
      devPoints: String(task.devPoints),
      bizPoints: task.bizPoints,
      developer: task.developer,
      coDeveloper: task.coDeveloper || '',
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status,
      acceptanceCriteria: task.acceptanceCriteria,
      userStory: task.userStory,
    } : {
      sprint: '',
      status: 'to-do',
      coDeveloper: '',
      acceptanceCriteria: [''],
      userStory: { who: '', what: '', why: '' },
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'acceptanceCriteria',
  })

  const onFormSubmit = async (data: any) => {
    const formattedData = {
      ...data,
      devPoints: Number(data.devPoints),
      bizPoints: Number(data.bizPoints),
    }
    await onSubmit(formattedData)
    reset()
  }

  const onFormError = (errors: any) => {
    console.error('Task form validation errors:', errors)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className={styles.form}>
      {/* Información Básica */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Información Básica</h3>
        <div className={styles.sectionContent}>
          <Input
            label="Título"
            placeholder="Ej: Implementar autenticación"
            required
            {...register('title')}
            error={errors.title?.message as string}
            disabled={isLoading}
          />

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

      {/* Fechas y Puntos */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Fechas y Puntos</h3>
        <div className={styles.sectionContent}>
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

            <Input
              label="Puntos Negocio"
              type="number"
              min="1"
              max="100"
              required
              {...register('bizPoints', { valueAsNumber: true })}
              error={errors.bizPoints?.message as string}
              disabled={isLoading}
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
      </div>

      {/* User Story */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>User Story</h3>
        <div className={styles.sectionContent}>
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
      </div>

      {/* Criterios de Aceptación */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Criterios de Aceptación</h3>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => append('')}
            disabled={isLoading}
          >
            <Plus size={16} />
          </Button>
        </div>
        <div className={styles.criteriaContent}>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.criteriaRow}>
              <div className={styles.criteriaInput}>
                <Input
                  placeholder={`Criterio ${index + 1}`}
                  {...register(`acceptanceCriteria.${index}`)}
                  error={(errors.acceptanceCriteria as any)?.[index]?.message as string}
                  disabled={isLoading}
                />
              </div>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
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

      <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
        {task ? 'Actualizar Tarea' : 'Crear Tarea'}
      </Button>
    </form>
  )
}
