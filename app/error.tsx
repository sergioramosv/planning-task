'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Algo salió mal</h1>
      <p>Ha ocurrido un error inesperado. Inténtalo de nuevo.</p>
      <button onClick={reset} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Intentar de nuevo
      </button>
    </div>
  )
}
