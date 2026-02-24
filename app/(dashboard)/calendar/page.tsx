'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import Spinner from '@/components/ui/Spinner'
import { Task, Sprint } from '@/types'
import { database } from '@/lib/firebase/config'
import { ref, onValue, update } from 'firebase/database'
import { Calendar, dateFnsLocalizer, Event, Views, View } from 'react-big-calendar'
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import styles from './page.module.css'
import { AlertCircle } from 'lucide-react'
import { TASK_STATUS_COLORS } from '@/lib/constants/taskStates'
import toast, { Toaster } from 'react-hot-toast'

// Setup the localizer for react-big-calendar
const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const DnDCalendar = withDragAndDrop(Calendar)

interface CalendarEvent extends Event {
  id: string
  resourceId: string
  type: 'task' | 'sprint'
  status: string
  projectId: string
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [allSprints, setAllSprints] = useState<Sprint[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())

  const handleNavigate = useCallback((newDate: Date) => setDate(newDate), [])
  const handleViewChange = useCallback((newView: View) => setView(newView), [])

  const userProjects = projects.filter(
    (p) => p.members && user?.uid && p.members[user.uid]
  )

  const projectsToShow = selectedProjects.length > 0
    ? userProjects.filter((p) => selectedProjects.includes(p.id))
    : userProjects

  // Default to selecting all projects initially if none selected
  useEffect(() => {
    if (userProjects.length > 0 && selectedProjects.length === 0) {
      // Optional: Select all by default or leave as "show all if none selected" logic
    }
  }, [userProjects, selectedProjects])

  // Fetch data
  useEffect(() => {
    if (projectsToShow.length === 0) {
      setAllTasks([])
      setAllSprints([])
      return
    }

    const unsubscribers: (() => void)[] = []

    projectsToShow.forEach((project) => {
      // Tasks
      const tasksRef = ref(database, `tasks/${project.id}`)
      const tasksUnsub = onValue(tasksRef, (snapshot) => {
        const data = snapshot.val() || {}
        const projectTasks = Object.entries(data).map(([id, value]: [string, any]) => ({
          ...value,
          id,
        })) as Task[]
        setAllTasks((prev) => {
           // Remove existing tasks for this project to avoid duplicates on updates
           const filtered = prev.filter((t) => t.projectId !== project.id)
           return [...filtered, ...projectTasks]
        })
      })
      unsubscribers.push(tasksUnsub)

      // Sprints
      const sprintsRef = ref(database, `sprints/${project.id}`)
      const sprintsUnsub = onValue(sprintsRef, (snapshot) => {
        const data = snapshot.val() || {}
        const projectSprints = Object.entries(data).map(([id, value]: [string, any]) => ({
          ...value,
          id,
        })) as Sprint[]
        setAllSprints((prev) => {
           const filtered = prev.filter((s) => s.projectId !== project.id)
           return [...filtered, ...projectSprints]
        })
      })
      unsubscribers.push(sprintsUnsub)
    })

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [JSON.stringify(projectsToShow.map(p => p.id))]) // Stable dependency

  // Map to events
  useEffect(() => {
    const taskEvents: CalendarEvent[] = allTasks.filter((task) => task.startDate).map((task) => ({
      id: task.id,
      title: `[Tarea] ${task.title}`,
      start: new Date(task.startDate!),
      end: task.endDate ? new Date(task.endDate) : new Date(task.startDate!),
      allDay: true, // Tasks sort of span the whole day usually
      resourceId: task.id,
      type: 'task',
      status: task.status,
      projectId: task.projectId
    }))

    const sprintEvents: CalendarEvent[] = allSprints.map((sprint) => ({
      id: sprint.id,
      title: `[Sprint] ${sprint.name}`,
      start: new Date(sprint.startDate),
      end: new Date(sprint.endDate),
      allDay: true,
      resourceId: sprint.id,
      type: 'sprint',
      status: sprint.status,
      projectId: sprint.projectId
    }))

    setEvents([...taskEvents, ...sprintEvents])
  }, [allTasks, allSprints])

  const onEventDrop = useCallback(
    async ({ event, start, end, isAllDay }: any) => {
      if (event.type !== 'task') {
        toast.error('Solo puedes mover tareas, no sprints')
        return
      }

      const taskEvent = event as CalendarEvent
      try {
        // Update in Firebase
        await update(ref(database, `tasks/${taskEvent.projectId}/${taskEvent.id}`), {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        })
        toast.success('Fecha de tarea actualizada')
      } catch (error) {
        console.error('Error updating task date:', error)
        toast.error('Error al actualizar la fecha')
      }
    },
    []
  )

  const onEventResize = useCallback(
    async ({ event, start, end }: any) => {
      if (event.type !== 'task') {
         toast.error('Solo puedes redimensionar tareas')
         return
      }
      const taskEvent = event as CalendarEvent
      try {
        await update(ref(database, `tasks/${taskEvent.projectId}/${taskEvent.id}`), {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd'),
        })
         toast.success('Duración de tarea actualizada')
      } catch (error) {
        console.error(error)
        toast.error('Error al actualizar duración')
      }
    },
    []
  )

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad'
    if (event.type === 'task') {
       if (event.status === 'done') backgroundColor = '#10B981' // Green
       else if (event.status === 'in-progress') backgroundColor = '#3B82F6' // Blue
       else if (event.status === 'to-validate') backgroundColor = '#F59E0B' // Yellow
       else backgroundColor = '#6B7280' // Gray for to-do
    } else {
      backgroundColor = '#8B5CF6' // Purple for Sprints
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  if (authLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>Por favor inicia sesión para ver el calendario</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-right" />

      <div className={styles.controls}>
        <div className={styles.filterSection}>
          <label className={styles.label}>Filtrar por Proyecto:</label>
          <div className={styles.projectGrid}>
            {userProjects.map((project) => (
              <button
                key={project.id}
                className={`${styles.projectBtn} ${
                  selectedProjects.length === 0 || selectedProjects.includes(project.id)
                    ? styles.active
                    : ''
                }`}
                onClick={() => {
                  setSelectedProjects((prev) =>
                    prev.includes(project.id)
                      ? prev.filter((id) => id !== project.id)
                      : [...prev, project.id]
                  )
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedProjects.length === 0 || selectedProjects.includes(project.id)}
                  readOnly
                  className={styles.checkbox}
                />
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.calendarWrapper}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor={(event: object) => (event as CalendarEvent).start as Date}
          endAccessor={(event: object) => (event as CalendarEvent).end as Date}
          style={{ height: 600 }}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          resizable
          draggableAccessor={(event: any) => event.type === 'task'}
          eventPropGetter={(event: any) => eventStyleGetter(event)}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          view={view}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento"
          }}
          culture='es'
        />
      </div>

      <div className={styles.note}>
        <AlertCircle size={16} style={{ marginRight: '8px' }} />
        <div>
           <strong>Próximamente:</strong> Exportación a ICS/Google Calendar/Outlook.
        </div>
      </div>
    </div>
  )
}
