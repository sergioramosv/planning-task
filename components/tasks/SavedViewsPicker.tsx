'use client'

import { useState, useRef, useEffect } from 'react'
import { SavedView, SavedViewFilters } from '@/types'
import { Bookmark, ChevronDown, Trash2, Plus, Globe, User } from 'lucide-react'
import styles from './SavedViewsPicker.module.css'

interface SavedViewsPickerProps {
  views: SavedView[]
  currentFilters: SavedViewFilters
  onLoadView: (filters: SavedViewFilters) => void
  onSaveView: (name: string, shared: boolean) => void
  onDeleteView: (viewId: string) => void
  hasActiveFilters: boolean
}

export default function SavedViewsPicker({
  views,
  currentFilters,
  onLoadView,
  onSaveView,
  onDeleteView,
  hasActiveFilters,
}: SavedViewsPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [isShared, setIsShared] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setIsSaving(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    if (isSaving && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSaving])

  const handleSave = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    onSaveView(trimmed, isShared)
    setNewName('')
    setIsShared(false)
    setIsSaving(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setIsSaving(false)
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        title="Vistas guardadas"
      >
        <Bookmark size={16} />
        <span>Vistas</span>
        {views.length > 0 && <span className={styles.badge}>{views.length}</span>}
        <ChevronDown size={14} className={isOpen ? styles.chevronOpen : ''} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {views.length > 0 && (
            <div className={styles.viewsList}>
              {views.map(view => (
                <div key={view.id} className={styles.viewItem}>
                  <button
                    className={styles.viewButton}
                    onClick={() => {
                      onLoadView(view.filters)
                      setIsOpen(false)
                    }}
                  >
                    {view.shared ? <Globe size={14} /> : <User size={14} />}
                    <span className={styles.viewName}>{view.name}</span>
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => onDeleteView(view.id)}
                    title="Eliminar vista"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {views.length === 0 && !isSaving && (
            <div className={styles.emptyState}>
              No hay vistas guardadas
            </div>
          )}

          {isSaving ? (
            <div className={styles.saveForm}>
              <input
                ref={inputRef}
                type="text"
                className={styles.saveInput}
                placeholder="Nombre de la vista..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <label className={styles.sharedLabel}>
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={e => setIsShared(e.target.checked)}
                />
                <Globe size={12} />
                <span>Compartida</span>
              </label>
              <div className={styles.saveActions}>
                <button className={styles.cancelBtn} onClick={() => setIsSaving(false)}>
                  Cancelar
                </button>
                <button
                  className={styles.confirmBtn}
                  onClick={handleSave}
                  disabled={!newName.trim()}
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            hasActiveFilters && (
              <button
                className={styles.saveButton}
                onClick={() => setIsSaving(true)}
              >
                <Plus size={14} />
                Guardar vista actual
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
