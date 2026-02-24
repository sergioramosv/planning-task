import React from 'react'
import { render, screen } from '@testing-library/react'
import TaskCard from '@/components/tasks/TaskCard'

jest.mock('@/lib/utils/calculations', () => ({
  calculatePriority: jest.fn(() => 10),
}))

jest.mock('@/lib/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

const mockTask = {
  id: 'task1',
  title: 'Implement authentication',
  projectId: 'proj1',
  acceptanceCriteria: ['Should work'],
  userStory: { who: 'user', what: 'login', why: 'access' },
  bizPoints: 50,
  devPoints: 5,
  priority: 10,
  status: 'to-do' as const,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  createdBy: 'user1',
  history: {},
  developer: 'dev1',
  coDeveloper: 'dev2',
  startDate: '2024-02-01',
  sprintId: 'sprint1',
}

describe('TaskCard', () => {
  it('should render task title in full (not truncated)', () => {
    render(<TaskCard task={mockTask} />)
    const title = screen.getByText('Implement authentication')
    expect(title).toBeInTheDocument()
    expect(title.textContent).toBe('Implement authentication')
  })

  it('should render developer name when developerName prop is provided', () => {
    render(<TaskCard task={mockTask} developerName="John Doe" />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should render sprint name tag when sprintName prop is provided', () => {
    render(<TaskCard task={mockTask} sprintName="Sprint 1" />)
    expect(screen.getByText('Sprint 1')).toBeInTheDocument()
  })

  it('should render priority and points', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('P10')).toBeInTheDocument()
    expect(screen.getByText('50/5pts')).toBeInTheDocument()
  })

  it('should render start date when present', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('2024-02-01')).toBeInTheDocument()
  })

  it('should not render developer tag when no developer', () => {
    const taskWithoutDev = { ...mockTask, developer: undefined }
    render(<TaskCard task={taskWithoutDev} />)
    expect(screen.queryByText('dev1')).not.toBeInTheDocument()
  })

  it('should not render sprint tag when no sprintName', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.queryByText('Sprint 1')).not.toBeInTheDocument()
  })

  it('should not render date when no startDate', () => {
    const taskWithoutDate = { ...mockTask, startDate: undefined }
    render(<TaskCard task={taskWithoutDate} />)
    expect(screen.queryByText('2024-02-01')).not.toBeInTheDocument()
  })

  it('should call onClick when card is clicked', () => {
    const handleClick = jest.fn()
    const { container } = render(<TaskCard task={mockTask} onClick={handleClick} />)
    const card = container.firstChild as HTMLElement
    card.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply dragging class when isDragging is true', () => {
    const { container } = render(<TaskCard task={mockTask} isDragging={true} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('cardDragging')
  })
})
