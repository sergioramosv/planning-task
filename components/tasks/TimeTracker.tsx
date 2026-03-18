'use client'

import { useState } from 'react'
import { useTimer } from '@/contexts/TimerContext'
import { TimeEntry } from '@/types/task'
import { Play, Square, Clock, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './TimeTracker.module.css'

interface TimeTrackerProps {
  taskId: string
  taskTitle: string
  projectId: string
  userId: string
  userName: string
  timeEntries: TimeEntry[]
  onSaveEntry: (entry: Omit<TimeEntry, 'id'>) => void
  onDeleteEntry?: (entryId: string) => void
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatDurationShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TimeTracker({
  taskId,
  taskTitle,
  projectId,
  userId,
  userName,
  timeEntries,
  onSaveEntry,
  onDeleteEntry,
}: TimeTrackerProps) {
  const { activeTimer, elapsed, startTimer, stopTimer, isTimerActive } = useTimer()
  const { t } = useLanguage()
  const [showEntries, setShowEntries] = useState(false)
  const isActive = isTimerActive(taskId)
  const otherTimerActive = activeTimer !== null && !isActive

  const totalMs = timeEntries.reduce((sum, e) => sum + (e.endTime - e.startTime), 0)
  const totalWithCurrent = isActive ? totalMs + elapsed * 1000 : totalMs

  const handleToggle = () => {
    if (isActive) {
      const result = stopTimer()
      if (result) {
        onSaveEntry({
          startTime: result.startTime,
          endTime: result.endTime,
          userId: result.userId,
          userName: result.userName,
        })
      }
    } else {
      // Stop other timer first if active
      if (otherTimerActive) {
        stopTimer()
      }
      startTimer(taskId, taskTitle, projectId, userId, userName)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Clock size={16} className={styles.icon} />
        <span className={styles.title}>{t('timeTracker.title')}</span>
      </div>

      <div className={styles.timerRow}>
        <button
          className={`${styles.timerButton} ${isActive ? styles.timerButtonStop : styles.timerButtonPlay}`}
          onClick={handleToggle}
          title={isActive ? t('timeTracker.stop') : t('timeTracker.start')}
        >
          {isActive ? <Square size={14} /> : <Play size={14} />}
        </button>

        <div className={styles.timerDisplay}>
          {isActive ? (
            <span className={styles.timerActive}>{formatDuration(elapsed)}</span>
          ) : (
            <span className={styles.timerIdle}>{t('timeTracker.stopped')}</span>
          )}
        </div>

        <div className={styles.totalTime}>
          <span className={styles.totalLabel}>{t('timeTracker.total')}</span>
          <span className={styles.totalValue}>{formatDurationShort(totalWithCurrent)}</span>
        </div>
      </div>

      {timeEntries.length > 0 && (
        <>
          <button
            className={styles.toggleEntries}
            onClick={() => setShowEntries(!showEntries)}
          >
            {showEntries ? t('timeTracker.hideEntries') : t('timeTracker.showEntries')} ({timeEntries.length})
          </button>

          {showEntries && (
            <div className={styles.entries}>
              {[...timeEntries].reverse().map(entry => (
                <div key={entry.id} className={styles.entry}>
                  <div className={styles.entryInfo}>
                    <span className={styles.entryTime}>
                      {formatTimestamp(entry.startTime)} — {formatTimestamp(entry.endTime)}
                    </span>
                    <span className={styles.entryDuration}>
                      {formatDurationShort(entry.endTime - entry.startTime)}
                    </span>
                    {entry.userName && (
                      <span className={styles.entryUser}>{entry.userName}</span>
                    )}
                  </div>
                  {onDeleteEntry && (
                    <button
                      className={styles.entryDelete}
                      onClick={() => onDeleteEntry(entry.id)}
                      title={t('common.delete')}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
