'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { sprintSchema, type SprintFormData } from '@/lib/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Sprint } from '@/types'
import styles from './SprintForm.module.css'

interface SprintFormProps {
  sprint?: Sprint
  onSubmit: (data: SprintFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function SprintForm({ sprint, onSubmit, onCancel, isLoading = false }: SprintFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    defaultValues: sprint ? {
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
    } : undefined,
  })

  const onFormSubmit = async (data: SprintFormData) => {
    // Validación adicional: endDate debe ser posterior a startDate
    if (new Date(data.endDate) <= new Date(data.startDate)) {
      return
    }
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <Input
        label="Nombre del Sprint"
        placeholder="Ej: Sprint 1"
        {...register('name')}
        error={errors.name?.message}
        disabled={isLoading}
      />

      <div className={styles.dateGrid}>
        <Input
          label="Fecha de Inicio"
          type="date"
          {...register('startDate')}
          error={errors.startDate?.message}
          disabled={isLoading}
        />

        <Input
          label="Fecha de Fin"
          type="date"
          {...register('endDate')}
          error={errors.endDate?.message}
          disabled={isLoading}
        />
      </div>

      <Select
        label="Estado"
        {...register('status')}
        error={errors.status?.message}
        disabled={isLoading}
        options={[
          { value: 'planned', label: 'Planeado' },
          { value: 'active', label: 'Activo' },
          { value: 'completed', label: 'Completado' },
        ]}
      />

      <div className={styles.actions}>
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          {sprint ? 'Actualizar Sprint' : 'Crear Sprint'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
