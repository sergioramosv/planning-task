'use client'

import { useState, useMemo } from 'react'
import { useComments } from '@/hooks/useComments'
import { Comment } from '@/types/comment'
import { Task } from '@/types'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'
import HistoryItem from './HistoryItem'
import Spinner from '@/components/ui/Spinner'
import styles from './TaskActivityPanel.module.css'

interface TaskActivityPanelProps {
  task: Task
  currentUserId: string
  currentUserName: string
  currentUserPhotoURL?: string
  projectMembers?: Array<{ uid: string; displayName: string }>
}

export default function TaskActivityPanel({
  task,
  currentUserId,
  currentUserName,
  currentUserPhotoURL,
  projectMembers = [],
}: TaskActivityPanelProps) {
  const { comments, loading, createComment } = useComments(task.id)
  const [filter, setFilter] = useState<'all' | 'comments' | 'changes'>('all')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  // Merge comments and history into unified timeline
  const activityItems = useMemo(() => {
    const items: any[] = []

    // Add comments
    if (filter === 'all' || filter === 'comments') {
      items.push(
        ...comments.map((comment) => ({
          type: 'comment',
          data: comment,
          timestamp: comment.createdAt,
        }))
      )
    }

    // Add task history
    if ((filter === 'all' || filter === 'changes') && task.history) {
      const historyEntries = Object.entries(task.history).map(([key, value]: [string, any]) => ({
        type: 'history',
        data: value,
        timestamp: value.timestamp,
      }))
      items.push(...historyEntries)
    }

    // Sort by timestamp (newest first)
    items.sort((a, b) => b.timestamp - a.timestamp)
    return items
  }, [comments, task.history, filter])

  const handleCommentSubmit = async (text: string, mentions: string[]) => {
    if (!text.trim()) return

    setIsSubmittingComment(true)
    try {
      await createComment(text, currentUserId, currentUserName, currentUserPhotoURL, mentions)
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Actividad</h3>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Todo
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'comments' ? styles.active : ''}`}
            onClick={() => setFilter('comments')}
          >
            Comentarios
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'changes' ? styles.active : ''}`}
            onClick={() => setFilter('changes')}
          >
            Cambios
          </button>
        </div>
      </div>

      <div className={styles.commentForm}>
        <CommentForm
          taskId={task.id}
          currentUserName={currentUserName}
          currentUserPhotoURL={currentUserPhotoURL}
          projectMembers={projectMembers}
          onSubmit={handleCommentSubmit}
          isLoading={isSubmittingComment}
        />
      </div>

      <div className={styles.timeline}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner />
          </div>
        ) : activityItems.length === 0 ? (
          <div className={styles.emptyMessage}>
            {filter === 'comments' && 'No hay comentarios aún'}
            {filter === 'changes' && 'No hay cambios registrados'}
            {filter === 'all' && 'No hay actividad aún'}
          </div>
        ) : (
          <div className={styles.items}>
            {activityItems.map((item) =>
              item.type === 'comment' ? (
                <CommentItem
                  key={`comment-${item.data.id}`}
                  comment={item.data as Comment}
                  isCurrentUser={item.data.userId === currentUserId}
                  projectMembers={projectMembers}
                />
              ) : (
                <HistoryItem key={`history-${item.data.timestamp}`} history={item.data} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
