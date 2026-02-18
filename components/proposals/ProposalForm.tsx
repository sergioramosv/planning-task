'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import cardStyles from '@/components/ui/Card.module.css'
import { Proposal } from '@/types/proposal'
import { FIBONACCI_LABELS } from '@/lib/constants/fibonacciPoints'
import styles from './ProposalForm.module.css'

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

            <select {...register('devPoints')} className={styles.select} disabled={isLoading}>
              <option value="">Puntos de Desarrollo</option>
              <option value="1">{FIBONACCI_LABELS[1]}</option>
              <option value="2">{FIBONACCI_LABELS[2]}</option>
              <option value="3">{FIBONACCI_LABELS[3]}</option>
              <option value="5">{FIBONACCI_LABELS[5]}</option>
              <option value="8">{FIBONACCI_LABELS[8]}</option>
              <option value="13">{FIBONACCI_LABELS[13]}</option>
            </select>
            {errors.devPoints && <span className={styles.fieldError}>{errors.devPoints.message}</span>}
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
          <CardTitle>Criterios de Aceptación</CardTitle>
        </CardHeader>
        <CardContent className={cardStyles.contentSpaced4}>
          <div className={styles.field}>
            <textarea
              placeholder="Ej:&#10;- El login con Google debe funcionar&#10;- Debe guardar el token&#10;- Debe redirigir al dashboard"
              disabled={isLoading}
              {...register('acceptanceCriteria')}
              className={styles.textarea}
            />
            {errors.acceptanceCriteria && <span className={styles.fieldError}>{errors.acceptanceCriteria.message}</span>}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
        Crear Propuesta
      </Button>
    </form>
  )
}
