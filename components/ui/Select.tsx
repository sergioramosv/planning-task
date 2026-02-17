'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
  required?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, required, ...props }, ref) => {
    return (
      <div className={styles.container}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span style={{ color: 'var(--color-red-600)', marginLeft: '4px' }}>*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            styles.select,
            error && styles.error,
            className
          )}
          required={required}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
