import React from 'react'
import { render, screen } from '@testing-library/react'
import TaskKanban from '@/components/tasks/TaskKanban'
import { Task } from '@/types'

jest.mock('@/lib/utils/calculations', () => ({
  calculatePriority: jest.fn(() => 10),
}))

jest.mock('@/lib/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task1',
  title: 'Test task',
  projectId: 'proj1',
  acceptanceCriteria: ['Should work'],
  userStory: { who: 'user', what: 'feature', why: 'value' },
  bizPoints: 5,
  devPoints: 3,
  priority: 10,
  status: 'to-do',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'user1',
  history: {},
  ...overrides,
})

describe('TaskKanban', () => {
  it('should render kanban columns', () => {
    render(<TaskKanban tasks={[]} />)

    expect(screen.getByText('to-do')).toBeInTheDocument()
    expect(screen.getByText('in-progress')).toBeInTheDocument()
    expect(screen.getByText('to-validate')).toBeInTheDocument()
    expect(screen.getByText('done & validated')).toBeInTheDocument()
  })

  it('should render tasks in the correct column', () => {
    const tasks: Task[] = [
      createMockTask({ id: 'task1', title: 'Todo task', status: 'to-do' }),
      createMockTask({ id: 'task2', title: 'Progress task', status: 'in-progress' }),
    ]

    render(<TaskKanban tasks={tasks} />)

    expect(screen.getByText('Todo task')).toBeInTheDocument()
    expect(screen.getByText('Progress task')).toBeInTheDocument()
  })

  it('should pass onDelete to TaskCard when onDelete is provided', () => {
    const onDelete = jest.fn()
    const tasks: Task[] = [
      createMockTask({ id: 'task1', title: 'Deletable task', status: 'to-do' }),
    ]

    render(<TaskKanban tasks={tasks} onDelete={onDelete} />)

    // When onDelete is provided, TaskCard receives it and renders a delete button
    const deleteButton = screen.getByLabelText('Eliminar tarea')
    expect(deleteButton).toBeInTheDocument()
  })

  it('should not pass onDelete to TaskCard when onDelete is not provided', () => {
    const tasks: Task[] = [
      createMockTask({ id: 'task1', title: 'Non-deletable task', status: 'to-do' }),
    ]

    render(<TaskKanban tasks={tasks} />)

    // When onDelete is not provided, TaskCard does not render the delete button
    const deleteButton = screen.queryByLabelText('Eliminar tarea')
    expect(deleteButton).not.toBeInTheDocument()
  })

  it('should call onDelete with the correct task id when delete is triggered', () => {
    const onDelete = jest.fn()
    const tasks: Task[] = [
      createMockTask({ id: 'task-abc', title: 'Task to delete', status: 'to-do' }),
    ]

    render(<TaskKanban tasks={tasks} onDelete={onDelete} />)

    const deleteButton = screen.getByLabelText('Eliminar tarea')
    deleteButton.click()

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('task-abc')
  })

  it('should show column task counts', () => {
    const tasks: Task[] = [
      createMockTask({ id: 'task1', status: 'to-do' }),
      createMockTask({ id: 'task2', status: 'to-do' }),
      createMockTask({ id: 'task3', status: 'in-progress' }),
    ]

    render(<TaskKanban tasks={tasks} />)

    // The count spans show the number of tasks per column
    const counts = screen.getAllByText('2')
    expect(counts.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should merge validated tasks into the done column', () => {
    const tasks: Task[] = [
      createMockTask({ id: 'task1', title: 'Validated task', status: 'validated' }),
      createMockTask({ id: 'task2', title: 'Done task', status: 'done' }),
    ]

    render(<TaskKanban tasks={tasks} />)

    // Both validated and done tasks appear in the done & validated column
    expect(screen.getByText('Validated task')).toBeInTheDocument()
    expect(screen.getByText('Done task')).toBeInTheDocument()
  })

  it('should use filteredTasks over tasks when provided', () => {
    const allTasks: Task[] = [
      createMockTask({ id: 'task1', title: 'All task', status: 'to-do' }),
      createMockTask({ id: 'task2', title: 'Hidden task', status: 'to-do' }),
    ]
    const filteredTasks: Task[] = [
      createMockTask({ id: 'task1', title: 'Filtered task', status: 'to-do' }),
    ]

    render(<TaskKanban tasks={allTasks} filteredTasks={filteredTasks} />)

    expect(screen.getByText('Filtered task')).toBeInTheDocument()
    expect(screen.queryByText('All task')).not.toBeInTheDocument()
    expect(screen.queryByText('Hidden task')).not.toBeInTheDocument()
  })

  it('should resolve developer names from developers prop', () => {
    const tasks: Task[] = [
      createMockTask({ id: 'task1', title: 'Dev task', status: 'to-do', developer: 'dev1' }),
    ]
    const developers = [{ id: 'dev1', name: 'Alice' }]

    render(<TaskKanban tasks={tasks} developers={developers} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('should resolve sprint names from sprints prop', () => {
    const tasks: Task[] = [
      createMockTask({ id: 'task1', title: 'Sprint task', status: 'to-do', sprintId: 'sprint1' }),
    ]
    const sprints = [{ id: 'sprint1', name: 'Sprint 1' }]

    render(<TaskKanban tasks={tasks} sprints={sprints} />)

    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
  })
})
