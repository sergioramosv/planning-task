'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import cardStyles from '@/components/ui/Card.module.css'
import { Proposal } from '@/types/proposal'
import { FIBONACCI_LABELS } from '@/lib/constants/fibonacciPoints'
import { Plus, X } from 'lucide-react'
import styles from './ProposalForm.module.css'

const proposalValidationSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  userStoryWho: z.string().min(2, 'Completa "Como"'),
  userStoryWhat: z.string().min(5, 'Completa "Quiero"'),
  userStoryWhy: z.string().min(5, 'Completa "Para"'),
  acceptanceCriteria: z.array(z.string().min(1, 'El criterio no puede estar vacío')).min(1, 'Añade al menos un criterio'),
  startDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    },
    'La fecha de inicio debe ser hoy o en el futuro'
  ),
  bizPoints: z.enum(['1', '2', '3', '5', '8', '13', '21', '34'] as const),
  devPoints: z.enum(['1', '2', '3', '5', '8', '13'] as const),
})

type ProposalFormData = z.infer<typeof proposalValidationSchema>

interface ProposalFormProps {
  onSubmit: (data: ProposalFormData) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<Proposal>
}

export default function ProposalForm({ onSubmit, isLoading = false, initialData }: ProposalFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(proposalValidationSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      userStoryWho: initialData?.userStory?.who || '',
      userStoryWhat: initialData?.userStory?.what || '',
      userStoryWhy: initialData?.userStory?.why || '',
      acceptanceCriteria: initialData?.acceptanceCriteria || [''],
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      bizPoints: String(initialData?.bizPoints || 5) as any,
      devPoints: String(initialData?.devPoints || 3) as any,
    } as any,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'acceptanceCriteria',
  } as any)

  const handleFormSubmit = async (data: ProposalFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className={cardStyles.contentSpaced4}>
          <Input
            label="Título"
            placeholder="Ej: Implementar autenticación OAuth"
            required
            {...register('title')}
            error={errors.title?.message as string}
            disabled={isLoading}
          />
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
          </div>

          <div className={styles.formGrid}>
            <Select
              label="Puntos de Negocio"
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
            {...register('userStoryWho')}
            error={errors.userStoryWho?.message as string}
            disabled={isLoading}
          />

          <Input
            label="Qué (quiero...)"
            placeholder="quiero poder acceder con Google"
            required
            {...register('userStoryWhat')}
            error={errors.userStoryWhat?.message as string}
            disabled={isLoading}
          />

          <Input
            label="Para qué (para...)"
            placeholder="para no tener que recordar contraseña"
            required
            {...register('userStoryWhy')}
            error={errors.userStoryWhy?.message as string}
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
        Crear Propuesta
      </Button>
    </form>
  )
}
