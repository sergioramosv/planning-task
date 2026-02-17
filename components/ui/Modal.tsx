'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import styles from './Modal.module.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export default function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.container}>
        <div
          className={cn(styles.content, className)}
          onClick={e => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </>
  )
}
