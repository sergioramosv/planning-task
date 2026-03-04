import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Button.module.css'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
  title?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
    >
      {loading ? '...' : children}
    </button>
  )
}
