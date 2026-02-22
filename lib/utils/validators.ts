import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').max(500),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  status: z.enum(['planned', 'active', 'completed', 'archived']),
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
  developer: z.string().min(1, 'Debe seleccionar un developer'),
  coDeveloper: z.string().optional(),
  startDate: z.string().min(1, 'Fecha de inicio requerida').regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido'),
  endDate: z.string().optional(),
  bizPoints: z.number().min(1, 'Mínimo 1 punto de negocio').max(100, 'Máximo 100 puntos'),
  devPoints: z.enum(['1', '2', '3', '5', '8', '13']).refine(
    val => ['1', '2', '3', '5', '8', '13'].includes(val),
    'Debe ser un número Fibonacci válido'
  ),
  status: z.enum(['to-do', 'in-progress', 'to-validate', 'validated', 'done']),
})

export type ProjectFormData = z.infer<typeof projectSchema>
export type SprintFormData = z.infer<typeof sprintSchema>
export type TaskFormData = z.infer<typeof taskSchema>
