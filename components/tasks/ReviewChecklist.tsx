'use client'

import { useState } from 'react'
import { ReviewChecklistItem, REVIEW_CHECKLIST_TEMPLATES, ReviewChecklistTemplate } from '@/types'
import { CheckSquare, Square, Shield, ChevronDown } from 'lucide-react'
import styles from './ReviewChecklist.module.css'

interface ReviewChecklistProps {
  checklist: ReviewChecklistItem[]
  onChange: (checklist: ReviewChecklistItem[]) => void
  currentUserId: string
  currentUserName: string
  readOnly?: boolean
}

export default function ReviewChecklist({
  checklist,
  onChange,
  currentUserId,
  currentUserName,
  readOnly = false,
}: ReviewChecklistProps) {
  const [showTemplates, setShowTemplates] = useState(false)

  const completedCount = checklist.filter(item => item.checked).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const allChecked = totalCount > 0 && completedCount === totalCount

  const toggleItem = (itemId: string) => {
    if (readOnly) return
    const updated = checklist.map(item => {
      if (item.id !== itemId) return item
      if (item.checked) {
        return { ...item, checked: false, checkedBy: undefined, checkedByName: undefined, checkedAt: undefined }
      }
      return { ...item, checked: true, checkedBy: currentUserId, checkedByName: currentUserName, checkedAt: Date.now() }
    })
    onChange(updated)
  }

  const applyTemplate = (template: Exclude<ReviewChecklistTemplate, 'custom'>) => {
    const items: ReviewChecklistItem[] = REVIEW_CHECKLIST_TEMPLATES[template].map((label, i) => ({
      id: `review-${Date.now()}-${i}`,
      label,
      checked: false,
    }))
    onChange(items)
    setShowTemplates(false)
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Shield size={16} className={styles.headerIcon} />
          <span className={styles.title}>Code Review Checklist</span>
          <span className={`${styles.badge} ${allChecked ? styles.badgeComplete : ''}`}>
            {completedCount}/{totalCount}
          </span>
        </div>
        {!readOnly && checklist.length === 0 && (
          <div className={styles.templateSelector}>
            <button className={styles.templateBtn} onClick={() => setShowTemplates(!showTemplates)}>
              Apply template <ChevronDown size={14} />
            </button>
            {showTemplates && (
              <div className={styles.templateDropdown}>
                <button onClick={() => applyTemplate('frontend')}>Frontend</button>
                <button onClick={() => applyTemplate('backend')}>Backend</button>
                <button onClick={() => applyTemplate('fullstack')}>Fullstack</button>
              </div>
            )}
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${allChecked ? styles.progressComplete : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {checklist.length === 0 ? (
        <p className={styles.empty}>No checklist configured. Apply a template to get started.</p>
      ) : (
        <div className={styles.list}>
          {checklist.map(item => (
            <div
              key={item.id}
              className={`${styles.item} ${item.checked ? styles.itemChecked : ''}`}
              onClick={() => toggleItem(item.id)}
            >
              <span className={styles.checkbox}>
                {item.checked ? (
                  <CheckSquare size={18} className={styles.checked} />
                ) : (
                  <Square size={18} className={styles.unchecked} />
                )}
              </span>
              <div className={styles.itemContent}>
                <span className={`${styles.itemLabel} ${item.checked ? styles.labelChecked : ''}`}>
                  {item.label}
                </span>
                {item.checked && item.checkedByName && (
                  <span className={styles.itemMeta}>
                    {item.checkedByName} - {formatDate(item.checkedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
