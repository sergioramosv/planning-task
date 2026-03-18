'use client'

import { useTimer } from '@/contexts/TimerContext'
import { Clock, Square } from 'lucide-react'
import styles from './ActiveTimerWidget.module.css'

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function ActiveTimerWidget() {
  const { activeTimer, elapsed, stopTimer } = useTimer()

  if (!activeTimer) return null

  return (
    <div className={styles.widget}>
      <Clock size={14} className={styles.icon} />
      <span className={styles.time}>{formatElapsed(elapsed)}</span>
      <span className={styles.taskName}>{activeTimer.taskTitle}</span>
      <button className={styles.stopBtn} onClick={stopTimer} title="Stop timer">
        <Square size={10} />
      </button>
    </div>
  )
}
