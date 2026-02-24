'use client'

import { useState, useCallback } from 'react'
import { StorageService } from '@/lib/services/storage.service'

interface TaskAttachmentResult {
  id: string
  name: string
  url: string
  storagePath: string
  uploadedAt: number
  uploadedBy: string
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)

  const uploadFiles = useCallback(
    async (files: File[], basePath: string, userId: string): Promise<TaskAttachmentResult[]> => {
      setUploading(true)
      setProgress({})
      setError(null)
      try {
        const results = await StorageService.uploadMultiple(
          files,
          basePath,
          userId,
          (fileIndex, prog) => {
            setProgress(prev => ({ ...prev, [fileIndex]: prog }))
          }
        )
        return results
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error uploading files'
        setError(errorMsg)
        throw err
      } finally {
        setUploading(false)
      }
    },
    []
  )

  const deleteFile = useCallback(async (storagePath: string) => {
    try {
      await StorageService.deleteFile(storagePath)
    } catch (err) {
      console.error('Error deleting file:', err)
      throw err
    }
  }, [])

  return { uploading, progress, error, uploadFiles, deleteFile }
}
