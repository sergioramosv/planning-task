import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: es })
  } catch {
    return dateString
  }
}

export const formatDateTime = (timestamp: number): string => {
  try {
    return format(new Date(timestamp), 'dd MMM yyyy HH:mm', { locale: es })
  } catch {
    return new Date(timestamp).toLocaleString()
  }
}

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'hace unos segundos'
  if (minutes < 60) return `hace ${minutes}m`
  if (hours < 24) return `hace ${hours}h`
  if (days < 30) return `hace ${days}d`

  return formatDateTime(timestamp)
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'to-do': 'Por Hacer',
    'in-progress': 'En Progreso',
    'to-validate': 'Por Validar',
    'validated': 'Validado',
    'done': 'Completado',
    'planned': 'Planeado',
    'active': 'Activo',
    'completed': 'Completado',
    'archived': 'Archivado',
  }
  return labels[status] || status
}

export const truncateText = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}
