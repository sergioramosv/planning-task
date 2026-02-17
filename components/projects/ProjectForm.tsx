'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, type ProjectFormData } from '@/lib/utils/validators'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Project } from '@/types'
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
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
    } : undefined,
  })

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

      <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
        {project ? 'Actualizar Proyecto' : 'Crear Proyecto'}
      </Button>
    </form>
  )
}
