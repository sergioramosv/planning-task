'use client'

import { useCallback, useEffect, useState } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, onValue, push, update, remove } from 'firebase/database'
import { Comment } from '@/types/comment'

export function useComments(taskId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!taskId) {
      setComments([])
      setLoading(false)
      return
    }

    const commentsRef = ref(database, `comments/${taskId}`)

    const unsubscribe = onValue(
      commentsRef,
      (snapshot) => {
        try {
          const data = snapshot.val()
          if (!data) {
            setComments([])
          } else {
            const commentsList = Object.entries(data).map(([key, value]: [string, any]) => ({
              ...value,
              id: key,
            }))
            // Sort by creation date (newest first)
            commentsList.sort((a, b) => b.createdAt - a.createdAt)
            setComments(commentsList)
          }
          setError(null)
        } catch (err: any) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [taskId])

  const createComment = useCallback(
    async (
      text: string,
      userId: string,
      userName: string,
      userPhotoURL?: string,
      mentions: string[] = []
    ) => {
      if (!taskId) throw new Error('No task selected')

      try {
        const newCommentRef = push(ref(database, `comments/${taskId}`))
        const commentId = newCommentRef.key

        const comment: any = {
          taskId,
          userId,
          userName,
          text,
          mentions,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          edited: false,
        }

        // Only add userPhotoURL if it's defined (Firebase doesn't allow undefined values)
        if (userPhotoURL && typeof userPhotoURL === 'string') {
          comment.userPhotoURL = userPhotoURL
        }

        await update(newCommentRef, comment)
        return commentId!
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [taskId]
  )

  const updateComment = useCallback(
    async (commentId: string, text: string, mentions: string[] = []) => {
      if (!taskId) throw new Error('No task selected')

      try {
        await update(ref(database, `comments/${taskId}/${commentId}`), {
          text,
          mentions,
          updatedAt: Date.now(),
          edited: true,
        })
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [taskId]
  )

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!taskId) throw new Error('No task selected')

      try {
        await remove(ref(database, `comments/${taskId}/${commentId}`))
      } catch (err: any) {
        setError(err.message)
        throw err
      }
    },
    [taskId]
  )

  return {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
  }
}
