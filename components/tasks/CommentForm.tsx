'use client'

import { useState, useCallback, useMemo } from 'react'
import { CommentService } from '@/lib/services/comment.service'
import Button from '@/components/ui/Button'
import styles from './CommentForm.module.css'

interface CommentFormProps {
  taskId: string
  currentUserName: string
  currentUserPhotoURL?: string
  projectMembers?: Array<{ uid: string; displayName: string }>
  onSubmit: (text: string, mentions: string[]) => Promise<void>
  isLoading?: boolean
}

export default function CommentForm({
  taskId,
  currentUserName,
  currentUserPhotoURL,
  projectMembers = [],
  onSubmit,
  isLoading = false,
}: CommentFormProps) {
  const [text, setText] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')

  const mentions = useMemo(() => CommentService.parseMentions(text), [text])

  const filteredMembers = useMemo(() => {
    if (!mentionFilter) return projectMembers
    return projectMembers.filter((member) =>
      member.displayName.toLowerCase().includes(mentionFilter.toLowerCase())
    )
  }, [mentionFilter, projectMembers])

  const handleMentionClick = useCallback(
    (memberName: string) => {
      const currentCursorPos = text.length
      const beforeCursor = text.substring(0, currentCursorPos)
      const afterCursor = text.substring(currentCursorPos)

      // Find the last @ symbol
      const lastAtIndex = beforeCursor.lastIndexOf('@')
      if (lastAtIndex !== -1) {
        const newText = beforeCursor.substring(0, lastAtIndex) + `@${memberName} ` + afterCursor
        setText(newText)
        setShowMentions(false)
        setMentionFilter('')
      }
    },
    [text]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      const parsedMentions = CommentService.parseMentions(text)
      await onSubmit(text, parsedMentions)
      setText('')
      setShowPreview(false)
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setText(value)

    // Auto-show mentions when typing @
    const lastChar = value[value.length - 1]
    const lastWord = value.split(/\s+/).pop() || ''
    if (lastChar === '@' || (lastWord.startsWith('@') && lastWord.length > 1)) {
      setMentionFilter(lastWord.replace('@', ''))
      setShowMentions(true)
    } else if (lastWord.startsWith('@')) {
      setMentionFilter(lastWord.replace('@', ''))
    } else {
      setShowMentions(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.header}>
        {currentUserPhotoURL && (
          <img src={currentUserPhotoURL} alt={currentUserName} className={styles.avatar} />
        )}
        <div className={styles.userInfo}>
          <span className={styles.userName}>{currentUserName}</span>
          <span className={styles.timestamp}>Ahora</span>
        </div>
      </div>

      <div className={styles.inputWrapper}>
        <div className={styles.textareaContainer}>
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Escribe un comentario... (usa @ para mencionar)"
            className={styles.textarea}
            rows={3}
            disabled={isLoading}
          />

          {showMentions && filteredMembers.length > 0 && (
            <div className={styles.mentionsList}>
              {filteredMembers.slice(0, 5).map((member) => (
                <button
                  key={member.uid}
                  type="button"
                  className={styles.mentionItem}
                  onClick={() => handleMentionClick(member.displayName)}
                >
                  <span className={styles.mentionName}>@{member.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.previewBtn} ${showPreview ? styles.active : ''}`}
            onClick={() => setShowPreview(!showPreview)}
            disabled={isLoading}
          >
            {showPreview ? 'Editar' : 'Vista Previa'}
          </button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!text.trim() || isLoading}
            loading={isLoading}
          >
            Comentar
          </Button>
        </div>
      </div>

      {showPreview && text.trim() && (
        <div className={styles.preview}>
          <div className={styles.previewLabel}>Vista Previa:</div>
          <div className={styles.previewContent}>{text}</div>
        </div>
      )}
    </form>
  )
}
