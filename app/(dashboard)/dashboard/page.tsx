'use client'

import { useAuth } from '@/hooks/useAuth'
import Spinner from '@/components/ui/Spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import cardStyles from '@/components/ui/Card.module.css'
import styles from './page.module.css'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Bienvenido, {user?.displayName}! 👋</h1>
        <p className={styles.subtitle}>Gestiona tus proyectos y tareas de forma eficiente</p>
      </div>

      <div className={styles.grid}>
        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValuePrimary}`}>0</div>
              <p className={styles.statLabel}>Proyectos Activos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValueBlue}`}>0</div>
              <p className={styles.statLabel}>Sprints en Progreso</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValueGreen}`}>0</div>
              <p className={styles.statLabel}>Tareas Completadas</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cardStyles.content}>
            <div className={styles.statContainer}>
              <div className={`${styles.statValue} ${styles.statValueYellow}`}>0</div>
              <p className={styles.statLabel}>Tareas Pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.grid2}>
        <Card>
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.emptyMessage}>No hay proyectos aún. Crea uno para comenzar.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas Asignadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.emptyMessage}>No hay tareas asignadas aún.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
