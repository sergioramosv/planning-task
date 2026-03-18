'use client'

import { Epic, EPIC_COLORS } from '@/types/epic'
import styles from './EpicSelector.module.css'

interface EpicSelectorProps {
  epics: Epic[]
  selectedEpicId?: string
  onChange: (epicId: string | undefined) => void
}

export default function EpicSelector({ epics, selectedEpicId, onChange }: EpicSelectorProps) {
  if (epics.length === 0) return null

  return (
    <div className={styles.container}>
      <label className={styles.label}>Epic</label>
      <select
        className={styles.select}
        value={selectedEpicId || ''}
        onChange={e => onChange(e.target.value || undefined)}
      >
        <option value="">Sin epic</option>
        {epics.map(epic => (
          <option key={epic.id} value={epic.id}>
            {epic.title}
          </option>
        ))}
      </select>
      {selectedEpicId && (
        <span
          className={styles.colorDot}
          style={{ background: epics.find(e => e.id === selectedEpicId)?.color || EPIC_COLORS[0] }}
        />
      )}
    </div>
  )
}
