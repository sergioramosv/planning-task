import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Badge.module.css'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

export default function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span className={cn(styles.base, styles[variant], className)}>
      {children}
    </span>
  )
}
