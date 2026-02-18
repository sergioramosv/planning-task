'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Proposal } from '@/types/proposal'
import { FIBONACCI_POINTS } from '@/lib/constants/fibonacciPoints'
import styles from './ProposalForm.module.css'
import { useState } from 'react'

const proposalValidationSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  userStoryWho: z.string().min(2, 'Completa "Como"'),
  userStoryWhat: z.string().min(5, 'Completa "Quiero"'),
  userStoryWhy: z.string().min(5, 'Completa "Para"'),
  acceptanceCriteria: z.string().min(5, 'Añade criterios de aceptación'),
  startDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    },
    'La fecha de inicio debe ser hoy o en el futuro'
  ),
  bizPoints: z.coerce
    .number()
    .int('Los puntos deben ser números enteros')
    .min(1, 'Mínimo 1 punto')
    .max(100, 'Máximo 100 puntos'),
  devPoints: z.enum(['1', '2', '3', '5', '8', '13'] as const),
})

type ProposalFormData = z.infer<typeof proposalValidationSchema>

interface ProposalFormProps {
  onSubmit: (data: ProposalFormData) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<Proposal>
}

export default function ProposalForm({ onSubmit, isLoading = false, initialData }: ProposalFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalValidationSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      userStoryWho: initialData?.userStory?.who || '',
      userStoryWhat: initialData?.userStory?.what || '',
      userStoryWhy: initialData?.userStory?.why || '',
      acceptanceCriteria: initialData?.acceptanceCriteria?.join('\n') || '',
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      bizPoints: initialData?.bizPoints || 5,
      devPoints: String(initialData?.devPoints || 3) as any,
    } as any,
  })

  const handleFormSubmit = async (data: ProposalFormData) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar propuesta')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      {submitError && <div className={styles.error}>{submitError}</div>}

      <div className={styles.field}>
        <label className={styles.label}>Título de la Propuesta *</label>
        <Input type="text" placeholder="Ej: Implementar autenticación OAuth" disabled={isLoading} {...register('title')} />
        {errors.title && <span className={styles.fieldError}>{errors.title.message}</span>}
      </div>

      <div className={styles.userStorySection}>
        <h4 className={styles.sectionTitle}>User Story</h4>
        <div className={styles.field}>
          <label className={styles.label}>Como... *</label>
          <Input type="text" placeholder="Ej: usuario de la aplicación" disabled={isLoading} {...register('userStoryWho')} />
          {errors.userStoryWho && <span className={styles.fieldError}>{errors.userStoryWho.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Quiero... *</label>
          <Input type="text" placeholder="Ej: poder acceder con Google" disabled={isLoading} {...register('userStoryWhat')} />
          {errors.userStoryWhat && <span className={styles.fieldError}>{errors.userStoryWhat.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Para... *</label>
          <Input type="text" placeholder="Ej: no tener que recordar contraseña" disabled={isLoading} {...register('userStoryWhy')} />
          {errors.userStoryWhy && <span className={styles.fieldError}>{errors.userStoryWhy.message}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Criterios de Aceptación *</label>
        <textarea
          placeholder="Ej:&#10;- El login con Google debe funcionar&#10;- Debe guardar el token&#10;- Debe redirigir al dashboard"
          disabled={isLoading}
          {...register('acceptanceCriteria')}
          className={styles.textarea}
        />
        {errors.acceptanceCriteria && <span className={styles.fieldError}>{errors.acceptanceCriteria.message}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Fecha de Inicio *</label>
          <Input type="date" disabled={isLoading} {...register('startDate')} />
          {errors.startDate && <span className={styles.fieldError}>{errors.startDate.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Puntos de Negocio *</label>
          <Input type="number" min="1" max="100" disabled={isLoading} {...register('bizPoints')} />
          {errors.bizPoints && <span className={styles.fieldError}>{errors.bizPoints.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Puntos de Desarrollo *</label>
          <select {...register('devPoints')} className={styles.select} disabled={isLoading}>
            {FIBONACCI_POINTS.map((point) => (
              <option key={point} value={point}>
                {point}
              </option>
            ))}
          </select>
          {errors.devPoints && <span className={styles.fieldError}>{errors.devPoints.message}</span>}
        </div>
      </div>

      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Crear Propuesta'}
      </Button>
    </form>
  )
}
