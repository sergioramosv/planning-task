'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, type = 'text', required, ...props }, ref) => {
    return (
      <div className={styles.container}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span style={{ color: 'var(--color-red-600)', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            styles.input,
            error && styles.error,
            className
          )}
          required={required}
          {...props}
        />
        {error && <p className={styles.error}>{error}</p>}
        {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
