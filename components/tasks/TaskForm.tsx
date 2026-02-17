'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, type TaskFormData } from '@/lib/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import cardStyles from '@/components/ui/Card.module.css'
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
      startDate: task.startDate,
      endDate: task.endDate,
      status: task.status,
      acceptanceCriteria: task.acceptanceCriteria,
      userStory: task.userStory,
    } : {
      sprint: '',
      status: 'to-do',
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

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className={cardStyles.contentSpaced4}>
          <Input
            label="Título"
            placeholder="Ej: Implementar autenticación"
            required
            {...register('title')}
            error={errors.title?.message as string}
            disabled={isLoading}
          />

          {sprints.length > 0 ? (
            <Select
              label="Sprint"
              {...register('sprint')}
              error={errors.sprint?.message as string}
              disabled={isLoading}
              placeholder="Selecciona un sprint (opcional)"
              options={[
                { value: '', label: 'Sin asignar' },
                ...sprints.map(s => ({ value: s.id, label: s.name }))
              ]}
            />
          ) : (
            <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', backgroundColor: 'var(--color-yellow-100)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-yellow-700)' }}>
              <p style={{ color: 'var(--color-yellow-700)', fontSize: 'var(--text-sm)', margin: 0, marginBottom: 'var(--spacing-2)' }}>No hay sprints creados</p>
              <Button size="sm" variant="secondary" type="button" onClick={onCreateSprint}>
                Crear Sprint
              </Button>
            </div>
          )}

          <div className={styles.formGrid}>
            <Select
              label="Developer"
              required
              {...register('developer')}
              error={errors.developer?.message as string}
              disabled={isLoading}
              placeholder="Selecciona developer"
              options={developers.map(d => ({ value: d.id, label: d.name }))}
            />

            <Select
              label="Estado"
              required
              {...register('status')}
              disabled={isLoading}
              options={[
                { value: 'to-do', label: 'To Do' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'to-validate', label: 'To Validate' },
                { value: 'done', label: 'Done' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fechas y Puntos</CardTitle>
        </CardHeader>
        <CardContent className={cardStyles.contentSpaced4}>
          <div className={styles.formGrid}>
            <Input
              label="Fecha de Inicio"
              type="date"
              required
              {...register('startDate')}
              error={errors.startDate?.message as string}
              disabled={isLoading}
            />

            <Input
              label="Fecha de Fin"
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message as string}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Puntos de Negocio (1-100)"
              type="number"
              min="1"
              max="100"
              required
              {...register('bizPoints', { valueAsNumber: true })}
              error={errors.bizPoints?.message as string}
              disabled={isLoading}
            />

            <Select
              label="Puntos de Desarrollo"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Story</CardTitle>
        </CardHeader>
        <CardContent className={cardStyles.contentSpaced4}>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={cardStyles.titleWithAction}>
            <span>Criterios de Aceptación</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => append('')}
              disabled={isLoading}
            >
              <Plus size={16} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className={cardStyles.contentSpaced3}>
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
        </CardContent>
      </Card>

      <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
        {task ? 'Actualizar Tarea' : 'Crear Tarea'}
      </Button>
    </form>
  )
}
