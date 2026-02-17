import { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default function Home(): ReactNode {
  return (
    <html lang="es">
      <head>
        <title>Redirigiendo...</title>
        <meta httpEquiv="refresh" content="0;url=/login" />
      </head>
      <body>
        <p>Redirigiendo a <a href="/login">/login</a>...</p>
      </body>
    </html>
  )
}
