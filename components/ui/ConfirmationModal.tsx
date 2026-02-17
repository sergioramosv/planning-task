'use client'

import styles from './ConfirmationModal.module.css'
import { cn } from '@/lib/utils/cn'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  confirmInput?: string // If provided, user must type this to enable confirm button
  inputLabel?: string
  inputPlaceholder?: string
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  confirmInput,
  inputLabel,
  inputPlaceholder,
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('')
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(!confirmInput)

  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setIsConfirmEnabled(!confirmInput)
    }
  }, [isOpen, confirmInput])

  useEffect(() => {
    if (confirmInput) {
      setIsConfirmEnabled(inputValue === confirmInput)
    }
  }, [inputValue, confirmInput])

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm()
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.modalContent}>
        <div className={styles.warningBox}>
          {variant === 'danger' && <AlertTriangle className={styles.warningIcon} size={20} />}
          <p className={styles.warningMessage}>{message}</p>
        </div>

        {confirmInput && (
          <div className={styles.inputContainer}>
            {inputLabel && <label className={styles.inputLabel}>{inputLabel}</label>}
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              className={cn(styles.input, styles.dangerInput)}
            />
          </div>
        )}
        
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
