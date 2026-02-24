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

jest.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    uploading: false,
    progress: {},
    error: null,
    uploadFiles: jest.fn().mockResolvedValue([]),
    deleteFile: jest.fn().mockResolvedValue(undefined),
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

  it('should render all 4 tabs', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('User Story')).toBeInTheDocument()
    expect(screen.getByText('Implementación')).toBeInTheDocument()
    expect(screen.getByText(/Adjuntos/)).toBeInTheDocument()
  })

  it('should render title input on General tab', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ej: Implementar autenticación')).toBeInTheDocument()
  })

  it('should render sprint select with options on General tab', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
    expect(screen.getAllByText('Sin asignar').length).toBeGreaterThanOrEqual(1)
  })

  it('should render "Crear Sprint" button when no sprints', () => {
    const onCreateSprint = jest.fn()
    render(<TaskForm {...defaultProps} sprints={[]} onCreateSprint={onCreateSprint} />)
    expect(screen.getByText('Crear Sprint')).toBeInTheDocument()
  })

  it('should render developer and co-developer selects on General tab', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Developer')).toBeInTheDocument()
    expect(screen.getByText('Co-Developer')).toBeInTheDocument()
    expect(screen.getAllByText('John')).toHaveLength(2)
    expect(screen.getAllByText('Jane')).toHaveLength(2)
  })

  it('should render status select with all 5 options on General tab', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Estado')).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('To Validate')).toBeInTheDocument()
    expect(screen.getByText('Validated')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('should render date inputs and points on General tab', () => {
    render(<TaskForm {...defaultProps} />)
    expect(screen.getByText('Fecha Inicio')).toBeInTheDocument()
    expect(screen.getByText('Fecha Fin')).toBeInTheDocument()
    expect(screen.getByText('Puntos Negocio')).toBeInTheDocument()
    expect(screen.getByText('Puntos Dev')).toBeInTheDocument()
  })

  it('should show User Story fields when User Story tab is clicked', async () => {
    render(<TaskForm {...defaultProps} />)
    await userEvent.click(screen.getByText('User Story'))
    expect(screen.getByPlaceholderText('Como usuario')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('quiero poder iniciar sesión')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('para acceder a mis tareas')).toBeInTheDocument()
    expect(screen.getByText('Criterios de Aceptación')).toBeInTheDocument()
  })

  it('should show Implementation plan fields when Implementación tab is clicked', async () => {
    render(<TaskForm {...defaultProps} />)
    await userEvent.click(screen.getByText('Implementación'))
    expect(screen.getByText('Estado del Plan')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe el enfoque técnico para resolver esta tarea')).toBeInTheDocument()
    expect(screen.getByText('Pasos de implementación')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Campos nuevos, migraciones...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Endpoints, Cloud Functions...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Riesgos identificados')).toBeInTheDocument()
  })

  it('should show Attachments tab content when clicked', async () => {
    render(<TaskForm {...defaultProps} />)
    await userEvent.click(screen.getByText(/Adjuntos/))
    expect(screen.getByText('Haz clic para seleccionar archivos')).toBeInTheDocument()
    expect(screen.getByText('No hay archivos adjuntos')).toBeInTheDocument()
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

  it('should render acceptance criteria when on User Story tab', async () => {
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
    await userEvent.click(screen.getByText('User Story'))
    expect(screen.getByPlaceholderText('Criterio 1')).toBeInTheDocument()
  })

  it('should show attachment badge when task has existing attachments', () => {
    const mockTask = {
      id: 't1',
      title: 'Test Task',
      projectId: 'p1',
      acceptanceCriteria: ['Criteria 1'],
      userStory: { who: 'As a user', what: 'I want to test', why: 'To verify' },
      bizPoints: 5,
      devPoints: 3 as const,
      priority: 1,
      status: 'to-do' as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'u1',
      history: {},
      attachments: [
        { id: 'a1', name: 'file.pdf', url: 'http://example.com/file.pdf', storagePath: 'tasks/t1/a1', uploadedAt: Date.now(), uploadedBy: 'u1' },
      ],
    }
    render(<TaskForm {...defaultProps} task={mockTask} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
