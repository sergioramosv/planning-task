/**
 * Parser para CHANGELOG.md generado por semantic-release
 * Extrae versiones, fechas y cambios en formato estructurado
 */

export interface ChangelogEntry {
  version: string
  date: string
  sections: ChangelogSection[]
}

export interface ChangelogSection {
  type: 'added' | 'fixed' | 'changed' | 'deprecated' | 'removed' | 'security' | 'unknown'
  title: string
  items: ChangelogItem[]
}

export interface ChangelogItem {
  description: string
  type: string // 'feat', 'fix', 'chore', etc.
  scope?: string
}

/**
 * Parsea el contenido del CHANGELOG.md
 * Espera formato de Keep a Changelog o semantic-release
 */
export function parseChangelog(content: string): ChangelogEntry[] {
  if (!content || content.trim().length === 0) {
    return []
  }

  const entries: ChangelogEntry[] = []
  const lines = content.split('\n')

  let currentVersion: ChangelogEntry | null = null
  let currentSection: ChangelogSection | null = null
  let isProcessing = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Detectar versión: "## [1.0.0] - 2025-02-17" o "# 1.0.0 (2025-02-17)"
    const versionMatch = trimmed.match(/^#+\s*\[?([^\]\s]+)\]?(?:\s*[-–]\s*|\s*\()?(\d{4}-\d{2}-\d{2}|\d{1,2}\s+\w+\s+\d{4})/)

    if (versionMatch) {
      // Si hay una versión anterior, agregarla
      if (currentVersion && currentVersion.sections.length > 0) {
        entries.push(currentVersion)
      }

      currentVersion = {
        version: versionMatch[1],
        date: versionMatch[2] || 'Unknown',
        sections: [],
      }
      currentSection = null
      isProcessing = true
      continue
    }

    // Si no estamos procesando o no hay versión actual, skip
    if (!currentVersion || !isProcessing) continue

    // Detectar secciones: "### Added", "### Fixed", etc.
    const sectionMatch = trimmed.match(/^###\s+(.+)$/i)
    if (sectionMatch) {
      const sectionTitle = sectionMatch[1].trim()
      const sectionType = mapSectionType(sectionTitle)

      currentSection = {
        type: sectionType,
        title: sectionTitle,
        items: [],
      }

      if (!currentVersion.sections.find(s => s.type === sectionType && s.title === sectionTitle)) {
        currentVersion.sections.push(currentSection)
      }
      continue
    }

    // Detectar items: "* descripción" o "- descripción"
    const itemMatch = trimmed.match(/^[*\-]\s+(.+)$/i)
    if (itemMatch && currentSection) {
      const itemText = itemMatch[1].trim()

      // Eliminar links de GitHub commit: ([hash](url))
      const cleanedText = itemText.replace(/\s*\(\[[\da-f]+\]\([^)]+\)\)\s*$/i, '').trim()

      // Detectar tipo de cambio y scope
      const typeMatch = cleanedText.match(/^(feat|fix|chore|docs|refactor|perf|test|style|build|ci)(?:\(([^)]+)\))?\s*:?\s*(.*)$/i)

      let changeItem: ChangelogItem
      if (typeMatch) {
        changeItem = {
          type: typeMatch[1],
          scope: typeMatch[2],
          description: typeMatch[3] || cleanedText,
        }
      } else {
        // Si no hay tipo explícito, inferir del tipo de sección
        const typeFromSection = mapSectionTypeToChangeType(currentSection.type)
        changeItem = {
          type: typeFromSection,
          description: cleanedText,
        }
      }

      currentSection.items.push(changeItem)
      continue
    }

    // Detectar fin de versión (otra sección de nivel superior o EOF)
    if (trimmed.match(/^#{1,2}\s+/) && !trimmed.match(/^###/)) {
      if (currentVersion && currentVersion.sections.length > 0) {
        entries.push(currentVersion)
      }
      currentVersion = null
      currentSection = null
      isProcessing = false
    }
  }

  // Agregar última versión si existe
  if (currentVersion && currentVersion.sections.length > 0) {
    entries.push(currentVersion)
  }

  return entries
}

/**
 * Mapea títulos de sección a tipos normalizados
 */
function mapSectionType(title: string): ChangelogSection['type'] {
  const normalized = title.toLowerCase()

  if (normalized.includes('added') || normalized.includes('feature')) return 'added'
  if (normalized.includes('fixed') || normalized.includes('bug')) return 'fixed'
  if (normalized.includes('changed') || normalized.includes('modified')) return 'changed'
  if (normalized.includes('deprecated')) return 'deprecated'
  if (normalized.includes('removed')) return 'removed'
  if (normalized.includes('security')) return 'security'

  return 'unknown'
}

/**
 * Mapea tipo de sección a tipo de cambio convencional
 */
function mapSectionTypeToChangeType(sectionType: ChangelogSection['type']): string {
  switch (sectionType) {
    case 'added':
      return 'feat'
    case 'fixed':
      return 'fix'
    case 'changed':
      return 'refactor'
    case 'deprecated':
      return 'chore'
    case 'removed':
      return 'chore'
    case 'security':
      return 'fix'
    default:
      return 'chore'
  }
}

/**
 * Obtiene el badge color para un tipo de cambio
 */
export function getChangeTypeBadgeVariant(type: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (type?.toLowerCase()) {
    case 'feat':
    case 'feature':
    case 'added':
      return 'success'
    case 'fix':
    case 'fixed':
    case 'perf':
      return 'warning'
    case 'docs':
      return 'info'
    case 'chore':
    case 'refactor':
    case 'test':
    case 'style':
    case 'build':
    case 'ci':
      return 'secondary'
    case 'breaking':
    case 'removed':
      return 'danger'
    default:
      return 'secondary'
  }
}

/**
 * Obtiene un nombre legible para el tipo de cambio
 */
export function getChangeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    feat: 'Feature',
    fix: 'Fix',
    docs: 'Docs',
    style: 'Style',
    refactor: 'Refactor',
    perf: 'Performance',
    test: 'Test',
    build: 'Build',
    ci: 'CI',
    chore: 'Chore',
    breaking: 'Breaking',
    removed: 'Removed',
    added: 'Added',
    fixed: 'Fixed',
    changed: 'Changed',
    deprecated: 'Deprecated',
    security: 'Security',
  }

  return labels[type?.toLowerCase()] || type || 'Change'
}
