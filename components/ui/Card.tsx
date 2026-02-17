import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn(styles.card, className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn(styles.header, className)}>{children}</div>
}

export function CardTitle({ children, className }: CardProps) {
  return <h2 className={cn(styles.title, className)}>{children}</h2>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn(styles.content, className)}>{children}</div>
}

export function CardFooter({ children, className }: CardProps) {
  return <div className={cn(styles.footer, className)}>{children}</div>
}
