'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Bug, BugSeverity } from '@/types/bug'
import styles from './BugForm.module.css'
import { useState } from 'react'

const bugValidationSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  severity: z.enum(['critical', 'high', 'medium', 'low'] as const),
})

type BugFormData = z.infer<typeof bugValidationSchema>

interface BugFormProps {
  onSubmit: (data: BugFormData, attachments: File[]) => Promise<void>
  isLoading?: boolean
  initialData?: Partial<Bug>
}

export default function BugForm({ onSubmit, isLoading = false, initialData }: BugFormProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BugFormData>({
    resolver: zodResolver(bugValidationSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      severity: initialData?.severity || 'medium',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleFormSubmit = async (data: BugFormData) => {
    try {
      setSubmitError(null)
      await onSubmit(data, attachments)
      setAttachments([])
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al guardar bug')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      {submitError && <div className={styles.error}>{submitError}</div>}

      <div className={styles.field}>
        <label className={styles.label}>Título del Bug *</label>
        <Input
          type="text"
          placeholder="Ej: Botón de login no responde"
          disabled={isLoading}
          {...register('title')}
        />
        {errors.title && <span className={styles.fieldError}>{errors.title.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Descripción *</label>
        <textarea
          placeholder="Describe el problema detalladamente..."
          disabled={isLoading}
          {...register('description')}
          className={styles.textarea}
        />
        {errors.description && <span className={styles.fieldError}>{errors.description.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Severidad *</label>
        <select {...register('severity')} className={styles.select} disabled={isLoading}>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
        {errors.severity && <span className={styles.fieldError}>{errors.severity.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Archivos Adjuntos (opcional)</label>
        <input
          type="file"
          multiple
          disabled={isLoading}
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {attachments.length > 0 && (
          <div className={styles.attachmentsList}>
            {attachments.map((file, idx) => (
              <div key={idx} className={styles.attachmentItem}>
                📎 {file.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Crear Bug'}
      </Button>
    </form>
  )
}
