'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormData } from '@/lib/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Project } from '@/types'
import { Plus, X, Star } from 'lucide-react'
import styles from './ProjectForm.module.css'

interface ProjectFormProps {
  project?: Project
  onSubmit: (data: ProjectFormData) => Promise<void>
  isLoading?: boolean
}

export default function ProjectForm({ project, onSubmit, isLoading = false }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      repositories: project.repositories || [],
      languages: project.languages || '',
      frameworks: project.frameworks || '',
    } : {
      repositories: [],
      languages: '',
      frameworks: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'repositories' as any,
  })

  const repositories = watch('repositories') || []

  const handleSetDefault = (index: number) => {
    repositories.forEach((_: any, i: number) => {
      setValue(`repositories.${i}.isDefault` as any, i === index)
    })
  }

  const handleAddRepo = () => {
    append({ url: '', type: 'fullstack', isDefault: fields.length === 0 } as any)
  }

  const handleRemoveRepo = (index: number) => {
    const wasDefault = repositories[index]?.isDefault
    remove(index)
    if (wasDefault && fields.length > 1) {
      setTimeout(() => setValue('repositories.0.isDefault' as any, true), 0)
    }
  }

  const onFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.form}>
      <Input
        label="Nombre del Proyecto"
        placeholder="Ej: Plataforma E-commerce"
        {...register('name')}
        error={errors.name?.message}
        disabled={isLoading}
      />

      <Input
        label="Descripción"
        placeholder="Describe el propósito del proyecto"
        {...register('description')}
        error={errors.description?.message}
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
          { value: 'archived', label: 'Archivado' },
        ]}
      />

      {/* Repositorios */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Repositorios (Opcional)</span>
          <Button type="button" size="sm" variant="secondary" onClick={handleAddRepo} disabled={isLoading}>
            <Plus size={16} /> Añadir repositorio
          </Button>
        </div>
        {fields.length > 0 && (
          <div className={styles.sectionContent}>
            {fields.map((field, index) => (
              <div key={field.id} className={styles.repoRow}>
                <Input
                  placeholder="https://github.com/org/repo"
                  {...register(`repositories.${index}.url` as any)}
                  error={(errors.repositories as any)?.[index]?.url?.message}
                  disabled={isLoading}
                />
                <Select
                  {...register(`repositories.${index}.type` as any)}
                  disabled={isLoading}
                  options={[
                    { value: 'front', label: 'Frontend' },
                    { value: 'back', label: 'Backend' },
                    { value: 'api', label: 'API' },
                    { value: 'fullstack', label: 'Full Stack' },
                  ]}
                />
                <button
                  type="button"
                  className={`${styles.defaultBadge} ${repositories[index]?.isDefault ? styles.defaultBadgeActive : ''}`}
                  onClick={() => handleSetDefault(index)}
                  disabled={isLoading}
                >
                  <Star size={14} />
                </button>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveRepo(index)}
                  disabled={isLoading}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              El repositorio con ★ es el &quot;por defecto&quot; para tareas sin etiqueta asignada.
            </p>
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Tech Stack (Opcional)</span>
        <div className={styles.techStackGrid} style={{ marginTop: 'var(--spacing-3)' }}>
          <Input
            label="Lenguajes"
            placeholder="TypeScript, CSS, HTML"
            {...register('languages')}
            disabled={isLoading}
          />
          <Input
            label="Frameworks"
            placeholder="Next, Tailwind"
            {...register('frameworks')}
            disabled={isLoading}
          />
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--spacing-1)' }}>
          Separados por comas.
        </p>
      </div>

      <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
        {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
      </Button>
    </form>
  )
}
