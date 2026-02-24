import { storage } from '@/lib/firebase/config'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

export const StorageService = {
  uploadFile: (
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref)
          resolve({ url, name: file.name })
        }
      )
    })
  },

  deleteFile: async (path: string): Promise<void> => {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  },

  uploadMultiple: async (
    files: File[],
    basePath: string,
    userId: string,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<Array<{ id: string; name: string; url: string; storagePath: string; uploadedAt: number; uploadedBy: string }>> => {
    const results = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const uniqueName = `${Date.now()}_${file.name}`
      const filePath = `${basePath}/${uniqueName}`
      const { url, name } = await StorageService.uploadFile(
        file,
        filePath,
        (progress) => onProgress?.(i, progress)
      )
      results.push({
        id: uniqueName,
        name,
        url,
        storagePath: filePath,
        uploadedAt: Date.now(),
        uploadedBy: userId,
      })
    }
    return results
  },
}
