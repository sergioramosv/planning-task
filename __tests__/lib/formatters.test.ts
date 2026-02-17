import { formatDate, formatDateTime, formatTimeAgo, getStatusLabel, truncateText } from '@/lib/utils/formatters'

describe('Formatters', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate('2024-02-17')
      expect(result).toContain('17')
      expect(result).toContain('2024')
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('invalid')
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const timestamp = new Date('2024-02-17T12:00:00').getTime()
      const result = formatDateTime(timestamp)
      expect(result).toContain('12')
    })
  })

  describe('formatTimeAgo', () => {
    it('should show "hace unos segundos" for recent timestamps', () => {
      const timestamp = Date.now() - 10000
      expect(formatTimeAgo(timestamp)).toBe('hace unos segundos')
    })

    it('should show minutes ago', () => {
      const timestamp = Date.now() - 5 * 60 * 1000
      expect(formatTimeAgo(timestamp)).toBe('hace 5m')
    })

    it('should show hours ago', () => {
      const timestamp = Date.now() - 3 * 3600 * 1000
      expect(formatTimeAgo(timestamp)).toBe('hace 3h')
    })

    it('should show days ago', () => {
      const timestamp = Date.now() - 7 * 24 * 3600 * 1000
      expect(formatTimeAgo(timestamp)).toBe('hace 7d')
    })
  })

  describe('getStatusLabel', () => {
    it('should return correct labels for task statuses', () => {
      expect(getStatusLabel('to-do')).toBe('Por Hacer')
      expect(getStatusLabel('in-progress')).toBe('En Progreso')
      expect(getStatusLabel('to-validate')).toBe('Por Validar')
      expect(getStatusLabel('validated')).toBe('Validado')
      expect(getStatusLabel('done')).toBe('Completado')
    })

    it('should return correct labels for project statuses', () => {
      expect(getStatusLabel('planned')).toBe('Planeado')
      expect(getStatusLabel('active')).toBe('Activo')
      expect(getStatusLabel('completed')).toBe('Completado')
      expect(getStatusLabel('archived')).toBe('Archivado')
    })

    it('should return original status if not found', () => {
      expect(getStatusLabel('unknown')).toBe('unknown')
    })
  })

  describe('truncateText', () => {
    it('should truncate text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
    })

    it('should not truncate if text is shorter than limit', () => {
      expect(truncateText('Hi', 5)).toBe('Hi')
    })

    it('should not truncate if text equals limit', () => {
      expect(truncateText('Hello', 5)).toBe('Hello')
    })
  })
})
