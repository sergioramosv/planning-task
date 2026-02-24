import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskForm from '@/components/tasks/TaskForm'

jest.mock('@/lib/utils/validators', () => ({
  taskSchema: {
    parse: jest.fn(),
  },
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (values: any) => ({
    values,
    errors: {},
  }),
}))

const mockSprints = [
  { id: 's1', name: 'Sprint 1', projectId: 'p1', startDate: '2024-01-01', endDate: '2024-01-14', status: 'active' as const, createdAt: Date.now(), createdBy: 'u1' },
]

const mockDevelopers = [
  { id: 'd1', name: 'John' },
  { id: 'd2', name: 'Jane' },
]

const mockOnSubmit = jest.fn()

const defaultProps = {
  sprints: mockSprints,
  developers: mockDevelopers,
  onSubmit: mockOnSubmit,
}

describe('TaskForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all section titles', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Información Básica')).toBeInTheDocument()
    expect(screen.getByText('Fechas y Puntos')).toBeInTheDocument()
    expect(screen.getByText('User Story')).toBeInTheDocument()
    expect(screen.getByText('Criterios de Aceptación')).toBeInTheDocument()
  })

  it('should render title input', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej: Implementar autenticación')).toBeInTheDocument()
  })

  it('should render sprint select with options when sprints are provided', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Sprint')).toBeInTheDocument()
    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
    // "Sin asignar" appears in multiple selects (Sprint, Developer)
    expect(screen.getAllByText('Sin asignar').length).toBeGreaterThanOrEqual(1)
  })

  it('should render "Crear Sprint" button when no sprints', () => {
    const onCreateSprint = jest.fn()
    render(<TaskForm {...defaultProps} sprints={[]} onCreateSprint={onCreateSprint} />)
    expect(screen.getByText('Crear Sprint')).toBeInTheDocument()
  })

  it('should render developer and co-developer selects', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Developer')).toBeInTheDocument()
    expect(screen.getByText('Co-Developer')).toBeInTheDocument()
    expect(screen.getAllByText('John')).toHaveLength(2)
    expect(screen.getAllByText('Jane')).toHaveLength(2)
  })

  it('should render status select with all 5 options', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('To Validate')).toBeInTheDocument()
    expect(screen.getByText('Validated')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('should render date inputs', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Fecha Inicio')).toBeInTheDocument()
    expect(screen.getByText('Fecha Fin')).toBeInTheDocument()
  })

  it('should render business and dev points inputs', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Puntos Negocio')).toBeInTheDocument()
    expect(screen.getByText('Puntos Dev')).toBeInTheDocument()
  })

  it('should render user story inputs', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Quién (Como...)')).toBeInTheDocument()
    expect(screen.getByText('Qué (quiero...)')).toBeInTheDocument()
    expect(screen.getByText('Para qué (para...)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Como usuario')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('quiero poder iniciar sesión')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('para acceder a mis tareas')).toBeInTheDocument()
  })

  it('should render acceptance criteria with add button', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Criterios de Aceptación')).toBeInTheDocument()
    // The add button contains a Plus icon (SVG), find by role
    const buttons = screen.getAllByRole('button')
    // There should be at least the add criteria button and the submit button
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should show "Crear Tarea" button for new task', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Crear Tarea')).toBeInTheDocument()
  })

  it('should show "Actualizar Tarea" button when editing', () => {
    const mockTask = {
      id: 't1',
      title: 'Test Task',
      projectId: 'p1',
      sprintId: 's1',
      acceptanceCriteria: ['Criteria 1'],
      userStory: { who: 'As a user', what: 'I want to test', why: 'To verify' },
      developer: 'd1',
      coDeveloper: 'd2',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      bizPoints: 5,
      devPoints: 3 as const,
      priority: 1,
      status: 'to-do' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'u1',
      history: {},
    }
    render(<TaskForm {...defaultProps} task={mockTask} />)
    expect(screen.getByText('Actualizar Tarea')).toBeInTheDocument()
  })

  it('should render initial acceptance criteria field', () => {
    const mockTask = {
      id: 't1',
      title: 'Test Task',
      projectId: 'p1',
      sprintId: 's1',
      acceptanceCriteria: ['First criterion'],
      userStory: { who: 'As a user', what: 'I want to test', why: 'To verify' },
      developer: 'd1',
      coDeveloper: 'd2',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      bizPoints: 5,
      devPoints: 3 as const,
      priority: 1,
      status: 'to-do' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'u1',
      history: {},
    }
    render(<TaskForm {...defaultProps} task={mockTask} />)
    expect(screen.getByPlaceholderText('Criterio 1')).toBeInTheDocument()
  })
})
