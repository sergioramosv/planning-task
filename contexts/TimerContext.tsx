'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

interface ActiveTimer {
  taskId: string
  taskTitle: string
  projectId: string
  userId: string
  userName: string
  startTime: number
}

interface TimerContextType {
  activeTimer: ActiveTimer | null
  elapsed: number
  startTimer: (taskId: string, taskTitle: string, projectId: string, userId: string, userName: string) => void
  stopTimer: () => { taskId: string; startTime: number; endTime: number; userId: string; userName: string } | null
  isTimerActive: (taskId: string) => boolean
}

const TimerContext = createContext<TimerContextType | null>(null)

const STORAGE_KEY = 'planning-task-active-timer'

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const timer = JSON.parse(stored) as ActiveTimer
        setActiveTimer(timer)
      }
    } catch {
      // ignore
    }
  }, [])

  // Tick elapsed time
  useEffect(() => {
    if (activeTimer) {
      const tick = () => {
        setElapsed(Math.floor((Date.now() - activeTimer.startTime) / 1000))
      }
      tick()
      intervalRef.current = setInterval(tick, 1000)
    } else {
      setElapsed(0)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [activeTimer])

  const startTimer = useCallback((taskId: string, taskTitle: string, projectId: string, userId: string, userName: string) => {
    const timer: ActiveTimer = { taskId, taskTitle, projectId, userId, userName, startTime: Date.now() }
    setActiveTimer(timer)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timer))
  }, [])

  const stopTimer = useCallback(() => {
    if (!activeTimer) return null
    const result = {
      taskId: activeTimer.taskId,
      startTime: activeTimer.startTime,
      endTime: Date.now(),
      userId: activeTimer.userId,
      userName: activeTimer.userName,
    }
    setActiveTimer(null)
    localStorage.removeItem(STORAGE_KEY)
    return result
  }, [activeTimer])

  const isTimerActive = useCallback((taskId: string) => {
    return activeTimer?.taskId === taskId
  }, [activeTimer])

  return (
    <TimerContext.Provider value={{ activeTimer, elapsed, startTimer, stopTimer, isTimerActive }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const ctx = useContext(TimerContext)
  if (!ctx) throw new Error('useTimer must be used within TimerProvider')
  return ctx
}
