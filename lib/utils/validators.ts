import { z } from 'zod'

const repositorySchema = z.object({
  url: z.string().url('URL de repositorio inválida'),
  type: z.enum(['front', 'back', 'api', 'fullstack']),
  isDefault: z.boolean(),
})

export const projectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').max(500),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  status: z.enum(['planned', 'active', 'completed', 'archived']),
  repositories: z.array(repositorySchema).optional(),
  languages: z.string().optional(),
  frameworks: z.string().optional(),
})

export const sprintSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  status: z.enum(['planned', 'active', 'completed']),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  }
)

const implementationPlanSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'done']).default('pending'),
  approach: z.string().optional().default(''),
  steps: z.array(z.string()).optional().default([]),
  dataModelChanges: z.string().optional().default(''),
  apiChanges: z.string().optional().default(''),
  risks: z.string().optional().default(''),
  outOfScope: z.string().optional().default(''),
})

const taskAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  storagePath: z.string(),
  uploadedAt: z.number(),
  uploadedBy: z.string(),
})

export const taskSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  sprint: z.string().optional(),
  acceptanceCriteria: z.array(z.string()).refine(
    (arr) => arr.some(criterion => criterion.trim().length > 0),
    'Debe tener al menos un criterio de aceptación'
  ),
  userStory: z.object({
    who: z.string().min(5, 'Campo "Quién" requerido'),
    what: z.string().min(5, 'Campo "Qué" requerido'),
    why: z.string().min(5, 'Campo "Para qué" requerido'),
  }),
  developer: z.string().optional(),
  coDeveloper: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bizPoints: z.enum(['1', '2', '3', '5', '8', '13', '21', '34']).refine(
    val => ['1', '2', '3', '5', '8', '13', '21', '34'].includes(val),
    'Debe ser un número Fibonacci válido'
  ),
  devPoints: z.enum(['1', '2', '3', '5', '8', '13']).refine(
    val => ['1', '2', '3', '5', '8', '13'].includes(val),
    'Debe ser un número Fibonacci válido'
  ),
  status: z.enum(['to-do', 'in-progress', 'to-validate', 'validated', 'done']),
  implementationPlan: implementationPlanSchema.optional(),
  attachments: z.array(taskAttachmentSchema).optional(),
})

export type ProjectFormData = z.infer<typeof projectSchema>
export type SprintFormData = z.infer<typeof sprintSchema>
export type TaskFormData = z.infer<typeof taskSchema>
