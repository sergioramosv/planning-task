'use client'

import Modal from '@/components/ui/Modal'
import modalStyles from '@/components/ui/Modal.module.css'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { History, AlertCircle } from 'lucide-react'
import { useChangelog } from '@/hooks/useChangelog'
import { getChangeTypeBadgeVariant, getChangeTypeLabel } from '@/lib/utils/parseChangelog'
import styles from './ChangelogModal.module.css'

interface ChangelogModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const { versions, loading, error, exists } = useChangelog()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Historial de Cambios"
      className={modalStyles.contentLg}
    >
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spinner />
            <p className={styles.loadingText}>Cargando historial de cambios...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <AlertCircle className={styles.errorIcon} />
            <h3 className={styles.errorTitle}>Error al cargar el changelog</h3>
            <p className={styles.errorMessage}>{error.message}</p>
          </div>
        ) : !exists || versions.length === 0 ? (
          <div className={styles.emptyState}>
            <History className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Sin cambios registrados</h3>
            <p className={styles.emptyText}>
              El historial de cambios se generará automáticamente<br />
              cuando se haga el primer release con commit convencionales.
            </p>
          </div>
        ) : (
          <div className={styles.versionsContainer}>
            {versions.map((version, versionIndex) => (
              <div key={`${version.version}-${versionIndex}`} className={styles.versionSection}>
                <div className={styles.versionHeader}>
                  <div className={styles.versionInfo}>
                    <span className={styles.versionNumber}>v{version.version}</span>
                    <span className={styles.versionDate}>{version.date}</span>
                  </div>
                </div>

                <div className={styles.changesList}>
                  {version.sections.length === 0 ? (
                    <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>
                      Sin cambios en esta versión
                    </p>
                  ) : (
                    version.sections.map((section, sectionIndex) => (
                      <div key={`${version.version}-${section.title}-${sectionIndex}`}>
                        {section.items.map((item, itemIndex) => (
                          <div key={`${version.version}-${section.title}-${itemIndex}`} className={styles.changeItem}>
                            <div className={styles.changeBadge}>
                              <Badge variant={getChangeTypeBadgeVariant(item.type)}>
                                {getChangeTypeLabel(item.type)}
                              </Badge>
                            </div>
                            <div className={styles.changeContent}>
                              {item.scope && <span className={styles.changeScope}>{item.scope}</span>}
                              <p className={styles.changeDescription}>{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
