'use client'

import { useState } from 'react'
import { Comment } from '@/types/comment'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Edit2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import styles from './CommentItem.module.css'

interface CommentItemProps {
  comment: Comment
  isCurrentUser: boolean
  onDelete?: (commentId: string) => void
  onEdit?: (commentId: string, text: string) => void
  projectMembers?: Array<{ uid: string; displayName: string }>
}

export default function CommentItem({
  comment,
  isCurrentUser,
  onDelete,
  onEdit,
  projectMembers = [],
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(comment.text)

  const handleEditSubmit = async () => {
    if (editedText.trim() && onEdit) {
      await onEdit(comment.id, editedText)
      setIsEditing(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {comment.userPhotoURL && (
          <img src={comment.userPhotoURL} alt={comment.userName} className={styles.avatar} />
        )}
        <div className={styles.userInfo}>
          <span className={styles.userName}>{comment.userName}</span>
          <span className={styles.timestamp}>
            {timeAgo}
            {comment.edited && <span className={styles.edited}>(editado)</span>}
          </span>
        </div>

        {isCurrentUser && (
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={() => setIsEditing(!isEditing)}
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            {onDelete && (
              <button
                className={styles.actionBtn}
                onClick={() => onDelete(comment.id)}
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className={styles.editForm}>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className={styles.editTextarea}
            rows={3}
          />
          <div className={styles.editActions}>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setIsEditing(false)
                setEditedText(comment.text)
              }}
            >
              Cancelar
            </button>
            <button className={styles.saveBtn} onClick={handleEditSubmit}>
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {comment.text}
            </ReactMarkdown>
          </div>

          {comment.mentions && comment.mentions.length > 0 && (
            <div className={styles.mentions}>
              <span className={styles.mentionsLabel}>Menciones:</span>
              {comment.mentions.map((mention) => (
                <span key={mention} className={styles.mention}>
                  @{mention}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
