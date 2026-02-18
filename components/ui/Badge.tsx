import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Badge.module.css'

export interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({ children, variant = 'primary', size = 'md', className }: BadgeProps) {
  return (
    <span className={cn(styles.base, styles[variant], size === 'sm' && styles.sm, className)}>
      {children}
    </span>
  )
}
